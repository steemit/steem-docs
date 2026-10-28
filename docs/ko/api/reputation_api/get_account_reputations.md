---
title: "reputation_api.get_account_reputations"
description: "계정의 평판을 반환합니다. 파라미터: account:string; limit:int"
outline: [2, 3]
---

# reputation_api.get_account_reputations

<p class="api-badges"><span class="badge badge-since">since HF20</span></p>

## Purpose

계정의 평판을 반환합니다.  파라미터: `account:string`; `limit:int`

* `limit`는 최대 1000입니다.

| `account` (string) | `limit` (int) | |
|--------------------|-|
| `"steemit"` | 10 | "steemit" 계정의 평판을 조회합니다. |

참고: [#1425](https://github.com/steemit/steem/issues/1425)

함께 보기: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account_lower_bound": "",
  "limit": 1000
}
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
    "method": "reputation_api.get_account_reputations",
    "params": {
      "account_lower_bound": "steem"
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
  "account": "steem",
  "reputation": 0
}
```

</div>
