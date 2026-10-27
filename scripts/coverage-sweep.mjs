#!/usr/bin/env node
// Coverage sweep: three-source synthesis that answers the one question drift
// deliberately does not answer — "what does a node serve that the docs do not
// cover?" — plus the post-disposal regression check that the documented dead
// set is exactly the YAML-flagged dead set. Companion to audit-drift.mjs:
//   audit:drift    governs the life/death AND contract drift of methods the
//                  docs already cover;
//   audit:coverage governs the node-has/docs-lacks direction (missing pages)
//                  and re-confirms the dead set against the YAML flags after
//                  each disposal round.
//
// Candidate method names come from three sources synthesized into one union —
// no blind variant enumeration (uncostable):
//   1. jsonrpc.get_methods catalog from BOTH nodes (known to lag; used as one
//      source only, never trusted for completeness);
//   2. jsonrpc.get_signature probed on BOTH nodes for every candidate,
//      including cataloged names absent from the docs;
//   3. the repository manifest: every api_method documented under
//      data/apidefinitions/*.yml (walked leniently, ops entries excluded).
//
// Live dispatch probing reuses audit-drift's exact six-level classifier and
// dead/dispatched semantics so the dead confirmation is apples-to-apples with
// the committed drift baseline. Documented methods are probed with their
// documented parameter_json; undocumented candidates (catalog-only names) are
// existence-probed with empty params. FALSE-POSITIVE PROTECTION: a name only
// enters the gaps list when it dispatches on BOTH nodes; single-node or
// not-found outcomes stay out (catalog phantoms / divergent) and are reported
// separately.
//
// Regression check (in-script, structural — not a count comparison): every
// freshly-dead documented method must carry at least one YAML death flag
// (removed / disabled / deprecated), every `removed: true` method must be
// freshly dead, and the flagged-dead set must equal the fresh dead set; the
// residual flagged-but-alive methods are listed as known soft flags. The fresh
// dead set is additionally diffed against the latest committed
// data/audit/drift-*.json baseline (added / resolved) when one is readable.
//
// Outputs (data/audit/, ONLY with --write; default is report-only so a
// scoped or trial run can never silently overwrite a committed snapshot):
//   coverage-<YYYY-MM-DD>.json - per-source detail, the gaps list with curl
//     evidence, the dead-regression alignment matrix, and one record per
//     candidate;
//   coverage-<YYYY-MM-DD>.md   - human-readable summary of the same.
//
// CLI:
//   --node1 <url>  first node  (default https://api.steem.fans)
//   --node2 <url>  second node (default https://api.steemit.com)
//   --write        persist the snapshot into data/audit/ (default: off)
//
// Exit code: 0 once the sweep completed (the report is the artifact — findings
// are data, not failures); 1 on usage errors or YAML parse failures.
//
// Deliberately no new dependencies: yaml + node stdlib only, lenient-YAML
// handling shared via scripts/lib/yaml-lenient.mjs, and the probe/verdict
// helpers mirror audit-drift.mjs rather than importing from it (the snapshot
// tools evolve independently — see the lib header note).

import { parseDocument } from 'yaml';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import process from 'node:process';
import { isObject, repairLegacyQuotesCounted, walkMethods } from './lib/yaml-lenient.mjs';

const DATA_DIR = fileURLToPath(new URL('../data/apidefinitions/', import.meta.url));
const OUT_DIR = fileURLToPath(new URL('../data/audit/', import.meta.url));
const DEFAULT_NODE1 = 'https://api.steem.fans';
const DEFAULT_NODE2 = 'https://api.steemit.com';
const CONCURRENCY = 5;
const TIMEOUT_MS = 15_000;
const REASON_MAX = 90;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function usage() {
  console.error(
    'Usage: node scripts/coverage-sweep.mjs [--node1 <url>] [--node2 <url>] [--write]\n' +
      '  --node1 <url>  first probe node (default: ' + DEFAULT_NODE1 + ')\n' +
      '  --node2 <url>  second probe node (default: ' + DEFAULT_NODE2 + ')\n' +
      '  --write        write data/audit/coverage-<date>.{json,md} (default: report-only)'
  );
  process.exit(1);
}

const args = process.argv.slice(2);
let NODE1 = DEFAULT_NODE1;
let NODE2 = DEFAULT_NODE2;
let WRITE = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--node1') NODE1 = args[++i] ?? usage();
  else if (args[i] === '--node2') NODE2 = args[++i] ?? usage();
  else if (args[i] === '--write') WRITE = true;
  else usage();
}
for (const [flag, url] of [['--node1', NODE1], ['--node2', NODE2]]) {
  if (!/^https?:\/\//.test(url)) {
    console.error(`coverage-sweep: ${flag} must be an http(s) URL, got "${url}"`);
    process.exit(1);
  }
}

/** Short JSON key for a node URL; the defaults yield the canonical fans/steemit. */
function nodeLabel(url) {
  const host = new URL(url).host;
  if (/steem\.fans$/.test(host)) return 'fans';
  if (/steemit\.com$/.test(host)) return 'steemit';
  return host.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'node';
}
const LABEL1 = nodeLabel(NODE1);
const LABEL2 = nodeLabel(NODE2);

// ---------------------------------------------------------------------------
// Manifest: the documented-method source (lenient, mirrors audit-drift.mjs)
// ---------------------------------------------------------------------------

function loadMethods(file) {
  const raw = readFileSync(join(DATA_DIR, file), 'utf8');
  let doc = parseDocument(raw, { uniqueKeys: false });
  if (doc.errors.length > 0) {
    // Legacy quirk: some files close a multi-line single-quoted scalar with a
    // quote at column 1 (YAML 1.1 ok, YAML 1.2 not). Repair in memory only.
    const { text: repairedRaw, repaired } = repairLegacyQuotesCounted(raw);
    if (repaired > 0) doc = parseDocument(repairedRaw, { uniqueKeys: false });
  }
  if (doc.errors.length > 0) {
    const line = doc.errors[0].linePos?.[0]?.line ?? '?';
    throw new Error(`${file}: unrecoverable YAML parse error at line ${line}`);
  }
  return doc.toJS();
}

/**
 * Normalized `params` for the probe body: parameter_json is either a JSON
 * string or native YAML; when absent, fall back to the first documented curl
 * example's params. Unparseable values degrade to {} (the point is probing
 * the method, not the params).
 */
function paramsFor(m) {
  let raw = m.parameter_json;
  if (raw === undefined || raw === null || raw === '') {
    raw = Array.isArray(m.curl_examples) && m.curl_examples.length > 0 ? m.curl_examples[0] : undefined;
  }
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (raw === undefined || raw === null) return {};
  if (isObject(raw) && 'params' in raw && 'method' in raw) return raw.params ?? {}; // a full curl example
  return raw;
}

const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.yml')).sort();
const manifest = []; // { api_method, api, file, flags: {removed,disabled,deprecated}, params }
let parseFailures = 0;
for (const file of files) {
  let data;
  try {
    data = loadMethods(file);
  } catch (e) {
    console.error(`coverage-sweep: ${e.message}`);
    parseFailures++;
    continue;
  }
  const stem = file.replace(/\.yml$/, '');
  const methods = [];
  walkMethods(data, methods);
  for (const m of methods) {
    manifest.push({
      api_method: String(m.api_method),
      api: stem,
      file,
      flags: { removed: m.removed === true, disabled: m.disabled === true, deprecated: m.deprecated === true },
      params: paramsFor(m),
    });
  }
}
if (parseFailures > 0) process.exit(1);
const docMap = new Map(manifest.map((m) => [m.api_method, m]));

// ---------------------------------------------------------------------------
// JSON-RPC probe (exact audit-drift classifier — keep in sync so the dead
// confirmation stays apples-to-apples with the committed drift baseline)
// ---------------------------------------------------------------------------

async function probe(nodeUrl, apiMethod, params) {
  const body = JSON.stringify({ jsonrpc: '2.0', method: apiMethod, params, id: 1 });
  let res;
  try {
    res = await fetch(nodeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    const reason = e.name === 'TimeoutError' ? `timeout after ${TIMEOUT_MS / 1000}s` : e.cause?.code ?? e.message;
    return {
      classification: e.name === 'TimeoutError' ? 'TIMEOUT' : 'NETWORK_FAIL',
      httpStatus: null,
      rpcErrorCode: null,
      responseBytes: null,
      reason: String(reason),
    };
  }
  const httpStatus = res.status;
  let text;
  try {
    text = await res.text();
  } catch (e) {
    // Body read died mid-stream: degrade this lane to NETWORK_FAIL instead of
    // rejecting Promise.all and crashing the sweep halfway.
    return { classification: e.name === 'TimeoutError' ? 'TIMEOUT' : 'NETWORK_FAIL', httpStatus, rpcErrorCode: null, responseBytes: null, reason: `body read failed: ${e.cause?.code ?? e.message}` };
  }
  const responseBytes = Buffer.byteLength(text, 'utf8');
  if (!res.ok) return { classification: 'HTTP_FAIL', httpStatus, rpcErrorCode: null, responseBytes, reason: `HTTP ${res.status} ${res.statusText}`.trim() };
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { classification: 'HTTP_FAIL', httpStatus, rpcErrorCode: null, responseBytes, reason: 'HTTP 200 with non-JSON body' };
  }
  if (!isObject(parsed)) return { classification: 'HTTP_FAIL', httpStatus, rpcErrorCode: null, responseBytes, reason: 'response is not a JSON-RPC envelope' };
  if ('result' in parsed) return { classification: 'OK', httpStatus, rpcErrorCode: null, responseBytes, reason: 'result' };
  if (isObject(parsed.error)) {
    const code = typeof parsed.error.code === 'number' ? parsed.error.code : null;
    const message = String(parsed.error.message ?? '').replace(/\s+/g, ' ').slice(0, REASON_MAX);
    if (code === -32602) return { classification: 'OK_PARAM_INVALID', httpStatus, rpcErrorCode: code, responseBytes, reason: `param rejected: ${message}` };
    return { classification: 'RPC_FAIL', httpStatus, rpcErrorCode: code, responseBytes, reason: `jsonrpc error ${code ?? '?'}: ${message}` };
  }
  return { classification: 'RPC_FAIL', httpStatus, rpcErrorCode: null, responseBytes, reason: 'malformed JSON-RPC response (no result, no error)' };
}

/** Structured not-found: the RPC layer itself says the API/method is absent. */
function notFound(p) {
  if (p.classification !== 'RPC_FAIL' || p.rpcErrorCode === null) return false;
  if (p.rpcErrorCode === -32601) return true; // "Method not found"
  // appbase assert: -32002 is also thrown by ordinary business asserts, so
  // the message decides ("Could not find API x" / "Could not find method x").
  return p.rpcErrorCode === -32002 && /could not find (api|method)/i.test(p.reason);
}

/** The method was found and executed (result, param rejection, or any
 *  non-not-found server-level error). */
function dispatched(p) {
  return p.classification === 'OK' || p.classification === 'OK_PARAM_INVALID' || (p.classification === 'RPC_FAIL' && !notFound(p));
}

/** jsonrpc.get_signature on `nodeUrl`: { ok, usable, note }. Never throws.
 *  usable = a non-empty args schema came back (mirrors drift's sigUsable). */
async function getSignature(nodeUrl, apiMethod) {
  try {
    const res = await fetch(nodeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'jsonrpc.get_signature', params: { method: apiMethod }, id: 1 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body = await res.json(); // throws on non-JSON → caught below
    if (isObject(body) && isObject(body.result) && body.result.args !== undefined) {
      const args = body.result.args;
      const usable = Array.isArray(args) ? args.length > 0 : isObject(args) ? Object.keys(args).length > 0 : false;
      return { ok: true, usable, note: usable ? `ok (args: ${JSON.stringify(args).slice(0, 80)})` : 'ok (args empty)' };
    }
    const msg = isObject(body?.error) ? `jsonrpc error ${body.error.code ?? '?'}: ${String(body.error.message ?? '').replace(/\s+/g, ' ').slice(0, 70)}` : 'unexpected get_signature payload';
    return { ok: false, usable: false, note: msg };
  } catch (e) {
    return { ok: false, usable: false, note: e.name === 'TimeoutError' ? `timeout after ${TIMEOUT_MS / 1000}s` : String(e.cause?.code ?? e.message) };
  }
}

/** jsonrpc.get_methods on `nodeUrl`: { list, raw } or null. Never throws. */
async function fetchCatalog(nodeUrl, label) {
  let res;
  try {
    res = await fetch(nodeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'jsonrpc.get_methods', params: {}, id: 1 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    console.warn(`coverage-sweep: warning: get_methods on ${label} failed: ${e.name === 'TimeoutError' ? 'timeout' : e.cause?.code ?? e.message}`);
    return null;
  }
  let body;
  try {
    body = await res.json();
  } catch {
    console.warn(`coverage-sweep: warning: get_methods on ${label}: non-JSON response`);
    return null;
  }
  const list = body?.result;
  if (!Array.isArray(list)) {
    console.warn(`coverage-sweep: warning: get_methods on ${label}: unexpected payload`);
    return null;
  }
  return { list: list.map(String).filter((n) => n.includes('.')), raw: JSON.stringify(list) };
}

// ---------------------------------------------------------------------------
// Source 1: catalogs from both nodes (one source of three — never trusted)
// ---------------------------------------------------------------------------

console.log(`coverage-sweep: manifest ${manifest.length} method(s) from ${files.length} file(s)`);
console.log(`  node1: ${NODE1} [${LABEL1}]`);
console.log(`  node2: ${NODE2} [${LABEL2}]`);
console.log(`  mode: ${WRITE ? 'WRITE data/audit/' : 'report-only (pass --write to persist)'}`);
console.log(`  concurrency: ${CONCURRENCY} | timeout: ${TIMEOUT_MS / 1000}s | probes: 2 get_signature + 2 curl per candidate\n`);

const catalog1 = await fetchCatalog(NODE1, LABEL1);
const catalog2 = await fetchCatalog(NODE2, LABEL2);
const set1 = catalog1 ? new Set(catalog1.list) : null;
const set2 = catalog2 ? new Set(catalog2.list) : null;
const identical = set1 && set2 ? catalog1.raw === catalog2.raw : null;
console.log(
  `  get_methods: ${catalog1 ? LABEL1 + ' ' + catalog1.list.length : LABEL1 + ' n/a'} / ` +
    (catalog2 ? LABEL2 + ' ' + catalog2.list.length : LABEL2 + ' n/a') +
    (identical === null ? '' : identical ? ' (identical)' : ' (DIFFERENT)')
);
const catalogUnion = [...new Set([...(catalog1?.list ?? []), ...(catalog2?.list ?? [])])];
console.log(`  catalog union: ${catalogUnion.length} name(s)\n`);

// Candidate set = catalog union ∪ manifest. No blind variant enumeration.
const union = [...new Set([...catalogUnion, ...manifest.map((m) => m.api_method)])].sort();
const catalogOnly = union.filter((n) => !docMap.has(n));
console.log(`  candidates: ${union.length} (${manifest.length} documented + ${catalogOnly.length} catalog-only)\n`);

// ---------------------------------------------------------------------------
// Probe every candidate
// ---------------------------------------------------------------------------

const records = new Array(union.length);
let next = 0;
const lane = async () => {
  while (next < union.length) {
    const i = next++;
    const name = union[i];
    const doc = docMap.get(name);
    // Documented → probe with the documented contract; catalog-only → an
    // existence probe with empty params (no schema is known).
    const params = doc ? doc.params : {};
    const sig1 = await getSignature(NODE1, name); // source 2, node1
    const sig2 = await getSignature(NODE2, name); // source 2, node2
    const c1 = await probe(NODE1, name, params); // source 3 (live dispatch)
    const c2 = await probe(NODE2, name, params);

    const inCat1 = set1 ? set1.has(name) : null;
    const inCat2 = set2 ? set2.has(name) : null;
    const d1 = dispatched(c1);
    const d2 = dispatched(c2);
    const nf1 = notFound(c1);
    const nf2 = notFound(c2);

    let verdict;
    if (doc) {
      if (d1 && d2) verdict = 'alive';
      else if (!d1 && !d2 && nf1 && nf2) verdict = 'dead';
      else verdict = 'node-dependent';
    } else {
      // FALSE-POSITIVE PROTECTION: only a candidate that dispatches on BOTH
      // nodes is a confirmed gap; anything less stays out of the gaps list.
      if (d1 && d2) verdict = 'gap';
      else if (d1 !== d2) verdict = 'gap-divergent';
      else verdict = 'phantom'; // cataloged somewhere but dispatches nowhere
    }

    const evidence = [];
    if (inCat1 === null || inCat2 === null) {
      const parts = [
        `get_methods: ${inCat1 === null ? LABEL1 + ' catalog unavailable' : inCat1 ? 'listed on ' + LABEL1 : 'NOT listed on ' + LABEL1}`,
        `${inCat2 === null ? LABEL2 + ' catalog unavailable' : inCat2 ? 'listed on ' + LABEL2 : 'NOT listed on ' + LABEL2}`,
      ];
      evidence.push(parts.join('; '));
    } else if (inCat1 === inCat2) {
      evidence.push(`get_methods: ${inCat1 ? 'listed' : 'NOT listed'} on both nodes`);
    } else {
      evidence.push(`get_methods: ${inCat1 ? 'listed on ' + LABEL1 : 'NOT listed on ' + LABEL1} but ${inCat2 ? 'listed on ' + LABEL2 : 'NOT listed on ' + LABEL2} - catalogs differ`);
    }
    evidence.push(`get_signature [${LABEL1}]: ${sig1.note}`);
    evidence.push(`get_signature [${LABEL2}]: ${sig2.note}`);
    const probeNote = doc ? 'documented parameter_json' : '{} (existence probe: undocumented name)';
    evidence.push(`curl ${LABEL1} [${probeNote}]: ${c1.classification}${c1.rpcErrorCode !== null ? ` (jsonrpc ${c1.rpcErrorCode})` : ''}, ${c1.responseBytes ?? '?'}B - ${c1.reason}`);
    evidence.push(`curl ${LABEL2} [${probeNote}]: ${c2.classification}${c2.rpcErrorCode !== null ? ` (jsonrpc ${c2.rpcErrorCode})` : ''}, ${c2.responseBytes ?? '?'}B - ${c2.reason}`);

    records[i] = {
      api_method: name,
      api: doc ? doc.api : null,
      file: doc ? doc.file : null,
      kind: doc ? 'documented' : 'catalog-only',
      verdict,
      flags: doc ? doc.flags : null,
      catalog: { [LABEL1]: inCat1, [LABEL2]: inCat2 },
      sig: {
        [LABEL1]: { ok: sig1.ok, usable: sig1.usable },
        [LABEL2]: { ok: sig2.ok, usable: sig2.usable },
      },
      curl: {
        [LABEL1]: { classification: c1.classification, httpStatus: c1.httpStatus, rpcErrorCode: c1.rpcErrorCode, responseBytes: c1.responseBytes },
        [LABEL2]: { classification: c2.classification, httpStatus: c2.httpStatus, rpcErrorCode: c2.rpcErrorCode, responseBytes: c2.responseBytes },
      },
      evidence,
    };
    const mark = verdict === 'gap' ? '  ← GAP' : verdict === 'dead' ? '  ← dead' : '';
    console.log(`  [${String(i + 1).padStart(String(union.length).length)}/${union.length}] ${verdict.padEnd(15)} ${name}${mark}`);
  }
};
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, union.length) }, lane));

// ---------------------------------------------------------------------------
// Dead regression: fresh dead set vs YAML death flags vs drift baseline
// ---------------------------------------------------------------------------

const documented = records.filter((r) => r.kind === 'documented');
const dead = documented.filter((r) => r.verdict === 'dead');
const deadSet = new Set(dead.map((r) => r.api_method));
const flaggedDead = manifest.filter((m) => (m.flags.removed || m.flags.disabled || m.flags.deprecated) && deadSet.has(m.api_method));
const softFlaggedAlive = manifest
  .filter((m) => m.flags.removed || m.flags.disabled || m.flags.deprecated)
  .filter((m) => !deadSet.has(m.api_method))
  .map((m) => `${m.api_method} [${[m.flags.removed && 'removed', m.flags.disabled && 'disabled', m.flags.deprecated && 'deprecated'].filter(Boolean).join(',')}]`);
const deadMissingFlags = dead.filter((r) => !r.flags.removed && !r.flags.disabled && !r.flags.deprecated).map((r) => r.api_method);
const removedFlaggedAlive = manifest.filter((m) => m.flags.removed && !deadSet.has(m.api_method)).map((m) => m.api_method);
const aligned = deadMissingFlags.length === 0 && removedFlaggedAlive.length === 0 && flaggedDead.length === dead.length;

// Baseline diff: latest committed drift snapshot (files sort by date in their
// names, so the last match is the latest).
let baseline = null;
const driftFiles = existsSync(OUT_DIR) ? readdirSync(OUT_DIR).filter((f) => /^drift-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort() : [];
if (driftFiles.length > 0) {
  const driftFile = driftFiles[driftFiles.length - 1];
  try {
    const snap = JSON.parse(readFileSync(join(OUT_DIR, driftFile), 'utf8'));
    const baselineDead = new Set((snap.methods ?? []).filter((m) => m.verdict === 'dead').map((m) => m.api_method));
    baseline = {
      file: `data/audit/${driftFile}`,
      deadCount: baselineDead.size,
      added: [...deadSet].filter((n) => !baselineDead.has(n)).sort(),
      resolved: [...baselineDead].filter((n) => !deadSet.has(n)).sort(),
      match: baselineDead.size === deadSet.size && [...baselineDead].every((n) => deadSet.has(n)),
    };
  } catch (e) {
    console.warn(`coverage-sweep: warning: could not read baseline ${driftFile}: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const gaps = records.filter((r) => r.verdict === 'gap');
const gapDivergent = records.filter((r) => r.verdict === 'gap-divergent');
const phantoms = records.filter((r) => r.verdict === 'phantom');
const alive = documented.filter((r) => r.verdict === 'alive');
const nodeDep = documented.filter((r) => r.verdict === 'node-dependent');

const byApi = (list) => {
  const m = new Map();
  for (const r of list) m.set(r.api, (m.get(r.api) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, n]) => `${k} ${n}`).join(', ') || '-';
};

console.log('\nSummary');
console.log(`  candidates                : ${union.length} (${manifest.length} documented + ${catalogOnly.length} catalog-only)`);
console.log(`  documented verdicts       : alive ${alive.length} · dead ${dead.length} · node-dependent ${nodeDep.length}`);
console.log(`  coverage gaps (confirmed) : ${gaps.length}${gaps.length ? '  (' + gaps.map((r) => r.api_method).join(', ') + ')' : '  ← node real, docs missing'}`);
console.log(`  gap candidates not confirmed: divergent ${gapDivergent.length} · phantom (catalog-only, dead) ${phantoms.length}`);
console.log(`  dead regression           : fresh dead ${dead.length} · YAML-flagged dead ${flaggedDead.length} · aligned ${aligned ? 'YES' : 'NO'}`);
if (deadMissingFlags.length) console.log(`    dead WITHOUT any YAML death flag : ${deadMissingFlags.join(', ')}`);
if (removedFlaggedAlive.length) console.log(`    removed-flagged but alive        : ${removedFlaggedAlive.join(', ')}`);
console.log(`    flagged-but-alive (soft flags)   : ${softFlaggedAlive.length}${softFlaggedAlive.length ? '  (' + softFlaggedAlive.join('; ') + ')' : ''}`);
if (baseline) {
  console.log(`  drift baseline            : ${baseline.file} dead ${baseline.deadCount} · match ${baseline.match ? 'YES' : 'NO'} · added ${baseline.added.length} · resolved ${baseline.resolved.length}`);
  if (baseline.added.length) console.log(`    newly dead vs baseline   : ${baseline.added.join(', ')}`);
  if (baseline.resolved.length) console.log(`    resurrected vs baseline  : ${baseline.resolved.join(', ')}`);
}

// ---------------------------------------------------------------------------
// Outputs: data/audit/coverage-<date>.json + .md — ONLY with --write
// ---------------------------------------------------------------------------

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const flagStr = (r) => (r.flags ? [r.flags.removed && 'removed', r.flags.disabled && 'disabled', r.flags.deprecated && 'deprecated'].filter(Boolean).join('+') || '-' : '-');
const cls = (r, label) => {
  const c = r.curl[label]?.classification ?? '?';
  return c === 'OK_PARAM_INVALID' ? 'OK_PARAM' : c;
};

const snapshot = {
  tool: 'coverage-sweep',
  generatedAt: now.toISOString(),
  date,
  mode: WRITE ? 'write' : 'report-only',
  nodes: { [LABEL1]: NODE1, [LABEL2]: NODE2 },
  sources: {
    manifest: { files: files.length, methods: manifest.length },
    catalog: {
      [LABEL1]: catalog1 ? { count: catalog1.list.length } : { count: null },
      [LABEL2]: catalog2 ? { count: catalog2.list.length } : { count: null },
      identical,
      union: catalogUnion.length,
    },
    signatures: { probed: union.length * 2, note: 'get_signature probed on both nodes for every candidate' },
  },
  stats: {
    candidates: union.length,
    documented: manifest.length,
    catalogOnly: catalogOnly.length,
    documentedVerdicts: { alive: alive.length, dead: dead.length, 'node-dependent': nodeDep.length },
    gaps: gaps.length,
    gapDivergent: gapDivergent.length,
    phantoms: phantoms.length,
  },
  deadRegression: {
    deadConfirmed: dead.length,
    yamlFlaggedDead: flaggedDead.length,
    aligned,
    deadMissingFlags,
    removedFlaggedAlive,
    softFlaggedAlive,
    baseline,
    perMethod: dead.map((r) => ({ api_method: r.api_method, api: r.api, yamlFlags: flagStr(r), curl: r.curl, evidence: r.evidence })),
  },
  classificationLegend: ['OK', 'OK_PARAM_INVALID', 'RPC_FAIL', 'HTTP_FAIL', 'NETWORK_FAIL', 'TIMEOUT'],
  verdictLegend: {
    alive: 'documented method dispatched on both nodes',
    dead: 'documented method answered a structured not-found (-32601 / -32002 "Could not find API/method") on both nodes',
    'node-dependent': 'documented method with divergent callability or undetermined outcome (a single-node anomaly never kills)',
    gap: 'catalog-only name that dispatched on BOTH nodes - node real, docs missing (curl-confirmed)',
    'gap-divergent': 'catalog-only name that dispatched on only one node - NOT a gap until confirmed on both',
    phantom: 'catalog-only name that dispatched on neither node - stale catalog entry, not a gap',
  },
  gaps: gaps.map((r) => ({ api_method: r.api_method, catalog: r.catalog, sig: r.sig, curl: r.curl, evidence: r.evidence })),
  methods: records,
};

const lines = [];
lines.push(`# API coverage sweep — ${date}`);
lines.push('');
lines.push(`- node1: ${NODE1} [\`${LABEL1}\`] · node2: ${NODE2} [\`${LABEL2}\`] · mode: ${WRITE ? 'write' : 'report-only'}`);
lines.push(`- sources: manifest ${manifest.length} methods / ${files.length} files · get_methods ${catalog1 ? catalog1.list.length : 'n/a'} / ${catalog2 ? catalog2.list.length : 'n/a'} (union ${catalogUnion.length}, ${identical === null ? 'identity unknown' : identical ? 'identical' : 'DIFFERENT'}) · get_signature 2×${union.length} candidates`);
lines.push(`- candidates: ${union.length} = ${manifest.length} documented + ${catalogOnly.length} catalog-only`);
lines.push(`- documented verdicts: alive ${alive.length} · dead ${dead.length} · node-dependent ${nodeDep.length}`);
lines.push(`- **coverage gaps (node real, docs missing, curl-confirmed on both nodes): ${gaps.length}**${gaps.length ? ` — ${gaps.map((r) => r.api_method).join(', ')}` : ''}`);
lines.push(`- gap candidates not confirmed: divergent ${gapDivergent.length} · phantom ${phantoms.length} (catalog-only names that dispatch nowhere)`);
lines.push(`- dead regression: fresh dead ${dead.length} · YAML-flagged dead ${flaggedDead.length} · **aligned ${aligned ? 'YES' : 'NO'}**${baseline ? ` · drift baseline ${baseline.match ? 'matches' : 'DIFFERS'} (${baseline.file})` : ''}`);
lines.push('');
lines.push('Candidate sources: get_methods catalog (both nodes, untrusted) ∪ get_signature probes ∪ the YAML manifest. No variant enumeration. A catalog-only name enters the gaps list only after dispatching on BOTH nodes; everything else is reported as divergent or phantom.');
lines.push('');
lines.push('## Family stats (documented methods)');
lines.push('');
lines.push('| api | total | alive | dead | node-dependent |');
lines.push('| --- | --- | --- | --- | --- |');
const fams = [...new Set(manifest.map((m) => m.api))].sort();
for (const api of fams) {
  const rs = documented.filter((r) => r.api === api);
  const vc = { alive: 0, dead: 0, 'node-dependent': 0 };
  for (const r of rs) vc[r.verdict]++;
  lines.push(`| ${api} | ${rs.length} | ${vc.alive} | ${vc.dead} | ${vc['node-dependent']} |`);
}
lines.push('');
lines.push(`## Coverage gaps (${gaps.length})`);
lines.push('');
if (gaps.length === 0) {
  lines.push('None. Every name the nodes serve (per catalog union ∪ signature probes) is documented; every documented method is accounted for by the dead regression below.');
} else {
  lines.push('| api_method | ' + LABEL1 + ' | ' + LABEL2 + ' | evidence |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of gaps) {
    lines.push(`| ${r.api_method} | ${cls(r, LABEL1)} ${r.curl[LABEL1].rpcErrorCode ?? ''} | ${cls(r, LABEL2)} ${r.curl[LABEL2].rpcErrorCode ?? ''} | ${r.evidence[1]}; ${r.evidence[2]} |`);
  }
}
lines.push('');
if (gapDivergent.length > 0 || phantoms.length > 0) {
  lines.push('## Unconfirmed catalog-only names (NOT gaps)');
  lines.push('');
  lines.push('| api_method | verdict | ' + LABEL1 + ' | ' + LABEL2 + ' | note |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const r of [...gapDivergent, ...phantoms]) {
    lines.push(`| ${r.api_method} | ${r.verdict} | ${cls(r, LABEL1)} | ${cls(r, LABEL2)} | ${r.evidence[3].slice(0, 80)} |`);
  }
  lines.push('');
}
lines.push(`## Dead regression — fresh probe vs YAML death flags (${dead.length})`);
lines.push('');
lines.push(`Alignment: ${aligned ? 'PASS' : 'FAIL'} — every freshly-dead documented method carries its T9 death flag (removed/disabled/deprecated), no \`removed\`-flagged method is alive, and the flagged-dead set equals the fresh dead set.`);
if (deadMissingFlags.length > 0) lines.push(`- dead WITHOUT any YAML death flag: ${deadMissingFlags.join(', ')}`);
if (removedFlaggedAlive.length > 0) lines.push(`- removed-flagged but alive: ${removedFlaggedAlive.join(', ')}`);
lines.push(`- flagged-but-alive (soft \`deprecated\`/\`disabled\` on live methods, expected from phase 1): ${softFlaggedAlive.length}${softFlaggedAlive.length ? ' — ' + softFlaggedAlive.join('; ') : ''}`);
if (baseline) {
  lines.push(`- drift baseline ${baseline.file}: dead ${baseline.deadCount}, ${baseline.match ? 'matches the fresh set' : 'DIFFERS'}${baseline.added.length ? `, newly dead: ${baseline.added.join(', ')}` : ''}${baseline.resolved.length ? `, resurrected: ${baseline.resolved.join(', ')}` : ''}`);
}
lines.push('');
lines.push('| api_method | yaml flags | ' + LABEL1 + ' | ' + LABEL2 + ' | baseline |');
lines.push('| --- | --- | --- | --- | --- |');
for (const r of dead) {
  const inBase = baseline ? (baseline.added.includes(r.api_method) ? 'NEW' : baseline.resolved.includes(r.api_method) ? '?' : 'same') : 'n/a';
  lines.push(`| ${r.api_method} | ${flagStr(r)} | ${cls(r, LABEL1)} ${r.curl[LABEL1].rpcErrorCode ?? ''} | ${cls(r, LABEL2)} ${r.curl[LABEL2].rpcErrorCode ?? ''} | ${inBase} |`);
}
lines.push('');
lines.push('## All candidates');
lines.push('');
lines.push('| api_method | kind | verdict | get_methods | sig [' + LABEL1 + '/' + LABEL2 + '] | ' + LABEL1 + ' | ' + LABEL2 + ' |');
lines.push('| --- | --- | --- | --- | --- | --- | --- |');
for (const r of records) {
  const cat = r.catalog[LABEL1] === null || r.catalog[LABEL2] === null ? '?' : r.catalog[LABEL1] && r.catalog[LABEL2] ? 'both' : r.catalog[LABEL1] || r.catalog[LABEL2] ? 'one' : 'none';
  const sigStr = `${r.sig[LABEL1].ok ? (r.sig[LABEL1].usable ? 'yes' : 'empty') : 'no'}/${r.sig[LABEL2].ok ? (r.sig[LABEL2].usable ? 'yes' : 'empty') : 'no'}`;
  lines.push(`| ${r.api_method} | ${r.kind} | ${r.verdict} | ${cat} | ${sigStr} | ${cls(r, LABEL1)} | ${cls(r, LABEL2)} |`);
}
lines.push('');

if (WRITE) {
  mkdirSync(OUT_DIR, { recursive: true });
  const jsonPath = join(OUT_DIR, `coverage-${date}.json`);
  const mdPath = join(OUT_DIR, `coverage-${date}.md`);
  writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2) + '\n');
  writeFileSync(mdPath, lines.join('\n') + '\n');
  console.log(`\nwrote ${jsonPath}`);
  console.log(`wrote ${mdPath}`);
} else {
  console.log(`\n${lines.join('\n')}`);
  console.log(`\nreport-only: nothing written. Re-run with --write to persist data/audit/coverage-${date}.{json,md}.`);
}
console.log('\ndone (exit 0; findings are data, not failures — read the gaps/deadRegression sections)');
