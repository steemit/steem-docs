#!/usr/bin/env node
// Source crosscheck (phase 3 / T21): the disposition matrix that fuses the
// three baselines this project now keeps into one per-method verdict —
//
//   source  (what still defines it)  ← data/source-inventory/{steem,hivemind}.json (T20)
//   docs    (what the site covers)   ← data/apidefinitions/*.yml (238 methods)
//   node    (what a public node serves) ← latest committed data/audit/drift-*.json
//
// Every method in the universe (steem 211 ∪ hivemind 68 ∪ every documented
// name, which contributes the witness_api 2 + condenser_api.get_account_bandwidth
// + the `call` wire-name page as doc-legacy rows) lands in exactly one cell
// of the 8-combo grid
// (src± × doc± × node alive/dead) and each cell maps to exactly one disposal
// action — the combo→disposition table below is the review artifact:
//
//   src?  doc?  node?   → disposition           action
//   ─────────────────────────────────────────────────────────────────────────
//   yes   yes   alive   → all-good              keep page; no edit (drift
//                 `changed` rows carry a contract-drift note → T23 input;
//                 alive-but-flagged rows carry a soft-flag note)
//   yes   yes   dead    → annotation-refresh    refresh the page's death
//                 annotation per family: deprecated → keep (decision 3-①);
//                 disabled → reword to "defined in source; plugin not
//                 enabled on public nodes" (decision 3-②); removed → the
//                 claim "removed from the API" is falsified by the source
//                 inventory → regression state (post-T25 all such pages were
//                 refreshed to the disabled wording; the census asserts 0)
//   yes   no    alive   → add-page              missing page, method is served
//                 → T22 fill list (en+zh pages + overview count guard)
//   yes   no    dead    → add-page+dead-note    missing page, method is dead →
//                 T22 fill list WITH the dead-note block
//   no    yes   alive   → keep-annotation       the witness shape: documented,
//                 alive, but defined in neither source — keep the page and
//                 its annotation (decision 3-① logic generalized)
//   no    yes   dead    → removed-keep          keep the removed annotation,
//                 now with harder evidence: the name is absent from both
//                 source inventories (decision 3-③)
//   no    no    *       → unreachable           impossible by construction
//                 (the universe is sources ∪ docs) — asserted, never emitted
//
// Node status comes from the committed drift snapshot for every documented
// method (alive / dead / changed→alive-with-drift). Methods the snapshot
// structurally cannot cover — source-defined names with no doc page — are
// existence-probed live on the same dual nodes (get_signature + an empty-params
// dispatch probe, using audit-drift's exact dispatched/not-found semantics so
// "alive"/"dead" stays apples-to-apples with the snapshot). Provenance is
// recorded per row (`node.source`).
//
// Exclusions (plan decision 2) are NOT matrix rows — they are reported in a
// dedicated section so the disposal lists stay clean:
//   test_api.*   test-only plugin, never mounted on public nodes;
//   jsonrpc.*    JSON-RPC infrastructure self-describing methods;
//   ingest       not an API plugin at all (no json_rpc dependency, no
//                DECLARE_API) — asserted absent from the steem inventory;
//   community.py unregistered defs — never entered the hivemind inventory
//                (T20 extracts exactly the serve.py registration points;
//                asserted via the 68-binding count).
//
// Double-source methods (hivemind-served condenser_api/follow_api/tags_api
// names that steem also defines) get a param_style comparison column; when
// both sides have statically enumerable params and they differ, the row is
// flagged as a signature mismatch (plan decision 1: node reality wins; T23
// contract input).
//
// Outputs (data/audit/, ONLY with --write; default is report-only so a trial
// run can never silently overwrite a committed snapshot):
//   source-crosscheck-<YYYY-MM-DD>.json - meta, combo census, the combo→
//     disposition table, full matrix rows, excluded rows, and the four
//     disposal lists (add-page / death-annotation review / double-source /
//     exclusions);
//   source-crosscheck-<YYYY-MM-DD>.md   - the same as a reviewable matrix.
//
// Hard assertions (exit 1 on violation — these are contract checks, not
// findings): inventory counts (steem 211 = 204 + 7 SMT-conditional across the
// plan §1 census; hivemind 68 bindings / 6 namespaces / 2 dummies), manifest
// 238 == drift snapshot scope, universe accounting (body ∪ excluded ==
// universe, every source/doc name lands exactly once), the witness_api
// double-check (both methods must resolve to src-none + doc + dead →
// removed-keep), and the decision-3 family census (deprecated 7 / disabled 25
// = 9 debug_node_api + 2 chain_api filled post-T22 + 14 refreshed from
// removed to the disabled wording in T25 / removed-keep 3 /
// removed-unsupported 0 / soft-flagged-alive 5).
//
// CLI:
//   --node1 <url> --node2 <url>  probe nodes for undocumented names
//                                (default: the snapshot's own nodes)
//   --drift <path>               drift snapshot to read (default: latest
//                                data/audit/drift-*.json)
//   --write                      persist into data/audit/ (default: off)
//
// Exit code: 0 once the crosscheck completed (the report is the artifact —
// findings are data, not failures); 1 on usage errors, YAML parse failures,
// missing/invalid inputs, or a violated assertion.
//
// Deliberately no new dependencies: yaml + node stdlib only; the lenient-YAML
// handling and the probe classifier mirror coverage-sweep.mjs rather than
// importing from it (the audit tools evolve independently — same rationale as
// the concurrency pools there). Read-only over data/apidefinitions by
// construction: the only paths this script ever writes are data/audit/
// source-crosscheck-<date>.{json,md} under --write.

import { parseDocument } from 'yaml';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import process from 'node:process';
import { isObject, repairLegacyQuotesCounted, walkMethods } from './lib/yaml-lenient.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const STEEM_INVENTORY = join(ROOT, 'data/source-inventory/steem.json');
const HIVEMIND_INVENTORY = join(ROOT, 'data/source-inventory/hivemind.json');
const DATA_DIR = join(ROOT, 'data/apidefinitions/');
const OUT_DIR = join(ROOT, 'data/audit/');
const DEFAULT_NODE1 = 'https://api.steem.fans';
const DEFAULT_NODE2 = 'https://api.steemit.com';
const CONCURRENCY = 5;
const TIMEOUT_MS = 15_000;
const REASON_MAX = 90;

// Plan §3 decision 2 — names excluded from the matrix body, with reasons.
const EXCLUDED_PREFIXES = [
  { prefix: 'test_api.', reason: 'test-only API plugin (test_api_plugin); never mounted on public nodes, not part of the public API surface (plan decision 2)' },
  { prefix: 'jsonrpc.', reason: 'JSON-RPC infrastructure self-description (get_methods/get_signature); protocol plumbing, not a business API (plan decision 2)' },
];

// T20 inventory naming artifact: hivemind serve.py registers the legacy `call`
// adapter under the bare wire name `call` (serve.py:119-121, "legacy `call`
// style adapter"), which the inventory models as namespace `call` + method
// `call` → `call.call`. Matrix rows keep the inventory name; the live probe
// targets the wire name so the node dimension reflects wire reality. The
// `call` convention requires ARRAY params `[api, method, args]` — an empty
// object degrades into jussi parse errors (fans: -32600, steemit: HTTP 500),
// so the probe carries a real, cheap 3-arg payload instead of `{}`.
const WIRE_NAME_OVERRIDES = {
  'call.call': { wire: 'call', params: ['condenser_api', 'get_dynamic_global_properties', []] },
};

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function usage(msg) {
  if (msg) console.error('source-crosscheck: ' + msg);
  console.error(
    'Usage: node scripts/audit-source-crosscheck.mjs [--node1 <url>] [--node2 <url>] [--drift <path>] [--write]\n' +
      '  --node1 <url>   first probe node (default: the drift snapshot\'s node1)\n' +
      '  --node2 <url>   second probe node (default: the drift snapshot\'s node2)\n' +
      '  --drift <path>  drift snapshot to read (default: latest data/audit/drift-*.json)\n' +
      '  --write         write data/audit/source-crosscheck-<date>.{json,md} (default: report-only)'
  );
  process.exit(1);
}

const argv = process.argv.slice(2);
let NODE1 = null;
let NODE2 = null;
let DRIFT_PATH = null;
let WRITE = false;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--node1') NODE1 = argv[++i] ?? usage();
  else if (argv[i] === '--node2') NODE2 = argv[++i] ?? usage();
  else if (argv[i] === '--drift') DRIFT_PATH = argv[++i] ?? usage();
  else if (argv[i] === '--write') WRITE = true;
  else usage();
}

// ---------------------------------------------------------------------------
// Input 1+2: source inventories (T20) with plan-baseline assertions
// ---------------------------------------------------------------------------

function readJson(path, what) {
  if (!existsSync(path)) {
    console.error(`source-crosscheck: missing input ${what}: ${path}`);
    process.exit(1);
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    console.error(`source-crosscheck: ${what} is not valid JSON (${path}): ${e.message}`);
    process.exit(1);
  }
}

const steemInv = readJson(STEEM_INVENTORY, 'steem inventory');
const hiveInv = readJson(HIVEMIND_INVENTORY, 'hivemind inventory');

const inputFailures = [];
const steemMethods = new Map(); // name → {api, name, conditional, param_style, params, source}
for (const [api, v] of Object.entries(steemInv.apis ?? {})) {
  const methods = Array.isArray(v?.methods) ? v.methods : [];
  for (const m of methods) {
    const full = `${api}.${m.name}`;
    if (steemMethods.has(full)) inputFailures.push(`steem inventory: duplicate method ${full}`);
    steemMethods.set(full, { api, name: m.name, conditional: m.conditional === true, param_style: m.param_style, params: m.params ?? null, source: m.source ?? null });
  }
}
const hiveMethods = new Map(); // name → {ns, name, params, dummy, type}
for (const [ns, v] of Object.entries(hiveInv.namespaces ?? {})) {
  const methods = Array.isArray(v?.methods) ? v.methods : [];
  for (const m of methods) {
    const full = `${ns}.${m.name}`;
    if (hiveMethods.has(full)) inputFailures.push(`hivemind inventory: duplicate method ${full}`);
    hiveMethods.set(full, { ns, name: m.name, params: Array.isArray(m.params) ? m.params : [], dummy: m.dummy === true, type: m.type ?? null });
  }
}
const hiveDummies = [...hiveMethods.entries()].filter(([, m]) => m.dummy).map(([n]) => n);
const steemConditional = [...steemMethods.values()].filter((m) => m.conditional);

// Plan §1 baseline census (machine acceptance of T20 carried into T21).
const STEEM_CENSUS = {
  condenser_api: 87, database_api: 57, tags_api: 20, follow_api: 10, debug_node_api: 9,
  market_history_api: 7, rc_api: 3, account_history_api: 4, test_api: 2, jsonrpc: 2,
};
const steemPerApi = {};
for (const m of steemMethods.values()) steemPerApi[m.api] = (steemPerApi[m.api] ?? 0) + 1;
for (const [api, n] of Object.entries(STEEM_CENSUS)) {
  if ((steemPerApi[api] ?? 0) !== n) inputFailures.push(`steem inventory: ${api} has ${steemPerApi[api] ?? 0} methods, plan baseline is ${n}`);
}
if (steemMethods.size !== 211) inputFailures.push(`steem inventory: ${steemMethods.size} methods, plan baseline is 211`);
if (steemConditional.length !== 7) inputFailures.push(`steem inventory: ${steemConditional.length} conditional methods, plan baseline is 7 (SMT)`);
if (hiveInv.bindings !== 68) inputFailures.push(`hivemind inventory: bindings=${hiveInv.bindings}, plan baseline is 68`);
if (hiveMethods.size !== 68) inputFailures.push(`hivemind inventory: ${hiveMethods.size} methods resolved, plan baseline is 68`);
if (Object.keys(hiveInv.namespaces ?? {}).length !== 6) inputFailures.push(`hivemind inventory: ${Object.keys(hiveInv.namespaces ?? {}).length} namespaces, plan baseline is 6`);
const DUMMY_BASELINE = ['condenser_api.get_account_votes', 'tags_api.get_account_votes'];
if (hiveDummies.sort().join(',') !== DUMMY_BASELINE.join(',')) inputFailures.push(`hivemind inventory: dummies are [${hiveDummies.join(', ')}], plan baseline is [${DUMMY_BASELINE.join(', ')}]`);
// ingest is a pure appbase plugin, not an API plugin — it must not be in the
// steem inventory as an api namespace (plan §1 / decision 2).
if ('ingest' in (steemInv.apis ?? {})) inputFailures.push('steem inventory: `ingest` must not appear as an API namespace (it is not an API plugin)');

if (inputFailures.length > 0) {
  for (const f of inputFailures) console.error('source-crosscheck: INPUT CONTRACT VIOLATION: ' + f);
  process.exit(1);
}
console.log(`source-crosscheck: steem inventory ${steemMethods.size} methods (204 + 7 SMT-conditional) @ ${steemInv.repo}@${(steemInv.commit ?? '').slice(0, 7)} [${steemInv.branch}]`);
console.log(`source-crosscheck: hivemind inventory 68 bindings / ${Object.keys(hiveInv.namespaces).length} namespaces @ ${hiveInv.repo}@${(hiveInv.commit ?? '').slice(0, 7)} [${hiveInv.branch}]`);

// ---------------------------------------------------------------------------
// Input 3: the YAML manifest (lenient — mirrors coverage-sweep.mjs)
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

const docFiles = readdirSync(DATA_DIR).filter((f) => f.endsWith('.yml')).sort();
const docMethods = new Map(); // name → {file, flags}
for (const file of docFiles) {
  const data = loadMethods(file);
  const stem = file.replace(/\.yml$/, '');
  const methods = [];
  walkMethods(data, methods);
  for (const m of methods) {
    const name = String(m.api_method);
    if (docMethods.has(name)) throw new Error(`${file}: duplicate api_method ${name}`);
    docMethods.set(name, {
      file,
      stem,
      flags: { removed: m.removed === true, disabled: m.disabled === true, deprecated: m.deprecated === true },
    });
  }
}
console.log(`source-crosscheck: manifest ${docMethods.size} documented methods / ${docFiles.length} files`);

// ---------------------------------------------------------------------------
// Input 4: drift snapshot (latest committed by default)
// ---------------------------------------------------------------------------

let driftFile = DRIFT_PATH;
if (!driftFile) {
  const drifts = existsSync(OUT_DIR) ? readdirSync(OUT_DIR).filter((f) => /^drift-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort() : [];
  if (drifts.length === 0) {
    console.error('source-crosscheck: no data/audit/drift-<date>.json snapshot found — run `pnpm audit:drift -- --write` first (or pass --drift <path>)');
    process.exit(1);
  }
  driftFile = join(OUT_DIR, drifts[drifts.length - 1]);
}
if (!existsSync(driftFile)) {
  console.error(`source-crosscheck: --drift path not found: ${driftFile}`);
  process.exit(1);
}
const drift = readJson(driftFile, 'drift snapshot');
const driftVerdict = new Map((drift.methods ?? []).map((m) => [m.api_method, m.verdict]));
if (driftVerdict.size === 0) {
  console.error(`source-crosscheck: drift snapshot ${driftFile} carries no method records`);
  process.exit(1);
}
// The snapshot is doc-scoped: its method set must equal the manifest set, or
// the node dimension would silently diverge from the docs dimension.
const driftScopeDiff = [...docMethods.keys()].filter((n) => !driftVerdict.has(n));
const driftExtra = [...driftVerdict.keys()].filter((n) => !docMethods.has(n));
if (driftScopeDiff.length > 0 || driftExtra.length > 0) {
  console.error(`source-crosscheck: drift snapshot ${driftFile} does not match the manifest scope (missing ${driftScopeDiff.length}, extra ${driftExtra.length})`);
  process.exit(1);
}

// Probe nodes default to the snapshot's own nodes so live probes and snapshot
// rows always speak about the same infrastructure.
if (!NODE1) NODE1 = drift.nodes?.fans ?? drift.nodes?.node1 ?? DEFAULT_NODE1;
if (!NODE2) NODE2 = drift.nodes?.steemit ?? drift.nodes?.node2 ?? DEFAULT_NODE2;
for (const [flag, url] of [['--node1', NODE1], ['--node2', NODE2]]) {
  if (!/^https?:\/\//.test(url)) {
    console.error(`source-crosscheck: ${flag} must be an http(s) URL, got "${url}"`);
    process.exit(1);
  }
}
function nodeLabel(url) {
  const host = new URL(url).host;
  if (/steem\.fans$/.test(host)) return 'fans';
  if (/steemit\.com$/.test(host)) return 'steemit';
  return host.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'node';
}
const LABEL1 = nodeLabel(NODE1);
const LABEL2 = nodeLabel(NODE2);
const DRIFT_DATE = drift.date ?? driftFile.match(/drift-(\d{4}-\d{2}-\d{2})\.json$/)?.[1] ?? 'unknown';
const DRIFT_BASENAME = driftFile.split('/').pop();

// ---------------------------------------------------------------------------
// Universe, exclusions, rows
// ---------------------------------------------------------------------------

const universe = [...new Set([...steemMethods.keys(), ...hiveMethods.keys(), ...docMethods.keys()])].sort();
const excluded = universe.filter((n) => EXCLUDED_PREFIXES.some((e) => n.startsWith(e.prefix)));
const bodyNames = universe.filter((n) => !excluded.includes(n));
const bodyUndocumented = bodyNames.filter((n) => !docMethods.has(n));

console.log(`source-crosscheck: universe ${universe.length} = steem ${steemMethods.size} ∪ hivemind ${hiveMethods.size} ∪ doc ${docMethods.size} (overlap collapsed)`);
console.log(`source-crosscheck: matrix body ${bodyNames.length} + excluded ${excluded.length} · undocumented in body (live-probe): ${bodyUndocumented.length}`);
console.log(`source-crosscheck: node1 ${NODE1} [${LABEL1}] · node2 ${NODE2} [${LABEL2}] · drift ${DRIFT_BASENAME} (${DRIFT_DATE})`);
console.log(`source-crosscheck: mode ${WRITE ? 'WRITE data/audit/' : 'report-only (pass --write to persist)'}\n`);

// ---------------------------------------------------------------------------
// Live existence probe for undocumented body names (audit-drift classifier —
// keep the dispatched/not-found semantics in sync so "alive"/"dead" means the
// same thing here as in the committed snapshot)
// ---------------------------------------------------------------------------

async function probe(nodeUrl, apiMethod, params = {}) {
  const body = JSON.stringify({ jsonrpc: '2.0', method: apiMethod, params, id: 1 });
  let res;
  try {
    res = await fetch(nodeUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (e) {
    return { classification: e.name === 'TimeoutError' ? 'TIMEOUT' : 'NETWORK_FAIL', httpStatus: null, rpcErrorCode: null, responseBytes: null, reason: e.name === 'TimeoutError' ? `timeout after ${TIMEOUT_MS / 1000}s` : String(e.cause?.code ?? e.message) };
  }
  const httpStatus = res.status;
  let text;
  try {
    text = await res.text();
  } catch (e) {
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

function notFound(p) {
  if (p.classification !== 'RPC_FAIL' || p.rpcErrorCode === null) return false;
  if (p.rpcErrorCode === -32601) return true;
  return p.rpcErrorCode === -32002 && /could not find (api|method)/i.test(p.reason);
}
function dispatched(p) {
  return p.classification === 'OK' || p.classification === 'OK_PARAM_INVALID' || (p.classification === 'RPC_FAIL' && !notFound(p));
}

async function getSignature(nodeUrl, apiMethod) {
  try {
    const res = await fetch(nodeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'jsonrpc.get_signature', params: { method: apiMethod }, id: 1 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body = await res.json();
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

const liveProbes = new Map(); // name → { status, per-node detail, sig }
if (bodyUndocumented.length > 0) {
  console.log(`source-crosscheck: existence-probing ${bodyUndocumented.length} undocumented body name(s) on ${LABEL1} + ${LABEL2} (empty-params dispatch + get_signature)\n`);
  let next = 0;
  const lane = async () => {
    while (next < bodyUndocumented.length) {
      const i = next++;
      const name = bodyUndocumented[i];
      const override = WIRE_NAME_OVERRIDES[name];
      const wire = override?.wire ?? name;
      const params = override?.params ?? {};
      const sig1 = await getSignature(NODE1, wire);
      const sig2 = await getSignature(NODE2, wire);
      const c1 = await probe(NODE1, wire, params);
      const c2 = await probe(NODE2, wire, params);
      const d1 = dispatched(c1);
      const d2 = dispatched(c2);
      const nf1 = notFound(c1);
      const nf2 = notFound(c2);
      let status;
      if (d1 && d2) status = 'alive';
      else if (!d1 && !d2 && nf1 && nf2) status = 'dead';
      else if (d1 !== d2) status = 'node-dependent';
      else status = 'undetermined'; // both lanes failed structurally (network etc.)
      liveProbes.set(name, {
        status,
        probeName: wire,
        probeParams: override ? 'array [api, method, args] (call convention)' : '{} (existence probe)',
        sig: { [LABEL1]: { ok: sig1.ok, usable: sig1.usable, note: sig1.note }, [LABEL2]: { ok: sig2.ok, usable: sig2.usable, note: sig2.note } },
        curl: { [LABEL1]: c1, [LABEL2]: c2 },
        evidence: [
          `get_signature [${LABEL1}]: ${sig1.note}`,
          `get_signature [${LABEL2}]: ${sig2.note}`,
          `curl ${LABEL1} [${override ? 'call-convention array params' : '{} existence probe'}]: ${c1.classification}${c1.rpcErrorCode !== null ? ` (jsonrpc ${c1.rpcErrorCode})` : ''}, ${c1.responseBytes ?? '?'}B - ${c1.reason}`,
          `curl ${LABEL2} [${override ? 'call-convention array params' : '{} existence probe'}]: ${c2.classification}${c2.rpcErrorCode !== null ? ` (jsonrpc ${c2.rpcErrorCode})` : ''}, ${c2.responseBytes ?? '?'}B - ${c2.reason}`,
        ],
      });
      console.log(`  [${String(i + 1).padStart(String(bodyUndocumented.length).length)}/${bodyUndocumented.length}] ${status.padEnd(15)} ${name}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, bodyUndocumented.length) }, lane));
}

// ---------------------------------------------------------------------------
// Double-source param comparison (plan decision 1)
// ---------------------------------------------------------------------------

function compareParams(name) {
  const sm = steemMethods.get(name);
  const hm = hiveMethods.get(name);
  if (!sm || !hm) return null;
  const out = { steem_style: sm.param_style, hivemind_style: hm.dummy ? 'dummy' : 'named' };
  if (hm.dummy) {
    out.comparable = false;
    out.reason = 'hivemind side is a dummy binding (registered, no validator params)';
    return out;
  }
  if (sm.param_style === 'positional' || sm.params === null) {
    out.comparable = false;
    out.reason = sm.params === null && sm.param_style !== 'positional' ? 'steem params not statically enumerable (params:null)' : 'steem side is positional (no parameter names)';
    return out;
  }
  const sp = sm.params ?? [];
  const hp = hm.params.map((p) => p.name);
  out.comparable = true;
  out.steem_params = sp;
  out.hivemind_params = hp;
  out.mismatch = sp.join(',') !== hp.join(',');
  return out;
}

// ---------------------------------------------------------------------------
// The combo→disposition table (the review artifact) + per-row resolution
// ---------------------------------------------------------------------------

const DISPOSITION_TABLE = [
  { combo: 'src+ doc+ node-alive', id: 'all-good', action: 'keep the page as-is', basis: '常规组合：三源一致（node `changed` 行附带 contract-drift 注记 → T23 输入；alive 但带 deprecated/disabled/removed 软标注的行附带 soft-flag 注记）' },
  { combo: 'src+ doc+ node-dead', id: 'annotation-refresh', action: '按死亡标注三族复核（决策 3）：deprecated 维持 / disabled 口径为「源码仍定义；插件未在公共节点启用」/ removed 口径不成立（源码仍定义）→ 回归态（T25 已将全部此类页面刷新为 disabled 口径，family census 断言 0）', basis: '决策 3-①②③ + 对照表' },
  { combo: 'src+ doc- node-alive', id: 'add-page', action: 'T22 补页（en+zh 方法页 + 手写总览页计数守卫）', basis: '对照表：源码有+文档无+节点活 → 补页（T22 输入）' },
  { combo: 'src+ doc- node-dead', id: 'add-page+dead-note', action: 'T22 补页且携带 dead-note 警示块', basis: '对照表：源码有+文档无+节点死 → 补页+警示块' },
  { combo: 'src- doc+ node-alive', id: 'keep-annotation', action: 'witness 型：保留页面与标注（两源均无定义而节点仍服务）', basis: '对照表：源码无+文档有+节点活 → keep-annotation（witness 型）' },
  { combo: 'src- doc+ node-dead', id: 'removed-keep', action: '维持 removed 标注，理由升级为源码缺失实证（两源清单均无此名）', basis: '决策 3-③：removed 源码均无定义，标注维持且理由更硬' },
  { combo: 'src- doc- node-*', id: 'unreachable', action: 'impossible by construction（universe = 两源 ∪ 文档）', basis: '构造性排除；出现即断言失败' },
  { combo: 'node-dependent（任意 src/doc 组合）', id: 'node-dependent-review', action: '两节点结论分歧，单节点异常不足以致死 — 仲裁后归入对应组合', basis: 'drift/coverage「never auto-kill」语义' },
  { combo: 'node-undetermined（探测双失败）', id: 'needs-live-confirmation', action: '节点不可达或探测通道结构性失败 — 换可达节点重跑', basis: 'node 维度未定，无法落入 8 组合' },
];

function comboKey(srcPresent, docPresent, nodeStatus) {
  return `src${srcPresent ? '+' : '-'} doc${docPresent ? '+' : '-'} node-${nodeStatus}`;
}

function resolveDisposition(srcPresent, docPresent, nodeStatus, doc) {
  if (!srcPresent && !docPresent) return { id: 'unreachable', note: null, basis: '构造性排除' };
  if (nodeStatus === 'node-dependent') return { id: 'node-dependent-review', note: '两节点结论分歧（alive/dead 不一致）— 单节点异常不足以致死（drift 语义）；仲裁后归入对应组合', basis: 'drift 单节点异常语义（never auto-kill）' };
  if (srcPresent && docPresent) {
    if (nodeStatus === 'alive') return { id: 'all-good', note: null, basis: '对照表：src+ doc+ node-alive → all-good' };
    if (nodeStatus === 'dead') {
      const flags = doc.flags;
      if (flags.removed) return { id: 'annotation-refresh', family: 'removed-unsupported', note: '源码清单仍定义此方法，「Removed from the API」口径不成立；T25 已将此类页面刷新为 disabled 口径 — 此处重新出现即回归', basis: '对照表 + 决策 3-③ 反例（T25 后为回归态）' };
      if (flags.disabled) return { id: 'annotation-refresh', family: 'disabled-refresh', note: '口径刷新为「源码仍定义；插件未在公共节点启用」（决策 3-②）', basis: '对照表 + 决策 3-②' };
      if (flags.deprecated) return { id: 'annotation-refresh', family: 'deprecated-keep', note: '弃用语义与源码存在不矛盾，标注维持（决策 3-①）', basis: '对照表 + 决策 3-①' };
      return { id: 'annotation-refresh', family: 'unflagged-dead', note: 'dead 但无任何死亡标注（违反二期 dead-regression 对齐），需补标注', basis: '对照表 + coverage dead-regression 契约' };
    }
  }
  if (srcPresent && !docPresent) {
    if (nodeStatus === 'alive') return { id: 'add-page', note: null, basis: '对照表：源码有+文档无+节点活 → add-page（T22 输入）' };
    if (nodeStatus === 'dead') return { id: 'add-page+dead-note', note: null, basis: '对照表：源码有+文档无+节点死 → add-page+dead-note' };
  }
  if (!srcPresent && docPresent) {
    if (nodeStatus === 'alive') return { id: 'keep-annotation', note: null, basis: '对照表：源码无+文档有+节点活 → keep-annotation（witness 型）' };
    if (nodeStatus === 'dead') return { id: 'removed-keep', note: '两源清单均无此名 — removed 标注维持，理由升级为源码缺失实证（决策 3-③）', basis: '对照表 + 决策 3-③' };
  }
  return { id: 'needs-live-confirmation', note: 'node status undetermined — re-run with reachable nodes', basis: 'node 维度未定，无法落入 8 组合' };
}

// ---------------------------------------------------------------------------
// Build the matrix
// ---------------------------------------------------------------------------

const rows = [];
for (const name of bodyNames) {
  const sm = steemMethods.get(name);
  const hm = hiveMethods.get(name);
  const dm = docMethods.get(name) ?? null;
  const srcPresent = Boolean(sm || hm);
  const docPresent = Boolean(dm);

  let node;
  if (docPresent) {
    const v = driftVerdict.get(name);
    if (v === 'alive' || v === 'changed') {
      node = { status: 'alive', drift: v, source: `drift-snapshot ${DRIFT_DATE} (${DRIFT_BASENAME})` };
    } else if (v === 'dead') {
      node = { status: 'dead', drift: v, source: `drift-snapshot ${DRIFT_DATE} (${DRIFT_BASENAME})` };
    } else {
      node = { status: v === 'node-dependent' ? 'node-dependent' : 'undetermined', drift: v, source: `drift-snapshot ${DRIFT_DATE} (${DRIFT_BASENAME})` };
    }
  } else {
    const lp = liveProbes.get(name);
    node = lp
      ? { status: lp.status, drift: null, source: `live-probe ${new Date().toISOString().slice(0, 10)} (${LABEL1}+${LABEL2}, empty-params existence probe)` }
      : { status: 'undetermined', drift: null, source: 'not probed' };
  }

  const disposition = resolveDisposition(srcPresent, docPresent, node.status, dm);
  const notes = [];
  if (WIRE_NAME_OVERRIDES[name]) {
    notes.push(`线名为裸 \`${WIRE_NAME_OVERRIDES[name].wire}\`（legacy call 约定，hivemind serve.py:119）；清单名 \`call.call\` 是 T20 命名空间拼接的产物 — 实测按线名携带 call 约定数组参数探测`);
  }
  if (hm?.dummy) {
    notes.push('hivemind 侧为 dummy 绑定（serve.py 注册了方法名但无独立实现，返回空壳）');
  }
  if (disposition.id === 'all-good' && dm && (dm.flags.deprecated || dm.flags.disabled || dm.flags.removed)) {
    notes.push(`alive 但页面带 ${[dm.flags.removed && 'removed', dm.flags.disabled && 'disabled', dm.flags.deprecated && 'deprecated'].filter(Boolean).join('+')} 软标注（2018 抓取期语义）— 维持，T22/T23 复核时顺带确认${dm.flags.removed ? '（removed+alive 自相矛盾态，需重点复核）' : ''}`);
  }
  if (disposition.id === 'all-good' && node.drift === 'changed') {
    notes.push('节点契约与文档 parameter_json 不一致（drift verdict: changed）— all-good 维持页面，契约刷新归 T23');
  }
  const row = {
    api_method: name,
    src: sm && hm ? 'both' : sm ? 'steem' : hm ? 'hivemind' : 'none',
    steem: sm ? { param_style: sm.param_style, params: sm.params, conditional: sm.conditional, source: sm.source } : null,
    hivemind: hm ? { params: hm.params.map((p) => (p.default === undefined ? { name: p.name } : { name: p.name, default: p.default })), dummy: hm.dummy, type: hm.type } : null,
    doc: dm ? { file: dm.file, flags: dm.flags } : null,
    node,
    param_style: compareParams(name), // populated only for double-source rows
    combo: comboKey(srcPresent, docPresent, node.status),
    disposition: { ...disposition, note: notes.length > 0 ? notes.join('；') : (disposition.note ?? null) },
  };
  rows.push(row);
}
rows.sort((a, b) => a.api_method.localeCompare(b.api_method));

const excludedRows = excluded.map((name) => {
  const sm = steemMethods.get(name);
  const dm = docMethods.get(name) ?? null;
  const rule = EXCLUDED_PREFIXES.find((e) => name.startsWith(e.prefix));
  return {
    api_method: name,
    src: sm ? 'steem' : 'none',
    doc: dm ? { file: dm.file, flags: dm.flags } : null,
    node: dm ? { status: driftVerdict.get(name), source: `drift-snapshot ${DRIFT_DATE}` } : { status: 'not-probed (excluded)', source: null },
    reason: rule?.reason ?? 'unknown exclusion rule',
  };
});

// ---------------------------------------------------------------------------
// Disposal lists (① add-page ② death-annotation review ③ double-source ④ exclusions)
// ---------------------------------------------------------------------------

const byId = (id) => rows.filter((r) => r.disposition.id === id);
const addPage = byId('add-page');
const addPageDeadNote = byId('add-page+dead-note');
const annotationRefresh = byId('annotation-refresh');
const refreshByFamily = (f) => annotationRefresh.filter((r) => r.disposition.family === f);
const removedKeep = byId('removed-keep');
const keepAnnotation = byId('keep-annotation');
const allGood = byId('all-good');
const needsLive = byId('needs-live-confirmation');
const nodeDep = byId('node-dependent-review');

const deprecatedKeep = refreshByFamily('deprecated-keep');
const disabledRefresh = refreshByFamily('disabled-refresh');
const removedUnsupported = refreshByFamily('removed-unsupported');
const unflaggedDead = refreshByFamily('unflagged-dead');
const softFlaggedAlive = allGood.filter((r) => r.doc && (r.doc.flags.deprecated || r.doc.flags.disabled || r.doc.flags.removed) && r.node.drift !== 'changed');
const driftChanged = allGood.filter((r) => r.node.drift === 'changed');
const doubleSource = rows.filter((r) => r.src === 'both');

// ---------------------------------------------------------------------------
// Hard outcome assertions (contract checks — exit 1 on violation)
// ---------------------------------------------------------------------------

const failures = [];
const nameSet = new Set(rows.map((r) => r.api_method));
if (nameSet.size !== bodyNames.length) failures.push('matrix rows contain duplicates');
for (const n of steemMethods.keys()) if (!nameSet.has(n) && !excluded.includes(n)) failures.push(`steem method missing from matrix: ${n}`);
for (const n of hiveMethods.keys()) if (!nameSet.has(n)) failures.push(`hivemind method missing from matrix: ${n}`);
for (const n of docMethods.keys()) if (!nameSet.has(n) && !excludedRows.some((e) => e.api_method === n)) failures.push(`documented method missing from matrix: ${n}`);
if (rows.length + excludedRows.length !== universe.length) failures.push(`universe accounting: body ${rows.length} + excluded ${excludedRows.length} != universe ${universe.length}`);
if (rows.some((r) => r.disposition.id === 'unreachable')) failures.push('unreachable combo materialized: ' + rows.filter((r) => r.disposition.id === 'unreachable').map((r) => r.api_method).join(', '));

// Task-mandated double-check: the two witness_api doc-legacy methods must land
// on src-none + doc + dead → removed-keep.
for (const w of ['witness_api.get_account_bandwidth', 'witness_api.get_reserve_ratio']) {
  const r = rows.find((x) => x.api_method === w);
  if (!r) failures.push(`witness double-check: ${w} missing from matrix`);
  else if (r.src !== 'none' || !r.doc || r.node.status !== 'dead' || r.disposition.id !== 'removed-keep') {
    failures.push(`witness double-check: ${w} resolved to src=${r.src} doc=${Boolean(r.doc)} node=${r.node.status} disposition=${r.disposition.id}, expected src-none+doc+dead → removed-keep`);
  }
}
const cab = rows.find((r) => r.api_method === 'condenser_api.get_account_bandwidth');
if (!cab || cab.disposition.id !== 'removed-keep') failures.push('condenser_api.get_account_bandwidth must resolve to removed-keep (documented, absent from both inventories, dead)');

// Decision-3 family census.
// Post-T25: the 14 removed-unsupported pages were refreshed to the disabled
// wording (source still defines them — "Removed from the API" was falsified),
// so the disabled family is 25 and removed-unsupported must stay 0; a
// reappearing removed flag on a source-defined method is a T25 regression.
const FAMILY_BASELINE = {
  deprecatedKeep: { n: 7, members: ['database_api.find_smt_contributions', 'database_api.find_smt_token_emissions', 'database_api.find_smt_tokens', 'database_api.get_nai_pool', 'database_api.list_smt_contributions', 'database_api.list_smt_token_emissions', 'database_api.list_smt_tokens'] },
  // Post-T22: the two chain_api pages (filled with the decision-3-② wording
  // baked in) join the 9 debug_node_api methods in the disabled family.
  // Post-T25: the 14 former removed-unsupported pages join them after their
  // annotation refresh (removed flag → disabled flag + source-truth detail).
  disabledRefresh: {
    n: 25,
    members: [
      'debug_node_api.debug_generate_blocks', 'debug_node_api.debug_generate_blocks_until',
      'debug_node_api.debug_get_hardfork_property_object', 'debug_node_api.debug_get_json_schema',
      'debug_node_api.debug_get_witness_schedule', 'debug_node_api.debug_has_hardfork',
      'debug_node_api.debug_pop_block', 'debug_node_api.debug_push_blocks', 'debug_node_api.debug_set_hardfork',
      'chain_api.push_block', 'chain_api.push_transaction',
      'follow_api.get_blog_authors', 'follow_api.get_feed', 'follow_api.get_feed_entries',
      'rewards_api.simulate_curve_payouts',
      'tags_api.get_active_votes', 'tags_api.get_discussions_by_active', 'tags_api.get_discussions_by_cashout',
      'tags_api.get_discussions_by_children', 'tags_api.get_discussions_by_feed', 'tags_api.get_discussions_by_votes',
      'tags_api.get_replies_by_last_update', 'tags_api.get_tags_used_by_author', 'tags_api.get_trending_tags',
      'transaction_status_api.find_transaction',
    ],
  },
  removedKeep: { n: 3, members: ['condenser_api.get_account_bandwidth', 'witness_api.get_account_bandwidth', 'witness_api.get_reserve_ratio'] },
  removedUnsupported: { n: 0 },
  softFlaggedAlive: { n: 5 },
};
if (deprecatedKeep.length !== FAMILY_BASELINE.deprecatedKeep.n || deprecatedKeep.map((r) => r.api_method).sort().join(',') !== [...FAMILY_BASELINE.deprecatedKeep.members].sort().join(',')) {
  failures.push(`decision-3 ①: deprecated-keep family is [${deprecatedKeep.map((r) => r.api_method).join(', ')}], expected the 7 SMT-era database_api methods`);
}
if (disabledRefresh.length !== FAMILY_BASELINE.disabledRefresh.n || disabledRefresh.map((r) => r.api_method).sort().join(',') !== [...FAMILY_BASELINE.disabledRefresh.members].sort().join(',')) {
  failures.push(`decision-3 ②: disabled-refresh family is [${disabledRefresh.map((r) => r.api_method).join(', ')}], expected the 25 pages carrying the decision-3-② wording (9 debug_node_api + 2 chain_api filled post-T22 + 14 refreshed from removed to disabled post-T25)`);
}
if (removedKeep.length !== FAMILY_BASELINE.removedKeep.n || removedKeep.map((r) => r.api_method).sort().join(',') !== [...FAMILY_BASELINE.removedKeep.members].sort().join(',')) {
  failures.push(`decision-3 ③: removed-keep family is [${removedKeep.map((r) => r.api_method).join(', ')}], expected the 3 source-absent documented dead methods`);
}
if (removedUnsupported.length !== FAMILY_BASELINE.removedUnsupported.n) {
  failures.push(`decision-3 ③ amendment (post-T25): removed-unsupported family is ${removedUnsupported.length} rows, expected 0 — every removed flag on a source-defined method was refreshed to the disabled wording in T25; a reappearing one is a regression: ${removedUnsupported.map((r) => r.api_method).join(', ')}`);
}
if (softFlaggedAlive.length !== FAMILY_BASELINE.softFlaggedAlive.n) {
  failures.push(`soft-flagged-alive census is ${softFlaggedAlive.length}, expected 5 (2 deprecated + 3 disabled era-2018 soft flags on live methods; removed+alive would also count here — none expected)`);
}
if (unflaggedDead.length > 0) failures.push('dead documented methods without any death flag: ' + unflaggedDead.map((r) => r.api_method).join(', '));

if (failures.length > 0) {
  for (const f of failures) console.error('source-crosscheck: ASSERTION FAILED: ' + f);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const comboCensus = {};
for (const r of rows) comboCensus[r.combo] = (comboCensus[r.combo] ?? 0) + 1;

console.log('\nSummary');
console.log(`  universe           : ${universe.length} (body ${rows.length} + excluded ${excludedRows.length})`);
console.log(`  combo census       : ${Object.entries(comboCensus).map(([k, v]) => `${k}=${v}`).join(' · ')}`);
console.log(`  ① add-page         : ${addPage.length}${addPageDeadNote.length ? ` (+${addPageDeadNote.length} with dead-note)` : ''}`);
console.log(`  ② annotation review: deprecated-keep ${deprecatedKeep.length} · disabled-refresh ${disabledRefresh.length} · removed-keep ${removedKeep.length} · removed-unsupported ${removedUnsupported.length}`);
console.log(`  ③ double-source    : ${doubleSource.length} (param mismatches: ${doubleSource.filter((r) => r.param_style?.mismatch).length})`);
console.log(`  ④ excluded         : ${excludedRows.length} (+ ingest / community.py inventory-level notes)`);
if (needsLive.length) console.log(`  needs-live-confirm : ${needsLive.length} (${needsLive.map((r) => r.api_method).join(', ')})`);
if (nodeDep.length) console.log(`  node-dependent     : ${nodeDep.length} (${nodeDep.map((r) => r.api_method).join(', ')})`);
if (softFlaggedAlive.length) console.log(`  soft-flagged alive : ${softFlaggedAlive.length} (${softFlaggedAlive.map((r) => r.api_method).join(', ')})`);

// ---------------------------------------------------------------------------
// Outputs: data/audit/source-crosscheck-<date>.json + .md — ONLY with --write
// ---------------------------------------------------------------------------

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

const snapshot = {
  tool: 'source-crosscheck',
  generatedAt: now.toISOString(),
  date,
  mode: WRITE ? 'write' : 'report-only',
  inputs: {
    steemInventory: { file: 'data/source-inventory/steem.json', repo: steemInv.repo, commit: steemInv.commit, branch: steemInv.branch, methods: steemMethods.size, conditional: steemConditional.length },
    hivemindInventory: { file: 'data/source-inventory/hivemind.json', repo: hiveInv.repo, commit: hiveInv.commit, branch: hiveInv.branch, bindings: hiveMethods.size, dummies: hiveDummies },
    manifest: { dir: 'data/apidefinitions/', files: docFiles.length, methods: docMethods.size },
    drift: { file: `data/audit/${DRIFT_BASENAME}`, date: DRIFT_DATE, nodes: drift.nodes ?? null },
  },
  nodes: { [LABEL1]: NODE1, [LABEL2]: NODE2 },
  dispositionTable: DISPOSITION_TABLE,
  stats: {
    universe: universe.length,
    body: rows.length,
    excluded: excludedRows.length,
    combos: comboCensus,
    addPage: addPage.length,
    addPageDeadNote: addPageDeadNote.length,
    annotationRefresh: { total: annotationRefresh.length, deprecatedKeep: deprecatedKeep.length, disabledRefresh: disabledRefresh.length, removedUnsupported: removedUnsupported.length, unflaggedDead: unflaggedDead.length },
    removedKeep: removedKeep.length,
    keepAnnotation: keepAnnotation.length,
    allGood: allGood.length,
    softFlaggedAlive: softFlaggedAlive.length,
    driftChanged: driftChanged.length,
    doubleSource: doubleSource.length,
    doubleSourceParamMismatch: doubleSource.filter((r) => r.param_style?.mismatch).length,
    needsLiveConfirmation: needsLive.length,
    nodeDependent: nodeDep.length,
  },
  lists: {
    addPage: addPage.map((r) => ({ api_method: r.api_method, src: r.src, param_style: r.param_style, node: r.node, steem: r.steem, hivemind: r.hivemind, note: r.disposition.note ?? null })),
    addPageDeadNote: addPageDeadNote.map((r) => ({ api_method: r.api_method, src: r.src, param_style: r.param_style, node: r.node, steem: r.steem, hivemind: r.hivemind, note: r.disposition.note ?? null })),
    annotationRefresh: {
      deprecatedKeep: deprecatedKeep.map((r) => r.api_method),
      disabledRefresh: disabledRefresh.map((r) => r.api_method),
      removedUnsupported: removedUnsupported.map((r) => ({ api_method: r.api_method, steemSource: r.steem?.source ?? null })),
      unflaggedDead: unflaggedDead.map((r) => r.api_method),
    },
    removedKeep: removedKeep.map((r) => ({ api_method: r.api_method, docFlags: r.doc?.flags ?? null })),
    keepAnnotation: keepAnnotation.map((r) => r.api_method),
    softFlaggedAlive: softFlaggedAlive.map((r) => ({ api_method: r.api_method, flags: r.doc.flags })),
    driftChanged: driftChanged.map((r) => r.api_method),
    doubleSource: doubleSource.map((r) => ({ api_method: r.api_method, param_style: r.param_style, hivemind_dummy: r.hivemind?.dummy ?? false })),
  },
  excludedRows,
  exclusionsInventoryLevel: [
    { name: 'ingest (steem)', reason: '纯 appbase 插件（ingest_plugin 分支定制）：无 json_rpc 依赖、无 DECLARE_API，不是 API 插件 → 不产生方法，不入矩阵（plan §1 / 决策 2）。机检：steem inventory 无 ingest 命名空间。' },
    { name: 'community.py unregistered defs (hivemind)', reason: 'hivemind community.py/notify/stats 的函数只有经 serve.py 注册点暴露的部分才入清单（bridge./hive. 前缀）；未注册 def 不构成 JSON-RPC 方法 → 不入矩阵。机检：hivemind inventory 绑定数 == 68（T20 基线）。' },
  ],
  classificationLegend: ['OK', 'OK_PARAM_INVALID', 'RPC_FAIL', 'HTTP_FAIL', 'NETWORK_FAIL', 'TIMEOUT'],
  verdictLegend: {
    alive: 'dispatched on both probe nodes (result / -32602 param rejection / non-not-found server error), or the drift snapshot says alive|changed',
    dead: 'structured not-found (-32601 / -32002 "Could not find API/method") on both probe nodes',
    'node-dependent': 'divergent outcomes across the two nodes — never auto-killed',
    undetermined: 'probe lanes failed structurally (network) or snapshot verdict unknown',
  },
  matrix: rows,
};

const lines = [];
lines.push(`# Source × docs × node crosscheck matrix — ${date}`);
lines.push('');
lines.push(`- inputs: steem inventory ${steemMethods.size} methods (${steemInv.repo}@${(steemInv.commit ?? '').slice(0, 7)} [${steemInv.branch}]) · hivemind inventory 68 bindings (${hiveInv.repo}@${(hiveInv.commit ?? '').slice(0, 7)} [${hiveInv.branch}]) · manifest ${docMethods.size} methods / ${docFiles.length} files · drift \`${DRIFT_BASENAME}\` (${DRIFT_DATE})`);
lines.push(`- probe nodes (undocumented body names): ${NODE1} [\`${LABEL1}\`] + ${NODE2} [\`${LABEL2}\`] · mode: ${WRITE ? 'write' : 'report-only'}`);
lines.push(`- universe ${universe.length} = matrix body ${rows.length} + excluded ${excludedRows.length} · combo census: ${Object.entries(comboCensus).map(([k, v]) => `\`${k}\`=${v}`).join(' · ')}`);
lines.push('');
lines.push('Combo→disposition table (every body row resolves through exactly one cell):');
lines.push('');
lines.push('| combo | disposition | action | basis |');
lines.push('| --- | --- | --- | --- |');
for (const t of DISPOSITION_TABLE) lines.push(`| ${t.combo} | \`${t.id}\` | ${esc(t.action)} | ${esc(t.basis)} |`);
lines.push('');
lines.push('## ① Add-page list (source-has + docs-lacks → T22 input)');
lines.push('');
lines.push(`${addPage.length} alive + ${addPageDeadNote.length} dead (pages carry a dead-note block). Each needs en+zh method pages plus the hand-written overview count guard (plan decision 5).`);
lines.push('');
const styleStr = (r) => {
  if (r.param_style) return `${r.param_style.steem_style ?? '-'} / ${r.param_style.hivemind_style ?? '-'}`;
  if (r.steem) return r.steem.param_style;
  if (r.hivemind) return r.hivemind.dummy ? 'dummy' : 'named';
  return '-';
};
lines.push('| api_method | source | node | param_style | note |');
lines.push('| --- | --- | --- | --- | --- |');
for (const r of [...addPage, ...addPageDeadNote]) {
  const noteBits = [r.disposition.id === 'add-page+dead-note' ? 'add dead-note block' : '', r.disposition.note ?? ''].filter(Boolean).join(' — ');
  lines.push(`| ${r.api_method} | ${r.src} | ${r.node.status} | ${styleStr(r)} | ${esc(noteBits)} |`);
}
lines.push('');
lines.push('## ② Death-annotation review (plan decision 3, three families re-checked against the source inventories)');
lines.push('');
lines.push(`- **deprecated — keep (${deprecatedKeep.length})**: source still defines every one; deprecation semantics do not contradict source presence. ${deprecatedKeep.map((r) => r.api_method).join(', ')}.`);
lines.push(`- **disabled — decision-3-② wording (${disabledRefresh.length})**: every dead-but-source-defined page carries the "defined in source; plugin not enabled on public nodes" wording (decision 3-②; T25 refreshed the 14 former removed-unsupported pages onto this口径). ${disabledRefresh.map((r) => r.api_method).join(', ')}.`);
lines.push(`- **removed — keep with harder evidence (${removedKeep.length})**: absent from BOTH source inventories — the annotation survives with source-absence as proof. ${removedKeep.map((r) => r.api_method).join(', ')}.`);
lines.push(`- **removed — annotation falsified (${removedUnsupported.length})**: post-T25 no removed-flagged page describes a method the steem inventory (${steemInv.commit?.slice(0, 7)}) STILL DEFINES — T25 refreshed all 14 falsified annotations to the disabled wording ("defined in source, not enabled on public nodes"); a reappearing entry here is a regression${removedUnsupported.length ? `: ${removedUnsupported.map((r) => r.api_method).join(', ')}.` : '.'}`);
lines.push(`- **soft flags on live methods (${softFlaggedAlive.length})**: era-2018 \`disabled\`/"Not Implemented" and \`deprecated\` annotations on methods that still dispatch — kept as-is here, confirm during T22/T23 edits. ${softFlaggedAlive.map((r) => r.api_method).join(', ')}.`);
lines.push(`- **contract drift on alive methods (${driftChanged.length})**: all-good pages whose node signature differs from the documented parameter_json (drift verdict \`changed\`) — page stays, contract fix belongs to T23. ${driftChanged.map((r) => r.api_method).join(', ')}.`);
lines.push('');
lines.push('## ③ Double-source methods (hivemind-served names the steem source also defines)');
lines.push('');
lines.push(`${doubleSource.length} methods carry both a steem and a hivemind definition (plan decision 1: steem=positional/named per DECLARE_API args, hivemind=named per serve.py validators, dummy=dummy binding). When both sides have statically enumerable params and the sequences differ, the row is flagged — node reality wins; contract reconciliation is T23 input.`);
lines.push('');
lines.push('| api_method | steem style | steem params | hivemind style | hivemind params | mismatch |');
lines.push('| --- | --- | --- | --- | --- | --- |');
for (const r of doubleSource) {
  const ps = r.param_style;
  const sp = ps.comparable ? (ps.steem_params ?? []).join(', ') : `n/a (${esc(ps.reason)})`;
  const hp = ps.comparable ? (ps.hivemind_params ?? []).join(', ') : r.hivemind.dummy ? 'dummy' : 'named (defaults omitted)';
  lines.push(`| ${r.api_method} | ${ps.steem_style} | ${esc(sp)} | ${ps.hivemind_style} | ${esc(hp)} | ${ps.comparable ? (ps.mismatch ? '**YES**' : 'no') : 'not comparable'} |`);
}
lines.push('');
lines.push(`Signature mismatches: ${doubleSource.filter((r) => r.param_style?.mismatch).length} of ${doubleSource.filter((r) => r.param_style?.comparable).length} comparable rows (${doubleSource.length} double-source total) — ${doubleSource.filter((r) => r.param_style?.mismatch).map((r) => r.api_method).join(', ')}.`);
lines.push('');
lines.push('## ④ Exclusions (plan decision 2) — NOT matrix rows');
lines.push('');
lines.push('| name | source | node | reason |');
lines.push('| --- | --- | --- | --- |');
for (const e of excludedRows) lines.push(`| ${e.api_method} | ${e.src} | ${e.node.status} | ${esc(e.reason)} |`);
for (const e of snapshot.exclusionsInventoryLevel) lines.push(`| ${esc(e.name)} | — | — | ${esc(e.reason)} |`);
lines.push('');
lines.push('## Matrix (all body rows)');
lines.push('');
lines.push('| api_method | src | doc | flags | node | node source | combo | disposition | note |');
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
const flagStr = (r) => (r.doc ? [r.doc.flags.removed && 'removed', r.doc.flags.disabled && 'disabled', r.doc.flags.deprecated && 'deprecated'].filter(Boolean).join('+') || '-' : '-');
for (const r of rows) {
  lines.push(`| ${r.api_method} | ${r.src} | ${r.doc ? r.doc.file : '-'} | ${flagStr(r)} | ${r.node.status}${r.node.drift ? ` (${r.node.drift})` : ''} | ${r.node.source} | ${r.combo} | \`${r.disposition.id}\`${r.disposition.family ? `/${r.disposition.family}` : ''} | ${esc(r.disposition.note ?? '')} |`);
}
lines.push('');
lines.push('Verdict rules: `alive` = dispatched on both probe nodes (or drift snapshot alive/changed); `dead` = structured not-found on both; a single-node anomaly never kills. Undocumented names were existence-probed live (empty params; the legacy `call` adapter probed with its array-params convention — see the row note); provenance is in `node source`.');

if (WRITE) {
  mkdirSync(OUT_DIR, { recursive: true });
  const jsonPath = join(OUT_DIR, `source-crosscheck-${date}.json`);
  const mdPath = join(OUT_DIR, `source-crosscheck-${date}.md`);
  writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2) + '\n');
  writeFileSync(mdPath, lines.join('\n') + '\n');
  console.log(`\nwrote ${jsonPath}`);
  console.log(`wrote ${mdPath}`);
} else {
  console.log(`\n${lines.join('\n')}`);
  console.log(`\nreport-only: nothing written. Re-run with --write to persist data/audit/source-crosscheck-${date}.{json,md}.`);
}
console.log('\ndone (exit 0; findings are data, not failures — read the disposal lists and the death-annotation review)');
