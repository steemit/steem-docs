---
title: "database_api.find_comments"
description: "댓글을 검색합니다."
outline: [2, 3]
---

# database_api.find_comments

## Purpose

댓글을 검색합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "comments": [
    [
      "steemit",
      "firstpost"
    ]
  ]
}
```

</div>

## Example

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.find_comments",
    "params": {
      "comments": [
        [
          "steemit",
          "firstpost"
        ]
      ]
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
  "comments": []
}
```

</div>
