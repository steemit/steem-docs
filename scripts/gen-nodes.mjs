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
// Exit code: 0 on success, 1 on any guard failure (G1-G7).

import { parse } from 'yaml';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
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

function fail(message) {
  console.error(`gen-nodes: ${message}`);
  process.exit(1);
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
const exampleNode = data.nodes.find((n) => n.url === data.example);

const lines = [];
lines.push('---');
lines.push('title: Quickstart');
lines.push('description: Choose a Steem client library, connect to a public API node, and make your first JSON-RPC call.');
lines.push('---');
// Generated-file banner (repo rule: content changes go into the data file,
// never into generated output).
lines.push('');
lines.push('<!-- GENERATED by scripts/gen-nodes.mjs from data/nodes.yml — do not edit by hand. Regenerate with `pnpm gen:nodes`. -->');
lines.push('');
lines.push('# Quickstart');
lines.push('');
lines.push('Connecting to the Steem blockchain takes two decisions: pick a **client library** for your stack, then point it at an **API node**. This page walks through both, so you can make your first request in minutes.');
lines.push('');
lines.push('## Choose a library');
lines.push('');
lines.push('Accessing Steem data is easy from the official client libraries, depending on your infrastructure and objectives:');
lines.push('');
lines.push('| Language | Library | Description |');
lines.push('| --- | --- | --- |');
lines.push('| JavaScript / TypeScript | [steem-js](https://github.com/steemit/steem-js) | Pure JavaScript Steem crypto library for Node.js and browsers; can be used to construct, sign, and broadcast transactions. |');
lines.push('| Go | [steemgosdk](https://github.com/steemit/steemgosdk) | A Go SDK for interacting with the Steem blockchain: high-level abstractions for common operations, transaction signing and broadcasting, key management. Under active development. |');
lines.push('| Python | [steem-python](https://github.com/steemit/steem-python) | The official Steem library for Python; comes with a BIP38 encrypted wallet and the `steempy` CLI tool. |');
lines.push('');
lines.push('All of these libraries speak JSON-RPC to a `steemd` node — the connection setup in the next section applies to every one of them.');
lines.push('');
lines.push('## Connect to a node');
lines.push('');
lines.push('Applications that interface directly with the Steem blockchain need to connect to a `steemd` node. You can run your own instance, or start against one of the public API nodes below.');
lines.push('');
lines.push('Although `steemd` fully supports WebSockets (`wss://` and `ws://`), public nodes typically do not. All nodes listed here use HTTPS.');
lines.push('');
lines.push('| URL | Operator |');
lines.push('| --- | --- |');
for (const node of data.nodes) {
  lines.push(`| ${node.url} | ${node.owner} |`);
}
lines.push('');
lines.push(`This list is community-maintained and can change at any time. Each node above was verified live with a direct JSON-RPC call on ${data.updated}; nodes that failed the test have been removed. If a node stops responding, switch to another entry from the table.`);
lines.push('');
lines.push('### Test a node with curl');
lines.push('');
lines.push(`Every public node speaks JSON-RPC over HTTPS. The example below asks ${exampleNode.url} for the chain's dynamic global properties — the \`head_block_number\` field in the response is the tip of the chain that node is serving:`);
lines.push('');
lines.push('```bash');
lines.push(`curl -s -X POST ${exampleNode.url}/ \\`);
lines.push("    -H 'Content-Type: application/json' \\");
lines.push(`    -d '{"jsonrpc":"2.0","method":"condenser_api.get_dynamic_global_properties","params":[],"id":1}'`);
lines.push('```');
lines.push('');
lines.push('The same request envelope works for every method in the [API Reference](/api/) — point it at any node from the table above, or hand the URL to your client library\'s node setting.');
lines.push('');

const markdown = lines.join('\n');

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

mkdirSync(join(ROOT, 'docs/quickstart'), { recursive: true });
writeFileSync(OUT_PATH, markdown);

const owners = data.nodes.reduce((m, n) => m.set(n.owner, (m.get(n.owner) ?? 0) + 1), new Map());
console.log('Quickstart page generated:');
console.log(`  nodes: ${data.nodes.length} (verified ${data.updated})`);
for (const [owner, count] of owners) {
  console.log(`    ${owner.padEnd(10)} ${count} node${count === 1 ? '' : 's'}`);
}
console.log(`  example node: ${data.example}`);
console.log(`  -> docs/quickstart/index.md (${Buffer.byteLength(markdown, 'utf8')} bytes)`);
