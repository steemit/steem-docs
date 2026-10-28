---
title: "follow_api.get_follow_count"
description: "계정의 팔로워 수를 반환합니다."
outline: [2, 3]
---

# follow_api.get_follow_count

<p class="api-badges"><span class="badge badge-since">since HF9</span></p>

## Purpose

계정의 팔로워 수를 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": "steemit"
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
    "method": "follow_api.get_follow_count",
    "params": {
      "account": "steemit"
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
    "method": "follow_api.get_follow_count",
    "params": {
      "account": "alice"
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
  "account": "",
  "follower_count": 0,
  "following_count": 0
}
```

</div>
