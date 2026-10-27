#!/usr/bin/env node
// API documentation generator: data/apidefinitions/*.yml -> docs/api/**/*.md
//
// Reads the verbatim YAML definitions (never modifies them), renders one page
// per JSON-RPC method plus index/overview pages, and emits two build inputs
// for the VitePress config:
//   - docs/.vitepress/gen/api-manifest.json   (sidebar assembly)
//   - docs/.vitepress/gen/liquid-warnings.txt (every cleaned Liquid leftover)
//
// Legacy data quirks handled here (mirroring scripts/validate-data.mjs):
//   * 2019-era files with a closing quote at column 1 -> re-indent in memory
//   * Liquid `{{ '...' | relative_url }}` leftovers -> degraded to plain text
//   * parameter_json / expected_response_json as YAML scalars or native nodes
//     -> normalized to pretty JSON, never throwing
//
// Exit code: 0 on success, 1 on unexpected failure. Never fails on bad fields.

import { parseDocument, YAMLMap, YAMLSeq } from 'yaml';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { isObject, repairLegacyQuotesCounted, walkMethods } from './lib/yaml-lenient.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DATA_DIR = join(ROOT, 'data/apidefinitions');
const OUT_DIR = join(ROOT, 'docs/api');
const GEN_DIR = join(ROOT, 'docs/.vitepress/gen');
const MANIFEST_PATH = join(GEN_DIR, 'api-manifest.json');
const LIQUID_LOG_PATH = join(GEN_DIR, 'liquid-warnings.txt');
// zh locale pilot (T11): bridge index pages, generated --locale zh. Only the
// <stem>/index.md subtrees are written; hand-written static pages under
// docs/zh/ (home, API overview) are never touched by this script.
// T12: methods covered by data/translations/zh/purposes.yml additionally get
// a zh method page (docs/zh/api/<stem>/<short>.md, purpose translated,
// everything else identical to the en page); uncovered methods keep bridging.
const ZH_OUT_DIR = join(ROOT, 'docs/zh/api');
const ZH_PURPOSES_PATH = join(ROOT, 'data/translations/zh/purposes.yml');
const API_URL = 'https://api.steem.fans';

const isMissing = (v) => v === undefined || v === null || v === '';

// ---------------------------------------------------------------------------
// YAML loading (lenient, mirrors scripts/validate-data.mjs)
// ---------------------------------------------------------------------------

function loadYaml(file) {
  const raw = readFileSync(join(DATA_DIR, file), 'utf8');
  let doc = parseDocument(raw, { uniqueKeys: false });
  if (doc.errors.length > 0) {
    // Legacy quirk: some files close a multi-line single-quoted scalar with a
    // quote at column 1 (YAML 1.1 ok, YAML 1.2 not). Repair in memory only.
    const { text: repairedRaw, repaired } = repairLegacyQuotesCounted(raw);
    if (repaired > 0) doc = parseDocument(repairedRaw, { uniqueKeys: false });
  }
  if (doc.errors.length > 0) {
    throw new Error(`${file}: unrecoverable YAML parse error: ${doc.errors[0].message}`);
  }
  return doc.toJS();
}

// ---------------------------------------------------------------------------
// Liquid cleanup
// ---------------------------------------------------------------------------

const liquidWarnings = [];
const RE_LINK_LIQUID = /\[([^\]]*)\]\(\s*\{\{[^}]*\}\}\s*\)/g;
const RE_BARE_LIQUID = /\{\{\s*'([^']*)'\s*\|\s*relative_url\s*\}\}/g;
const RE_ANY_LIQUID = /\{\{[^}]*\}\}/g;

function snippet(text, match, pad = 40) {
  const i = text.indexOf(match);
  const before = text.slice(Math.max(0, i - pad), i).replace(/\s+/g, ' ');
  const after = text.slice(i + match.length, i + match.length + pad).replace(/\s+/g, ' ');
  return `…${before}[${match.replace(/\s+/g, ' ').slice(0, 80)}]${after}…`;
}

/**
 * Degrade Jekyll Liquid leftovers to plain text so VitePress/Vue never sees
 * `{{ ... }}` interpolation. Link form keeps the link text; bare form keeps
 * the target path as inline code. Every replacement is logged.
 */
function cleanLiquid(text, file, where) {
  if (typeof text !== 'string') return '';
  if (!text.includes('{{')) return text;
  let out = text.replace(RE_LINK_LIQUID, (_m, label) => {
    liquidWarnings.push(`${file} | ${where} | link degraded to text "${label}" | ${snippet(text, _m)}`);
    return label;
  });
  out = out.replace(RE_BARE_LIQUID, (m, path) => {
    liquidWarnings.push(`${file} | ${where} | liquid degraded to inline code | ${snippet(text, m)}`);
    return `\`${path.trim()}\``;
  });
  out = out.replace(RE_ANY_LIQUID, (m) => {
    liquidWarnings.push(`${file} | ${where} | unknown liquid removed | ${snippet(text, m)}`);
    return '';
  });
  return out;
}

/** First non-empty line as plain text (markdown symbols stripped, truncated). */
function firstPlainLine(text, max = 160) {
  if (typeof text !== 'string') return '';
  const line = text.split('\n').map((l) => l.trim()).find((l) => l.length > 0) ?? '';
  const plain = line
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  return plain.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

// ---------------------------------------------------------------------------
// JSON normalization (rule 3: never throw, always produce a code block)
// ---------------------------------------------------------------------------

/** Pretty JSON content for a fenced block, or null when the section is omitted. */
function jsonBlock(value, { omitEmptyArray = false } = {}) {
  if (isMissing(value)) return null;
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return null;
    try {
      return JSON.stringify(JSON.parse(s), null, 2);
    } catch {
      return s; // not JSON -> verbatim inside the block
    }
  }
  if (Array.isArray(value) && value.length === 0) {
    return omitEmptyArray ? null : '[]';
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return null;
  }
}

/** Compact JSON for embedding inside the synthetic curl single-quoted string. */
function compactJson(value) {
  if (isMissing(value)) return '[]';
  if (typeof value === 'string') {
    const s = value.trim();
    return s || '[]';
  }
  try {
    return JSON.stringify(value);
  } catch {
    return '[]';
  }
}

/**
 * Roles/params on ops are legacy folded lists: `- voter\n  author\n  permlink`
  * parses as ONE string "voter author permlink weight". Split on whitespace so
 * the normalized JSON shows the individual entries.
 */
function splitFoldedList(value) {
  if (!Array.isArray(value)) return value;
  return value.flatMap((item) => (typeof item === 'string' ? item.split(/\s+/).filter(Boolean) : [item]));
}

// ---------------------------------------------------------------------------
// Page rendering helpers
// ---------------------------------------------------------------------------

const fence = (lang, content) => `\`\`\`${lang}\n${content}\n\`\`\``;

/** Escape a value for a markdown table cell ('|' is the column separator). */
const tableCell = (text) => String(text).replace(/\|/g, '\\|');

/** Escape text for embedding as raw HTML text content (summaries, badges). */
const escapeHtml = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Escape a value for use as markdown link text: HTML entities first (& < >),
 * then the markdown-significant characters [ ] | backslash-escaped, so the
 * text survives link parsing and still renders literally (e.g. "&" -> "&amp;").
 */
const escapeLinkText = (text) =>
  escapeHtml(text).replace(/[[\]|]/g, (ch) => `\\${ch}`);

/**
 * Wrap a fenced block (or several) in a titled card container. Blank lines
 * around the fence keep markdown processing active inside the raw HTML div.
 */
const codeCard = (title, variant, inner) =>
  [
    `<div class="code-card code-card-${variant}">`,
    `<div class="code-card-title">${title}</div>`,
    '',
    inner,
    '',
    '</div>',
  ].join('\n');

/**
 * Fence language for a curl example: a few legacy entries store a bare
 * JSON-RPC body (condenser_api.get_block, database_api.find_savings_withdrawals)
 * — those render as json; anything else stays a bash line.
 */
function curlExampleLang(text) {
  const s = String(text).trimStart();
  return s.startsWith('{') || s.startsWith('[') ? 'json' : 'bash';
}

function frontmatter({ title, description, outline = true }) {
  const lines = ['---', `title: ${JSON.stringify(title)}`];
  if (description) lines.push(`description: ${JSON.stringify(description)}`);
  if (outline) lines.push('outline: [2, 3]');
  lines.push('---', '');
  // Explicit h1: VitePress 1.x does not render frontmatter title into the body.
  lines.push(`# ${title.replace(/[{}]/g, '')}`, '');
  return lines.join('\n');
}

function badgeLine(m) {
  const parts = [];
  if (!isMissing(m.since)) parts.push(`<span class="badge badge-since">since ${escapeHtml(String(m.since))}</span>`);
  if (m.deprecated === true) parts.push('<span class="badge badge-deprecated">deprecated</span>');
  if (m.disabled === true) parts.push('<span class="badge badge-disabled">disabled</span>');
  if (m.removed === true) parts.push('<span class="badge badge-removed">removed</span>');
  return parts.join(' ');
}

/**
 * Death-cause line: a `detail` string carried by a method with one of the
 * death badges (deprecated / disabled / removed) explains why the method is
 * gone. Rendered as its own paragraph right under the badge row.
 */
function detailLine(m, file, apiMethod) {
  if (typeof m.detail !== 'string' || !m.detail.trim()) return '';
  const detail = escapeHtml(cleanLiquid(m.detail, file, `detail of ${apiMethod}`).trim());
  return `<p class="api-detail">${detail}</p>`;
}

/**
 * True when the method carries a death badge together with a `detail` cause:
 * the T9 drift baseline annotates every method that public nodes stopped
 * serving with badge + detail. Legacy entries that carry a bare
 * disabled/deprecated flag but are still dispatched (get_state,
 * verify_account_authority, ...) have no detail and must NOT claim the method
 * is "no longer provided".
 */
function isDeadWithCause(m) {
  const deathBadge = m.removed === true || m.disabled === true || m.deprecated === true;
  return deathBadge && typeof m.detail === 'string' && m.detail.trim() !== '';
}

/** testnet/mainnet availability notes (objects of { working, detail }). */
function networkLine(m) {
  const parts = [];
  for (const key of ['testnet', 'mainnet']) {
    const v = m[key];
    if (!isObject(v)) continue;
    const state = v.working === true ? 'working' : 'not working';
    const detail = typeof v.detail === 'string' && v.detail.trim() ? ` — ${cleanLiquid(v.detail, '', '').trim()}` : '';
    // Inline-code leftovers from Liquid cleanup render as real <code> here.
    const detailHtml = escapeHtml(detail)
      .replace(/`([^`]*)`/g, '<code>$1</code>');
    parts.push(`<span class="badge badge-net">${key}: ${state}${detailHtml}</span>`);
  }
  return parts.join(' ');
}

function syntheticCurl(apiMethod, parameterJson) {
  // The body is a single-quoted shell string: escape embedded single quotes.
  const params = compactJson(parameterJson).replace(/'/g, `'\\''`);
  return `curl -s ${API_URL} --data '{"jsonrpc":"2.0","method":"${apiMethod}","params":${params},"id":1}'`;
}

function expectedCurlResponsesSection(value, file, where) {
  if (!Array.isArray(value) || value.length === 0) return null;
  const blocks = [];
  for (const item of value) {
    if (isMissing(item)) continue;
    if (Array.isArray(item) && item.length === 0) continue;
    if (typeof item === 'string') {
      blocks.push(fence('text', item));
    } else {
      const pretty = jsonBlock(item);
      if (pretty !== null) blocks.push(fence('json', pretty));
    }
  }
  if (blocks.length === 0) return null;
  return [
    `## Expected curl responses`,
    '',
    codeCard('EXPECTED RESPONSES', 'response', blocks.join('\n\n')),
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Page builders
// ---------------------------------------------------------------------------

/**
 * Render one method page. `zhPurpose` (zh mode only) swaps the Purpose section
 * text and the frontmatter description for the zh translation; titles, badges,
 * detail lines, parameter/response blocks and curl cards are rendered from the
 * en data exactly like the en page (T12 scope: translate purpose only).
 */
function methodPage(m, file, zhPurpose) {
  const apiMethod = String(m.api_method);
  const dot = apiMethod.indexOf('.');
  const short = dot === -1 ? apiMethod : apiMethod.slice(dot + 1);
  const where = `purpose of ${apiMethod}`;

  const purpose = cleanLiquid(typeof zhPurpose === 'string' ? zhPurpose : m.purpose, file, where);
  const parts = [frontmatter({ title: apiMethod, description: firstPlainLine(purpose) })];

  const badges = [badgeLine(m), networkLine(m)].filter(Boolean);
  if (badges.length) parts.push(`<p class="api-badges">${badges.join(' ')}</p>`, '');

  const detail = detailLine(m, file, apiMethod);
  if (detail) parts.push(detail, '');

  if (purpose.trim()) {
    parts.push('## Purpose', '', purpose.trim(), '');
  }

  const params = jsonBlock(m.parameter_json);
  if (params !== null) {
    parts.push('## Parameters', '', codeCard('PARAMETERS', 'params', fence('json', params)), '');
  }

  const curlExample = Array.isArray(m.curl_examples)
    ? m.curl_examples.find((e) => typeof e === 'string' && e.trim())
    : undefined;
  const curlBody = curlExample ?? syntheticCurl(apiMethod, m.parameter_json);
  if (isDeadWithCause(m)) {
    parts.push('<p class="dead-note">⚠ This RPC method is no longer provided by public nodes.</p>', '');
  }
  parts.push(
    '## Example curl',
    '',
    codeCard('CURL', 'example', fence(curlExampleLang(curlBody), curlBody)),
    ''
  );

  const response = jsonBlock(m.expected_response_json, { omitEmptyArray: true });
  if (response !== null) {
    parts.push('## Response', '', codeCard('RESPONSE', 'response', fence('json', response)), '');
  }

  const ecr = expectedCurlResponsesSection(m.expected_curl_responses, file, where);
  if (ecr) parts.push(ecr, '');

  return { short, content: parts.join('\n') };
}

function methodsIndexPage(stem, displayName, description, methods, file) {
  const parts = [
    frontmatter({
      title: displayName,
      description: firstPlainLine(description),
    }),
    description.trim() ? description.trim() + '\n' : '',
    `## Methods (${methods.length})`,
    '',
    '| Method | Since | Flags |',
    '| --- | --- | --- |',
  ];
  for (const entry of methods) {
    const m = entry.m ?? entry;
    const short = entry.short ?? String(entry.full ?? '');
    const flags = [
      m.deprecated === true ? 'deprecated' : '',
      m.disabled === true ? 'disabled' : '',
      m.removed === true ? 'removed' : '',
    ]
      .filter(Boolean)
      .join(', ');
    const since = isMissing(m.since) ? '' : String(m.since);
    parts.push(`| [${tableCell(short)}](${tableCell(short)}) | ${tableCell(since)} | ${tableCell(flags)} |`);
  }
  parts.push('');
  return parts.join('\n');
}

function opsIndexPage(stem, displayName, description, ops, file) {
  const parts = [
    frontmatter({
      title: displayName,
      description: firstPlainLine(description),
    }),
    description.trim() ? description.trim() + '\n' : '',
  ];
  for (const op of ops) {
    if (!isObject(op) || isMissing(op.name)) continue;
    const name = String(op.name);
    const where = `purpose of op ${name}`;
    parts.push(`## ${name}`, '');

    const badges = [];
    if (op.virtual === true) badges.push('<span class="badge badge-virtual">virtual</span>');
    badges.push(badgeLine(op));
    const badgeRow = badges.filter(Boolean).join(' ');
    if (badgeRow) parts.push(`<p class="api-badges">${badgeRow}</p>`, '');

    const purpose = cleanLiquid(op.purpose, file, where);
    if (typeof purpose === 'string' && purpose.trim()) parts.push(purpose.trim(), '');

    if (op.roles !== undefined && (Array.isArray(op.roles) ? op.roles.length : true)) {
      const roles = splitFoldedList(op.roles);
      try {
        parts.push(`**Roles:** ${roles.map((r) => `\`${r}\``).join(', ')}`, '');
      } catch {
        /* tolerate anything */
      }
    }

    const params = jsonBlock(splitFoldedList(op.params));
    if (params !== null) {
      parts.push(codeCard('PARAMS', 'params', fence('json', params)), '');
    }

    if (Array.isArray(op.json_examples)) {
      const blocks = [];
      for (const ex of op.json_examples) {
        const pretty = jsonBlock(ex);
        if (pretty !== null) blocks.push(fence('json', pretty));
      }
      if (blocks.length) {
        const title = blocks.length === 1 ? 'EXAMPLE' : 'EXAMPLES';
        parts.push(codeCard(title, 'example', blocks.join('\n\n')), '');
      }
    }
  }
  return parts.join('\n');
}

function overviewPage(apis) {
  const parts = [
    frontmatter({
      title: 'API Reference',
      description: 'JSON-RPC APIs generated from data/apidefinitions',
      outline: false,
    }),
    'The JSON-RPC API reference below is generated from `data/apidefinitions/*.yml`.',
    '',
    '<div class="api-cards">',
    '',
  ];
  for (const api of apis) {
    const isOps = api.type === 'ops';
    const n = isOps ? api.opCount : api.methodCount;
    const unit = isOps ? 'op' : 'method';
    const count = `${n} ${unit}${n === 1 ? '' : 's'}`;
    // Summary goes into a raw single-line HTML block (escaped), so legacy text
    // can never be re-interpreted as markdown (lists, emphasis, ...).
    const summary = escapeHtml(api.summary ?? '');
    // The API name stays a real markdown link so strict dead-link checking
    // still covers every card (raw <a href> would bypass it). Link text is
    // escaped so legacy names with markdown-significant characters cannot
    // break the link or inject markup.
    parts.push(
      '<div class="api-card">',
      '',
      `[${escapeLinkText(api.displayName)}](/api/${api.stem}/) <span class="badge badge-count">${count}</span>`,
      '',
      `<p class="api-card-summary">${summary}</p>`,
      '',
      '</div>',
      '',
    );
  }
  parts.push('</div>', '');
  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// zh locale pages (T11 bridge indexes + T12 translated method pages)
//
// docs/zh/api/<stem>/index.md exist for every API; docs/zh/api/<stem>/<short>.md
// exist only for methods covered by data/translations/zh/purposes.yml. Method
// rows in the index link to the zh page when it exists, otherwise they bridge
// to the English page by site-absolute path (`/api/<stem>/<method>.html`):
// VitePress' dead-link checker resolves site-absolute links from the site
// root, so they pass even from a /zh/ page, while relative links would resolve
// into the wrong tree and fail the zero-tolerance check. Method names, badges
// and purposes stay English on untranslated pages by design.
// ---------------------------------------------------------------------------

// T12 final (all 215 translated): every method row links to its zh page, so
// the note below no longer mentions en bridging. The hasZh branch in
// zhMethodsIndexPage stays as a safety net — an uncovered method (stale
// translation key) would still bridge to the English page.
const ZH_BRIDGE_NOTE =
  '> 本页为中文索引页：全部方法的 purpose 均已翻译为中文，方法行链接指向中文方法页。';

const ZH_OPS_BRIDGE_NOTE =
  '> 本页为中文索引页：该 API 的操作列表页暂未提供中文版。点击操作名跳转到英文页面的对应小节。';

function zhFlags(m, includeVirtual = false) {
  const flags = [
    includeVirtual && m.virtual === true ? 'virtual' : '',
    m.deprecated === true ? 'deprecated' : '',
    m.disabled === true ? 'disabled' : '',
    m.removed === true ? 'removed' : '',
  ]
    .filter(Boolean)
    .join(', ');
  return flags;
}

function zhMethodsIndexPage(stem, displayName, description, decorated) {
  const parts = [
    frontmatter({
      title: displayName,
      description: firstPlainLine(description),
    }),
    description.trim() ? description.trim() + '\n' : '',
    ZH_BRIDGE_NOTE,
    '',
    `## 方法 (${decorated.length})`,
    '',
    '| 方法 | 起始版本 | 状态 |',
    '| --- | --- | --- |',
  ];
  for (const { m, short, hasZh } of decorated) {
    const since = isMissing(m.since) ? '' : String(m.since);
    const flags = zhFlags(m);
    // T12: methods with a zh purpose link to their zh page (same tree, so a
    // site-absolute path is still required for the dead-link checker);
    // everything else keeps bridging to the English page.
    const href = hasZh
      ? `/zh/api/${stem}/${tableCell(short)}.html`
      : `/api/${stem}/${tableCell(short)}.html`;
    parts.push(`| [${tableCell(short)}](${href}) | ${tableCell(since)} | ${tableCell(flags)} |`);
  }
  parts.push('');
  return parts.join('\n');
}

/**
 * Mirror of VitePress' internal heading slugify (the one markdown-it-anchor
 * uses to build heading ids, here from the installed vitepress 1.6.4 dist):
 * NFKD-normalize, strip combining/control chars, collapse runs of special
 * characters (underscores included) into single hyphens, trim, prefix a
 * leading digit with "_", lowercase. The zh ops bridge index deep-links into
 * the en ops pages, so the generated `#anchor` targets must match the ids
 * VitePress actually assigns to the `## <op name>` headings — the raw op name
 * does not (transfer_to_vesting -> transfer-to-vesting, setRole -> setrole).
 * Verified against the built dist (docs/api/broadcast_ops index.html).
 */
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g;
const rCombining = /[\u0300-\u036F]/g;
const vitepressSlug = (str) =>
  str
    .normalize('NFKD')
    .replace(rCombining, '')
    .replace(rControl, '')
    .replace(rSpecial, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase();

function zhOpsIndexPage(stem, displayName, description, ops) {
  const parts = [
    frontmatter({
      title: displayName,
      description: firstPlainLine(description),
      outline: false,
    }),
    description.trim() ? description.trim() + '\n' : '',
    ZH_OPS_BRIDGE_NOTE,
    '',
    `## 操作 (${ops.length})`,
    '',
    '| 操作 | 状态 |',
    '| --- | --- |',
  ];
  for (const op of ops) {
    if (!isObject(op) || isMissing(op.name)) continue;
    const name = String(op.name);
    // Anchor deep-links into the English ops page (checker strips #hash, and
    // the /api/<stem>/ page exists, so this passes the dead-link check).
    // The hash must be VitePress' slugified heading id, not the raw op name —
    // see vitepressSlug above.
    parts.push(
      `| [${tableCell(name)}](/api/${stem}/#${vitepressSlug(name)}) | ${tableCell(zhFlags(op, true))} |`
    );
  }
  parts.push('');
  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/** `--locale <code>` CLI flag; only the zh pilot exists so far. */
function readLocaleArg(argv) {
  const i = argv.indexOf('--locale');
  if (i === -1) return undefined;
  const value = argv[i + 1];
  if (!value) throw new Error('--locale requires a value');
  if (value !== 'zh') throw new Error(`unsupported --locale '${value}' (only 'zh' is implemented)`);
  return value;
}

/**
 * Parse one YAML data file and collect everything needed to render its pages.
 * Pure (no writes) so the en and zh generators can both consume it.
 */
function collectApi(file) {
  const stem = file.replace(/\.yml$/, '');
  const data = loadYaml(file);
  if (!Array.isArray(data)) {
    console.warn(`! ${file}: top level is not an array, skipped`);
    return null;
  }

  const methods = [];
  const ops = [];
  let displayName = stem;
  let description = '';
  for (const group of data) {
    if (!isObject(group)) continue;
    // One-line normalize: several legacy files carry a leading colon
    // (':block_api') that must never leak into sidebar/titles/h1/overview.
    if (!isMissing(group.name)) displayName = String(group.name).replace(/^:+/, '').trim() || stem;
    if (!isMissing(group.description)) description = cleanLiquid(group.description, file, `description of group ${displayName}`);
    if (Array.isArray(group.methods)) {
      for (const el of group.methods) walkMethods(el, methods);
    }
    if (Array.isArray(group.ops)) ops.push(...group.ops.filter((op) => isObject(op) && !isMissing(op.name)));
  }

  const summary = firstPlainLine(description);
  const decorated = methods.map((m) => {
    const apiMethod = String(m.api_method);
    const dot = apiMethod.indexOf('.');
    return { m, short: dot === -1 ? apiMethod : apiMethod.slice(dot + 1), full: apiMethod };
  });
  // Uniqueness safety net for standalone `pnpm docs:gen` runs: two methods
  // sharing one short name would silently overwrite the same .md file.
  const seenShort = new Map();
  for (const { short, full } of decorated) {
    if (seenShort.has(short)) {
      throw new Error(
        `${file}: duplicate method short name '${short}' in API '${displayName}' — ` +
          `'${seenShort.get(short)}' and '${full}' both render to ${stem}/${short}.md`
      );
    }
    seenShort.set(short, full);
  }

  return { stem, displayName, description, summary, methods, ops, decorated };
}

/** en generation: verbatim behavior of the pre-T11 generator. */
function generateEnApis(files, collected) {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(GEN_DIR, { recursive: true });

  let methodPages = 0;
  let opPages = 0;
  const manifestApis = [];

  for (const file of files) {
    const api = collected.get(file);
    if (!api) continue;
    const { stem, displayName, description, summary, methods, ops, decorated } = api;

    const apiDir = join(OUT_DIR, stem);
    mkdirSync(apiDir, { recursive: true });

    let indexContent;
    if (methods.length > 0) {
      indexContent = methodsIndexPage(stem, displayName, description, decorated, file);
    } else {
      indexContent = opsIndexPage(stem, displayName, description, ops, file);
      opPages++;
    }
    writeFileSync(join(apiDir, 'index.md'), indexContent);

    for (const { m, short } of decorated) {
      const { content } = methodPage(m, file);
      writeFileSync(join(apiDir, `${short}.md`), content);
      methodPages++;
    }

    manifestApis.push({
      stem,
      displayName,
      summary,
      // Strict semantics: methodCount counts method pages only (0 for ops
      // APIs); opCount carries the op entries. Overview/index render the
      // opCount for ops APIs.
      methodCount: methods.length,
      opCount: ops.length,
      methods: decorated.map(({ short, full, m }) => ({
        short,
        full,
        deprecated: m.deprecated === true,
      })),
      type: methods.length > 0 ? 'methods' : 'ops',
    });
  }

  // Overview page + manifest: ops APIs (broadcast_ops*) sort last.
  manifestApis.sort((a, b) => (a.type === 'ops' ? 1 : 0) - (b.type === 'ops' ? 1 : 0) || a.stem.localeCompare(b.stem));
  const manifest = {
    apis: manifestApis.map(({ type, ...spec }) => {
      void type; // internal sort key; consumers use methodCount/opCount
      return spec;
    }),
  };
  writeFileSync(join(OUT_DIR, 'index.md'), overviewPage(manifestApis));
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(LIQUID_LOG_PATH, liquidWarnings.map((l) => l.replace(/\s+/g, ' ').trim()).join('\n') + '\n');

  const totalPages = 1 + manifestApis.length + methodPages;
  console.log(`API docs generated:`);
  console.log(`  data files           : ${files.length}`);
  console.log(`  API index pages      : ${manifestApis.length} (incl. ${opPages} ops single-page refs)`);
  console.log(`  method pages         : ${methodPages}`);
  console.log(`  total pages          : ${totalPages} (1 overview + ${manifestApis.length} indexes + ${methodPages} methods)`);
  console.log(`  liquid cleanups      : ${liquidWarnings.length} -> ${LIQUID_LOG_PATH}`);
  console.log(`  manifest             : ${MANIFEST_PATH}`);
}

/**
 * Load data/translations/zh/purposes.yml (zh mode only): api_method -> zh
 * purpose translation. Lenient by design — a missing/unusable entry means
 * "no zh page for that method" (index keeps bridging to en), never a crash.
 * Unknown keys (no matching api_method in data/) are reported so stale
 * translations cannot hide silently. Only consumed by the zh run; the en run
 * never reads this file.
 */
function loadZhPurposes() {
  const map = new Map();
  if (!existsSync(ZH_PURPOSES_PATH)) {
    console.warn(`! zh purposes file not found (${ZH_PURPOSES_PATH}); no zh method pages will be generated`);
    return map;
  }
  const raw = readFileSync(ZH_PURPOSES_PATH, 'utf8');
  const doc = parseDocument(raw, { uniqueKeys: false });
  if (doc.errors.length > 0) {
    throw new Error(`zh purposes: YAML parse error: ${doc.errors[0].message}`);
  }
  // Duplicate api_method keys would silently drop one translation (last wins),
  // so surface them like the data validator does.
  const seen = new Set();
  const visit = (node) => {
    if (node instanceof YAMLMap) {
      for (const pair of node.items) {
        const key = String(pair.key?.value ?? pair.key);
        if (seen.has(key)) console.warn(`! zh purposes: duplicate key '${key}' (last value wins)`);
        seen.add(key);
        visit(pair.value);
      }
    } else if (node instanceof YAMLSeq) {
      node.items.forEach(visit);
    }
  };
  visit(doc.contents);

  const data = doc.toJS();
  if (!isObject(data) || !isObject(data.purposes)) {
    throw new Error('zh purposes: expected a top-level `purposes` mapping');
  }
  for (const [key, value] of Object.entries(data.purposes)) {
    if (typeof value !== 'string' || !value.trim()) {
      console.warn(`! zh purposes: '${key}' has no usable string translation, skipped`);
      continue;
    }
    map.set(String(key), value);
  }
  return map;
}

/**
 * zh generation (T11 + T12): the 19 API bridge index pages under docs/zh/api/
 * plus one zh method page per translated method. The hand-written
 * docs/zh/api/index.md overview and docs/zh/*.md static pages are NEVER
 * touched: no rm of ZH_OUT_DIR itself — only per-stem dirs are replaced, and
 * stale stem dirs (APIs removed from the YAML) are swept. Also never writes
 * the en-side artifacts (manifest / liquid log) — those belong to the en run.
 */
function generateZhPages(files, collected, zhPurposes) {
  mkdirSync(ZH_OUT_DIR, { recursive: true });

  // Report translations whose method no longer exists in the en data so the
  // translation file cannot drift silently.
  const knownMethods = new Set();
  for (const api of collected.values()) {
    for (const { full } of api.decorated) knownMethods.add(full);
  }
  for (const key of zhPurposes.keys()) {
    if (!knownMethods.has(key)) console.warn(`! zh purposes: '${key}' matches no api_method in data/, ignored`);
  }

  const stems = new Set();
  let methodIndexes = 0;
  let opsIndexes = 0;
  let zhMethodPages = 0;
  for (const file of files) {
    const api = collected.get(file);
    if (!api) continue;
    const { stem, displayName, description, methods, ops, decorated } = api;
    const stemDir = join(ZH_OUT_DIR, stem);
    rmSync(stemDir, { recursive: true, force: true });
    mkdirSync(stemDir, { recursive: true });
    const rows = decorated.map(({ m, short }) => {
      const zhPurpose = zhPurposes.get(String(m.api_method));
      const hasZh = zhPurpose !== undefined;
      if (hasZh) {
        writeFileSync(join(stemDir, `${short}.md`), methodPage(m, file, zhPurpose).content);
        zhMethodPages++;
      }
      return { m, short, hasZh };
    });
    const content =
      methods.length > 0
        ? zhMethodsIndexPage(stem, displayName, description, rows)
        : zhOpsIndexPage(stem, displayName, description, ops);
    writeFileSync(join(stemDir, 'index.md'), content);
    stems.add(stem);
    if (methods.length > 0) methodIndexes++;
    else opsIndexes++;
  }

  // Sweep stem dirs whose API no longer exists in data/ (the hand-written
  // overview file is not a directory, so it survives this sweep).
  for (const entry of readdirSync(ZH_OUT_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && !stems.has(entry.name)) {
      rmSync(join(ZH_OUT_DIR, entry.name), { recursive: true, force: true });
    }
  }

  console.log(`zh API pages generated:`);
  console.log(`  data files           : ${files.length}`);
  console.log(`  zh index pages       : ${methodIndexes + opsIndexes} (${methodIndexes} methods + ${opsIndexes} ops bridges)`);
  console.log(`  zh method pages      : ${zhMethodPages} (translations loaded: ${zhPurposes.size})`);
  console.log(`  output               : ${ZH_OUT_DIR}/`);
}

function main() {
  const locale = readLocaleArg(process.argv.slice(2));
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.yml')).sort();
  const collected = new Map();
  for (const file of files) {
    const api = collectApi(file);
    if (api) collected.set(file, api);
  }
  if (locale === 'zh') {
    generateZhPages(files, collected, loadZhPurposes());
    return;
  }
  generateEnApis(files, collected);
}

try {
  main();
} catch (err) {
  console.error('docs:gen failed:', err);
  process.exit(1);
}
