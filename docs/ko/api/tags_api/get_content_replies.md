---
title: "tags_api.get_content_replies"
description: "답글 목록을 반환합니다."
outline: [2, 3]
---

# tags_api.get_content_replies

## Purpose

답글 목록을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "author": "steemit",
  "permlink": "firstpost"
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
    "method": "tags_api.get_content_replies",
    "params": {
      "author": "steemit",
      "permlink": "firstpost"
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
    "method": "tags_api.get_content_replies",
    "params": {
      "author": "alice",
      "permlink": "a-post-by-alice"
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
