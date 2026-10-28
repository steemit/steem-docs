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
// Partial locales (T11 zh pilot, T13 ru/fr/de/it/es rollouts, T32 ko rollout):
// bridge index pages, generated with --locale <code>. Only the <stem>/index.md
// subtrees are written; hand-written static pages under docs/<code>/ (home, API
// overview) are never touched by this script. Full locales additionally get a
// method page per purpose covered by their data/translations/<code>/purposes.yml —
// zh (T12, all 238 since the T22 source-fill), ru (T27, same 238 key set),
// fr (T28, same 238 key set), de (T29, same 238 key set), it (T30, same
// 238 key set), es (T31, same 238 key set) and ko (T32, same 238 key set)
// are full locales — every registered locale generates method pages today;
// every method row in their index tables links to the locale method page
// (the per-row en bridge remains only as a safety net for uncovered keys).
const ZH_OUT_DIR = join(ROOT, 'docs/zh/api');
const ZH_PURPOSES_PATH = join(ROOT, 'data/translations/zh/purposes.yml');
const RU_OUT_DIR = join(ROOT, 'docs/ru/api');
const RU_PURPOSES_PATH = join(ROOT, 'data/translations/ru/purposes.yml');
const FR_OUT_DIR = join(ROOT, 'docs/fr/api');
const FR_PURPOSES_PATH = join(ROOT, 'data/translations/fr/purposes.yml');
const DE_OUT_DIR = join(ROOT, 'docs/de/api');
const DE_PURPOSES_PATH = join(ROOT, 'data/translations/de/purposes.yml');
const IT_OUT_DIR = join(ROOT, 'docs/it/api');
const IT_PURPOSES_PATH = join(ROOT, 'data/translations/it/purposes.yml');
const ES_OUT_DIR = join(ROOT, 'docs/es/api');
const ES_PURPOSES_PATH = join(ROOT, 'data/translations/es/purposes.yml');
const KO_OUT_DIR = join(ROOT, 'docs/ko/api');
const KO_PURPOSES_PATH = join(ROOT, 'data/translations/ko/purposes.yml');
// T23 (user decision): every generated curl command targets api.steemit.com.
const API_URL = 'https://api.steemit.com';

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

/**
 * First non-empty line as plain text (truncated). Only markdown syntax
 * symbols are stripped — underscores are preserved so snake_case method
 * names survive intact into meta descriptions (phase-3 nits).
 */
function firstPlainLine(text, max = 160) {
  if (typeof text !== 'string') return '';
  const line = text.split('\n').map((l) => l.trim()).find((l) => l.length > 0) ?? '';
  const plain = line
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`~]/g, '')
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
 * Bare JSON-RPC envelope for methods without curl_examples (T23 fallback):
 * returns the body string, formatted into a full command by
 * bashCurlCommand() exactly like the stored examples. Never throws.
 */
function syntheticCurl(apiMethod, parameterJson) {
  const compact = compactJson(parameterJson);
  try {
    return JSON.stringify({ jsonrpc: '2.0', method: apiMethod, params: JSON.parse(compact), id: 1 });
  } catch {
    // Non-JSON parameter_json: re-serialize instead of interpolating raw text
    // (raw interpolation would emit an invalid body). Warn so the data bug is visible.
    console.warn(`[syntheticCurl] non-JSON parameter_json for ${apiMethod}; wrapping as JSON string`);
    return JSON.stringify({ jsonrpc: '2.0', method: apiMethod, params: parameterJson, id: 1 });
  }
}

/**
 * T23: one complete wrapped curl command from a stored bare JSON-RPC body
 * string. The body is parsed and re-printed with a 2-space indent, embedded
 * in a single-quoted --data-binary payload with backslash continuations and
 * a Content-Type header. Target line width is <=80
 * (scripts/check-curl-width.mjs); bodies carrying unbreakable tokens (hex
 * signatures up to ~160 columns) are wrapped visually by CSS
 * (.code-card pre { white-space: pre-wrap }), so they stay warnings, never
 * hard failures. Never throws: an unparseable body is embedded verbatim.
 */
function bashCurlCommand(bodyString) {
  const raw = String(bodyString).trim();
  let pretty;
  try {
    pretty = JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    pretty = raw;
  }
  // Shell-safe single-quoted string: escape embedded ' as '\'' (defensive —
  // the T23 data census found zero single quotes in all 359 stored bodies).
  const lines = pretty.split('\n').map((l) => l.replace(/'/g, `'\\''`));
  const bodyLines = lines.map((l, i) => {
    let out = i === 0 ? `  --data-binary '${l}` : l.length > 0 ? `  ${l}` : l;
    if (i === lines.length - 1) out += `'`; // close the quoted payload
    return out;
  });
  return [`curl -s ${API_URL} \\`, `  -H 'Content-Type: application/json' \\`, ...bodyLines].join('\n');
}

/**
 * T23: the `## Example` section. Every curl_examples entry renders as its
 * own wrapped command in a `bash` fence (card title BASH) — all N of them,
 * keeping 1:1 positional pairing with expected_curl_responses — while the
 * legacy renderer showed only the first. Methods without any stored example
 * fall back to the synthetic envelope. Dead methods (badge + detail cause)
 * carry a shell comment line inside every bash block next to the existing
 * warning paragraph. N > 1 gets `### Example N` sub-headings.
 */
function exampleSection(m, apiMethod) {
  const stored = Array.isArray(m.curl_examples)
    ? m.curl_examples.filter((e) => typeof e === 'string' && e.trim())
    : [];
  const bodies = stored.length > 0 ? stored : [syntheticCurl(apiMethod, m.parameter_json)];
  const deadComment = isDeadWithCause(m) ? '# NOTE: this method is no longer served by public nodes\n' : '';
  const card = (body) => codeCard('BASH', 'example', fence('bash', deadComment + bashCurlCommand(body)));
  const parts = ['## Example', ''];
  if (bodies.length === 1) {
    parts.push(card(bodies[0]), '');
  } else {
    bodies.forEach((body, i) => parts.push(`### Example ${i + 1}`, '', card(body), ''));
  }
  return parts;
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

/**
 * Dead-note wording per death family (phase-3 nits). The single generic
 * "no longer provided" sentence was wrong for two of the three families:
 * the SMT-era set is deprecated rather than removed, and the source-defined
 * methods (debug_node / chain_api / the T25 source-truth set) still exist in
 * steem source — their plugins are just not enabled on public nodes. Family
 * selection: removed wins over disabled (the three removed methods carry
 * both flags in the YAML), then disabled, then deprecated. zh/ru/fr/de/it/es/ko
 * mirror the English sentences on locale-generated method pages.
 */
const DEAD_NOTES = {
  en: {
    removed: '⚠ This RPC method is no longer provided by public nodes.',
    disabled: '⚠ Defined in the steem source, but not enabled on public nodes.',
    deprecated: '⚠ This method is deprecated (SMT-era) and no longer served by public nodes.',
  },
  zh: {
    removed: '⚠ 此 RPC 方法已不再由公共节点提供。',
    disabled: '⚠ 该方法在 steem 源码中有定义，但公共节点未启用。',
    deprecated: '⚠ 此方法已弃用（SMT 时代），公共节点已不再提供。',
  },
  ru: {
    removed: '⚠ Этот RPC-метод больше не предоставляется публичными узлами.',
    disabled: '⚠ Определён в исходном коде steem, но не включён на публичных узлах.',
    deprecated: '⚠ Этот метод устарел (эпоха SMT) и больше не предоставляется публичными узлами.',
  },
  fr: {
    removed: '⚠ Cette méthode RPC n’est plus fournie par les nœuds publics.',
    disabled: '⚠ Définie dans le code source de steem, mais non activée sur les nœuds publics.',
    deprecated:
      '⚠ Cette méthode est dépréciée (ère SMT, jetons médiatiques intelligents) et n’est plus fournie par les nœuds publics.',
  },
  de: {
    removed: '⚠ Diese RPC-Methode wird von öffentlichen Knoten nicht mehr bereitgestellt.',
    disabled: '⚠ Im steem-Quellcode definiert, auf öffentlichen Knoten aber nicht aktiviert.',
    deprecated: '⚠ Diese Methode ist veraltet (SMT-Ära) und wird von öffentlichen Knoten nicht mehr bereitgestellt.',
  },
  it: {
    removed: '⚠ Questo metodo RPC non è più fornito dai nodi pubblici.',
    disabled: '⚠ Definito nel codice sorgente di steem, ma non abilitato sui nodi pubblici.',
    deprecated:
      '⚠ Questo metodo è deprecato (era SMT, token multimediali intelligenti) e non è più fornito dai nodi pubblici.',
  },
  es: {
    removed: '⚠ Este método RPC ya no es proporcionado por los nodos públicos.',
    disabled: '⚠ Definido en el código fuente de steem, pero no habilitado en los nodos públicos.',
    deprecated:
      '⚠ Este método está deprecado (de la era SMT, tokens de medios inteligentes) y ya no es proporcionado por los nodos públicos.',
  },
  ko: {
    removed: '⚠ 이 RPC 메서드는 더 이상 퍼블릭 노드에서 제공되지 않습니다.',
    disabled: '⚠ steem 소스 코드에 정의되어 있지만, 퍼블릭 노드에서는 활성화되지 않았습니다.',
    deprecated: '⚠ 이 메서드는 지원 중단(SMT 시대)되었으며 더 이상 퍼블릭 노드에서 제공되지 않습니다.',
  },
};

/** Death family of a method carrying at least one death badge. */
function deathFamily(m) {
  if (m.removed === true) return 'removed';
  if (m.disabled === true) return 'disabled';
  return 'deprecated';
}

/** Localized dead-note paragraph for a method that isDeadWithCause(). */
function deadNote(m, locale) {
  return `<p class="dead-note">${DEAD_NOTES[locale ?? 'en'][deathFamily(m)]}</p>`;
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
 * Render one method page. `translatedPurpose` (locale mode only) swaps the
 * Purpose section text and the frontmatter description for the translation;
 * `locale` (locale mode only) picks the dead-note wording (en when omitted).
 * Titles, badges, detail lines, parameter/response blocks and curl cards are
 * rendered from the en data exactly like the en page (T12 scope: translate
 * purpose only — zh, ru, fr, de, it, es and ko are the locales with method
 * pages today).
 */
function methodPage(m, file, translatedPurpose, locale) {
  const apiMethod = String(m.api_method);
  const dot = apiMethod.indexOf('.');
  const short = dot === -1 ? apiMethod : apiMethod.slice(dot + 1);
  const where = `purpose of ${apiMethod}`;

  const purpose = cleanLiquid(typeof translatedPurpose === 'string' ? translatedPurpose : m.purpose, file, where);
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

  if (isDeadWithCause(m)) {
    parts.push(deadNote(m, locale), '');
  }
  parts.push(...exampleSection(m, apiMethod));

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
// Partial-locale bridge pages (T11 zh pilot + T12 zh methods, T13 ru rollout)
//
// docs/<code>/api/<stem>/index.md exist for every API. Method rows in the
// index link to the locale's own page when it exists (zh, via the purposes
// translation file), otherwise they bridge to the English page by
// site-absolute path (`/api/<stem>/<method>.html`): VitePress' dead-link
// checker resolves site-absolute links from the site root, so they pass even
// from a /zh/ or /ru/ page, while relative links would resolve into the wrong
// tree and fail the zero-tolerance check. Method names, badges and purposes
// stay English on untranslated pages by design.
//
// T12 final (all 238 translated since the T22 source-fill): every zh method
// row links to its zh page,
// so the zh note below no longer mentions en bridging. The per-row branch
// stays as a safety net — an uncovered method (stale translation key) would
// still bridge to the English page. T27/T29 do the same for ru/de (purposes
// files registered, full-locale notes); the per-row branch keeps covering any
// row a future data change would leave untranslated. T32 registers ko the
// same way — with all seven locales full, no locale is bridge-only anymore.
// ---------------------------------------------------------------------------

const ZH_BRIDGE_NOTE =
  '> 本页为中文索引页：全部方法的 purpose 均已翻译为中文，方法行链接指向中文方法页。';

const ZH_OPS_BRIDGE_NOTE =
  '> 本页为中文索引页：该 API 的操作列表页暂未提供中文版。点击操作名跳转到英文页面的对应小节。';

const RU_METHODS_NOTE =
  '> Это русская индексная страница: все методы переведены на русский язык, ссылки в таблицах ведут на русские страницы методов.';

const RU_OPS_BRIDGE_NOTE =
  '> Это русская индексная страница: страница операций пока не переведена на русский язык — нажмите имя операции, чтобы перейти к соответствующему разделу английской страницы.';

const FR_METHODS_NOTE =
  '> Ceci est la page d’index française : toutes les méthodes sont traduites en français, les liens des tableaux mènent aux pages de méthodes françaises.';

const FR_OPS_BRIDGE_NOTE =
  '> Ceci est la page d’index française : la page des opérations n’est pas encore traduite en français — cliquez sur le nom d’une opération pour ouvrir la section correspondante de la page anglaise.';
const DE_METHODS_NOTE =
  '> Dies ist die deutsche Indexseite: alle Methoden sind ins Deutsche übersetzt, die Links in den Tabellen führen zu den deutschen Methodenseiten.';

const IT_METHODS_NOTE =
  '> Questa è la pagina di indice italiana: tutti i metodi sono tradotti in italiano, i link delle tabelle portano alle pagine dei metodi italiane.';

const IT_OPS_BRIDGE_NOTE =
  '> Questa è la pagina di indice italiana: la pagina delle operazioni non è ancora tradotta in italiano — fare clic sul nome di un’operazione per aprire la sezione corrispondente della pagina inglese.';

const ES_METHODS_NOTE =
  '> Esta es la página de índice en español: todos los métodos están traducidos al español, los enlaces de las tablas llevan a las páginas de métodos en español.';

const ES_OPS_BRIDGE_NOTE =
  '> Esta es la página de índice en español: la página de operaciones aún no está traducida al español — haga clic en el nombre de una operación para abrir la sección correspondiente de la página en inglés.';

const KO_METHODS_NOTE =
  '> 이것은 한국어 인덱스 페이지입니다: 모든 메서드가 한국어로 번역되었으며, 표의 링크는 한국어 메서드 페이지로 연결됩니다.';

const KO_OPS_BRIDGE_NOTE =
  '> 이것은 한국어 인덱스 페이지입니다: 작업 페이지는 아직 한국어로 번역되지 않았습니다 — 작업 이름을 클릭하면 영어 페이지의 해당 섹션으로 이동합니다.';

/**
 * Locale registry for `--locale <code>` runs. Every entry is a full locale:
 * zh, ru, fr, de, it, es and ko each map a purposes translation file to
 * translated method pages (ko via T32 — the last bridge-only locale to flip,
 * so bridgeOnlyLocale() is gone from this file).
 */
const LOCALES = {
  zh: {
    key: 'zh',
    outDir: ZH_OUT_DIR,
    purposesPath: ZH_PURPOSES_PATH,
    methods: {
      note: ZH_BRIDGE_NOTE,
      heading: '方法',
      colMethod: '方法',
      colSince: '起始版本',
      colFlags: '状态',
    },
    ops: {
      note: ZH_OPS_BRIDGE_NOTE,
      heading: '操作',
      colOp: '操作',
      colFlags: '状态',
    },
  },
  ru: {
    key: 'ru',
    outDir: RU_OUT_DIR,
    // T27 (phase 4): ru is the second full locale — one translated method page
    // per purpose in data/translations/ru/purposes.yml (all 238 since the T22
    // source-fill), mirroring the zh pattern.
    purposesPath: RU_PURPOSES_PATH,
    methods: {
      note: RU_METHODS_NOTE,
      heading: 'Методы',
      colMethod: 'Метод',
      colSince: 'Начиная с версии',
      colFlags: 'Статус',
    },
    ops: {
      note: RU_OPS_BRIDGE_NOTE,
      heading: 'Операции',
      colOp: 'Операция',
      colFlags: 'Статус',
    },
  },
  fr: {
    key: 'fr',
    outDir: FR_OUT_DIR,
    // T28 (phase 4): fr is the third full locale — one translated method page
    // per purpose in data/translations/fr/purposes.yml (all 238 since the T22
    // source-fill), mirroring the zh/ru pattern.
    purposesPath: FR_PURPOSES_PATH,
    methods: {
      note: FR_METHODS_NOTE,
      heading: 'Méthodes',
      colMethod: 'Méthode',
      colSince: 'À partir de la version',
      colFlags: 'Statut',
    },
    ops: {
      note: FR_OPS_BRIDGE_NOTE,
      heading: 'Opérations',
      colOp: 'Opération',
      colFlags: 'Statut',
    },
  },
  de: {
    key: 'de',
    outDir: DE_OUT_DIR,
    // T29 (phase 4): de is the fourth full locale — one translated method page
    // per purpose in data/translations/de/purposes.yml (all 238 since the T22
    // source-fill), mirroring the zh/ru pattern.
    purposesPath: DE_PURPOSES_PATH,
    methods: {
      note: DE_METHODS_NOTE,
      heading: 'Methoden',
      colMethod: 'Methode',
      colSince: 'Seit Version',
      colFlags: 'Status',
    },
    ops: {
      note:
        '> Dies ist die deutsche Indexseite: die Operationsseite ist noch nicht ins Deutsche übersetzt — klicken Sie auf den Namen einer Operation, um zum entsprechenden Abschnitt der englischen Seite zu gelangen.',
      heading: 'Operationen',
      colOp: 'Operation',
      colFlags: 'Status',
    },
  },
  it: {
    key: 'it',
    outDir: IT_OUT_DIR,
    // T30 (phase 4): it is the fifth full locale — one translated method page
    // per purpose in data/translations/it/purposes.yml (all 238 since the T22
    // source-fill), mirroring the zh/ru/fr pattern.
    purposesPath: IT_PURPOSES_PATH,
    methods: {
      note: IT_METHODS_NOTE,
      heading: 'Metodi',
      colMethod: 'Metodo',
      colSince: 'Dalla versione',
      colFlags: 'Stato',
    },
    ops: {
      note: IT_OPS_BRIDGE_NOTE,
      heading: 'Operazioni',
      colOp: 'Operazione',
      colFlags: 'Stato',
    },
  },
  es: {
    key: 'es',
    outDir: ES_OUT_DIR,
    // T31 (phase 4): es is the sixth full locale — one translated method page
    // per purpose in data/translations/es/purposes.yml (all 238 since the T22
    // source-fill), mirroring the zh/ru/fr/de/it pattern.
    purposesPath: ES_PURPOSES_PATH,
    methods: {
      note: ES_METHODS_NOTE,
      heading: 'Métodos',
      colMethod: 'Método',
      colSince: 'Desde la versión',
      colFlags: 'Estado',
    },
    ops: {
      note: ES_OPS_BRIDGE_NOTE,
      heading: 'Operaciones',
      colOp: 'Operación',
      colFlags: 'Estado',
    },
  },
  ko: {
    key: 'ko',
    outDir: KO_OUT_DIR,
    // T32 (phase 4): ko is the seventh full locale — one translated method
    // page per purpose in data/translations/ko/purposes.yml (all 238 since
    // the T22 source-fill), mirroring the zh/ru/fr/de/it/es pattern.
    purposesPath: KO_PURPOSES_PATH,
    methods: {
      note: KO_METHODS_NOTE,
      heading: '메서드',
      colMethod: '메서드',
      colSince: '도입 버전',
      colFlags: '상태',
    },
    ops: {
      note: KO_OPS_BRIDGE_NOTE,
      heading: '작업',
      colOp: '작업',
      colFlags: '상태',
    },
  },
};

function flagCells(m, includeVirtual = false) {
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

function localeMethodsIndexPage(locale, stem, displayName, description, decorated) {
  const { methods: cfg } = locale;
  const parts = [
    frontmatter({
      title: displayName,
      description: firstPlainLine(description),
    }),
    description.trim() ? description.trim() + '\n' : '',
    cfg.note,
    '',
    `## ${cfg.heading} (${decorated.length})`,
    '',
    `| ${cfg.colMethod} | ${cfg.colSince} | ${cfg.colFlags} |`,
    '| --- | --- | --- |',
  ];
  for (const { m, short, href } of decorated) {
    const since = isMissing(m.since) ? '' : String(m.since);
    const flags = flagCells(m);
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

function localeOpsIndexPage(locale, stem, displayName, description, ops) {
  const { ops: cfg } = locale;
  const parts = [
    frontmatter({
      title: displayName,
      description: firstPlainLine(description),
      outline: false,
    }),
    description.trim() ? description.trim() + '\n' : '',
    cfg.note,
    '',
    `## ${cfg.heading} (${ops.length})`,
    '',
    `| ${cfg.colOp} | ${cfg.colFlags} |`,
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
      `| [${tableCell(name)}](/api/${stem}/#${vitepressSlug(name)}) | ${tableCell(flagCells(op, true))} |`
    );
  }
  parts.push('');
  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/** `--locale <code>` CLI flag; supported codes are the LOCALES registry keys. */
function readLocaleArg(argv) {
  const i = argv.indexOf('--locale');
  if (i === -1) return undefined;
  const value = argv[i + 1];
  if (!value) throw new Error('--locale requires a value');
  if (!LOCALES[value]) {
    throw new Error(`unsupported --locale '${value}' (implemented: ${Object.keys(LOCALES).join(', ')})`);
  }
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

  // Fresh manifest in hand — assert the hand-written locale overview pages
  // still agree with the data (throws / exits 1 on any drift). The guard
  // covers OVERVIEW_GUARD_LOCALES, defined near its implementation below.
  verifyLocaleOverviewCounts(manifestApis);

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
 * Load a locale purposes translation file: api_method -> purpose translation.
 * Lenient by design — a missing/unusable entry means "no locale page for that
 * method" (index keeps bridging to en), never a crash. Unknown keys (no
 * matching api_method in data/) are reported so stale translations cannot
 * hide silently. All registered locales (zh/ru/fr/de/it/es/ko) have purposes
 * files today; with a file registered, a fully covered key set means every
 * method row links to its locale page.
 */
function loadPurposes(locale) {
  const map = new Map();
  if (!locale.purposesPath) return map;
  if (!existsSync(locale.purposesPath)) {
    console.warn(`! ${locale.key} purposes file not found (${locale.purposesPath}); no ${locale.key} method pages will be generated`);
    return map;
  }
  const raw = readFileSync(locale.purposesPath, 'utf8');
  const doc = parseDocument(raw, { uniqueKeys: false });
  if (doc.errors.length > 0) {
    throw new Error(`${locale.key} purposes: YAML parse error: ${doc.errors[0].message}`);
  }
  // Duplicate api_method keys would silently drop one translation (last wins),
  // so surface them like the data validator does.
  const seen = new Set();
  const visit = (node) => {
    if (node instanceof YAMLMap) {
      for (const pair of node.items) {
        const key = String(pair.key?.value ?? pair.key);
        if (seen.has(key)) console.warn(`! ${locale.key} purposes: duplicate key '${key}' (last value wins)`);
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
    throw new Error(`${locale.key} purposes: expected a top-level \`purposes\` mapping`);
  }
  for (const [key, value] of Object.entries(data.purposes)) {
    if (typeof value !== 'string' || !value.trim()) {
      console.warn(`! ${locale.key} purposes: '${key}' has no usable string translation, skipped`);
      continue;
    }
    map.set(String(key), value);
  }
  return map;
}

/**
 * Partial-locale generation: the 22 API stem index pages under
 * docs/<code>/api/ plus one method page per translated purpose. The
 * hand-written docs/<code>/api/index.md overview and docs/<code>/*.md static
 * pages are NEVER touched: no rm of the locale outDir itself — only per-stem
 * dirs are replaced, and stale stem dirs (APIs removed from the YAML) are
 * swept. Also never writes the en-side artifacts (manifest / liquid log) —
 * those belong to the en run.
 */
function generateLocalePages(files, collected, locale) {
  const purposes = loadPurposes(locale);
  mkdirSync(locale.outDir, { recursive: true });

  // Report translations whose method no longer exists in the en data so the
  // translation file cannot drift silently (only relevant when a purposes
  // file is consumed).
  if (locale.purposesPath) {
    const knownMethods = new Set();
    for (const api of collected.values()) {
      for (const { full } of api.decorated) knownMethods.add(full);
    }
    for (const key of purposes.keys()) {
      if (!knownMethods.has(key)) console.warn(`! ${locale.key} purposes: '${key}' matches no api_method in data/, ignored`);
    }
  }

  const stems = new Set();
  let methodIndexes = 0;
  let opsIndexes = 0;
  let localeMethodPages = 0;
  for (const file of files) {
    const api = collected.get(file);
    if (!api) continue;
    const { stem, displayName, description, methods, ops, decorated } = api;
    const stemDir = join(locale.outDir, stem);
    rmSync(stemDir, { recursive: true, force: true });
    mkdirSync(stemDir, { recursive: true });
    const rows = decorated.map(({ m, short }) => {
      const translated = purposes.get(String(m.api_method));
      const hasTranslated = translated !== undefined;
      if (hasTranslated) {
        writeFileSync(join(stemDir, `${short}.md`), methodPage(m, file, translated, locale.key).content);
        localeMethodPages++;
      }
      // A translated method links to its locale page (same tree, so a
      // site-absolute path is still required for the dead-link checker);
      // everything else keeps bridging to the English page — for the
      // bridge-only locales that is every row, by design.
      const href = hasTranslated
        ? `/${locale.key}/api/${stem}/${tableCell(short)}.html`
        : `/api/${stem}/${tableCell(short)}.html`;
      return { m, short, href };
    });
    const content =
      methods.length > 0
        ? localeMethodsIndexPage(locale, stem, displayName, description, rows)
        : localeOpsIndexPage(locale, stem, displayName, description, ops);
    writeFileSync(join(stemDir, 'index.md'), content);
    stems.add(stem);
    if (methods.length > 0) methodIndexes++;
    else opsIndexes++;
  }

  // Sweep stem dirs whose API no longer exists in data/ (the hand-written
  // overview file is not a directory, so it survives this sweep).
  for (const entry of readdirSync(locale.outDir, { withFileTypes: true })) {
    if (entry.isDirectory() && !stems.has(entry.name)) {
      rmSync(join(locale.outDir, entry.name), { recursive: true, force: true });
    }
  }

  const translationsNote = locale.purposesPath
    ? ` (translations loaded: ${purposes.size})`
    : ' (method pages deferred — all rows bridge to en)';
  console.log(`${locale.key} API pages generated:`);
  console.log(`  data files           : ${files.length}`);
  console.log(`  ${locale.key} index pages       : ${methodIndexes + opsIndexes} (${methodIndexes} methods + ${opsIndexes} ops bridges)`);
  console.log(`  ${locale.key} method pages      : ${localeMethodPages}${translationsNote}`);
  console.log(`  output               : ${locale.outDir}/`);
}

// ---------------------------------------------------------------------------
// Hand-written overview count guard (T13 review fix, phase-2 ru round P2):
// the per-locale API overview pages docs/<code>/api/index.md are hand-written
// static pages whose card badges repeat the method/op counts from the data.
// When the YAML data changes, docs:gen regenerates the ENGLISH overview
// automatically — the locale pages would silently go stale. This guard runs
// in every en-mode docs:gen run (after the fresh manifest is written) and
// FAILS the build when any locale page no longer matches the manifest, so
// the drift surfaces at build time instead of on the rendered page.
// ---------------------------------------------------------------------------
const OVERVIEW_GUARD_LOCALES = ['zh', 'ru', 'fr', 'de', 'it', 'es', 'ko'];

function verifyLocaleOverviewCounts(manifestApis) {
  for (const code of OVERVIEW_GUARD_LOCALES) {
    const pagePath = join(ROOT, 'docs', code, 'api', 'index.md');
    if (!existsSync(pagePath)) {
      throw new Error(
        `overview count guard: hand-written overview page missing: docs/${code}/api/index.md — ` +
          `restore it or remove '${code}' from OVERVIEW_GUARD_LOCALES`
      );
    }
    const text = readFileSync(pagePath, 'utf8');
    // Card shape emitted by overviewPage() and mirrored by the hand-written
    // locale pages: [Name](/api/<stem>/) <span class="badge badge-count">N …
    // Locale pages link /<code>/api/<stem>/ (methods) or /api/<stem>/ (ops).
    const cards = new Map();
    const cardRe =
      /\[[^\]]+\]\((\/(?:[a-z]{2}\/)?api\/([a-z_]+)\/)\) <span class="badge badge-count">(\d+)/g;
    for (const match of text.matchAll(cardRe)) {
      const stem = match[2];
      if (cards.has(stem)) {
        throw new Error(`overview count guard: docs/${code}/api/index.md has duplicate cards for '${stem}'`);
      }
      cards.set(stem, { count: Number(match[3]), href: match[1] });
    }
    const problems = [];
    if (cards.size !== manifestApis.length) {
      problems.push(`expected ${manifestApis.length} API cards, found ${cards.size}`);
    }
    for (const api of manifestApis) {
      const card = cards.get(api.stem);
      if (!card) {
        problems.push(`no card for '${api.stem}'`);
        continue;
      }
      const expected = api.methodCount > 0 ? api.methodCount : api.opCount;
      if (card.count !== expected) {
        problems.push(`'${api.stem}' badge says ${card.count}, manifest says ${expected}`);
      }
      const hrefOk = card.href === `/${code}/api/${api.stem}/` || card.href === `/api/${api.stem}/`;
      if (!hrefOk) {
        problems.push(`'${api.stem}' links to '${card.href}' (expected /${code}/api/${api.stem}/ or /api/${api.stem}/)`);
      }
    }
    if (problems.length > 0) {
      throw new Error(
        `overview count guard: docs/${code}/api/index.md is out of sync with api-manifest.json — ` +
          `${problems.join('; ')}. The English overview is regenerated from data/apidefinitions ` +
          `on every docs:gen run; update the hand-written ${code} page to match.`
      );
    }
    console.log(`  overview count guard  : docs/${code}/api/index.md OK (${cards.size} cards match manifest)`);
  }
}

function main() {
  const locale = readLocaleArg(process.argv.slice(2));
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.yml')).sort();
  const collected = new Map();
  for (const file of files) {
    const api = collectApi(file);
    if (api) collected.set(file, api);
  }
  if (locale) {
    generateLocalePages(files, collected, LOCALES[locale]);
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
