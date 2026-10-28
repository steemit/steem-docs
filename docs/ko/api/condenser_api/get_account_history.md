---
title: "condenser_api.get_account_history"
description: "주어진 계정의 모든 오퍼레이션 이력을 반환합니다. 파라미터: account:string; start:int. 예: 역방향 이력은 -1, 그 외에는 임의의 양수; limit:int 최대 10000"
outline: [2, 3]
---

# condenser_api.get_account_history

## Purpose

주어진 계정의 모든 오퍼레이션 이력을 반환합니다.  파라미터: `account:string`; `start:int`. 예: 역방향 이력은 -1, 그 외에는 임의의 양수; `limit:int` 최대 10000

| `account` (string) | `start` (int) | `limit` (int) | |
|--------------------|---------------|---------------|-|
| `"steemit"` | `1000` | `1000` | `steemit`이라는 이름의 계정을 이력의 가장 최근 항목부터 조회하며, 최대 1,000개 결과를 반환합니다. |
| `"alice"` | `-1` | `10000` | `alice`이라는 이름의 계정을 이력의 가장 오래된 항목부터 조회하며, 최대 10,000개 결과를 반환합니다. |

추가 참조: account_history_api.get_account_history, Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "",
  0,
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
    "method": "condenser_api.get_account_history",
    "params": [
      "steemit",
      1000,
      1000
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
    "method": "condenser_api.get_account_history",
    "params": [
      "steemit",
      -1,
      10000
    ],
    "id": 1
  }'
```

</div>
