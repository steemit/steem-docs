---
title: "condenser_api.get_blog_entries"
description: "계정의 블로그 항목 목록을 반환합니다. 파라미터: account:string; start_entry_id:int; limit:int 최대 500"
outline: [2, 3]
---

# condenser_api.get_blog_entries

## Purpose

계정의 블로그 항목 목록을 반환합니다.  파라미터: `account:string`; `start_entry_id:int`; `limit:int` 최대 500

| `account` (string) | `start_entry_id` (int) | `limit` (int) | |
|-------------------|------------------------|---------------|-|
| "steemit" | `0` | `1` | "steemit" 계정의 블로그 항목을 조회합니다. 최대 1개 결과입니다. |
| "alice" | `0` | `50` | "alice" 계정의 블로그 항목을 조회합니다. 최대 50개 결과입니다. |

함께 보기: follow_api.get_blog_entries, Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "steemit",
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
    "method": "condenser_api.get_blog_entries",
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
    "method": "condenser_api.get_blog_entries",
    "params": [
      "alice",
      0,
      50
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
[
  {
    "author": "steemit",
    "permlink": "firstpost",
    "blog": "steemit",
    "reblog_on": "1970-01-01T00:00:00",
    "entry_id": 0
  }
]
```

</div>
