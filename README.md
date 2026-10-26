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
and summarized:

- **OK** — HTTP 200 and the response carried a `result`, or a method-level
  business error: the request reached the RPC layer, which is the assertion;
- **RPC_FAIL** — a JSON-RPC protocol error (e.g. method not found);
- **HTTP_FAIL** — non-200 status or a non-JSON body;
- **NETWORK_FAIL** — DNS/refused/timeout; reported, never thrown.

```sh
TEST_NODE=https://api.steem.fans pnpm test:curl
TEST_NODE=https://api.steem.fans pnpm test:curl -- --api condenser_api --limit 5
```

`TEST_NODE` selects the endpoint (default `https://api.steem.fans`); `--node`
overrides it for one run. Once the report completes, the command exits 0 — the
summary table and failure list are the artifact, not a pass/fail gate: the
YAML snapshot dates to 2020 and drift against today's nodes is expected, not
an error. Exit code 1 means usage errors or unrecoverable YAML parse
failures; an unknown `--api` stem only prints a warning. (`TEST_NODE` applies
to this tool only — `scrape:api-defs` deliberately ignores it and always
requires an explicit `--node`.)
