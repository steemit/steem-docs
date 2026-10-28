---
title: "condenser_api.get_discussions_by_blog"
description: "블로그 기준의 토론 목록을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_discussions_by_blog

## Purpose

블로그 기준의 토론 목록을 반환합니다.

함께 보기: tags_api.get_discussions_by_blog

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  {
    "tag": "steemit",
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
    "method": "condenser_api.get_discussions_by_blog",
    "params": [
      {
        "tag": "steemit",
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
    "method": "condenser_api.get_discussions_by_blog",
    "params": [
      {
        "tag": "alice",
        "limit": 10
      }
    ],
    "id": 1
  }'
```

</div>
