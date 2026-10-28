---
title: "database_api.list_smt_contributions"
description: "SMT 기여 (contribution)를 나열합니다. 기여는 ICO 단계에서 SMT에 대한 개별 기여를 추적하는 데 필요합니다. 파라미터: start:array; limit:int; order:string"
outline: [2, 3]
---

# database_api.list_smt_contributions

<p class="api-badges"><span class="badge badge-since">since HF23</span> <span class="badge badge-deprecated">deprecated</span></p>

<p class="api-detail">SMT has been abandoned; this RPC method is no longer provided.</p>

## Purpose

SMT 기여 (contribution)를 나열합니다. 기여는 ICO 단계에서 SMT에 대한 개별 기여를 추적하는 데 필요합니다.  파라미터: `start:array`; `limit:int`; `order:string`

* `start`는 `order`에 따라 달라집니다 (아래 참고)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_symbol_id` - 심볼 (symbol) 순
  * `by_symbol_contributor` - `symbol`, `contributor`, `contribution_id` 순

| `start` (array) | `limit` (int) | `order` (string) |
|-------------------|-|-|-|-|-|
| `[{"nai": "@@422838704", "decimals": 0}, 0]` | 10 | `by_symbol_id` | 기여 10개를, 심볼·id 순으로 나열합니다 |
| `[{"nai": "@@422838704", "decimals": 0}, "alice", 0]` | 10 | `by_symbol_contributor` | 기여 10개를, 심볼·기여자·id 순으로 나열합니다 |

참고: [Token Units](https://github.com/steemit/smt-whitepaper/blob/master/smt-manual/manual.md#token-units), [Vesting Contributions](https://github.com/steemit/smt-whitepaper/blob/master/smt-manual/manual.md#vesting-contributions)

함께 보기: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "start": null,
  "limit": 0,
  "order": "by_symbol_id"
}
```

</div>

<p class="dead-note">⚠ 이 메서드는 지원 중단(deprecated, SMT 시대)되었으며 더 이상 퍼블릭 노드에서 제공되지 않습니다.</p>

## Example

### Example 1

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.list_smt_contributions",
    "params": {
      "start": [
        {
          "nai": "@@422838704",
          "decimals": 0
        },
        0
      ],
      "limit": 10,
      "order": "by_symbol_id"
    },
    "id": 1
  }'
```

</div>

### Example 2

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.list_smt_contributions",
    "params": {
      "start": [
        {
          "nai": "@@422838704",
          "decimals": 0
        },
        "alice",
        0
      ],
      "limit": 10,
      "order": "by_symbol_contributor"
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
  "contributions": [
    {
      "id": 0,
      "symbol": {
        "nai": "@@422838704",
        "decimals": 0
      },
      "contributor": "alice",
      "contribution_id": 0,
      "contribution": {
        "amount": "1000",
        "precision": 3,
        "nai": "@@000000021"
      }
    }
  ]
}
```

</div>
