---
title: "condenser_api.get_discussions_by_active"
description: "active 기준 토론 목록을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_discussions_by_active

## Purpose

active 기준 토론 목록을 반환합니다.

추가 참조: tags_api.get_discussions_by_active

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  {
    "tag": "",
    "limit": 0,
    "filter_tags": [],
    "select_authors": [],
    "select_tags": [],
    "truncate_body": 0
  }
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
    "method": "condenser_api.get_discussions_by_active",
    "params": [
      {
        "tag": "steem",
        "limit": 1
      }
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
    "method": "condenser_api.get_discussions_by_active",
    "params": [
      {
        "tag": "photography",
        "limit": 10,
        "truncate_body": 0
      }
    ],
    "id": 1
  }'
```

</div>
