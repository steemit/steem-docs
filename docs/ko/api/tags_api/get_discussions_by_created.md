---
title: "tags_api.get_discussions_by_created"
description: "created 기준 토론 목록을 반환합니다."
outline: [2, 3]
---

# tags_api.get_discussions_by_created

## Purpose

created 기준 토론 목록을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "tag": "steem",
  "limit": 1
}
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
    "method": "tags_api.get_discussions_by_created",
    "params": {
      "tag": "steem",
      "limit": 1
    },
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
    "method": "tags_api.get_discussions_by_created",
    "params": {
      "tag": "photography",
      "limit": 10,
      "truncate_body": 0
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
  "discussions": []
}
```

</div>
