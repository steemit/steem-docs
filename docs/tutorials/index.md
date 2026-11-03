---
title: Tutorials
description: Hands-on tutorials and usage examples for the official Steem client libraries - steem-js for JavaScript/TypeScript and steemgosdk for Go.
---

# Tutorials

This section collects hands-on usage examples for the two official Steem client libraries. Every example was migrated from the libraries' own documentation, and the demos are runnable against a public node such as `https://api.steemit.com`.

## The libraries

| Library | Language | Package / module | Repository |
|---------|----------|------------------|------------|
| steem-js | JavaScript / TypeScript | npm package `@steemit/steem-js` 1.2.4 | [steemit/steem-js](https://github.com/steemit/steem-js) |
| steemgosdk | Go | Go module `github.com/steemit/steemgosdk` | [steemit/steemgosdk](https://github.com/steemit/steemgosdk) |

Both libraries talk to the same JSON-RPC API that the generated [API Reference](/api/) documents, method by method. Use the tutorials to learn the client-side patterns; use the API Reference for the on-the-wire details of every method.

## steem-js pages

- [Getting started](/tutorials/steem-js/) - installation, browser usage, configuration (`config.set`, `api.setUrl`, `setOptions`, multiple API instances), JSON-RPC overview, API routing, end-to-end usage examples, TypeScript support and error handling.
- [Reading chain data](/tutorials/steem-js/read-api.html) - every read helper: tags, blog and discussions, blocks, global properties, accounts, market, votes, content, witnesses, plus the login/follow helpers and the offline authentication, formatter and utils utilities.
- [Broadcasting operations](/tutorials/steem-js/broadcast.html) - the full `steem.broadcast` operation catalogue, promise/callback patterns, multisig and binary transaction serialization.
- [Signed calls and signature verification](/tutorials/steem-js/signed-calls.html) - authenticated `signedCall` requests and the signature verification toolkit, with the complete example guides.
- [RPC auth test migration](/tutorials/steem-js/rpc-auth-migration.html) - how the `rpc-auth` test suite was migrated into steem-js.

## steemgosdk pages

- [Getting started](/tutorials/steemgosdk/) - client setup, chain-reading API examples, key-generation auth examples and Steem URI signing examples.
- [Broadcasting operations](/tutorials/steemgosdk/broadcast.html) - votes, transfers, comments, comment options with beneficiaries, multi-operation transactions and custom_json broadcasts, plus complete end-to-end examples.
- [SignedCall API](/tutorials/steemgosdk/signed-call.html) - authenticated JSON-RPC calls from Go, interoperable with steem-js signed calls.

## Notes

- The tutorials are English-only for now, mirroring the Guides section.
- Examples reference well-known test keys from the libraries' own documentation; never use them in production - generate your own keys as shown in the auth examples.
