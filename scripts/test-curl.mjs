#!/usr/bin/env node
// Live-test every documented JSON-RPC method against a steemd node. Methods
// only: `ops` entries (broadcast op docs) are not callable RPC methods and are
// deliberately out of scope.
//
// For each method that documents `curl_examples` or `parameter_json`, POSTs
//   {"jsonrpc":"2.0","method":<api_method>,"params":<normalized parameter_json>,"id":1}
// to $TEST_NODE (default https://api.steem.fans) and classifies the outcome:
//   OK          - HTTP 200 and the response carried a `result`, or an error
//                 that is the method's own business error: the request reached
//                 the RPC layer, which is all this tool asserts.
//   RPC_FAIL    - HTTP 200 but a JSON-RPC protocol error (method not found,
//                 invalid request, parse error): the method is not callable.
//   HTTP_FAIL   - non-200 status, or a 200 with a non-JSON body.
//   NETWORK_FAIL- the request never completed (DNS, refused, timeout).
// This is a report tool: it prints a summary table plus a failure list; drift
// against the 2020-era YAML is expected and is the point.
//
// Exit code: 0 once the report completed (the report is the artifact, the
// failure list is not a pass/fail gate); 1 on usage errors and on
// unrecoverable YAML parse failures (no report is possible then).

import { parseDocument } from 'yaml';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import process from 'node:process';
import { isObject, repairLegacyQuotesCounted, walkMethods } from './lib/yaml-lenient.mjs';

const DATA_DIR = fileURLToPath(new URL('../data/apidefinitions/', import.meta.url));
const DEFAULT_NODE = 'https://api.steem.fans';
const CONCURRENCY = 4;
const TIMEOUT_MS = 15_000;
const REASON_MAX = 90;

// JSON-RPC 2.0 protocol-level error codes: the method itself is not usable.
// Everything else (e.g. -32000 server/business errors) means the method exists
// and executed, which counts as OK.
const PROTOCOL_ERROR_CODES = new Set([-32700, -32600, -32601]);

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function usage() {
  console.error(
    'Usage: node scripts/test-curl.mjs [--api <stem>] [--limit <n>] [--node <url>]\n' +
      '  --api  <stem>  limit to one API namespace/file, e.g. condenser_api\n' +
      '  --limit <n>    test at most <n> methods\n' +
      '  --node <url>   override $TEST_NODE (default: ' + DEFAULT_NODE + ')'
  );
  process.exit(1);
}

const args = process.argv.slice(2);
let NODE_URL = process.env.TEST_NODE || DEFAULT_NODE;
let ONLY_API = null;
let LIMIT = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--api') ONLY_API = args[++i] ?? usage();
  else if (args[i] === '--limit') {
    LIMIT = Number(args[++i]);
    if (!Number.isInteger(LIMIT) || LIMIT < 1) usage();
  } else if (args[i] === '--node') NODE_URL = args[++i] ?? usage();
  else usage();
}
if (!/^https?:\/\//.test(NODE_URL)) {
  console.error(`test-curl: TEST_NODE/--node must be an http(s) URL, got "${NODE_URL}"`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// YAML loading (lenient, mirrors scripts/validate-data.mjs)
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

// ---------------------------------------------------------------------------
// Build the request list
// ---------------------------------------------------------------------------

const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.yml')).sort();
const entries = []; // { api_method, file, params }
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
    console.error(`test-curl: ${e.message}`);
    parseFailures++;
    continue;
  }
  const methods = [];
  walkMethods(data, methods);
  for (const m of methods) {
    const hasCurl = Array.isArray(m.curl_examples) && m.curl_examples.length > 0;
    const hasParams = m.parameter_json !== undefined && m.parameter_json !== null && m.parameter_json !== '';
    if (!hasCurl && !hasParams) continue; // nothing documented to exercise
    entries.push({ api_method: String(m.api_method), file, method: m });
  }
}

// Unknown --api stem: warn (probably a typo) but keep going - this stays a
// report tool, the empty scope is reported below and the exit code stays 0.
if (ONLY_API && !apiMatched) {
  console.warn(
    `test-curl: warning: unknown --api stem "${ONLY_API}" - no data/apidefinitions/${ONLY_API}.yml exists ` +
      `(known stems: ${files.map((f) => f.replace(/\.yml$/, '')).join(', ')})`
  );
}

if (parseFailures > 0) process.exit(1);

if (LIMIT !== null && entries.length > LIMIT) entries.length = LIMIT;

if (entries.length === 0) {
  console.log(`test-curl: no methods matched (${ONLY_API ? 'api=' + ONLY_API : 'all files'}). Nothing to do.`);
  process.exit(0);
}

/**
 * Normalized `params` for the POST body: parameter_json is either a JSON
 * string or native YAML; when absent, fall back to the first documented curl
 * example's params. Unparseable values degrade to {} (the point is reachability).
 */
function paramsFor(entry) {
  const m = entry.method;
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
// Run
// ---------------------------------------------------------------------------

console.log(`test-curl: ${entries.length} method(s) against ${NODE_URL}`);
console.log(`  scope: ${ONLY_API ?? 'all files'} | concurrency: ${CONCURRENCY} | timeout: ${TIMEOUT_MS / 1000}s\n`);

async function classify(entry) {
  const body = JSON.stringify({ jsonrpc: '2.0', method: entry.api_method, params: paramsFor(entry), id: 1 });
  let res;
  try {
    res = await fetch(NODE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    const reason = e.name === 'TimeoutError' ? `timeout after ${TIMEOUT_MS / 1000}s` : e.cause?.code ?? e.message;
    return { status: 'NETWORK_FAIL', reason: String(reason) };
  }
  if (!res.ok) return { status: 'HTTP_FAIL', reason: `HTTP ${res.status} ${res.statusText}`.trim() };
  let parsed;
  try {
    parsed = await res.json();
  } catch {
    return { status: 'HTTP_FAIL', reason: 'HTTP 200 with non-JSON body' };
  }
  if (!isObject(parsed)) return { status: 'HTTP_FAIL', reason: 'response is not a JSON-RPC envelope' };
  if ('result' in parsed) return { status: 'OK', reason: 'result' };
  if (isObject(parsed.error)) {
    const code = typeof parsed.error.code === 'number' ? parsed.error.code : null;
    const message = String(parsed.error.message ?? '').replace(/\s+/g, ' ').slice(0, REASON_MAX);
    if (code !== null && PROTOCOL_ERROR_CODES.has(code)) {
      return { status: 'RPC_FAIL', reason: `jsonrpc error ${code}: ${message}` };
    }
    return { status: 'OK', reason: `business error${code !== null ? ' ' + code : ''}: ${message}` };
  }
  return { status: 'RPC_FAIL', reason: 'malformed JSON-RPC response (no result, no error)' };
}

const results = new Array(entries.length);
let next = 0;
const lane = async () => {
  while (next < entries.length) {
    const i = next++;
    results[i] = { ...entries[i], ...(await classify(entries[i])) };
    const r = results[i];
    console.log(`  [${String(i + 1).padStart(String(entries.length).length)}/${entries.length}] ${r.status.padEnd(12)} ${r.api_method}${r.status === 'OK' ? '' : '  ← ' + r.reason.slice(0, REASON_MAX)}`);
  }
};
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, entries.length) }, lane));

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const counts = { OK: 0, RPC_FAIL: 0, HTTP_FAIL: 0, NETWORK_FAIL: 0 };
for (const r of results) counts[r.status]++;

const failures = results.filter((r) => r.status !== 'OK');
const col = Math.max(...Object.keys(counts).map((k) => k.length));

console.log('\nSummary');
console.log(`  total        : ${results.length}`);
for (const [status, n] of Object.entries(counts)) {
  console.log(`  ${status.padEnd(col)} : ${n}`);
}
if (failures.length > 0) {
  console.log(`\nFailures (${failures.length}):`);
  for (const r of failures) {
    console.log(`  ${r.api_method}  [${r.status}]  ${r.reason.slice(0, REASON_MAX)}`);
  }
}
console.log('\ndone (exit 0; this is a report tool — inspect the list, do not gate on it)');
