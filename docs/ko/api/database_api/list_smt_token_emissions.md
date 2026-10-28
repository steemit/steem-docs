---
title: "database_api.list_smt_token_emissions"
description: "SMT 배출 (emission)을 나열합니다. 파라미터: start:array; limit:int; order:string"
outline: [2, 3]
---

# database_api.list_smt_token_emissions

<p class="api-badges"><span class="badge badge-since">since HF23</span> <span class="badge badge-deprecated">deprecated</span></p>

<p class="api-detail">SMT has been abandoned; this RPC method is no longer provided.</p>

## Purpose

SMT 배출 (emission)을 나열합니다.  파라미터: `start:array`; `limit:int`; `order:string`

* `start`는 `order`에 따라 달라집니다 (아래 참고)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_symbol_time` - 심볼과 시간 순

| `start` (array) | `limit` (int) | `order` (string) |
|-------------------|-|-|-|-|-|
| `[{"nai": "@@422838704", "decimals": 0}, "2019-08-07T16:54:03"]` | 10 | `by_symbol_time` | 배출 10개를, 심볼·타임스탬프 순으로 나열합니다 |

참고: [Content Rewards](https://github.com/steemit/smt-whitepaper/blob/master/smt-manual/manual.md#content-rewards), [Qualitative Discussion](https://github.com/steemit/smt-whitepaper/blob/master/smt-manual/manual.md#qualitative-discussion)

함께 보기: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "start": null,
  "limit": 0,
  "order": "by_symbol_time"
}
```

</div>

<p class="dead-note">⚠ 이 메서드는 지원 중단(deprecated, SMT 시대)되었으며 더 이상 퍼블릭 노드에서 제공되지 않습니다.</p>

## Example

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.list_smt_token_emissions",
    "params": {
      "start": [
        {
          "nai": "@@422838704",
          "decimals": 0
        },
        "2019-08-07T16:54:03"
      ],
      "limit": 10,
      "order": "by_symbol_time"
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
  "token_emissions": []
}
```

</div>
