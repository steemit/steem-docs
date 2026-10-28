---
title: "rc_api.get_resource_pool"
description: "작업 진행 중입니다. 참조: 2563, PR2678"
outline: [2, 3]
---

# rc_api.get_resource_pool

<p class="api-badges"><span class="badge badge-since">since HF20</span></p>

## Purpose

작업 진행 중입니다.  참조: [#2563](https://github.com/steemit/steem/issues/2563), [PR#2678](https://github.com/steemit/steem/pull/2678)

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{}
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
    "method": "rc_api.get_resource_pool",
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "resource_pool": {
    "resource_history_bytes": {
      "pool": "22530662270"
    },
    "resource_new_accounts": {
      "pool": 17589594
    },
    "resource_market_bytes": {
      "pool": 1919726127
    },
    "resource_state_bytes": {
      "pool": "17720687726725"
    },
    "resource_execution_time": {
      "pool": "5835324988127"
    }
  }
}
```

</div>
