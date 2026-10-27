# API Definition Data

This directory holds the API definition YAML files for the site. They are a
**byte-identical port** of `steemit/devportal`'s `_data/apidefinitions/*.yml`
(the legacy Jekyll data set, generated in 2018–2019 by
`Scrape::ApiDefinitionsJob`). The YAML is the single source of truth: pages are
generated from it at build time and the files are never hand-edited here.

## Layout

- `apidefinitions/*.yml` — 19 files: 17 API definition files (one per API) plus
  2 broadcast operation reference files (`broadcast_ops.yml`,
  `broadcast_ops_communities.yml`). The file name (without `.yml`) is the API's
  URL slug (e.g. `bridge.yml` → `/api/bridge/`).
- `translations/zh/purposes.yml` — zh translations of method purposes

### translations/zh/purposes.yml schema

- `schema: zh-method-purposes/v1` — self-declared format marker (informational).
- `locale`, `batch` — provenance metadata (informational).
- `purposes:` — REQUIRED wrapper; the generator aborts without it. Keys are
  full `api_method` strings, values are non-empty strings (a translated page
  is generated only for usable entries; unknown / duplicate / empty /
  non-string keys produce warnings, never crashes).
- Translation contract: the English `purpose` in `data/apidefinitions/` is
  the sole source; terminology follows the frozen glossary
  `docs/.vitepress/zh-glossary.json`; badge/detail/dead-note strings stay
  English (purpose-only translation). The mapping is consumed by
  `scripts/gen-api-docs.mjs --locale zh`: methods covered here get a
  generated zh method page (`docs/zh/api/<stem>/<short>.md`); uncovered
  methods keep bridging to the English page from the zh index.

### Partial locales — the LOCALES registry (`--locale <code>`)

`scripts/gen-api-docs.mjs` carries a `LOCALES` registry: `pnpm docs:gen` runs
the generator once per entry (en first, then `--locale zh ru fr de it es`).
The current status:

- **zh** — full pilot: method pages generated from
  `translations/zh/purposes.yml` (schema above); all 215 methods covered.
- **ru / fr / de / it / es** — bridge-only locales (phase-2 plan §3.4, user
  decision: method pages deferred). For each, `docs:gen --locale <code>`
  generates the 19 API index pages under `docs/<code>/api/<stem>/index.md`
  (gitignored, build-time artifacts) whose method rows ALL bridge to the
  English method pages by site-absolute path (`/api/<stem>/<method>.html`);
  ops rows deep-link the English ops pages via VitePress heading anchors.
- **Hand-written statics per locale** (tracked in git): `docs/<code>/index.md`
  (home), `docs/<code>/api/index.md` (API overview — card badges repeat the
  manifest counts), `docs/.vitepress/<code>-glossary.json` (frozen
  terminology baseline for future translation batches; not a site page —
  excluded from builds and from the per-locale page counts, ru/fr/de/it/es
  pages = 21 each by hard spec).
- **Overview count guard**: every en-mode docs:gen run verifies each
  hand-written locale overview against the freshly written
  `docs/.vitepress/gen/api-manifest.json` (card count, per-API badge count,
  link targets). Any mismatch fails docs:gen with exit code 1, so a data
  change can never leave a locale overview silently stale — update the
  hand-written page in the same change as the data.
- **Theme config**: each locale is registered in `docs/.vitepress/config.mts`
  (label/lang/link, localized nav + sidebar prefixes + default-theme UI
  strings incl. `langMenuLabel` and `notFound`). `i18nRouting` stays `false`
  while any locale has partial coverage (switcher navigates to the locale
  home instead of 1:1-swapping paths that may not exist).

## File schema

Each file's top level is a **YAML array of API groups** (most files contain
exactly one group).

### Group

| Field         | Required | Description                                                        |
| ------------- | -------- | ------------------------------------------------------------------ |
| `name`        | yes      | Display name of the API group.                                     |
| `description` | yes      | Markdown description (may span multiple lines).                    |
| `methods`     | no       | Array of method entries (see below).                               |
| `ops`         | no       | Array of broadcast-operation entries (only in `broadcast_ops*.yml`). |

### Method entry

Collected recursively — most files nest methods at `group.methods[]`, but
nesting may be deeper, so consumers must recurse.

| Field                     | Required | Description                                                                                     |
| ------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `api_method`              | yes      | Full RPC method name, e.g. `condenser_api.get_block`. The *method short name* is the part after the first dot. |
| `purpose`                 | no       | Markdown description of the method.                                                             |
| `parameter_json`          | no       | Example parameters. May be a **native YAML list/mapping or a JSON string**; consumers must handle both. |
| `expected_response_json`  | no       | Example response. Same dual form as `parameter_json`.                                           |
| `curl_examples`           | no       | List of example request bodies (JSON-RPC payloads for `curl --data`).                           |
| `expected_curl_responses` | no       | List of responses matching `curl_examples` one-to-one.                                          |
| `since`                   | no       | Hardfork / version the method appeared in (e.g. `HF14`).                                        |
| `disabled`                | no       | `true` when the method is disabled on public nodes.                                             |
| `deprecated`              | no       | `true` when the method is deprecated.                                                           |
| `removed`                 | no       | `true` when the method has been removed from public nodes (drift baseline 2026-10-27). Renders the `removed` badge. |
| `detail`                  | no       | Death-cause note for a method carrying `deprecated`/`disabled`/`removed` (why it is no longer served). Rendered under the badge row; together with a death badge it also adds the "no longer provided by public nodes" warning above the Example curl card. |
| `testnet`                 | no       | Testnet availability status: object `{ working: boolean, detail: string }` (every occurrence in the data set uses this shape). |
| `mainnet`                 | no       | Mainnet availability status: object `{ working: boolean, detail: string }` (every occurrence in the data set uses this shape). |

### Op entry (`broadcast_ops.yml`, `broadcast_ops_communities.yml`)

| Field          | Required | Description                                       |
| -------------- | -------- | ------------------------------------------------- |
| `name`         | yes      | Operation type name, e.g. `vote`.                 |
| `virtual`      | no       | Marks virtual operations.                         |
| `purpose`      | no       | Markdown description of the operation.            |
| `roles`        | no       | Account roles allowed to use the operation.       |
| `params`       | no       | Operation parameters (list or mapping).           |
| `json_examples`| no       | Example JSON payloads.                            |

Ops entries have **no** `parameter_json`; all fields except `name` are
optional and may be absent (8 of the 10 communities ops lack `roles`/`params`).

## Missing-field tolerance

Required fields are hard requirements; every other gap is advisory.

- **Required field missing → validation error** (exit code 1):
  - file top level not an array
  - group without `name` or `description`
  - method entry without `api_method`
  - duplicate `method_short` *within the same API file*
  - op entry without `name`
- **Optional field missing → warning only.** "Missing" means absent, `null`,
  or an empty string. For the list field `curl_examples`, an empty array also
  counts as missing. Note that `expected_response_json: []` is a real example
  value (an empty response) and is *not* missing.
  Currently tracked: `purpose`, `expected_response_json`, `curl_examples`.

`method_short` duplicates **across** APIs are expected (59 names are shared by
multiple APIs, e.g. several APIs define `get_content`) and are counted but not
flagged.

## Known data defects (tolerated, reported as warnings)

- ~~`database_api.yml` — the `find_savings_withdrawals` entry has a
  **duplicate `parameter_json` key**~~ — cleaned up in T9 (merged into a
  single entry); kept here for history.
- `block_api.yml` and `condenser_api.yml` — contain one legacy multi-line
  single-quoted scalar whose closing quote sits at column 1 (a psych/YAML 1.1
  leniency). The validator re-indents that line **in memory** only; the source
  files remain untouched.

## Validation

```sh
pnpm validate:data
```

Run in CI on every PR (see `.github/workflows/pr-build.yml`). Current baseline:
19 files, 215 methods, 85 ops (75 + 10).
