# steem-docs

Steem developer documentation, rebuilt with [VitePress](https://vitepress.dev).

**Phase 1** will deliver the API Definitions: a complete, individually
addressable reference for every `condenser_api` and appbase JSON-RPC method.

## Commands

| Command                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `pnpm i`               | Install dependencies                                     |
| `pnpm dev`             | Generate docs data, then start the dev server            |
| `pnpm build`           | Generate docs data, then build the production site       |
| `pnpm preview`         | Preview the production build locally                     |
| `pnpm validate:data`   | Validate the YAML API definitions                        |
| `pnpm scrape:api-defs` | Compare the YAML API definitions against a live node     |
| `pnpm test:curl`       | Live-test documented methods against a node              |
| `pnpm audit:drift`     | Dual-node drift audit; writes a snapshot into data/audit |
| `pnpm audit:coverage`  | Coverage sweep + dead-set regression; report-only unless `--write` |
| `pnpm audit:source-crosscheck` | Source × docs × node disposition matrix; report-only unless `--write` |
| `pnpm check:curl-width` | Line-width assertion for the generated Example bash blocks (run after `pnpm docs:gen`) |

## Data pipeline

YAML files are the single source of truth for all API definitions; markdown
pages are generated from them at build time, keeping the rendered docs in
sync with the underlying data. Three tools operate on that pipeline — none of
them ever touches the `ops` entries: broadcast op documentation has no
JSON-RPC identity on a node (ops are not callable methods), so both scraping
and live-testing are methods-only by design.

### `pnpm validate:data`

Schema-validates `data/apidefinitions/*.yml`. Read-only; exit 0 when no
errors (warnings are informational and known).

### `pnpm scrape:api-defs` — sync check against a live node

Fetches `jsonrpc.get_methods` and per-method `jsonrpc.get_signature` from a
node (default `https://api.steem.fans`, override with `--node <url>`) and
compares them against the YAML data, grouped by API:

- **NEW** — the method exists on the node but not in the YAML data;
- **MISSING** — the method exists in the YAML data but not on the node;
- **SIGDIFF** — both exist but the node's `args` differ from the documented
  `parameter_json`.

```sh
pnpm scrape:api-defs                          # report only, all APIs
pnpm scrape:api-defs -- --api database_api    # one API namespace
pnpm scrape:api-defs -- --node https://api.steemit.com
```

**Report-only vs `--write`:** without `--write` nothing on disk changes —
the diff summary is the whole output (exit 0 whenever the comparison
completed — drift is informational; exit 1 on usage errors, network
failures, or YAML parse failures). With `--write`, NEW methods are merged
into the *existing* YAML file for their API (appended to the matching group's
`methods`, keeping all existing fields and order untouched). The write is
two-phase and atomic: every merged file is first validated in memory (strict
YAML parse plus a method-count pre-check — the count must not shrink and
every NEW method must land), and only when ALL files pass are they written,
each via a `.tmp` file + atomic rename. Any pre-check failure aborts the
whole run with exit 1 and leaves every file untouched. Two limits
are deliberate:

- A node namespace with **no** YAML file yet is only *reported* — new data
  files are never created automatically.
- The 2019-era data closes two multi-line scalars (`block_api.yml`,
  `condenser_api.yml`) with a quote at column 1, which strict YAML 1.2
  rejects. Before any write the repair used by the validator is applied
  in-memory, so a `--write` run re-emits those lines correctly indented
  instead of corrupting the files.

### `pnpm test:curl` — live-call every documented method

Walks every method that documents `curl_examples` or `parameter_json` and
POSTs `{"jsonrpc":"2.0","method":…,"params":…,"id":1}` to the node, with at
most 4 concurrent requests and a 15s timeout each. Outcomes are classified
into six levels and summarized:

- **OK** — HTTP 200 and the response carried a `result`: the method executed;
- **OK_PARAM_INVALID** — HTTP 200 but a jsonrpc `-32602` (Invalid parameters):
  the method exists and was dispatched, the documented params were rejected
  at the parameter level (stale sample values);
- **RPC_FAIL** — any other JSON-RPC error object (protocol errors like
  -32601/-32700 and server errors like -32000/-32002): no `result`;
- **HTTP_FAIL** — non-200 status or a non-JSON body;
- **NETWORK_FAIL** — DNS/refused; reported, never thrown;
- **TIMEOUT** — no completion within the 15s budget.

```sh
TEST_NODE=https://api.steem.fans pnpm test:curl
TEST_NODE=https://api.steem.fans pnpm test:curl -- --api condenser_api --limit 5
TEST_NODE=https://api.steem.fans pnpm test:curl -- --report /tmp/curl-report.json
```

`--report <file.json>` additionally writes a machine-readable report — one
`{ api_method, classification, httpStatus, rpcErrorCode, responseBytes, node }`
record per method plus run metadata — without changing the text report on
stdout.

`TEST_NODE` selects the endpoint (default `https://api.steem.fans`); `--node`
overrides it for one run. Once the report completes, the command exits 0 — the
summary table and failure list are the artifact, not a pass/fail gate: the
YAML snapshot dates to 2020 and drift against today's nodes is expected, not
an error. Exit code 1 means usage errors or unrecoverable YAML parse
failures; an unknown `--api` stem only prints a warning. (`TEST_NODE` applies
to this tool only — `scrape:api-defs` deliberately ignores it; use `--node`
there, which overrides its built-in default.)

### `pnpm audit:drift` — dual-node drift audit baseline

Probes every documented method against two nodes (default
`api.steem.fans` + `api.steemit.com`) and synthesizes three sources per
method — `jsonrpc.get_methods` catalog membership, `jsonrpc.get_signature`
availability, and a live curl with the documented `parameter_json` — into an
evidence-backed verdict. The verdict deliberately does **not** depend on
`get_methods` completeness: the catalog is known to lag (whole namespaces
whose methods still work are absent from it). Verdict rules (a single-node
anomaly never kills a method):

- **alive** — dispatched on both nodes (result, `-32602` param rejection, or
  any non-"not found" server error) without contract drift;
- **dead** — a structured not-found on both nodes (`-32601`, or `-32002`
  "Could not find API/method");
- **changed** — dispatched on both, cataloged, but the node's signature args
  differ from the documented `parameter_json`;
- **node-dependent** — divergent or undetermined outcomes.

Writes `data/audit/drift-<YYYY-MM-DD>.json` (one record per method:
`api_method`, `api`, `scrapeInNode`, `sigOk`, `consistency`, per-node
`curl` outcomes with `classification`/`httpStatus`/`rpcErrorCode`/
`responseBytes`, `verdict`, `evidence[]`) plus a human-readable
`drift-<YYYY-MM-DD>.md` summary. The committed snapshot is the disposal
baseline for content fixes; re-running overwrites the file for that date.

```sh
pnpm audit:drift                                  # full audit, both defaults
pnpm audit:drift -- --api database_api            # one namespace
pnpm audit:drift -- --node1 https://api.steem.fans --node2 https://api.steemit.com
```

Exit code 0 once the snapshot is written; 1 on usage errors, YAML parse
failures, or when the first node's `get_methods` cannot be fetched.

### `pnpm audit:coverage` — three-source coverage sweep & dead-set regression

Where `audit:drift` governs the life/death (and contract drift) of methods
the docs already cover, `audit:coverage` governs the other direction: it
answers "does a node serve anything the docs do not cover?" and re-confirms
that the documented dead set is exactly the YAML-flagged dead set after each
disposal round. Candidate method names are synthesized from three sources —
the `get_methods` catalog from both nodes (one source only; the catalog is
known to lag), a `get_signature` probe of every candidate on both nodes, and
the YAML manifest (every documented `api_method`). Residual blind spot: a
method the nodes serve but neither catalog lists nor the docs mention stays
undiscoverable — blind variant enumeration is deliberately out of scope.
A catalog-only name enters the gaps list only after a
live curl dispatches it on **both** nodes (false-positive protection);
single-node or not-found outcomes are reported as divergent/phantom instead.
The dead regression is structural, not a count comparison: every freshly-dead
documented method must carry at least one YAML death flag
(`removed`/`disabled`/`deprecated`), no `removed`-flagged method may be
alive, and the fresh dead set is diffed against the latest committed
`data/audit/drift-*.json` baseline.

**Report-only by default:** without `--write` nothing is written — the
summary is printed to stdout and `data/audit/` is untouched. `--write`
persists `coverage-<YYYY-MM-DD>.json` (per-source detail, gaps list with
curl evidence, dead-regression alignment matrix, one record per candidate)
plus a human-readable `coverage-<YYYY-MM-DD>.md`.

```sh
pnpm audit:coverage                               # report-only, both defaults
pnpm audit:coverage -- --node1 https://api.steem.fans --node2 https://api.steemit.com
pnpm audit:coverage -- --write                    # persist into data/audit/
```

Exit code 0 once the sweep completed (findings are data, not failures — read
the gaps/deadRegression sections); 1 on usage errors or YAML parse failures.

### `pnpm audit:source-crosscheck` — source × docs × node disposition matrix

The phase-3 crosscheck that fuses the two source inventories
(`data/source-inventory/steem.json`, 211 methods, and
`data/source-inventory/hivemind.json`, 68 bindings), the YAML manifest (238
documented methods), and the latest committed `data/audit/drift-*.json`
snapshot into one per-method disposition matrix. Every name in the universe
(sources ∪ docs — 241 names today) lands in exactly one cell of the
src± × doc± × node-alive/dead grid, and each cell maps to exactly one
disposal action (`all-good`, `annotation-refresh`, `add-page`,
`add-page+dead-note`, `keep-annotation`, `removed-keep`); the
combo→disposition table embedded in the report is the review artifact.
Documented methods take their node status from the drift snapshot;
source-only names (invisible to the snapshot by construction) are
existence-probed live on the same dual nodes, so the two evidence lanes stay
comparable. Exclusions (plan decision 2: `test_api.*`, `jsonrpc.*`, plus the
inventory-level `ingest` and community.py notes) are reported in a dedicated
section and never enter the matrix body. Double-source methods carry a
param-style comparison column; enumerable signature mismatches between the
steem and hivemind sides are flagged (10 of 42 today). Death-annotation
families after the T25 refresh (source-truth口径): `disabled` 25 — every
dead-but-source-defined page says "defined in source; plugin not enabled on
public nodes" (decision 3-②) —, `removed-keep` 3 (absent from both source
inventories), and `removed-unsupported` 0 (a removed flag on a source-defined
method is a regression the census asserts against).

Report-only by default; `--write` persists `source-crosscheck-<YYYY-MM-DD>.json`
(meta, combo census, full matrix rows, disposal lists) plus a human-readable
`.md` into `data/audit/`. Exit 0 once the crosscheck completes (findings are
data, not failures — read the disposal lists); 1 on usage errors, YAML parse
failures, input-contract violations (inventory counts vs the plan baselines),
or failed assertions (universe accounting, the witness_api double-check, the
decision-3 death-annotation family census).

```sh
pnpm audit:source-crosscheck                               # report-only
pnpm audit:source-crosscheck -- --write                    # persist into data/audit/
pnpm audit:source-crosscheck -- --drift data/audit/drift-2026-10-28.json --node1 https://api.steem.fans --node2 https://api.steemit.com
```

### `pnpm check:curl-width` — Example block line-width assertion

Every method page's `## Example` block renders `curl_examples` as a complete
wrapped `curl` command against `https://api.steemit.com` (bash fence, 2-space
indented JSON body, backslash continuations, target line width ≤80 columns).
A few stored bodies carry unbreakable tokens (hex transaction signatures up
to ~160 columns) that no fold logic can split, so the site CSS
(`.code-card pre { white-space: pre-wrap; word-break: break-all }`) wraps
long lines in place — no card ever scrolls horizontally regardless of this
check. The script scans the generated `docs/api` and `docs/zh/api` trees
after `pnpm docs:gen` and reports every bash line over the 80-column target
as a warning (exit code unaffected); anything over the 170-column hard cap
means a whole body leaked onto one line and fails the build with exit 1.

```sh
pnpm docs:gen && pnpm check:curl-width
```

## Internationalization (i18n)

The site ships English-only. The multi-language layout is scaffolded in
`docs/.vitepress/config.mts` (a commented template above `defineConfig`) but
no second locale is registered — an empty locale would render a language
switcher pointing at pages that don't exist.

### Directory convention

The root locale stays at `docs/`; every additional language gets its own
mirrored subtree:

```
docs/             # en — root locale (existing content)
docs/zh/          # zh — index.md, api/… mirror the root structure
```

### Adding a language (e.g. `zh`)

1. Create the content tree `docs/zh/`, mirroring `docs/`.
2. Register the locale in `docs/.vitepress/config.mts`, following the
   commented template above `defineConfig` — it shows the `locales` block
   (root + `zh`), how `themeConfig` deep-merges over the root's, and how the
   sidebar reuses `apiSidebar()` for the generated API pages.
3. `pnpm build`, then confirm the language switcher appears and every
   translated page has nav + sidebar. Never stage a half-registered locale.

### Translation scope

Translate in two passes:

1. **Theme chrome first** — nav labels, sidebar group titles, search
   placeholders: everything in the locale's `themeConfig`.
2. **Content second** — hand-written pages top-down. Pages under `docs/api/`
   are generated from the YAML data at build time; per-locale generation is
   a separate project — do not copy generated files into a locale tree.

The authoritative copy of the template is the comment block in
`docs/.vitepress/config.mts` — keep the two in sync when the scaffold is
extended.
