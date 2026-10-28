---
title: "condenser_api.get_account_references"
description: "구현되지 않음"
outline: [2, 3]
---

# condenser_api.get_account_references

<p class="api-badges"><span class="badge badge-disabled">disabled</span></p>

## Purpose

**구현되지 않음**

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[]
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
    "method": "condenser_api.get_account_references",
    "params": [
      "steemit"
    ],
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
