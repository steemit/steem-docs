---
title: "condenser_api.get_witnesses_by_vote"
description: "투표 기준 현재 위트니스를 반환합니다. 파라미터: start_name:string; limit:int 최대 1000"
outline: [2, 3]
---

# condenser_api.get_witnesses_by_vote

## Purpose

투표 기준 현재 위트니스를 반환합니다.  파라미터: `start_name:string`; `limit:int` 최대 1000

| `account` (string) | `limit` (int) | |
|--------------------|---------------|-|
| `null` | `21` | 상위 21개 위트니스 투표를 조회합니다. |
| `"a"` | `1` | "a"로 시작하는 상위 10개 위트니스 투표를 조회합니다. |

추가 참조: database_api.list_witnesses

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
    "method": "condenser_api.get_witnesses_by_vote",
    "params": [
      null,
      21
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
    "method": "condenser_api.get_witnesses_by_vote",
    "params": [
      "a",
      1
    ],
    "id": 1
  }'
```

</div>
