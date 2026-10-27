// --------------------------------------------------------------------------- 
// check-ops-anchors.mjs — guard against future slug drift between the zh ops
// bridge links and the real heading ids VitePress generates for the en
// broadcast_ops pages (phase-2 batch3 lesson: 72/85 anchors were missing).
//
// Usage: pnpm build && node scripts/check-ops-anchors.mjs
// Reads data/apidefinitions/broadcast_ops*.yml for op names, computes their
// VitePress slugs, and asserts every anchor that gen-api-docs.mjs emits in
// docs/zh/api/broadcast_ops*/index.html exists as a heading id in the built
// docs/.vitepress/dist/api/broadcast_ops*/index.html.
// keep vitepressSlug in sync with scripts/gen-api-docs.mjs (same rule).
// ---------------------------------------------------------------------------
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseDocument } from 'yaml';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'docs', '.vitepress', 'dist');

if (!existsSync(DIST)) {
  console.error('check-ops-anchors: docs/.vitepress/dist not found — run `pnpm build` first.');
  process.exit(1);
}

// Same rule as vitepressSlug() in scripts/gen-api-docs.mjs — keep in sync
// (mirror of VitePress 1.6.4 dist slugify: special runs incl. underscores
// collapse to single '-', trim, leading digit gets '_' prefix, lowercase).
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g;
const rCombining = /[\u0300-\u036F]/g;
function vitepressSlug(str) {
  return str
    .normalize('NFKD')
    .replace(rCombining, '')
    .replace(rControl, '')
    .replace(rSpecial, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase();
}

const ops = [];
for (const file of ['broadcast_ops.yml', 'broadcast_ops_communities.yml']) {
  const doc = parseDocument(readFileSync(join(ROOT, 'data', 'apidefinitions', file), 'utf8'), { intKeySorting: false });
  const data = doc.toJS();
  for (const group of data) for (const op of group.ops ?? []) ops.push(op.name);
}

const builtHtml = ['broadcast_ops', 'broadcast_ops_communities'].map((stem) =>
  readFileSync(join(DIST, 'api', stem, 'index.html'), 'utf8')
);
const ids = new Set();
for (const html of builtHtml) for (const m of html.matchAll(/id="([^"]+)"/g)) ids.add(m[1]);

const zhBridge = readFileSync(join(ROOT, 'docs', 'zh', 'api', 'broadcast_ops', 'index.md'), 'utf8');
const zhBridgeComm = readFileSync(join(ROOT, 'docs', 'zh', 'api', 'broadcast_ops_communities', 'index.md'), 'utf8');
const anchors = new Set();
for (const text of [zhBridge, zhBridgeComm]) for (const m of text.matchAll(/#([A-Za-z0-9_-]+)/g)) anchors.add(m[1]);

let hit = 0;
const miss = [];
for (const op of ops) {
  const slug = vitepressSlug(op);
  if (ids.has(slug)) hit++;
  else miss.push(`${op} -> #${slug}`);
}
console.log(`ops anchors: total=${ops.length} hit=${hit} miss=${miss.length}${miss.length ? '\n  MISSING: ' + miss.join(', ') : ''}`);
if (miss.length) process.exit(1);
console.log('ALL ANCHORS HIT');
