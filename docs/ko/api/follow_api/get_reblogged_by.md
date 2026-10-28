---
title: "follow_api.get_reblogged_by"
description: "포스트를 리블로그(reblog)한 저자 목록을 반환합니다."
outline: [2, 3]
---

# follow_api.get_reblogged_by

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

포스트를 리블로그(reblog)한 저자 목록을 반환합니다.

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
    "method": "follow_api.get_reblogged_by",
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
    "method": "follow_api.get_reblogged_by",
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
  "accounts": []
}
```

</div>

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
unknown key:unknown key:
```

</div>
