---
title: "follow_api.get_account_reputations"
description: "계정 평판 목록을 반환합니다."
outline: [2, 3]
---

# follow_api.get_account_reputations

<p class="api-badges"><span class="badge badge-since">since HF13</span></p>

## Purpose

계정 평판 목록을 반환합니다.

함께 보기: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account_lower_bound": "",
  "limit": 1000
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
    "method": "follow_api.get_account_reputations",
    "params": {
      "account_lower_bound": "steemit",
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
    "method": "follow_api.get_account_reputations",
    "params": {
      "account_lower_bound": "a",
      "limit": 10
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
  "reputations": []
}
```

</div>
