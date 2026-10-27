// Shared lenient-YAML helpers for the data/apidefinitions tooling.
//
// Single implementation of the three pieces that used to sit byte-identical
// in validate-data.mjs, gen-api-docs.mjs, scrape-api-defs.mjs and
// test-curl.mjs:
//
//   * METHOD_FIELDS      - documented method-entry fields
//   * walkMethods        - recursive method-entry collection
//   * repairLegacyQuotes - re-indent of legacy column-1 closing quotes
//
// The legacy-quote repair exists because `block_api.yml` and
// `condenser_api.yml` close one multi-line single-quoted scalar with a quote
// at column 1 (psych/YAML 1.1 accepted it, strict YAML 1.2 does not). The
// data files must stay byte-identical on disk, so the repair is always
// applied to in-memory text only.
//
// Deliberately NOT shared here: the concurrency pools (runPool in
// scrape-api-defs.mjs vs the inline pool in test-curl.mjs). Same shape, but
// different worker semantics (index-addressed result collection vs
// log-as-you-go reporting); merging them would couple unrelated behaviors.

/**
 * Fields with defined meaning on a method entry. AUTHORITATIVE SOURCE: the
 * "Method entry" schema table in data/README.md — update that table first,
 * then this set. Array-valued keys outside this set are treated as deeper
 * nesting containers by walkMethods() and recursed into.
 */
export const METHOD_FIELDS = new Set([
  'api_method',
  'purpose',
  'parameter_json',
  'expected_response_json',
  'curl_examples',
  'expected_curl_responses',
  'since',
  'disabled',
  'deprecated',
  'removed',
  'detail',
  'testnet',
  'mainnet',
]);

export const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Re-indent any closing quote of a multi-line single-quoted scalar that sits
 * at column 1 to the previous content line's indentation + 2 (matching the
 * style the rest of the data files use). Pure text transform, no parsing.
 *
 * Returns { text, repaired }: `text` is the (possibly unchanged) input,
 * `repaired` the number of quote lines moved.
 */
export function repairLegacyQuotesCounted(raw) {
  const lines = raw.split('\n');
  let repaired = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^'\r?$/.test(lines[i])) {
      let j = i - 1;
      while (j >= 0 && lines[j].trim() === '') j--;
      const indent = j >= 0 ? (/^[ \t]*/.exec(lines[j])?.[0] ?? '') + '  ' : '  ';
      lines[i] = indent + lines[i];
      repaired++;
    }
  }
  return repaired > 0 ? { text: lines.join('\n'), repaired } : { text: raw, repaired: 0 };
}

/** Same transform, returning only the text (fast-path: no column-1 quote). */
export function repairLegacyQuotes(raw) {
  if (!/^'$/m.test(raw)) return raw;
  return repairLegacyQuotesCounted(raw).text;
}

/**
 * Recursively collect method entries (objects carrying `api_method`) into
 * `out`, per the "Method entry" schema in data/README.md: arrays are
 * traversed; an object without `api_method` is a sub-group only when it
 * carries a nested `methods` array. `ops` entries (broadcast op docs) never
 * carry api_method and are deliberately skipped everywhere.
 */
export function walkMethods(node, out) {
  if (Array.isArray(node)) {
    node.forEach((el) => walkMethods(el, out));
    return;
  }
  if (!isObject(node)) return;
  if (node.api_method === undefined) {
    if (Array.isArray(node.methods)) {
      node.methods.forEach((el) => walkMethods(el, out));
    }
    return; // ops entries (broadcast op docs) never carry api_method: skipped
  }
  out.push(node);
  for (const [key, value] of Object.entries(node)) {
    if (Array.isArray(value) && !METHOD_FIELDS.has(key)) {
      value.forEach((el) => walkMethods(el, out));
    }
  }
}
