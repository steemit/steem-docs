---
title: "jsonrpc.get_methods"
description: "JSON RPC API가 지원하는 메서드 목록을 반환합니다."
outline: [2, 3]
---

# jsonrpc.get_methods

## Purpose

JSON RPC API가 지원하는 메서드 목록을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{}
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
    "method": "jsonrpc.get_methods",
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
[]
```

</div>
