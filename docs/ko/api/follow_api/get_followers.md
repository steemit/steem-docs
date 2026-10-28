---
title: "follow_api.get_followers"
description: "계정의 팔로워 목록을 반환합니다."
outline: [2, 3]
---

# follow_api.get_followers

<p class="api-badges"><span class="badge badge-since">since HF9</span></p>

## Purpose

계정의 팔로워 목록을 반환합니다.

함께 보기: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": "steemit",
  "start": null,
  "type": "blog",
  "limit": 10
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
    "method": "follow_api.get_followers",
    "params": {
      "account": "steemit",
      "start": null,
      "type": "blog",
      "limit": 10
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
    "method": "follow_api.get_followers",
    "params": {
      "account": "alice",
      "start": null,
      "type": "ignore",
      "limit": 100
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
  "followers": []
}
```

</div>
