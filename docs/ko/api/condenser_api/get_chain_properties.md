---
title: "condenser_api.get_chain_properties"
description: "체인 속성을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_chain_properties

## Purpose

체인 속성을 반환합니다.

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
    "method": "condenser_api.get_chain_properties",
    "params": [],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "account_creation_fee": "0.100 STEEM",
  "maximum_block_size": 131072,
  "sbd_interest_rate": 1000,
  "account_subsidy_limit": 0
}
```

</div>
