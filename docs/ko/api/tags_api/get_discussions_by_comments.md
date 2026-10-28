---
title: "tags_api.get_discussions_by_comments"
description: "comments 기준의 토론 목록을 반환합니다."
outline: [2, 3]
---

# tags_api.get_discussions_by_comments

## Purpose

comments 기준의 토론 목록을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "start_author": "steemit",
  "start_permlink": "firstpost",
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
    "method": "tags_api.get_discussions_by_comments",
    "params": {
      "start_author": "steemit",
      "start_permlink": "firstpost",
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
    "method": "tags_api.get_discussions_by_comments",
    "params": {
      "start_author": "alice",
      "start_permlink": "a-post-by-alice",
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

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
Comment is not in account's comments
```

</div>
