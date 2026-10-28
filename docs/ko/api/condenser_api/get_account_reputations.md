---
title: "condenser_api.get_account_reputations"
description: "계정 평판 목록을 반환합니다. 파라미터: account_lower_bound:string; limit:int 최대 1000"
outline: [2, 3]
---

# condenser_api.get_account_reputations

<p class="api-badges"><span class="badge badge-since">since HF13</span></p>

## Purpose

계정 평판 목록을 반환합니다.  파라미터: `account_lower_bound:string`; `limit:int` 최대 1000

| `account_lower_bound` (string) | `limit` (int) | |
|----------------------------|---------------|-|
| `"steemit"` | `1` | "steemit"으로 시작하는 계정을 조회하며, 결과는 하나만 반환합니다. |
| `"a"` | `10` | "a"로 시작하는 계정을 조회하며, 최대 10개 결과를 반환합니다. |

추가 참조: follow_api.get_account_reputations

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "",
  1000
]
```

</div>

## Example

### Example 1

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.get_account_reputations",
    "params": [
      "steemit",
      1
    ],
    "id": 1
  }'
```

</div>

### Example 2

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.get_account_reputations",
    "params": [
      "a",
      10
    ],
    "id": 1
  }'
```

</div>
