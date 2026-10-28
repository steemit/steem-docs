---
title: "account_history_api.get_ops_in_block"
description: "블록에 포함된 모든 오퍼레이션을 반환합니다."
outline: [2, 3]
---

# account_history_api.get_ops_in_block

## Purpose

블록에 포함된 모든 오퍼레이션을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "block_num": 0,
  "only_virtual": false
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
    "method": "account_history_api.get_ops_in_block",
    "params": {
      "block_num": 1,
      "only_virtual": false
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
    "method": "account_history_api.get_ops_in_block",
    "params": {
      "block_num": 5443322,
      "only_virtual": true
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
  "ops": []
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
