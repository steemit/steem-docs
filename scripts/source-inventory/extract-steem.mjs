#!/usr/bin/env node
// T20 source-inventory extractor for the steem C++ repo (phase 3 plan §1/§4-T20).
//
// Scans DECLARE_API blocks and resolves each method's args type to a param
// style, producing data/source-inventory/steem.json.
//
// Extraction rules (see also data/README.md "Source inventory"):
//
// DECLARE_API — 6 accepted forms:
//   1. Banner/doxygen comments inside the block: all comments are stripped
//      first (whitespace-preserving, so token line numbers stay true).
//   2. `#ifdef STEEM_ENABLE_SMT` regions inside the block: methods captured
//      there get `conditional: true` (compile switch, default OFF).
//   3. DECLARE_API lives in a .cpp for jsonrpc (json_rpc_plugin.cpp:152), so
//      the scan set is apis/**/*.{hpp,cpp} plus json_rpc/json_rpc_plugin.cpp.
//   4. test_api's file is `test_api_plugin.hpp` — files are found by content
//      scan, never by a `<name>_api.hpp` template.
//   5. Pure compact sequences `(m1)(m2)…` are the baseline form.
//   6. DECLARE_API_IMPL / DEFINE_API_IMPL never match: the matcher requires a
//      non-word char (whitespace) between DECLARE_API and '('.
//   API namespace: JSON_RPC_REGISTER_API("jsonrpc") string literal when
//   present, else the apis/<dir> directory name.
//
// Params — 5 resolution states for `<method>_args` (jsonrpc macro convention
// `BOOST_PP_CAT(method, _args)`), looked up per-API scope first, then across
// the whole plugins tree (args can live outside apis/, e.g.
// debug_generate_blocks_args in plugins/debug_node):
//   1. `typedef void_type X_args;`                          → void, params []
//   2. `typedef vector< variant > X_args;` (bare typedef)   → positional, params null
//   3. `DEFINE_API_ARGS(name, vector< variant >, ret)`      → positional
//      (macro expands to `typedef arg_type name##_args`; 85/87 condenser)
//   4. struct + FC_REFLECT(NAME, (m1)(m2)…)                 → named, member order
//      (FC_REFLECT_DERIVED base chain is followed)
//   5. typedef alias chain (`typedef Y X_args;`), resolved recursively with a
//      cycle guard; final plain struct → named, final void/positional → same.
//      An alias resolving to a type with no FC_REFLECT inside the plugins tree
//      (e.g. steem::chain::signed_transaction) → named, params null.
//
// Deterministic: same input repo state → byte-identical output (sorted file
// walk, declaration-order methods, sorted api keys, stable JSON).
//
// Usage: node scripts/source-inventory/extract-steem.mjs [--steem-dir <path>]
//        [--out <path>]   (defaults: ~/workspace/steem,
//                         data/source-inventory/steem.json)

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..', '..');

// ---------- CLI ----------
function parseArgs(argv) {
  const out = { steemDir: join(homedir(), 'workspace', 'steem'), out: join(REPO_ROOT, 'data', 'source-inventory', 'steem.json') };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--steem-dir') out.steemDir = resolve(argv[++i]);
    else if (argv[i] === '--out') out.out = resolve(argv[++i]);
    else {
      console.error(`Unknown argument: ${argv[i]}`);
      process.exit(2);
    }
  }
  return out;
}

// ---------- comment stripping (offset/line preserving) ----------
function stripComments(src) {
  let res = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') {
      while (i < n && src[i] !== '\n') { res += ' '; i++; }
    } else if (c === '/' && src[i + 1] === '*') {
      res += '  '; i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
        res += src[i] === '\n' ? '\n' : ' '; i++;
      }
      if (i < n) { res += '  '; i += 2; }
    } else if (c === '"' || c === "'") {
      const q = c;
      res += c; i++;
      while (i < n && src[i] !== q) {
        if (src[i] === '\\' && i + 1 < n) { res += src[i] + src[i + 1]; i += 2; continue; }
        res += src[i]; i++;
      }
      if (i < n) { res += q; i++; }
    } else {
      res += c; i++;
    }
  }
  return res;
}

function lineOf(text, offset) {
  let line = 1;
  for (let i = 0; i < offset; i++) if (text[i] === '\n') line++;
  return line;
}

// ---------- file walking ----------
function walk(dir, exts, acc = []) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, exts, acc);
    else if (exts.some((e) => name.endsWith(e))) acc.push(p);
  }
  return acc;
}

// ---------- DECLARE_API block extraction ----------
function extractMethods(text, relPath) {
  const methods = [];
  const re = /DECLARE_API\s*\(/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    // Word-char immediately before DECLARE_API (e.g. XDECLARE_API) — not ours.
    if (m.index > 0 && /[A-Za-z0-9_]/.test(text[m.index - 1])) continue;
    const open = text.indexOf('(', m.index);
    let depth = 1;
    let end = open + 1;
    while (end < text.length && depth > 0) {
      const ch = text[end];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      end++;
    }
    if (depth !== 0) throw new Error(`Unbalanced DECLARE_API block in ${relPath}@${lineOf(text, m.index)}`);
    const block = text.slice(open + 1, end - 1);

    // Conditional intervals: regions guarded by STEEM_ENABLE_SMT (rule 2).
    // Single linear scan of the block, tracking absolute block offsets so
    // interval bounds are exact even with repeated directive lines.
    const intervals = [];
    const stack = [];
    let pos = 0;
    for (const line of block.split('\n')) {
      const lineLen = line.length + 1; // +1 for the stripped '\n'
      const d = line.match(/^\s*#\s*(ifdef|if|else|endif)\b\s*(.*)$/);
      if (d) {
        if (d[1] === 'ifdef' || d[1] === 'if') {
          const smt = d[2].trim() === 'STEEM_ENABLE_SMT';
          const on = d[1] === 'ifdef';
          stack.push({ smt, on, start: smt && on ? pos + lineLen : null });
        } else if (d[1] === 'else') {
          const top = stack[stack.length - 1];
          if (top) {
            top.on = !top.on;
            if (top.smt) {
              if (top.on) top.start = pos + lineLen;
              else if (top.start !== null) { intervals.push({ start: top.start, end: pos }); top.start = null; }
            }
          }
        } else if (d[1] === 'endif') {
          const top = stack.pop();
          if (top && top.smt && top.start !== null) { intervals.push({ start: top.start, end: pos }); }
        }
      }
      pos += lineLen;
    }
    const isConditional = (offset) => intervals.some((iv) => offset >= iv.start && offset < iv.end);

    const tokenRe = /\(\s*([a-zA-Z0-9_]+)\s*\)/g;
    let t;
    while ((t = tokenRe.exec(block)) !== null) {
      const absOffset = open + 1 + t.index;
      methods.push({
        name: t[1],
        conditional: isConditional(t.index),
        source: `${relPath}:${lineOf(text, absOffset)}`,
      });
    }
    re.lastIndex = end;
  }
  return methods;
}

// ---------- args index (typedefs, DEFINE_API_ARGS, FC_REFLECT) ----------
function normalizeType(t) {
  return t.replace(/\s+/g, '');
}

function collectArgsIndex(files, repoDir) {
  // name -> { byScope: Map(scope, entry), others: Map(fileKey, entry) }
  // scope = apis/<dir> plugin directory; entries carry it so alias chains
  // resolve in their own namespace first (get_version_args exists in BOTH
  // condenser (positional) and database (void) scopes).
  const index = new Map();
  const put = (name, entry, scope) => {
    entry.scope = scope;
    if (!index.has(name)) index.set(name, { byScope: new Map(), others: new Map() });
    const slot = index.get(name);
    if (scope && !slot.byScope.has(scope)) slot.byScope.set(scope, entry);
    else if (!scope) slot.others.set(entry.file, entry);
  };

  for (const file of files) {
    const rel = relative(repoDir, file).split(sep).join('/');
    const scopeMatch = rel.match(/libraries\/plugins\/apis\/([^/]+)\//);
    const scope = scopeMatch ? scopeMatch[1] : null;
    const src = stripComments(readFileSync(file, 'utf8'));

    // typedef void_type X; / typedef vector< variant > X; / alias typedefs
    const tdRe = /typedef\s+([^;]+?)\s+([A-Za-z0-9_]+)\s*;/g;
    let t;
    while ((t = tdRe.exec(src)) !== null) {
      const [, typeText, name] = t;
      if (name.includes('##') || typeText.includes('##')) continue; // macro bodies
      if (name.endsWith('_return')) continue;
      const norm = normalizeType(typeText);
      let entry;
      if (norm === 'void_type') entry = { style: 'void', file: rel };
      else if (norm === 'vector<variant>') entry = { style: 'positional', file: rel };
      else {
        // Alias; keep a namespace hint when the target is qualified
        // (reputation::get_account_reputations_args → apis/reputation_api).
        const q = typeText.trim().match(/^(.*)::([A-Za-z0-9_]+)\s*$/);
        entry = {
          style: 'alias',
          target: (q ? q[2] : typeText.trim().split(/[\s:<>]+/).filter(Boolean).pop()),
          targetNs: q ? q[1].split('::').pop() : null,
          file: rel,
        };
      }
      put(name, entry, scope);
    }

    // DEFINE_API_ARGS( name, arg_type, return_type )  →  typedef arg_type name##_args
    const daRe = /DEFINE_API_ARGS\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([^,]+?)\s*,/g;
    while ((t = daRe.exec(src)) !== null) {
      const norm = normalizeType(t[2]);
      const style = norm === 'vector<variant>' ? 'positional' : norm === 'void_type' ? 'void' : 'named';
      put(`${t[1]}_args`, { style, file: rel }, scope);
    }

    // FC_REFLECT / FC_REFLECT_DERIVED member order
    const frRe = /FC_REFLECT(_DERIVED)?\s*\(/g;
    while ((t = frRe.exec(src)) !== null) {
      const open = src.indexOf('(', t.index);
      let depth = 1;
      let end = open + 1;
      while (end < src.length && depth > 0) {
        const ch = src[end];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        end++;
      }
      const inside = src.slice(open + 1, end - 1);
      const typeName = inside.split(',')[0].trim().split(/[\s:<>]+/).filter(Boolean).pop();
      if (typeName.endsWith('_return')) { continue; }
      const memberRe = /\(\s*([a-zA-Z0-9_]+)\s*\)/g;
      const members = [];
      let mm;
      while ((mm = memberRe.exec(inside)) !== null) members.push(mm[1]);
      put(typeName, { style: 'named', params: members, file: rel }, scope);
    }
  }
  return index;
}

// Candidate entries for a name, deterministic order: preferred scopes (own
// API first, then alias-target namespace), then unscoped files
// (e.g. plugins/debug_node), then remaining scopes alphabetically.
function* candidates(index, name, scopes) {
  const slot = index.get(name);
  if (!slot) return;
  const tried = new Set();
  for (const scope of scopes) {
    if (scope && slot.byScope.has(scope)) { tried.add(scope); yield slot.byScope.get(scope); }
  }
  for (const file of [...slot.others.keys()].sort()) yield slot.others.get(file);
  for (const s of [...slot.byScope.keys()].sort()) if (!tried.has(s)) yield slot.byScope.get(s);
}

function resolveArgs(index, argsName, scope, depth = 0, visited = new Set()) {
  if (depth > 8) return { style: 'named', params: null };
  const scopes = [scope];
  for (const entry of candidates(index, argsName, scopes)) {
    if (visited.has(entry)) continue;
    if (entry.style !== 'alias' || !entry.target) return entry;
    visited.add(entry);
    // Alias chains resolve in the target's namespace: an explicit qualifier
    // (reputation::x → apis/reputation_api) wins, else the alias's own.
    const ns = entry.targetNs
      ? [`${entry.targetNs}_api`, entry.targetNs]
      : [entry.scope];
    const r = resolveArgs(index, entry.target, ns.find(Boolean), depth + 1, visited);
    if (r) return r;
    return { style: 'named', params: null }; // alias to a type outside the plugins tree
  }
  return null;
}

// ---------- main ----------
const opts = parseArgs(process.argv.slice(2));
const repoDir = opts.steemDir;
if (!existsSync(join(repoDir, 'libraries', 'plugins'))) {
  console.error(`steem repo not found at ${repoDir} (expected libraries/plugins)`);
  process.exit(1);
}

const commit = execFileSync('git', ['-C', repoDir, 'rev-parse', '--short=7', 'HEAD'], { encoding: 'utf8' }).trim();
const branch = execFileSync('git', ['-C', repoDir, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim();

// Scan set: apis/**/*.{hpp,cpp} + json_rpc/json_rpc_plugin.cpp (rules 3+4).
const apisDir = join(repoDir, 'libraries', 'plugins', 'apis');
const scanFiles = [
  ...walk(apisDir, ['.hpp', '.cpp']),
  join(repoDir, 'libraries', 'plugins', 'json_rpc', 'json_rpc_plugin.cpp'),
].filter((f) => existsSync(f)).sort();

// Args index: whole plugins tree (cross-directory fallback).
const argsFiles = walk(join(repoDir, 'libraries', 'plugins'), ['.hpp', '.cpp']).sort();
const index = collectArgsIndex(argsFiles, repoDir);

const apis = {};
for (const file of scanFiles) {
  const rel = relative(repoDir, file).split(sep).join('/');
  const text = stripComments(readFileSync(file, 'utf8'));
  const methods = extractMethods(text, rel);
  if (!methods.length) continue;
  // API namespace: JSON_RPC_REGISTER_API("x") literal, else apis/<dir>.
  let apiName = (rel.match(/libraries\/plugins\/apis\/([^/]+)\//) || [])[1];
  const reg = text.match(/JSON_RPC_REGISTER_API\s*\(\s*"([^"]+)"\s*\)/);
  if (reg) apiName = reg[1];
  if (!apiName) throw new Error(`Cannot derive API name for ${rel}`);
  const scope = apiName.endsWith('_api') ? apiName : null; // jsonrpc registers as "jsonrpc"; args stay scoped by apis/ dir when identical
  const dirScope = (rel.match(/libraries\/plugins\/apis\/([^/]+)\//) || [])[1] ?? null;
  const list = apis[apiName] ?? (apis[apiName] = { methods: [] });
  for (const m of methods) {
    const argsName = `${m.name}_args`;
    const r = resolveArgs(index, argsName, dirScope);
    if (!r) {
      console.error(`WARN: no args definition found for ${apiName}.${m.name} (${argsName})`);
    }
    const style = r?.style ?? 'named';
    const params = style === 'positional' ? null : style === 'void' ? [] : r?.params ?? null;
    list.methods.push({
      name: m.name,
      conditional: m.conditional,
      param_style: style,
      params,
      source: m.source,
    });
  }
}

const out = { repo: 'steem', commit, branch, apis };
mkdirSync(dirname(opts.out), { recursive: true });
writeFileSync(opts.out, JSON.stringify(out, null, 2) + '\n');

const total = Object.values(apis).reduce((n, a) => n + a.methods.length, 0);
const cond = Object.values(apis).flatMap((a) => a.methods).filter((x) => x.conditional).length;
console.log(`steem inventory: ${total} methods (${total - cond} unconditional, ${cond} conditional) across ${Object.keys(apis).length} apis -> ${relative(REPO_ROOT, opts.out)}`);
