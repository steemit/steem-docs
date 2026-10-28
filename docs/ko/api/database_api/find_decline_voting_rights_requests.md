---
title: "database_api.find_decline_voting_rights_requests"
description: "투표권 포기 요청 목록을 반환합니다."
outline: [2, 3]
---

# database_api.find_decline_voting_rights_requests

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

투표권 포기 요청 목록을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "accounts": []
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
    "method": "database_api.find_decline_voting_rights_requests",
    "params": {
      "accounts": [
        "temp",
        "null"
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
  "requests": []
}
```

</div>
