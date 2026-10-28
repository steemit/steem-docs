---
title: "follow_api.get_blog_entries"
description: "계정의 블로그 항목 목록을 반환합니다."
outline: [2, 3]
---

# follow_api.get_blog_entries

## Purpose

계정의 블로그 항목 목록을 반환합니다.

함께 보기: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": "steemit",
  "start_entry_id": 0,
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
    "method": "follow_api.get_blog_entries",
    "params": {
      "account": "steemit",
      "start_entry_id": 0,
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
    "method": "follow_api.get_blog_entries",
    "params": {
      "account": "alice",
      "start_entry_id": 0,
      "limit": 50
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
  "blog": []
}
```

</div>
