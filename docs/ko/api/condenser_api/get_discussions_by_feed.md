---
title: "condenser_api.get_discussions_by_feed"
description: "feed 기준 토론 목록을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_discussions_by_feed

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

feed 기준 토론 목록을 반환합니다.

추가 참조: tags_api.get_discussions_by_feed

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  {
    "tag": "steem",
    "limit": 1
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
    "method": "condenser_api.get_discussions_by_feed",
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
    "method": "condenser_api.get_discussions_by_feed",
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
