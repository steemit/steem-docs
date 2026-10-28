---
title: "condenser_api.get_feed_entries"
description: "계정 피드의 항목(entry) 목록을 반환합니다. 파라미터: account:string; start_entry_id:int; limit:int 최대 500"
outline: [2, 3]
---

# condenser_api.get_feed_entries

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

계정 피드의 항목(entry) 목록을 반환합니다.  파라미터: `account:string`; `start_entry_id:int`; `limit:int` 최대 500

| `account` (string) | `start_entry_id` (int) | `limit` (int) | |
|-------------------|---------------|---------------|-|
| `"steemit"` | `0` | `1` | `steemit`이라는 이름의 계정을 첫 번째 항목부터 조회하며, 최대 1개 결과를 반환합니다. |
| `"alice"` | `1` | `10` | `alice`이라는 이름의 계정을 두 번째 항목부터 조회하며, 최대 10개 결과를 반환합니다. |

추가 참조: follow_api.get_feed_entries, Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "",
  0,
  1
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
    "method": "condenser_api.get_feed_entries",
    "params": [
      "steemit",
      0,
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
    "method": "condenser_api.get_feed_entries",
    "params": [
      "alice",
      1,
      10
    ],
    "id": 1
  }'
```

</div>
