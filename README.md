# steem-docs

Steem developer documentation, rebuilt with [VitePress](https://vitepress.dev).

**Phase 1** will deliver the API Definitions: a complete, individually
addressable reference for every `condenser_api` and appbase JSON-RPC method.

## Commands

| Command               | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `pnpm i`              | Install dependencies                                     |
| `pnpm dev`            | Generate docs data, then start the dev server            |
| `pnpm build`          | Generate docs data, then build the production site       |
| `pnpm preview`        | Preview the production build locally                     |
| `pnpm validate:data`  | Validate the YAML API definitions *(planned)*            |

## Data pipeline

YAML files are the single source of truth for all API definitions; markdown
pages are generated from them at build time, keeping the rendered docs in
sync with the underlying data. The generator itself ships in an upcoming change.
