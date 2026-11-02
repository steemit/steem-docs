#!/usr/bin/env node
// Quickstart page generator: data/nodes.yml -> docs/quickstart/index.md
//
// Phase-5 T5-3 migration of the steemit/devportal quickstart chapter. The page
// merges the two rewritten old pages:
//   * choose_library.md  -> "Choose a library" (official client libraries; the
//     old page's tutorials/services/resources cross-links do not exist on this
//     site yet and were dropped as dead ends)
//   * steemd_nodes.md    -> "Connect to a node" (public API node table + curl
//     example). Every node was tested for JSON-RPC liveness (POST
//     get_dynamic_global_properties, curl -m 15) before entering data/nodes.yml;
//     steem.61bts.com was dead at test time (non-JSON-RPC placeholder page) and
//     is not migrated.
// Not migrated, per the phase-5 plan: the 2018-era Docker examples, the dead
// block_log download links, and all testnet content (follows the T5-6 reserved
// page instead).
//
// Output is pure static markdown and byte-deterministic (no clock reads — the
// verified-on date comes from data/nodes.yml), so running this script twice
// produces identical bytes (idempotent). The generated page is committed;
// docs/quickstart/index.md must never be edited by hand — change data/nodes.yml
// and re-run `pnpm gen:nodes`.
//
// Locale mode (T6-2): `node scripts/gen-nodes.mjs --locale <lc>` builds the
// mirrored page docs/<lc>/quickstart/index.md for lc in SUPPORTED_LOCALES. The
// page prose comes from data/translations/<lc>/quickstart.yml (every fragment
// is REQUIRED — a missing fragment is a hard error, never a silent English
// fallback). The library rows, the node table rows and the curl example stay
// byte-identical to the English page (single source of truth: the node list is
// liveness-tested once, not per language); only table column headers are
// translatable. Link targets are locale-invariant too (the /api/ reference is
// English-rooted); link TEXT may be translated. The `en` page is built from
// the embedded EN_STRINGS table below through the same buildPage() template,
// which keeps the regression gate honest: en output must stay byte-identical
// across generator refactors.
//
// Exit code: 0 on success, 1 on any guard failure (G1-G7).

import { parse } from 'yaml';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DATA_PATH = join(ROOT, 'data/nodes.yml');
const OUT_PATH = join(ROOT, 'docs/quickstart/index.md');

// Audited migration shape (phase-5 plan T5-3): the old steemd_nodes.md table
// listed 9 public nodes; 1 was dead at test time -> 8 rows. These constants are
// the provenance anchor: changing the node list requires a fresh liveness test
// of EVERY node and a conscious update of both values.
const EXPECTED_NODE_COUNT = 17;
const EXPECTED_UPDATED = '2026-10-31'; // liveness-test date this count is valid for
const HARD_LINE_CAP = 170; // same bash line-width discipline as check:curl-width

// Locale rollouts (T6-2). Order mirrors `pnpm docs:gen`: en first (default
// mode), then the seven mirrored locales.
const SUPPORTED_LOCALES = ['zh', 'ru', 'fr', 'de', 'it', 'es', 'ko'];

// English page prose (T6-2): the single template source for the default page.
// The {updated} / {example_url} placeholders are filled from data/nodes.yml;
// they exist so locale files can share buildPage() verbatim.
const EN_STRINGS = {
  title: 'Quickstart',
  description: 'Choose a Steem client library, connect to a public API node, and make your first JSON-RPC call.',
  intro: 'Connecting to the Steem blockchain takes two decisions: pick a **client library** for your stack, then point it at an **API node**. This page walks through both, so you can make your first request in minutes.',
  choose_library: {
    heading: 'Choose a library',
    lead: 'Accessing Steem data is easy from the official client libraries, depending on your infrastructure and objectives:',
    table_headers: ['Language', 'Library', 'Description'],
    note: 'All of these libraries speak JSON-RPC to a `steemd` node — the connection setup in the next section applies to every one of them.'
  },
  connect_node: {
    heading: 'Connect to a node',
    lead: 'Applications that interface directly with the Steem blockchain need to connect to a `steemd` node. You can run your own instance, or start against one of the public API nodes below.',
    websocket_note: 'Although `steemd` fully supports WebSockets (`wss://` and `ws://`), public nodes typically do not. All nodes listed here use HTTPS.',
    table_headers: ['URL', 'Operator'],
    freshness_note: 'This list is community-maintained and can change at any time. Each node above was verified live with a direct JSON-RPC call on {updated}; nodes that failed the test have been removed. If a node stops responding, switch to another entry from the table.'
  },
  test_curl: {
    heading: 'Test a node with curl',
    lead: 'Every public node speaks JSON-RPC over HTTPS. The example below asks {example_url} for the chain\'s dynamic global properties — the `head_block_number` field in the response is the tip of the chain that node is serving:'
  },
  closing: 'The same request envelope works for every method in the [API Reference](/api/) — point it at any node from the table above, or hand the URL to your client library\'s node setting.'
};

// Every prose fragment a locale file must carry (dot paths into `strings`).
// A missing fragment is a hard error: pages must never mix a locale with
// silently-fallen-back English prose.
const REQUIRED_KEYS = [
  'title',
  'description',
  'intro',
  'choose_library.heading',
  'choose_library.lead',
  'choose_library.table_headers',
  'choose_library.note',
  'connect_node.heading',
  'connect_node.lead',
  'connect_node.websocket_note',
  'connect_node.table_headers',
  'connect_node.freshness_note',
  'test_curl.heading',
  'test_curl.lead',
  'closing'
];

function fail(message) {
  console.error(`gen-nodes: ${message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// CLI: default mode builds the en page; --locale <lc> builds the mirrored page.
const argv = process.argv.slice(2);
let locale = null;
const localeIndex = argv.indexOf('--locale');
if (localeIndex !== -1) {
  locale = argv[localeIndex + 1];
  if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
    fail(`--locale: unknown locale '${locale ?? ''}' (supported: ${SUPPORTED_LOCALES.join(', ')})`);
  }
}

function getIn(obj, dotPath) {
  return dotPath.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

// Locale contract (T6-2): every required fragment present and non-empty, table
// headers complete, the generator placeholders intact, and the closing link
// still pointing at the English-rooted API reference.
function validateLocaleStrings(filePath, strings) {
  if (strings == null || typeof strings !== 'object' || Array.isArray(strings)) {
    fail(`${filePath}: top-level \`strings\` mapping missing`);
  }
  const missing = REQUIRED_KEYS.filter((key) => {
    const value = getIn(strings, key);
    if (Array.isArray(value)) return value.length === 0;
    return typeof value !== 'string' || value.length === 0;
  });
  if (missing.length > 0) {
    fail(`${filePath}: missing required string(s): ${missing.join(', ')} — ` +
         'every prose fragment must be translated (no silent English fallback)');
  }
  const headers3 = getIn(strings, 'choose_library.table_headers');
  const headers2 = getIn(strings, 'connect_node.table_headers');
  if (headers3.length !== 3 || headers2.length !== 2) {
    fail(`${filePath}: table_headers must have 3 library columns and 2 node columns`);
  }
  const freshnessNote = getIn(strings, 'connect_node.freshness_note');
  if (!freshnessNote.includes('{updated}')) {
    fail(`${filePath}: connect_node.freshness_note is missing the {updated} placeholder`);
  }
  const curlLead = getIn(strings, 'test_curl.lead');
  if (!curlLead.includes('{example_url}')) {
    fail(`${filePath}: test_curl.lead is missing the {example_url} placeholder`);
  }
  const closing = getIn(strings, 'closing');
  if (!closing.includes('](/api/)')) {
    fail(`${filePath}: closing must keep the API reference link target ](/api/) — ` +
         'link targets are locale-invariant, only link text may be translated');
  }
}

let data;
try {
  data = parse(readFileSync(DATA_PATH, 'utf8'));
} catch (err) {
  fail(`cannot parse ${DATA_PATH}: ${err.message}`);
}

// G1 — shape: the data file must carry a non-empty `nodes` sequence.
if (!Array.isArray(data?.nodes) || data.nodes.length === 0) {
  fail('G1 shape: data/nodes.yml: top-level `nodes` sequence missing or empty');
}

// G2 — provenance: the row count must match the audited liveness-test result.
// A drift here almost always means the list was edited without re-testing.
if (data.nodes.length !== EXPECTED_NODE_COUNT) {
  fail(`G2 provenance: expected ${EXPECTED_NODE_COUNT} nodes (alive at ${EXPECTED_UPDATED}), ` +
       `found ${data.nodes.length} — re-test every node and update ` +
       'EXPECTED_NODE_COUNT/EXPECTED_UPDATED in scripts/gen-nodes.mjs consciously');
}

// G3 — provenance: the `updated` date stamps the liveness test into the page
// footer; it must stay in sync with the audited constant above.
if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.updated)) || data.updated !== EXPECTED_UPDATED) {
  fail(`G3 provenance: updated is '${data.updated}', expected '${EXPECTED_UPDATED}' ` +
       '(YYYY-MM-DD) — the page only claims liveness for the tested date');
}

// G4 — shape: every node is an HTTPS URL (optionally with a path — sanctioned
// case: https://steemyy.com/node/, an RPC endpoint living under a path on the
// steemyy portal host) plus an @owner handle (the old table's Owner column).
// Scheme-less hosts from the old table are stored with https:// because the
// old page itself noted "All nodes listed use HTTPS".
for (const node of data.nodes) {
  if (typeof node.url !== 'string' || !/^https:\/\/[a-z0-9.-]+(?::\d+)?(?:\/[a-z0-9._-]+)*\/?$/.test(node.url)) {
    fail(`G4 shape: node url '${node?.url}' is not a well-formed https URL`);
  }
  if (typeof node.owner !== 'string' || !/^@[a-z0-9.-]+$/.test(node.owner)) {
    fail(`G4 shape: node '${node.url}' owner '${node?.owner}' is not an @handle`);
  }
}

// G5 — uniqueness: duplicate rows would silently repeat in the generated table.
const urls = new Set();
for (const node of data.nodes) {
  if (urls.has(node.url)) fail(`G5 uniqueness: duplicate node url '${node.url}'`);
  urls.add(node.url);
}

// G6 — example integrity: the page's curl example points at `example`, so that
// node must be one of the tested rows (a dead example can never slip through).
if (typeof data.example !== 'string' || !urls.has(data.example)) {
  fail(`G6 example: '${data.example}' is not one of the listed nodes`);
}

// ---------------------------------------------------------------------------
// Page assembly (static prose + data-driven node table + curl example).
// Library table rows stay English in every locale (T6-2 contract: the table
// body has a single source of truth; only column headers are translatable).
const LIBRARY_ROWS = [
  '| JavaScript / TypeScript | [steem-js](https://github.com/steemit/steem-js) | Pure JavaScript Steem crypto library for Node.js and browsers; can be used to construct, sign, and broadcast transactions. |',
  '| Go | [steemgosdk](https://github.com/steemit/steemgosdk) | A Go SDK for interacting with the Steem blockchain: high-level abstractions for common operations, transaction signing and broadcasting, key management. Under active development. |',
  '| Python | [steem-python](https://github.com/steemit/steem-python) | The official Steem library for Python; comes with a BIP38 encrypted wallet and the `steempy` CLI tool. |'
];

function buildPage(t, data) {
  const exampleNode = data.nodes.find((n) => n.url === data.example);
  const lines = [];
  lines.push('---');
  lines.push(`title: ${t.title}`);
  lines.push(`description: ${t.description}`);
  lines.push('---');
  // Generated-file banner (repo rule: content changes go into the data file,
  // never into generated output).
  lines.push('');
  lines.push('<!-- GENERATED by scripts/gen-nodes.mjs from data/nodes.yml — do not edit by hand. Regenerate with `pnpm gen:nodes`. -->');
  lines.push('');
  lines.push(`# ${t.title}`);
  lines.push('');
  lines.push(t.intro);
  lines.push('');
  lines.push(`## ${t.choose_library.heading}`);
  lines.push('');
  lines.push(t.choose_library.lead);
  lines.push('');
  lines.push(`| ${t.choose_library.table_headers.join(' | ')} |`);
  lines.push('| --- | --- | --- |');
  for (const row of LIBRARY_ROWS) {
    lines.push(row);
  }
  lines.push('');
  lines.push(t.choose_library.note);
  lines.push('');
  lines.push(`## ${t.connect_node.heading}`);
  lines.push('');
  lines.push(t.connect_node.lead);
  lines.push('');
  lines.push(t.connect_node.websocket_note);
  lines.push('');
  lines.push(`| ${t.connect_node.table_headers.join(' | ')} |`);
  lines.push('| --- | --- |');
  for (const node of data.nodes) {
    lines.push(`| ${node.url} | ${node.owner} |`);
  }
  lines.push('');
  lines.push(t.connect_node.freshness_note.replaceAll('{updated}', String(data.updated)));
  lines.push('');
  lines.push(`### ${t.test_curl.heading}`);
  lines.push('');
  lines.push(t.test_curl.lead.replaceAll('{example_url}', exampleNode.url));
  lines.push('');
  lines.push('```bash');
  lines.push(`curl -s -X POST ${exampleNode.url}/ \\`);
  lines.push("    -H 'Content-Type: application/json' \\");
  lines.push(`    -d '{"jsonrpc":"2.0","method":"condenser_api.get_dynamic_global_properties","params":[],"id":1}'`);
  lines.push('```');
  lines.push('');
  lines.push(t.closing);
  lines.push('');
  return lines.join('\n');
}

// Resolve the strings table + output path for this invocation.
let strings;
let outPath;
let targetLabel;
if (locale === null) {
  strings = EN_STRINGS;
  outPath = OUT_PATH;
  targetLabel = 'docs/quickstart/index.md';
} else {
  const translationsPath = join(ROOT, `data/translations/${locale}/quickstart.yml`);
  let translations;
  try {
    translations = parse(readFileSync(translationsPath, 'utf8'));
  } catch (err) {
    fail(`cannot parse ${translationsPath}: ${err.message}`);
  }
  validateLocaleStrings(translationsPath, translations?.strings);
  strings = translations.strings;
  outPath = join(ROOT, `docs/${locale}/quickstart/index.md`);
  targetLabel = `docs/${locale}/quickstart/index.md`;
}

const markdown = buildPage(strings, data);

// G7 — output sanity: no Jekyll template residue (the old site was Liquid-based),
// bash lines stay under the repo-wide hard cap, and the node table carries
// exactly one row per tested node.
if (markdown.includes('{{') || markdown.includes('{%')) {
  fail('G7 output: generated markdown contains Liquid syntax (`{{` or `{%`)');
}
const bashLines = (markdown.split('```bash')[1]?.split('```')[0] ?? '').trim().split('\n');
const tooWide = bashLines.filter((l) => l.length > HARD_LINE_CAP);
if (tooWide.length > 0) {
  fail(`G7 output: bash example line(s) exceed ${HARD_LINE_CAP} columns: ${tooWide[0]}`);
}
// table row = a markdown line starting `| https://…` (the curl example line does
// not start with a pipe, so it is never counted here)
const tableRows = (markdown.match(/^\| https:\/\/[^\n]+$/gm) ?? []).length;
if (tableRows !== data.nodes.length) {
  fail(`G7 output: node table has ${tableRows} rows, expected ${data.nodes.length}`);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, markdown);

const owners = data.nodes.reduce((m, n) => m.set(n.owner, (m.get(n.owner) ?? 0) + 1), new Map());
console.log('Quickstart page generated:');
console.log(`  nodes: ${data.nodes.length} (verified ${data.updated})`);
for (const [owner, count] of owners) {
  console.log(`    ${owner.padEnd(10)} ${count} node${count === 1 ? '' : 's'}`);
}
console.log(`  example node: ${data.example}`);
console.log(`  -> ${targetLabel} (${Buffer.byteLength(markdown, 'utf8')} bytes)`);
