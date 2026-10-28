#!/usr/bin/env node
// T23 line-width assertion for the generated Example-section bash blocks.
//
// Every method page's `## Example` block is a wrapped `curl -s <url> \` + header
// + `--data-binary '<pretty JSON>'` command produced by bashCurlCommand() in
// scripts/gen-api-docs.mjs. The wrapping targets <=80 columns; bodies that
// carry unbreakable tokens (hex signatures up to ~160 columns) cannot reach
// that target, and those rows are covered by the CSS fallback
// (.code-card pre { white-space: pre-wrap; word-break: break-all }), so no
// card ever scrolls horizontally at any viewport.
//
// Consequence for this check:
//   * line width > 80  -> WARNING only (printed, counted, exit code unaffected)
//   * line width > 170 -> HARD FAILURE (exit 1): the generator's fold logic
//     should have broken every stored body across lines, so a line this long
//     means a whole body leaked onto one line.
//
// Scans the GENERATED pages (run after `pnpm docs:gen`): docs/api plus every
// locale api tree that has method pages (zh today; ru/fr/de/it/es are
// bridge-only). Bash fences are exactly the T23 example output — ops pages
// use json fences and are not scanned.
//
// Usage: pnpm docs:gen && pnpm check:curl-width

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TARGET = 80;
const HARD_CAP = 170;
const LOCALE_API_DIRS = ['api', 'zh/api'];

/** Recursively yield every .md file under dir (bridge index pages included —
 * they carry no bash fences, so they are filtered out by the fence scan). */
function* walkMd(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walkMd(p);
    else if (entry.isFile() && entry.name.endsWith('.md')) yield p;
  }
}

/** All fenced ```bash block contents as { file, startLine, lines }. */
function bashFences(file) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  const fences = [];
  let inFence = false;
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!inFence && /^```bash\s*$/.test(lines[i])) {
      inFence = true;
      start = i + 1; // first content line (1-based)
    } else if (inFence && /^```\s*$/.test(lines[i])) {
      fences.push({ file, startLine: start, lines: lines.slice(start, i) });
      inFence = false;
    }
  }
  return fences;
}

let fenceCount = 0;
let lineCount = 0;
let maxLine = { width: 0, file: '', line: 0 };
const warnings = [];
const violations = [];

for (const rel of LOCALE_API_DIRS) {
  const dir = join(ROOT, 'docs', rel);
  if (!existsSync(dir)) continue;
  for (const file of walkMd(dir)) {
    for (const fence of bashFences(file)) {
      fenceCount++;
      lineCount += fence.lines.length;
      for (let i = 0; i < fence.lines.length; i++) {
        const width = fence.lines[i].length;
        if (width > maxLine.width) {
          maxLine = { width, file: fence.file, line: fence.startLine + i };
        }
        if (width > TARGET) {
          const record = { file: fence.file, line: fence.startLine + i, width };
          if (width > HARD_CAP) violations.push(record);
          else warnings.push(record);
        }
      }
    }
  }
}

const rel = (p) => p.slice(ROOT.length);
console.log('curl line-width check (generated docs):');
console.log(`  trees scanned       : ${LOCALE_API_DIRS.join(', ')}`);
console.log(`  bash fences         : ${fenceCount}`);
console.log(`  bash lines          : ${lineCount}`);
console.log(`  target width        : <=${TARGET} cols (warnings only — CSS pre-wrap fallback)`);
console.log(`  hard cap            : >${ HARD_CAP} cols fails the build`);
console.log(`  lines over target   : ${warnings.length}`);
console.log(`  widest line         : ${maxLine.width} cols at ${maxLine.file ? rel(maxLine.file) + ':' + maxLine.line : 'n/a'}`);
if (warnings.length > 0) {
  for (const w of warnings) console.log(`    warn  ${rel(w.file)}:${w.line} ${w.width} cols`);
}
if (violations.length > 0) {
  console.error(`FAIL: ${violations.length} bash line(s) exceed the ${HARD_CAP}-col hard cap — the fold logic missed a body:`);
  for (const v of violations) console.error(`    ${rel(v.file)}:${v.line} ${v.width} cols`);
  process.exit(1);
}
console.log('OK: no line exceeds the hard cap');
