---
title: "database_api.verify_account_authority"
description: "구현되지 않음 (Not Implemented)"
outline: [2, 3]
---

# database_api.verify_account_authority

<p class="api-badges"><span class="badge badge-disabled">disabled</span></p>

## Purpose

**구현되지 않음 (Not Implemented)**

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": "",
  "signers": []
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
    "method": "database_api.verify_account_authority",
    "params": {
      "account": "temp",
      "signers": [
        "STM8GC13uCZbP44HzMLV6zPZGwVQ8Nt4Kji8PapsPiNq1BK153XTX"
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
  "valid": false
}
```

</div>

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
Missing Active Authority steemit
```

</div>
