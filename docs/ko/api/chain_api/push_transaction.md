---
title: "chain_api.push_transaction"
description: "트랜잭션을 노드에 푸시합니다."
outline: [2, 3]
---

# chain_api.push_transaction

<p class="api-badges"><span class="badge badge-disabled">disabled</span></p>

<p class="api-detail">The chain_api plugin is defined in source but not enabled on public nodes; the namespace is not registered.</p>

## Purpose

트랜잭션을 노드에 푸시합니다.

파라미터: 래퍼 없이 서명된 트랜잭션 객체 그 자체: `ref_block_num:int`; `ref_block_prefix:int`; `expiration:timestamp`; `operations:array`; `extensions:array`; `signatures:array`

`success:bool`을 반환하며, 실패 시 `error:string`을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "ref_block_num": 0,
  "ref_block_prefix": 0,
  "expiration": "1970-01-01T00:00:00",
  "operations": [],
  "extensions": [],
  "signatures": []
}
```

</div>

<p class="dead-note">⚠ steem 소스 코드에 정의되어 있지만, 퍼블릭 노드에서는 활성화되지 않았습니다.</p>

## Example

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "chain_api.push_transaction",
    "params": {
      "ref_block_num": 0,
      "ref_block_prefix": 0,
      "expiration": "1970-01-01T00:00:00",
      "operations": [],
      "extensions": [],
      "signatures": []
    },
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "success": true,
  "error": null
}
```

</div>

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
Could not find API chain_api
```

</div>
