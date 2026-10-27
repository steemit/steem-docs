#!/usr/bin/env node
// Drift audit baseline: probe every documented JSON-RPC method against two
// live steemd nodes and record an evidence-backed alive/dead/changed verdict
// per method. This is the T9 disposal baseline — one JSON snapshot that the
// YAML fixes are derived from, so it must not depend on `jsonrpc.get_methods`
// completeness (the catalog is known to lag: it misses whole namespaces whose
// methods still work).
//
// Three sources are synthesized per method (methods only; `ops` entries are
// not callable and stay out of scope):
//   1. get_methods catalog membership   (is the method listed?)
//   2. jsonrpc.get_signature availability (does the node know the method's
//      schema?)
//   3. dual-node live curl with the documented `parameter_json` (or the first
//      documented curl example, else {}), classified with the same six-level
//      scheme as scripts/test-curl.mjs.
//
// Verdict rules (calibrated 2026-10-27 against api.steem.fans +
// api.steemit.com; a single-node anomaly never kills a method):
//   alive    - the method dispatched on BOTH nodes (result, -32602 param
//              rejection, or a non-"not found" server error such as -32000 /
//              -32003 / -32603: the RPC layer found and executed the method)
//              and its documented contract did not drift (see changed);
//   dead     - BOTH nodes answered a structured not-found: -32601 (Method
//              not found) or -32002 "Could not find API/method";
//   changed  - dispatched on both, cataloged by the node, and the node's
//              get_signature args differ from the documented parameter_json
//              (contract drift; empty positional args=[] as returned for the
//              whole condenser_api family carries no schema and is ignored);
//   node-dependent - anything else: divergent callability, or both nodes
//              failed in a way that proves neither liveness nor death
//              (HTTP_FAIL / NETWORK_FAIL / TIMEOUT / undetermined errors).
//
// Outputs (written into data/audit/):
//   drift-<YYYY-MM-DD>.json - one record per method:
//     { api_method, api, scrapeInNode, sigOk, sigUsable, consistency,
//       curl: { <nodeLabel>: { classification, httpStatus, rpcErrorCode,
//                               responseBytes }, ... },
//       verdict, evidence: [...] }
//     plus run metadata (nodes, get_methods counts, verdict tallies).
//   drift-<YYYY-MM-DD>.md   - human-readable summary: family stats, the dead
//     list, the alive-but-uncataloged list, and one line per method.
//
// CLI:
//   --node1 <url>  first node  (default https://api.steem.fans)
//   --node2 <url>  second node (default https://api.steemit.com)
//   --api  <stem>  limit to one API namespace/file, e.g. database_api
//
// Exit code: 0 once the audit completed (the snapshot is the artifact);
// 1 on usage errors, YAML parse failures, or when the first node's
// get_methods cannot be fetched (the scrape source would be missing).
//
// Deliberately no new dependencies: yaml + node stdlib only, lenient-YAML
// handling shared via scripts/lib/yaml-lenient.mjs, and the probe/verdict
// helpers mirror test-curl.mjs rather than importing from it (same rationale
// as the concurrency pools noted in the lib header — the text-report tool and
// the snapshot tool evolve independently).

import { parseDocument } from 'yaml';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import process from 'node:process';
import { isObject, repairLegacyQuotesCounted, walkMethods } from './lib/yaml-lenient.mjs';

const DATA_DIR = fileURLToPath(new URL('../data/apidefinitions/', import.meta.url));
const OUT_DIR = fileURLToPath(new URL('../data/audit/', import.meta.url));
const DEFAULT_NODE1 = 'https://api.steem.fans';
const DEFAULT_NODE2 = 'https://api.steemit.com';
const CONCURRENCY = 4;
const TIMEOUT_MS = 15_000;
const REASON_MAX = 90;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function usage() {
  console.error(
    'Usage: node scripts/audit-drift.mjs [--node1 <url>] [--node2 <url>] [--api <stem>]\n' +
      '  --node1 <url>  first probe node (default: ' + DEFAULT_NODE1 + ')\n' +
      '  --node2 <url>  second probe node (default: ' + DEFAULT_NODE2 + ')\n' +
      '  --api  <stem>  limit to one API namespace/file, e.g. database_api'
  );
  process.exit(1);
}

const args = process.argv.slice(2);
let NODE1 = DEFAULT_NODE1;
let NODE2 = DEFAULT_NODE2;
let ONLY_API = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--node1') NODE1 = args[++i] ?? usage();
  else if (args[i] === '--node2') NODE2 = args[++i] ?? usage();
  else if (args[i] === '--api') ONLY_API = args[++i] ?? usage();
  else usage();
}
for (const [flag, url] of [['--node1', NODE1], ['--node2', NODE2]]) {
  if (!/^https?:\/\//.test(url)) {
    console.error(`audit-drift: ${flag} must be an http(s) URL, got "${url}"`);
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
// YAML loading (lenient, mirrors scripts/test-curl.mjs)
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

/** Canonical JSON: object keys sorted recursively, so arg order never matters. */
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (isObject(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, canonical(value[k])]));
  }
  return value;
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

// ---------------------------------------------------------------------------
// JSON-RPC probe (same six-level classification as scripts/test-curl.mjs)
// keep in sync with test-curl classifier — T9 machine-matching depends on
// identical classification.
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
    // rejecting Promise.all and crashing the snapshot halfway.
    return { classification: 'NETWORK_FAIL', httpStatus, rpcErrorCode: null, responseBytes: null, reason: `body read failed: ${e.cause?.code ?? e.message}` };
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
 *  non-not-found server-level error: the contract may be stale but the
 *  method is demonstrably there). */
function dispatched(p) {
  return p.classification === 'OK' || p.classification === 'OK_PARAM_INVALID' || (p.classification === 'RPC_FAIL' && !notFound(p));
}

/** jsonrpc.get_signature on `nodeUrl`: { ok, args, note }. Never throws. */
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
      return { ok: true, args: body.result.args, note: `ok (args: ${JSON.stringify(body.result.args).slice(0, 80)})` };
    }
    const msg = isObject(body?.error) ? `jsonrpc error ${body.error.code ?? '?'}: ${String(body.error.message ?? '').replace(/\s+/g, ' ').slice(0, 70)}` : 'unexpected get_signature payload';
    return { ok: false, args: undefined, note: msg };
  } catch (e) {
    return { ok: false, args: undefined, note: e.name === 'TimeoutError' ? `timeout after ${TIMEOUT_MS / 1000}s` : String(e.cause?.code ?? e.message) };
  }
}

// ---------------------------------------------------------------------------
// Build the method list
// ---------------------------------------------------------------------------

const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.yml')).sort();
const entries = []; // { api_method, api, file, params }
let parseFailures = 0;
let apiMatched = false;

for (const file of files) {
  const stem = file.replace(/\.yml$/, '');
  if (ONLY_API && stem !== ONLY_API) continue;
  apiMatched = true;
  let data;
  try {
    data = loadMethods(file);
  } catch (e) {
    console.error(`audit-drift: ${e.message}`);
    parseFailures++;
    continue;
  }
  const methods = [];
  walkMethods(data, methods);
  for (const m of methods) {
    entries.push({ api_method: String(m.api_method), api: stem, file, params: paramsFor(m) });
  }
}

if (ONLY_API && !apiMatched) {
  console.warn(
    `audit-drift: warning: unknown --api stem "${ONLY_API}" - no data/apidefinitions/${ONLY_API}.yml exists ` +
      `(known stems: ${files.map((f) => f.replace(/\.yml$/, '')).join(', ')})`
  );
}
if (parseFailures > 0) process.exit(1);
if (entries.length === 0) {
  console.log(`audit-drift: no methods matched (${ONLY_API ? 'api=' + ONLY_API : 'all files'}). Nothing to do.`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Source 1: get_methods catalog from both nodes
// ---------------------------------------------------------------------------

console.log(`audit-drift: ${entries.length} method(s), ${files.filter((f) => !ONLY_API || f === ONLY_API + '.yml').length} file(s)`);
console.log(`  node1: ${NODE1} [${LABEL1}]`);
console.log(`  node2: ${NODE2} [${LABEL2}]`);
console.log(`  concurrency: ${CONCURRENCY} | timeout: ${TIMEOUT_MS / 1000}s | probes: 2 curl + 1 get_signature per method\n`);

const catalog1 = await fetchCatalog(NODE1, LABEL1);
if (!catalog1) {
  console.error(`audit-drift: cannot proceed: jsonrpc.get_methods failed on ${NODE1} (source 1 missing)`);
  process.exit(1);
}
const catalog2 = await fetchCatalog(NODE2, LABEL2);
if (!catalog2) {
  console.warn(`audit-drift: warning: jsonrpc.get_methods failed on ${NODE2} - scrapeInNode uses ${LABEL1} only, catalog identity not checked`);
}
const set1 = new Set(catalog1.list);
const set2 = catalog2 ? new Set(catalog2.list) : null;
const identical = set2 ? catalog1.list.length === catalog2.list.length && catalog1.raw === catalog2.raw : null;
console.log(
  `  get_methods: ${LABEL1} ${catalog1.list.length} / ${set2 ? LABEL2 + ' ' + catalog2.list.length : LABEL2 + ' n/a'}` +
    (identical === null ? '' : identical ? ' (identical)' : ' (DIFFERENT)')
  + '\n'
);

async function fetchCatalog(nodeUrl, label) {
  const res = await fetch(nodeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'jsonrpc.get_methods', params: {}, id: 1 }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  }).catch((e) => {
    console.warn(`audit-drift: warning: get_methods on ${label} failed: ${e.name === 'TimeoutError' ? 'timeout' : e.cause?.code ?? e.message}`);
    return null;
  });
  if (!res) return null;
  let body;
  try {
    body = await res.json();
  } catch {
    console.warn(`audit-drift: warning: get_methods on ${label}: non-JSON response`);
    return null;
  }
  const list = body?.result;
  if (!Array.isArray(list)) {
    console.warn(`audit-drift: warning: get_methods on ${label}: unexpected payload`);
    return null;
  }
  return { list: list.map(String), raw: JSON.stringify(list) };
}

// ---------------------------------------------------------------------------
// Probe every method
// ---------------------------------------------------------------------------

const records = new Array(entries.length);
let next = 0;
const lane = async () => {
  while (next < entries.length) {
    const i = next++;
    const e = entries[i];
    const sig = await getSignature(NODE1, e.api_method); // source 2 (node1)
    const c1 = await probe(NODE1, e.api_method, e.params); // source 3
    const c2 = await probe(NODE2, e.api_method, e.params);

    const scrapeInNode = set1.has(e.api_method);
    const inCatalog2 = set2 ? set2.has(e.api_method) : null;
    const d1 = dispatched(c1);
    const d2 = dispatched(c2);
    const nf1 = notFound(c1);
    const nf2 = notFound(c2);

    let verdict;
    if (d1 !== d2) verdict = 'node-dependent';
    else if (!d1 && !d2) verdict = nf1 && nf2 ? 'dead' : 'node-dependent'; // undetermined ≠ dead
    else {
      // dispatched on both nodes
      const args = sig.args;
      const argsUsable =
        sig.ok && args !== undefined && paramsKnown(e.params) &&
        (Array.isArray(args) ? args.length > 0 : isObject(args) ? Object.keys(args).length > 0 : false);
      verdict = scrapeInNode && argsUsable && JSON.stringify(canonical(e.params)) !== JSON.stringify(canonical(args)) ? 'changed' : 'alive';
    }

    const evidence = [];
    if (scrapeInNode === inCatalog2 || inCatalog2 === null) {
      evidence.push(`get_methods: ${scrapeInNode ? 'listed' : 'NOT listed'} on ${LABEL1}${inCatalog2 === null ? ` (catalog unknown on ${LABEL2})` : ''}`);
    } else {
      evidence.push(`get_methods: ${scrapeInNode ? 'listed' : 'NOT listed'} on ${LABEL1} but ${inCatalog2 ? 'listed' : 'NOT listed'} on ${LABEL2} - catalogs differ`);
    }
    evidence.push(`get_signature [${LABEL1}]: ${sig.note}`);
    evidence.push(`curl ${LABEL1}: ${c1.classification}${c1.rpcErrorCode !== null ? ` (jsonrpc ${c1.rpcErrorCode})` : ''}, ${c1.responseBytes ?? '?'}B - ${c1.reason}`);
    evidence.push(`curl ${LABEL2}: ${c2.classification}${c2.rpcErrorCode !== null ? ` (jsonrpc ${c2.rpcErrorCode})` : ''}, ${c2.responseBytes ?? '?'}B - ${c2.reason}`);

    // sigUsable: get_signature returned a non-empty schema — the only case
    // where a rewrite can diff against the node. sigOk with args=[] (the
    // condenser_api family convention) and unregistered signatures are both
    // sigUsable=false; sigOk tells the two situations apart.
    const sigUsable = sig.ok &&
      (Array.isArray(sig.args) ? sig.args.length > 0 : isObject(sig.args) ? Object.keys(sig.args).length > 0 : false);

    records[i] = {
      api_method: e.api_method,
      api: e.api,
      file: e.file,
      scrapeInNode,
      sigOk: sig.ok,
      sigUsable,
      consistency: d1 === d2 ? 'consistent' : 'divergent',
      curl: {
        [LABEL1]: { classification: c1.classification, httpStatus: c1.httpStatus, rpcErrorCode: c1.rpcErrorCode, responseBytes: c1.responseBytes },
        [LABEL2]: { classification: c2.classification, httpStatus: c2.httpStatus, rpcErrorCode: c2.rpcErrorCode, responseBytes: c2.responseBytes },
      },
      verdict,
      evidence,
    };
    console.log(`  [${String(i + 1).padStart(String(entries.length).length)}/${entries.length}] ${verdict.padEnd(15)} ${e.api_method}${verdict === 'node-dependent' ? '  ← ' + records[i].evidence[3].slice(0, REASON_MAX) : ''}`);
  }
};
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, entries.length) }, lane));

/** paramsKnown: a documented contract exists to diff the signature against. */
function paramsKnown(params) {
  return isObject(params) ? Object.keys(params).length > 0 : Array.isArray(params) ? params.length > 0 : false;
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const verdictCounts = { alive: 0, dead: 0, changed: 0, 'node-dependent': 0 };
for (const r of records) verdictCounts[r.verdict]++;
const dead = records.filter((r) => r.verdict === 'dead');
const changed = records.filter((r) => r.verdict === 'changed');
const nodeDep = records.filter((r) => r.verdict === 'node-dependent');
const aliveUncataloged = records.filter((r) => r.verdict === 'alive' && !r.scrapeInNode);
const paramRejected = records.filter((r) => r.curl[LABEL1].classification === 'OK_PARAM_INVALID' && r.curl[LABEL2].classification === 'OK_PARAM_INVALID');

const byApi = (list) => {
  const m = new Map();
  for (const r of list) m.set(r.api, (m.get(r.api) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, n]) => `${k} ${n}`).join(', ') || '-';
};

console.log('\nSummary');
console.log(`  methods audited            : ${records.length}`);
console.log(`  verdict alive              : ${verdictCounts.alive}`);
console.log(`  verdict dead               : ${verdictCounts.dead}  (${byApi(dead)})`);
console.log(`  verdict changed            : ${verdictCounts.changed}${changed.length ? '  (' + changed.map((r) => r.api_method).join(', ') + ')' : ''}`);
console.log(`  verdict node-dependent     : ${verdictCounts['node-dependent']}${nodeDep.length ? '  (' + nodeDep.map((r) => r.api_method).join(', ') + ')' : ''}`);
console.log(`  alive but NOT in get_methods: ${aliveUncataloged.length}  (${byApi(aliveUncataloged)})`);
console.log(`  param-rejected (-32602 on both nodes): ${paramRejected.length}${paramRejected.length ? '  (' + paramRejected.map((r) => r.api_method).join(', ') + ')' : ''}`);

// ---------------------------------------------------------------------------
// Outputs: data/audit/drift-<date>.json + .md
// ---------------------------------------------------------------------------

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
mkdirSync(OUT_DIR, { recursive: true });

const snapshot = {
  tool: 'audit-drift',
  generatedAt: now.toISOString(),
  date,
  nodes: { [LABEL1]: NODE1, [LABEL2]: NODE2 },
  sigSource: { [LABEL1]: NODE1 },
  getMethods: {
    [LABEL1]: { count: catalog1.list.length },
    ...(set2 ? { [LABEL2]: { count: catalog2.list.length } } : { [LABEL2]: { count: null } }),
    identical,
  },
  scope: { api: ONLY_API, total: records.length },
  verdictCounts,
  aliveNotInCatalog: { count: aliveUncataloged.length, byApi: Object.fromEntries([...groupBy(aliveUncataloged, 'api')]) },
  deadByApi: Object.fromEntries([...groupBy(dead, 'api')]),
  paramRejectedCount: paramRejected.length,
  classificationLegend: ['OK', 'OK_PARAM_INVALID', 'RPC_FAIL', 'HTTP_FAIL', 'NETWORK_FAIL', 'TIMEOUT'],
  verdictLegend: {
    alive: 'dispatched on both nodes, contract not drifted vs get_signature',
    dead: 'structured not-found (-32601 / -32002 "Could not find API/method") on both nodes',
    changed: 'dispatched on both, cataloged, node get_signature args differ from documented parameter_json',
    'node-dependent': 'divergent callability or undetermined outcome (a single-node anomaly never kills a method)',
  },
  methods: records,
};

function groupBy(list, key) {
  const m = new Map();
  for (const r of list) {
    const v = r[key];
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const jsonPath = join(OUT_DIR, `drift-${date}.json`);
writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2) + '\n');
console.log(`\nwrote ${jsonPath}`);

const cls = (r, label) => {
  const c = r.curl[label]?.classification ?? '?';
  return c === 'OK_PARAM_INVALID' ? 'OK_PARAM' : c;
};
const lines = [];
lines.push(`# API drift audit — ${date}`);
lines.push('');
lines.push(`- node1: ${NODE1} [\`${LABEL1}\`] · node2: ${NODE2} [\`${LABEL2}\`] · get_signature source: ${LABEL1}`);
lines.push(`- methods: ${records.length}${ONLY_API ? ` (scope: ${ONLY_API})` : ' (all files)'} · get_methods: ${LABEL1} ${catalog1.list.length}${set2 ? ` / ${LABEL2} ${catalog2.list.length}${identical ? ', identical' : ', DIFFERENT'}` : ' / n/a'}`);
lines.push(`- verdicts: alive ${verdictCounts.alive} · dead ${verdictCounts.dead} · changed ${verdictCounts.changed} · node-dependent ${verdictCounts['node-dependent']}`);
lines.push(`- alive but NOT in get_methods: ${aliveUncataloged.length} (${byApi(aliveUncataloged)}) — the T9 keep-and-fix list`);
lines.push(`- param-rejected (-32602 on both nodes): ${paramRejected.length}`);
lines.push('');
lines.push('Verdict rules: `alive` = dispatched on both nodes without contract drift; `dead` = structured not-found (-32601 / -32002 "Could not find API/method") on both; `changed` = dispatched on both, cataloged, node signature differs from documented parameter_json; `node-dependent` = divergent or undetermined (a single-node anomaly never kills).');
lines.push('');
lines.push('## Family stats');
lines.push('');
lines.push('| api | total | alive | dead | changed | node-dependent |');
lines.push('| --- | --- | --- | --- | --- | --- |');
const fams = [...groupBy(records, 'api').map(([a]) => a)].sort();
for (const api of fams) {
  const rs = records.filter((r) => r.api === api);
  const vc = { alive: 0, dead: 0, changed: 0, 'node-dependent': 0 };
  for (const r of rs) vc[r.verdict]++;
  lines.push(`| ${api} | ${rs.length} | ${vc.alive} | ${vc.dead} | ${vc.changed} | ${vc['node-dependent']} |`);
}
lines.push('');
if (dead.length > 0) {
  lines.push(`## Dead (${dead.length})`);
  lines.push('');
  lines.push('| api_method | ' + LABEL1 + ' | ' + LABEL2 + ' | evidence |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of dead) {
    lines.push(`| ${r.api_method} | ${cls(r, LABEL1)} ${r.curl[LABEL1].rpcErrorCode ?? ''} | ${cls(r, LABEL2)} ${r.curl[LABEL2].rpcErrorCode ?? ''} | ${r.evidence[1]} |`);
  }
  lines.push('');
}
if (aliveUncataloged.length > 0) {
  lines.push(`## Alive but missing from get_methods (${aliveUncataloged.length}) — T9 keep-and-fix list`);
  lines.push('');
  lines.push('| api_method | ' + LABEL1 + ' | ' + LABEL2 + ' | sigOk |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of aliveUncataloged) {
    lines.push(`| ${r.api_method} | ${cls(r, LABEL1)} | ${cls(r, LABEL2)} | ${r.sigOk ? 'yes' : 'no'} |`);
  }
  lines.push('');
}
if (paramRejected.length > 0) {
  const sigUsableN = paramRejected.filter((r) => r.sigUsable).length;
  const emptyArgsN = paramRejected.filter((r) => r.sigOk && !r.sigUsable).length;
  const noSigN = paramRejected.length - sigUsableN - emptyArgsN;
  lines.push(`## Param-rejected, alive (-32602 on both nodes, ${paramRejected.length}) — recalibrate parameter values against node errors`);
  lines.push('');
  lines.push(`No usable node schema for these rows: ${noSigN} method(s) have no registered get_signature schema and ${emptyArgsN} answer \`args=[]\` (the condenser_api family convention) — a per-signature rewrite is impossible. Disposal: recalibrate the documented parameter_json value-by-value from each node's actual -32602 error messages (every rejection names the offending argument).`);
  lines.push('');
  lines.push('| api_method | ' + LABEL1 + ' B | ' + LABEL2 + ' B | sigUsable |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of paramRejected) {
    lines.push(`| ${r.api_method} | ${r.curl[LABEL1].responseBytes ?? '?'} | ${r.curl[LABEL2].responseBytes ?? '?'} | ${r.sigUsable ? 'yes' : r.sigOk ? 'no (args=[])' : 'no (unregistered)'} |`);
  }
  lines.push('');
}
if (changed.length > 0) {
  lines.push(`## Changed — contract drift vs node signature (${changed.length})`);
  lines.push('');
  lines.push('| api_method | ' + LABEL1 + ' | ' + LABEL2 + ' | sigOk | in get_methods |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const r of changed) {
    lines.push(`| ${r.api_method} | ${cls(r, LABEL1)} | ${cls(r, LABEL2)} | ${r.sigOk ? 'yes' : 'no'} | ${r.scrapeInNode ? 'yes' : 'no'} |`);
  }
  lines.push('');
}
if (nodeDep.length > 0) {
  lines.push(`## Node-dependent / undetermined (${nodeDep.length})`);
  lines.push('');
  lines.push('| api_method | ' + LABEL1 + ' | ' + LABEL2 + ' | note |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of nodeDep) {
    lines.push(`| ${r.api_method} | ${cls(r, LABEL1)} ${r.curl[LABEL1].rpcErrorCode ?? ''} | ${cls(r, LABEL2)} ${r.curl[LABEL2].rpcErrorCode ?? ''} | ${r.evidence[1].slice(0, 80)} |`);
  }
  lines.push('');
}
lines.push('## All methods');
lines.push('');
lines.push('| api_method | verdict | get_methods | sigOk | ' + LABEL1 + ' | ' + LABEL2 + ' |');
lines.push('| --- | --- | --- | --- | --- | --- |');
for (const r of records) {
  lines.push(`| ${r.api_method} | ${r.verdict} | ${r.scrapeInNode ? 'yes' : 'no'} | ${r.sigOk ? 'yes' : 'no'} | ${cls(r, LABEL1)} | ${cls(r, LABEL2)} |`);
}
lines.push('');
const mdPath = join(OUT_DIR, `drift-${date}.md`);
writeFileSync(mdPath, lines.join('\n') + '\n');
console.log(`wrote ${mdPath}`);
console.log('\ndone (exit 0; snapshot is the artifact — T9 disposes strictly from drift-<date>.json)');
