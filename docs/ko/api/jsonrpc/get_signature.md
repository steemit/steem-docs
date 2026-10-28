---
title: "jsonrpc.get_signature"
description: "JSON RPC 메서드의 시그니처(signature) 정보(인자와 예상 응답 JSON 포함)를 반환합니다."
outline: [2, 3]
---

# jsonrpc.get_signature

## Purpose

JSON RPC 메서드의 시그니처(signature) 정보(인자와 예상 응답 JSON 포함)를 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "method": ""
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
    "method": "jsonrpc.get_signature",
    "params": {
      "method": "jsonrpc.get_methods"
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
    "method": "jsonrpc.get_signature",
    "params": {
      "method": "jsonrpc.get_signature"
    },
    "id": 1
  }'
```

</div>

### Example 3

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "jsonrpc.get_signature",
    "params": {
      "method": "condenser_api.get_dynamic_global_properties"
    },
    "id": 1
  }'
```

</div>

### Example 4

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "jsonrpc.get_signature",
    "params": {
      "method": "database_api.get_dynamic_global_properties"
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
  "args": null,
  "ret": null
}
```

</div>
