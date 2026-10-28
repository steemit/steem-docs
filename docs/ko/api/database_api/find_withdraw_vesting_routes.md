---
title: "database_api.find_withdraw_vesting_routes"
description: "계정의 베스팅 인출 경로 목록을 반환합니다."
outline: [2, 3]
---

# database_api.find_withdraw_vesting_routes

## Purpose

계정의 베스팅 인출 경로 목록을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": "",
  "order": "by_name"
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
    "method": "database_api.find_withdraw_vesting_routes",
    "params": {
      "account": "temp",
      "order": "by_destination"
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
  "routes": []
}
```

</div>
