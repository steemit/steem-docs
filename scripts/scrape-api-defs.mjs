#!/usr/bin/env node
// Scrape live API definitions from a steemd node and compare/merge them with
// data/apidefinitions/*.yml. Methods only: `ops` entries (broadcast op docs)
// have no JSON-RPC identity on a node and are deliberately out of scope.
//
// Default mode is report-only: fetches `jsonrpc.get_methods` plus per-method
// `jsonrpc.get_signature` from the node and prints three diff classes grouped
// by API:
//   NEW     - method exists on the node but not in the YAML data
//   MISSING - method exists in the YAML data but not on the node
//   SIGDIFF - both exist but the node's `args` differ from `parameter_json`
// Pass --write to merge NEW methods back into the YAML files. The write is
// two-phase and all-or-nothing: every merged file is first built in memory
// and strictly validated (yaml parseDocument + method-count pre-check), and
// only when ALL files pass are they written, each via <file>.tmp + renameSync
// so no reader ever sees a half-written file. One file failing the pre-check
// aborts the whole write, but never prevents the other files from being
// checked and reported. (Existing files only; a brand-new API namespace
// would need a new file and is only reported.)
//
// TEST_NODE (honored by test-curl.mjs) deliberately does NOT apply here:
// this script never reads it from the environment — use --node to override
// the built-in default (https://api.steem.fans). Intentional asymmetry
// between the read-only tool and the writing one.
//
// Legacy data quirk (repair shared via scripts/lib/yaml-lenient.mjs):
// block_api.yml and condenser_api.yml each close one multi-line single-quoted
// scalar with a quote at column 1 (YAML 1.1 ok, YAML 1.2 not). The repair is
// applied to the in-memory copy before parsing/serializing, so --write never
// corrupts those files - the closing quote simply lands re-indented on
// write-back.
//
// Exit code: 0 on success (diffs are informational); 1 on usage errors,
// network errors, YAML parse failures, or --write pre-check/disk failures.

import { parseDocument } from 'yaml';
import { readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import process from 'node:process';
import { isObject, repairLegacyQuotes, walkMethods } from './lib/yaml-lenient.mjs';

const DATA_DIR = fileURLToPath(new URL('../data/apidefinitions/', import.meta.url));
const DEFAULT_NODE = 'https://api.steem.fans';
const CONCURRENCY = 4;
const TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function usage() {
  console.error(
    'Usage: node scripts/scrape-api-defs.mjs [--node <url>] [--api <stem>] [--write]\n' +
      '  --node <url>   steemd JSON-RPC endpoint (default: ' + DEFAULT_NODE + ')\n' +
      '  --api  <stem>  limit to one API namespace/file, e.g. database_api\n' +
      '  --write        merge NEW methods into the YAML files (default: report only)'
  );
  process.exit(1);
}

const args = process.argv.slice(2);
let NODE_URL = DEFAULT_NODE;
let ONLY_API = null;
let WRITE = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--node') NODE_URL = args[++i] ?? usage();
  else if (args[i] === '--api') ONLY_API = args[++i] ?? usage();
  else if (args[i] === '--write') WRITE = true;
  else usage();
}
if (!/^https?:\/\//.test(NODE_URL)) {
  console.error(`scrape: --node must be an http(s) URL, got "${NODE_URL}"`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// YAML loading (lenient, mirrors scripts/validate-data.mjs)
// ---------------------------------------------------------------------------

/**
 * Parse one data file into a yaml Document. Returns { doc, repaired } or
 * { error } when the file is unparseable even after the legacy-quote repair.
 */
function loadDoc(file) {
  const raw = readFileSync(join(DATA_DIR, file), 'utf8');
  const repairedRaw = repairLegacyQuotes(raw);
  const doc = parseDocument(repairedRaw, { uniqueKeys: false });
  if (doc.errors.length > 0) {
    const line = doc.errors[0].linePos?.[0]?.line ?? '?';
    return { error: `YAML parse error at line ${line}: ${String(doc.errors[0].message).split('\n')[0]}` };
  }
  return { doc, repaired: repairedRaw !== raw };
}

// ---------------------------------------------------------------------------
// JSON-RPC client
// ---------------------------------------------------------------------------

async function rpcCall(method, params) {
  let res;
  try {
    res = await fetch(NODE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    throw new Error(`network error talking to ${NODE_URL}: ${e.name === 'TimeoutError' ? 'timed out after ' + TIMEOUT_MS + 'ms' : e.cause?.code ?? e.message}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${NODE_URL}`);
  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error(`non-JSON response body from ${NODE_URL}`);
  }
  if (body.error) throw new Error(`jsonrpc error for ${method}: ${String(body.error.message).slice(0, 120)}`);
  return body.result;
}

async function runPool(items, worker) {
  const results = new Array(items.length);
  let next = 0;
  const lane = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, lane));
  return results;
}

/** Canonical JSON: object keys sorted recursively, so arg order never matters. */
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (isObject(value)) {
    return Object.fromEntries(
      Object.keys(value).sort().map((k) => [k, canonical(value[k])])
    );
  }
  return value;
}

/** parameter_json may be a JSON string or a native YAML structure. */
function normalizeParams(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  return value;
}

// ---------------------------------------------------------------------------
// Load YAML inventory
// ---------------------------------------------------------------------------

const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.yml')).sort();
const yamls = new Map(); // file -> { doc, methods: [{api_method, params}], repaired }
const methodToFiles = new Map(); // api_method -> Set(file)
let yamlMethodCount = 0;
const parseFailures = [];

for (const file of files) {
  const stem = file.replace(/\.yml$/, '');
  if (ONLY_API && stem !== ONLY_API) continue;
  const loaded = loadDoc(file);
  if (loaded.error) {
    parseFailures.push(`${file}: ${loaded.error}`);
    continue;
  }
  const methods = [];
  walkMethods(loaded.doc.toJS(), methods);
  yamlMethodCount += methods.length;
  for (const m of methods) {
    const entry = { api_method: String(m.api_method), params: normalizeParams(m.parameter_json) };
    if (!yamls.has(file)) yamls.set(file, { doc: loaded.doc, methods: [], repaired: loaded.repaired });
    yamls.get(file).methods.push(entry);
    if (!methodToFiles.has(entry.api_method)) methodToFiles.set(entry.api_method, new Set());
    methodToFiles.get(entry.api_method).add(file);
  }
}

if (parseFailures.length > 0) {
  console.error('scrape: cannot proceed, YAML parse failures:');
  for (const f of parseFailures) console.error(`  - ${f}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Fetch node state
// ---------------------------------------------------------------------------

console.log(`scrape-api-defs: comparing data/apidefinitions (${yamlMethodCount} methods in ${yamls.size} file(s))`);
console.log(`  node   : ${NODE_URL}`);
console.log(`  mode   : ${WRITE ? 'WRITE (merge NEW methods into YAML)' : 'report-only (pass --write to merge)'}`);
console.log('');

let nodeMethods;
try {
  nodeMethods = await rpcCall('jsonrpc.get_methods', {});
} catch (e) {
  console.error(`scrape: failed to fetch jsonrpc.get_methods - ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(nodeMethods)) {
  console.error('scrape: unexpected get_methods payload (expected an array of strings)');
  process.exit(1);
}

// Scope node methods to the requested API namespace, when given.
const apiPrefix = ONLY_API ? `${ONLY_API}.` : null;
const inScope = nodeMethods.filter((m) => !apiPrefix || m.startsWith(apiPrefix));

const yamlNames = new Set(methodToFiles.keys());
const nodeSet = new Set(inScope);
const newNodeNames = inScope.filter((m) => !yamlNames.has(m));

// get_signature for every method in the union (YAML-known + node-only).
const sigTargets = [...yamlNames].filter((m) => !apiPrefix || m.startsWith(apiPrefix)).concat(newNodeNames);
const signatures = new Map(); // api_method -> {args, ret} | null
await runPool(sigTargets, async (name) => {
  try {
    signatures.set(name, await rpcCall('jsonrpc.get_signature', { method: name }));
  } catch {
    signatures.set(name, null); // unreachable/private method: counted, not fatal
  }
});

// ---------------------------------------------------------------------------
// Diff report
// ---------------------------------------------------------------------------

// Group everything by API namespace (prefix before the first dot).
const byApi = new Map(); // api -> { file, newNode: [], missing: [], sigdiff: [], nosig: [] }
function apiBucket(api) {
  let b = byApi.get(api);
  if (!b) {
    b = { file: `${api}.yml`, newNode: [], missing: [], sigdiff: [], nosig: [] };
    byApi.set(api, b);
  }
  return b;
}
const apiOf = (name) => name.slice(0, name.indexOf('.'));

for (const [file, { methods }] of yamls) {
  for (const { api_method, params } of methods) {
    const b = apiBucket(apiOf(api_method));
    b.file = file;
    if (!nodeSet.has(api_method)) {
      b.missing.push(api_method);
      continue;
    }
    const sig = signatures.get(api_method);
    const args = sig?.args;
    if (params === undefined || args === undefined || args === null) {
      b.nosig.push({ api_method, why: 'no documented parameter_json or no node signature' });
      continue;
    }
    // appbase answers get_signature with `args: []` for the whole
    // condenser_api family (positional params it never documented, with an
    // arbitrary ret). An empty positional signature carries no schema data,
    // so it is "no signature available" rather than drift - otherwise every
    // condenser method would show up as a fake signature diff.
    if (Array.isArray(args) && args.length === 0) {
      b.nosig.push({ api_method, why: 'node returned an empty positional signature (args=[])' });
      continue;
    }
    if (JSON.stringify(canonical(params)) !== JSON.stringify(canonical(args))) {
      b.sigdiff.push({ api_method, yaml: params, node: args });
    }
  }
}
for (const name of newNodeNames) {
  apiBucket(apiOf(name)).newNode.push(name);
}

let apis = [...byApi.keys()];
if (ONLY_API && !apis.includes(ONLY_API)) apis.push(ONLY_API); // node-only namespace
apis.sort();

let totNew = 0;
let totMissing = 0;
let totSigdiff = 0;
const newApis = []; // namespaces with node methods but no YAML file at all
const fileExists = new Set(yamls.keys());

for (const api of apis) {
  const b = byApi.get(api) ?? { file: `${api}.yml`, newNode: [], missing: [], sigdiff: [], nosig: [] };
  const fileKnown = fileExists.has(b.file);
  if (!fileKnown && b.newNode.length > 0) newApis.push(api);
  if (b.newNode.length + b.missing.length + b.sigdiff.length === 0) continue;

  console.log(`== ${api} (${b.file}${fileKnown ? '' : ' — NO YAML FILE'}) ==`);
  if (b.newNode.length > 0) {
    totNew += b.newNode.length;
    console.log(`  NEW on node, missing in YAML (${b.newNode.length}):`);
    for (const m of b.newNode) {
      const args = signatures.get(m)?.args;
      console.log(`    + ${m}  args=${args === undefined || args === null ? '?' : JSON.stringify(args).slice(0, 100)}`);
    }
  }
  if (b.missing.length > 0) {
    totMissing += b.missing.length;
    console.log(`  MISSING from node (${b.missing.length}):`);
    for (const m of b.missing) console.log(`    - ${m}`);
  }
  if (b.sigdiff.length > 0) {
    totSigdiff += b.sigdiff.length;
    console.log(`  SIGNATURE DIFFS (${b.sigdiff.length}):`);
    for (const d of b.sigdiff) {
      console.log(`    ~ ${d.api_method}`);
      console.log(`        yaml: ${JSON.stringify(d.yaml).slice(0, 120)}`);
      console.log(`        node: ${JSON.stringify(d.node).slice(0, 120)}`);
    }
  }
  if (b.nosig.length > 0) {
    const byWhy = new Map();
    for (const e of b.nosig) byWhy.set(e.why, (byWhy.get(e.why) ?? 0) + 1);
    const detail = [...byWhy.entries()].map(([why, n]) => `${n} ${why}`).join('; ');
    console.log(`  (skipped signature check, ${b.nosig.length}: ${detail})`);
  }
  console.log('');
}

console.log('Summary');
console.log(`  node methods in scope        : ${inScope.length}`);
console.log(`  YAML methods in scope        : ${yamlMethodCount}`);
console.log(`  NEW on node                  : ${totNew}`);
console.log(`  MISSING from node            : ${totMissing}`);
console.log(`  signature diffs              : ${totSigdiff}`);
if (newApis.length > 0) {
  console.log(`  new API namespaces           : ${newApis.length} (${newApis.join(', ')})`);
}
console.log(`  (2020-era YAML vs a ${new Date().getFullYear()} node: some drift is expected)`);

// ---------------------------------------------------------------------------
// Write mode
// ---------------------------------------------------------------------------

if (!WRITE) {
  if (totNew > 0) console.log('\nreport-only: re-run with --write to merge NEW methods into the existing YAML files.');
  process.exit(0);
}

const writable = [...byApi.entries()].filter(([api, b]) => b.newNode.length > 0 && fileExists.has(b.file));

if (newApis.length > 0) {
  console.log(`\nwrite: ${newApis.length} API namespace(s) have no YAML file and are NOT auto-created: ${newApis.join(', ')}`);
}

if (writable.length === 0) {
  console.log('\nwrite: nothing to merge (no NEW methods in existing files).');
  process.exit(0);
}

console.log('');
const host = new URL(NODE_URL).host;

/** YAML single-quoted scalar, safe for any JSON text. */
const yq = (s) => `'${String(s).replace(/'/g, "''")}'`;

/** Render one method entry as text, matching the files' flat generated style. */
function renderEntry(name, itemIndent) {
  const sig = signatures.get(name);
  return [
    `${itemIndent}- api_method: ${name}`,
    `${itemIndent}  purpose: ${yq(`Scraped from ${host}: signature only, purpose pending manual edit.`)}`,
    `${itemIndent}  parameter_json: ${yq(JSON.stringify(sig?.args ?? {}))}`,
    `${itemIndent}  expected_response_json: ${yq(JSON.stringify(sig?.ret ?? {}))}`,
  ].join('\n');
}

// Phase 1 - build every merged file in memory and pre-check it. Nothing is
// written until ALL files pass. The pre-check is the former post-write
// self-check, moved in front of the write so a bad merge can never reach
// disk: the merged text must (a) parse strictly (zero parseDocument errors -
// the legacy-quote repair is already baked into the in-memory base text) and
// (b) contain every NEW method by name and at least before+NEW entries, so a
// mis-aligned text surgery that duplicated an existing entry while dropping a
// new one cannot slip through a pure count check.
// A failure in one file is logged and the loop moves on, so every file gets
// checked and the summary names all failures at once.
const mergedFiles = []; // { file, text, before, added }
let preCheckFailures = 0;

for (const [api, b] of writable) {
  const { doc, methods } = yamls.get(b.file);

  // Pick the target group: the last group whose methods belong to this API,
  // falling back to the last group that has a methods array at all.
  let targetIdx = -1;
  doc.toJS().forEach((group, gi) => {
    if (!isObject(group)) return;
    if (Array.isArray(group.methods)) {
      if (group.methods.some((m) => isObject(m) && String(m.api_method ?? '').startsWith(`${api}.`))) targetIdx = gi;
    }
  });
  if (targetIdx === -1) {
    doc.toJS().forEach((group, gi) => {
      if (isObject(group) && Array.isArray(group.methods)) targetIdx = gi;
    });
  }
  if (targetIdx === -1) {
    console.log(`  ${b.file}: no group with a "methods" array - skipped (${b.newNode.length} new method(s) not merged)`);
    preCheckFailures++;
    continue;
  }

  // Text surgery, not document re-serialization: serializing the whole file
  // with the yaml package would re-indent every sequence and re-wrap every
  // scalar, producing a repo-wide diff. The Document is used only to LOCATE
  // the target sequence and its last item's indentation; the merge itself
  // inserts rendered lines after the last existing item.
  const raw = repairLegacyQuotes(readFileSync(join(DATA_DIR, b.file), 'utf8'));
  const seq = doc.getIn([targetIdx, 'methods']);
  const last = seq?.items?.[seq.items.length - 1];
  if (!seq || !last || !Array.isArray(seq.range)) {
    console.log(`  ${b.file}: groups[${targetIdx}].methods is empty or unlocatable - skipped`);
    preCheckFailures++;
    continue;
  }
  const itemLineStart = raw.lastIndexOf('\n', last.range[0] - 1) + 1;
  const itemLine = raw.slice(itemLineStart, raw.indexOf('\n', itemLineStart));
  const itemIndent = /^[ \t]*/.exec(itemLine)?.[0] ?? '  ';
  const insertAt = seq.range[1]; // offset just past the last item's content
  const block = b.newNode.map((name) => renderEntry(name, itemIndent)).join('\n');
  const atEof = insertAt >= raw.length;
  // seq.range[1] usually sits past the last line's trailing newline already;
  // only add our own newline separator when it does not.
  const needsLeadNl = insertAt === 0 || raw[insertAt - 1] !== '\n';
  const merged =
    raw.slice(0, insertAt) + (needsLeadNl ? '\n' : '') + block + (atEof ? '\n' : '') + raw.slice(insertAt);

  // Pre-check (former post-write self-check), strictly, before any write.
  const checkDoc = parseDocument(merged, { uniqueKeys: false });
  if (checkDoc.errors.length > 0) {
    const line = checkDoc.errors[0].linePos?.[0]?.line ?? '?';
    const msg = String(checkDoc.errors[0].message).split('\n')[0];
    console.error(`  PRE-CHECK FAILED for ${b.file}: merged YAML does not parse (line ${line}): ${msg}`);
    preCheckFailures++;
    continue;
  }
  const afterMethods = [];
  walkMethods(checkDoc.toJS(), afterMethods);
  const before = methods.length;
  if (afterMethods.length < before + b.newNode.length) {
    console.error(
      `  PRE-CHECK FAILED for ${b.file}: merged YAML holds ${afterMethods.length} method(s), expected >= ${before + b.newNode.length} (${before} existing + ${b.newNode.length} new)`
    );
    preCheckFailures++;
    continue;
  }
  const mergedNames = new Set(afterMethods.map((m) => m.api_method));
  const missingNew = b.newNode.filter((name) => !mergedNames.has(name));
  if (missingNew.length > 0) {
    console.error(
      `  PRE-CHECK FAILED for ${b.file}: new method(s) not found in merged text: ${missingNew.join(', ')}`
    );
    preCheckFailures++;
    continue;
  }
  console.log(`  ${b.file}: pre-check OK (${afterMethods.length} methods, was ${before}, +${b.newNode.length})`);
  mergedFiles.push({ file: b.file, text: merged, before, added: b.newNode.length });
}

if (preCheckFailures > 0) {
  console.error(
    `\nwrite aborted: ${preCheckFailures} pre-check failure(s) - NOTHING was written` +
      (mergedFiles.length > 0 ? ` (${mergedFiles.length} checked file(s) held back)` : '') +
      '.'
  );
  process.exit(1);
}

// Phase 2 - all files validated: write them, each as <file>.tmp + renameSync
// so the target path only ever appears fully-formed (rename is atomic).
let writeFailures = 0;
for (const { file, text, before, added } of mergedFiles) {
  const target = join(DATA_DIR, file);
  const tmp = `${target}.tmp`;
  try {
    writeFileSync(tmp, text);
    renameSync(tmp, target);
  } catch (e) {
    console.error(`  WRITE FAILED for ${file}: ${e.message}`);
    try {
      rmSync(tmp, { force: true });
    } catch {
      /* best-effort cleanup */
    }
    writeFailures++;
    continue;
  }
  console.log(`  ${file}: appended ${added} method(s) to groups[].methods (atomic write, ${before} -> ${before + added} methods)`);
}

if (writeFailures > 0) {
  console.error(`\nwrite finished with ${writeFailures} disk-write failure(s) - inspect the files before committing.`);
  process.exit(1);
}
console.log('\nwrite: done. Run `pnpm validate:data` to confirm schema validity.');
