#!/usr/bin/env node
// T20 machine reconciliation for the source inventories (phase 3 plan §4-T20
// acceptance). Asserts the extracted data/source-inventory/{steem,hivemind}.json
// against the expected baselines and prints the reconciliation table.
//
// Baseline (plan §1): steem 211 = 204 unconditional + 7 SMT conditional
// (condenser 87 / database 57 / tags 20 / follow 10 / debug_node 9 / market 7 /
// rc 3 / account_history 4 / test_api 2 / jsonrpc 2 / rest 1-2 each);
// hivemind 68 bindings (condenser_api 26 incl 1 dummy / bridge 19 / follow 9 /
// tags 12 incl 1 dummy / hive 1 / call 1).
//
// Exit code 0 = all assertions hold; 1 = any mismatch (printed).

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, '..', '..', 'data', 'source-inventory');

const EXPECT_STEEM = {
  total: 211,
  unconditional: 204,
  conditional: 7,
  families: {
    condenser_api: 87, database_api: 57, tags_api: 20, follow_api: 10,
    debug_node_api: 9, market_history_api: 7, rc_api: 3, account_history_api: 4,
    test_api: 2, jsonrpc: 2, block_api: 2, chain_api: 2, network_broadcast_api: 2,
    account_by_key_api: 1, reputation_api: 1, rewards_api: 1, transaction_status_api: 1,
  },
};

const EXPECT_HIVEMIND = {
  total: 68,
  families: {
    condenser_api: 26, bridge: 19, tags_api: 12, follow_api: 9, hive: 1, call: 1,
  },
};

const failures = [];
const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures.push(`${label}: got ${actual}, expected ${expected}`);
  return { label, actual, expected, ok };
};

const steem = JSON.parse(readFileSync(join(DATA, 'steem.json'), 'utf8'));
const hive = JSON.parse(readFileSync(join(DATA, 'hivemind.json'), 'utf8'));

// ---------- steem ----------
const rows = [];
const allSteem = Object.entries(steem.apis).flatMap(([api, v]) => v.methods.map((m) => ({ api, ...m })));
rows.push(check('steem total', allSteem.length, EXPECT_STEEM.total));
rows.push(check('steem unconditional', allSteem.filter((m) => !m.conditional).length, EXPECT_STEEM.unconditional));
rows.push(check('steem conditional (SMT)', allSteem.filter((m) => m.conditional).length, EXPECT_STEEM.conditional));

const familyCounts = {};
for (const m of allSteem) familyCounts[m.api] = (familyCounts[m.api] ?? 0) + 1;
for (const [api, n] of Object.entries(EXPECT_STEEM.families)) {
  rows.push(check(`steem ${api}`, familyCounts[api] ?? 0, n));
}
const unexpectedApis = Object.keys(familyCounts).filter((a) => !(a in EXPECT_STEEM.families));
if (unexpectedApis.length) failures.push(`unexpected apis in inventory: ${unexpectedApis.join(', ')}`);

// DECLARE_API_IMPL / DEFINE_API_IMPL must not leak into method names.
const implLeaks = allSteem.filter((m) => /(^|_)impl($|_)/.test(m.name));
rows.push(check('DECLARE_API_IMPL/DEFINE_API_IMPL misgrabs', implLeaks.length, 0));

// Duplicates (api, method).
const seen = new Set();
const dupes = [];
for (const m of allSteem) {
  const k = `${m.api}.${m.name}`;
  if (seen.has(k)) dupes.push(k);
  seen.add(k);
}
rows.push(check('duplicate api.method pairs', dupes.length, 0));

// The 7 SMT conditionals: names + all in database_api.
const cond = allSteem.filter((m) => m.conditional);
const expectSmt = ['get_nai_pool', 'list_smt_contributions', 'find_smt_contributions',
  'list_smt_tokens', 'find_smt_tokens', 'list_smt_token_emissions', 'find_smt_token_emissions'];
rows.push(check('SMT conditional set', cond.map((m) => m.name).sort().join(','),
  [...expectSmt].sort().join(',')));
rows.push(check('SMT conditionals all in database_api', cond.every((m) => m.api === 'database_api') ? 1 : 0, 1));

// condenser: all 87 positional (DEFINE_API_ARGS → vector<variant>).
const condenser = steem.apis.condenser_api.methods;
rows.push(check('condenser all positional', condenser.every((m) => m.param_style === 'positional') ? 1 : 0, 1));

// Bare typedefs stay distinct from database_api's void get_version_args
// (same args name, different plugin scopes — not merged, not double-counted).
rows.push(check('condenser get_version positional', steem.apis.condenser_api.methods.find((m) => m.name === 'get_version')?.param_style, 'positional'));
rows.push(check('database get_version void', steem.apis.database_api.methods.find((m) => m.name === 'get_version')?.param_style, 'void'));
rows.push(check('condenser broadcast_transaction_synchronous positional',
  steem.apis.condenser_api.methods.find((m) => m.name === 'broadcast_transaction_synchronous')?.param_style, 'positional'));

// ---------- hivemind ----------
const allHive = Object.entries(hive.namespaces).flatMap(([ns, v]) => v.methods.map((m) => ({ ns, ...m })));
rows.push(check('hivemind bindings', hive.bindings, EXPECT_HIVEMIND.total));
rows.push(check('hivemind method entries', allHive.length, EXPECT_HIVEMIND.total));
const nsCounts = {};
for (const m of allHive) nsCounts[m.ns] = (nsCounts[m.ns] ?? 0) + 1;
for (const [ns, n] of Object.entries(EXPECT_HIVEMIND.families)) {
  rows.push(check(`hivemind ${ns}`, nsCounts[ns] ?? 0, n));
}
const dummies = allHive.filter((m) => m.dummy);
rows.push(check('hivemind dummies', dummies.length, 2));
rows.push(check('dummies are get_account_votes', dummies.every((m) => m.name === 'get_account_votes') ? 1 : 0, 1));
rows.push(check('all types null', allHive.every((m) => m.type === null) ? 1 : 0, 1));

// Spot checks pinned by the plan (§4-T20 抽核).
const ranked = hive.namespaces.bridge.methods.find((m) => m.name === 'get_ranked_posts');
rows.push(check('bridge.get_ranked_posts params', JSON.stringify(ranked?.params?.map((p) => p.name)),
  '["sort","start_author","start_permlink","limit","tag","observer"]'));
rows.push(check('bridge.get_ranked_posts limit default', ranked?.params?.find((p) => p.name === 'limit')?.default, 20));

// ---------- report ----------
console.log('Source inventory reconciliation');
console.log('steem', steem.commit, `(${steem.branch})`, '/', 'hivemind', hive.commit, `(${hive.branch})`);
console.log('');
for (const r of rows) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.label}: ${r.actual}${r.ok ? '' : ` (expected ${r.expected})`}`);
}
console.log('');
console.log(failures.length
  ? `RECONCILIATION FAILED: ${failures.length} mismatch(es)`
  : `RECONCILIATION OK: ${rows.length}/${rows.length} assertions hold (steem ${allSteem.length} = ${allSteem.filter((m) => !m.conditional).length}+${cond.length}, hivemind ${allHive.length})`);
process.exit(failures.length ? 1 : 0);
