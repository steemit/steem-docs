---
title: "condenser_api.get_version"
description: "블록체인, steem, FC의 버전을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_version

## Purpose

블록체인, steem, FC의 버전을 반환합니다.

함께 보기: database_api.get_version, Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[]
```

</div>

## Example

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.get_version",
    "params": [],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "blockchain_version": "",
  "steem_revision": "",
  "fc_revision": ""
}
```

</div>
