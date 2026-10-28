---
title: "account_history_api.get_account_history"
description: "주어진 계정의 모든 오퍼레이션 기록을 반환합니다."
outline: [2, 3]
---

# account_history_api.get_account_history

## Purpose

주어진 계정의 모든 오퍼레이션 기록을 반환합니다.

함께 보기: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": "",
  "start": "18446744073709551615",
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
    "method": "account_history_api.get_account_history",
    "params": {
      "account": "steemit",
      "start": 1000,
      "limit": 1000
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
    "method": "account_history_api.get_account_history",
    "params": {
      "account": "steemit",
      "start": -1,
      "limit": 10000
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
  "history": []
}
```

</div>

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
Could not find API account_history_api
```

```text
Could not find API account_history_api
```

</div>
