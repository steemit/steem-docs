---
title: "follow_api.get_following"
description: "한 계정을 팔로우하고 있는 계정 목록을 반환합니다."
outline: [2, 3]
---

# follow_api.get_following

<p class="api-badges"><span class="badge badge-since">since HF9</span></p>

## Purpose

한 계정을 팔로우하고 있는 계정 목록을 반환합니다.

추가 참조: Paginated API Methods

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
    "method": "follow_api.get_following",
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
    "method": "follow_api.get_following",
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
  "following": []
}
```

</div>
