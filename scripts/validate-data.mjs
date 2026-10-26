#!/usr/bin/env node
// Schema validation for data/apidefinitions/*.yml
//
// The YAML files are a verbatim port of steemit/devportal `_data/apidefinitions`
// and are treated as read-only data: this validator NEVER rewrites them. It
// parses each file with the `yaml` package (duplicate keys tolerated at parse
// time, then detected by walking the AST) and enforces the schema documented in
// data/README.md.
//
// Exit code: 0 when no errors (warnings allowed), 1 otherwise.

import { parseDocument, YAMLMap, YAMLSeq } from 'yaml';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import process from 'node:process';

const DATA_DIR = fileURLToPath(new URL('../data/apidefinitions/', import.meta.url));

// Fields with well-defined meaning on a method entry. Array-valued keys outside
// this set are treated as deeper nesting containers and recursed into.
const METHOD_FIELDS = new Set([
  'api_method',
  'purpose',
  'parameter_json',
  'expected_response_json',
  'curl_examples',
  'expected_curl_responses',
  'since',
  'disabled',
  'deprecated',
  'testnet',
  'mainnet',
]);

const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
// "Missing" = absent, null or empty string. An empty array is *not* missing:
// `expected_response_json: []` is a real example value (35 condenser methods
// use it). List fields additionally treat an empty array as missing.
const isMissing = (v) => v === undefined || v === null || v === '';
const isMissingList = (v) => isMissing(v) || (Array.isArray(v) && v.length === 0);

const errors = [];
const warnings = []; // { category, message }

// Aggregates
let totalGroups = 0;
let totalMethods = 0;
const methodsPerFile = {};
const opsPerFile = {};
const missingPurpose = [];
const missingResponse = [];
const missingCurl = [];
const shortsAcrossApis = new Map(); // short -> Set(files)
const filesWithOps = new Set();

function warn(category, message) {
  warnings.push({ category, message });
}

function error(message) {
  errors.push(message);
}

/** Detect duplicate mapping keys by walking the yaml AST. */
function collectDuplicateKeys(node, path, file, methodCtx) {
  if (node instanceof YAMLMap) {
    // If this mapping is a method entry, remember its api_method + display
    // path so duplicate-key warnings inside it can name the offending method.
    let ctx = methodCtx;
    for (const pair of node.items) {
      const key = String(pair.key?.value ?? pair.key);
      if (key === 'api_method' && pair.value?.value != null) {
        ctx = { apiMethod: String(pair.value.value), displayPath: stripGroupPrefix(path) };
      }
    }
    const seen = new Set();
    for (const pair of node.items) {
      const key = String(pair.key?.value ?? pair.key);
      if (seen.has(key)) {
        if (ctx) {
          warn('duplicate-key', `${file}: ${ctx.displayPath} (${ctx.apiMethod}) has duplicate key "${key}"`);
        } else {
          warn('duplicate-key', `${file}:${path || '<root>'} has duplicate key "${key}" (last value silently wins for consumers)`);
        }
      }
      seen.add(key);
      collectDuplicateKeys(pair.value, path ? `${path}.${key}` : key, file, ctx);
    }
  } else if (node instanceof YAMLSeq) {
    node.items.forEach((item, i) => collectDuplicateKeys(item, `${path}[${i}]`, file, methodCtx));
  }
}

/** `[0].methods[8]` -> `methods[8]` (drop the top-level group index). */
function stripGroupPrefix(path) {
  return path.replace(/^\[\d+\]\./, '');
}

/**
 * Recursively walk method entries. Handles arbitrarily deep nesting (objects
 * without `api_method` but with nested `methods` arrays are treated as
 * sub-groups; any other shape without `api_method` is an error).
 *
 * `shorts` is the per-file method_short registry: one Map per file, shared
 * across all groups in that file (duplicates within a file are errors).
 */
function walkMethodEntry(node, path, file, shorts) {
  if (!isObject(node)) {
    error(`${path}: method entry must be a mapping, got ${node === null ? 'null' : typeof node}`);
    return;
  }
  if (node.api_method === undefined) {
    if (Array.isArray(node.methods)) {
      // Sub-group with nested methods (legacy nesting); recurse.
      node.methods.forEach((el, i) => walkMethodEntry(el, `${path}.methods[${i}]`, file, shorts));
      return;
    }
    error(`${path}: method entry is missing required field "api_method"`);
    return;
  }

  const apiMethod = String(node.api_method);
  const dot = apiMethod.indexOf('.');
  const short = dot === -1 ? apiMethod : apiMethod.slice(dot + 1);

  if (shorts.has(short)) {
    error(
      `${file}: duplicate method_short "${short}" within API (${shorts.get(short)} and ${apiMethod})`
    );
  } else {
    shorts.set(short, apiMethod);
  }
  const filesWithShort = shortsAcrossApis.get(short) ?? new Set();
  filesWithShort.add(file);
  shortsAcrossApis.set(short, filesWithShort);
  totalMethods++;
  methodsPerFile[file] = (methodsPerFile[file] ?? 0) + 1;

  if (isMissing(node.purpose)) missingPurpose.push(apiMethod);
  if (isMissing(node.expected_response_json)) missingResponse.push(apiMethod);
  if (isMissingList(node.curl_examples)) missingCurl.push(apiMethod);

  // Tolerate deeper nesting: recurse into array-valued keys that are not part
  // of the documented method schema (known list fields hold scalars).
  for (const [key, value] of Object.entries(node)) {
    if (Array.isArray(value) && !METHOD_FIELDS.has(key)) {
      value.forEach((el, i) => walkMethodEntry(el, `${path}.${key}[${i}]`, file, shorts));
    }
  }
}

const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.yml')).sort();

for (const file of files) {
  const raw = readFileSync(join(DATA_DIR, file), 'utf8');

  // One method_short registry per file, shared across all of the file's
  // groups: a duplicate short anywhere in the file is an error.
  const fileShorts = new Map();
  let doc = parseDocument(raw, { uniqueKeys: false });

  // Legacy quirk: the 2019-era Ruby scraper emitted the closing quote of some
  // multi-line single-quoted scalars at column 1, which psych (YAML 1.1)
  // accepted but strict YAML 1.2 parsers reject. The data files must stay
  // byte-identical, so repair in memory only: re-indent the lone closing quote
  // line to the previous content line's indentation + 2.
  if (doc.errors.length > 0) {
    const lines = raw.split('\n');
    let repairedLines = 0;
    for (let i = 0; i < lines.length; i++) {
      if (/^'\r?$/.test(lines[i])) {
        let j = i - 1;
        while (j >= 0 && lines[j].trim() === '') j--;
        const indent = j >= 0 ? (/^[ \t]*/.exec(lines[j])?.[0] ?? '') + '  ' : '  ';
        lines[i] = indent + lines[i];
        repairedLines++;
      }
    }
    if (repairedLines > 0) {
      doc = parseDocument(lines.join('\n'), { uniqueKeys: false });
      warn(
        'lenient-parse',
        `${file}: applied in-memory re-indent to ${repairedLines} legacy unindented closing quote line(s); source file untouched`
      );
    }
  }

  if (doc.errors.length > 0) {
    for (const e of doc.errors) {
      const line = e.linePos?.[0]?.line ?? '?';
      error(`${file}: YAML parse error at line ${line}: ${String(e.message).split('\n')[0]}`);
    }
    continue;
  }

  collectDuplicateKeys(doc.contents, '', file);

  const data = doc.toJS();
  if (!Array.isArray(data)) {
    error(`${file}: top level must be an array, got ${data === null ? 'null' : typeof data}`);
    continue;
  }

  data.forEach((group, gi) => {
    totalGroups++;
    const groupPath = `${file}:groups[${gi}]`;
    if (!isObject(group)) {
      error(`${groupPath}: group must be a mapping`);
      return;
    }
    if (isMissing(group.name)) {
      error(`${groupPath}: group is missing required field "name"`);
    }
    if (isMissing(group.description)) {
      error(`${groupPath}: group is missing required field "description"`);
    }

    if (group.methods !== undefined && !Array.isArray(group.methods)) {
      error(`${groupPath}: "methods" must be an array when present`);
    } else if (Array.isArray(group.methods)) {
      group.methods.forEach((el, mi) =>
        walkMethodEntry(el, `${groupPath}.methods[${mi}]`, file, fileShorts)
      );
    }

    if (group.ops !== undefined) {
      if (!Array.isArray(group.ops)) {
        error(`${groupPath}: "ops" must be an array when present`);
      } else {
        filesWithOps.add(file);
        opsPerFile[file] = (opsPerFile[file] ?? 0) + group.ops.length;
        group.ops.forEach((op, oi) => {
          if (!isObject(op)) {
            error(`${groupPath}:ops[${oi}]: op must be a mapping`);
          } else if (isMissing(op.name)) {
            error(`${groupPath}:ops[${oi}]: op is missing required field "name"`);
          }
        });
      }
    }
  });
}

const totalOps = Object.values(opsPerFile).reduce((a, b) => a + b, 0);
const crossApiDuplicates = [...shortsAcrossApis.entries()].filter(([, files]) => files.size > 1);

// ---- Report ---------------------------------------------------------------

console.log('Validating data/apidefinitions/*.yml\n');

if (warnings.length > 0) {
  const byCategory = new Map();
  for (const w of warnings) {
    if (!byCategory.has(w.category)) byCategory.set(w.category, []);
    byCategory.get(w.category).push(w.message);
  }
  for (const [category, messages] of byCategory) {
    console.log(`Warnings — ${category} (${messages.length}):`);
    for (const m of messages) console.log(`  - ${m}`);
    console.log();
  }
}

if (errors.length > 0) {
  console.log(`Errors (${errors.length}):`);
  for (const e of errors) console.log(`  - ${e}`);
  console.log();
}

console.log('Summary');
const warningsTotal =
  warnings.length + missingPurpose.length + missingResponse.length + missingCurl.length;
console.log('  files                              : ' + files.length);
console.log('  groups                             : ' + totalGroups);
console.log('  methods                            : ' + totalMethods);
console.log('  methods per file                   :');
const fileCol = Math.max(...files.map((f) => f.length));
for (const f of files) {
  const m = methodsPerFile[f] ?? 0;
  const o = opsPerFile[f];
  console.log(`    ${f.padEnd(fileCol)} : ${m} methods${o !== undefined ? `, ${o} ops` : ''}`);
}
console.log(
  '  ops                                : ' +
    totalOps +
    (filesWithOps.size
      ? ' (' + [...filesWithOps].map((f) => `${f}: ${opsPerFile[f]}`).join(', ') + ')'
      : '')
);
console.log('  warnings                           : ' + warningsTotal);
console.log(
  '    - lenient-parse repairs          : ' +
    warnings.filter((w) => w.category === 'lenient-parse').length
);
console.log(
  '    - duplicate YAML keys            : ' +
    warnings.filter((w) => w.category === 'duplicate-key').length
);
console.log('    - missing purpose                : ' + missingPurpose.length);
if (missingPurpose.length) console.log('        ' + missingPurpose.join(', '));
console.log('    - missing expected_response_json : ' + missingResponse.length);
if (missingResponse.length) console.log('        ' + missingResponse.join(', '));
console.log('    - missing curl_examples          : ' + missingCurl.length);
if (missingCurl.length) console.log('        ' + missingCurl.join(', '));
console.log(
  '  cross-API duplicate method_short   : ' +
    crossApiDuplicates.length +
    ' (informational — duplicates across APIs are expected, only within-API duplicates are errors)'
);

if (errors.length > 0) {
  console.log(`\nFAILED: ${errors.length} error(s), ${warningsTotal} warning(s)`);
  process.exit(1);
}
console.log(`\nOK: schema valid, ${warningsTotal} warning(s)`);
