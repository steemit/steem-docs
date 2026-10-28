---
title: "condenser_api.get_block"
description: "블록을 반환합니다. 파라미터: block_num:int"
outline: [2, 3]
---

# condenser_api.get_block

## Purpose

블록을 반환합니다.  파라미터: `block_num:int`

| `block_num` (int) | |
|-------------------|-|
| `1` | 가장 첫 번째 블록을 조회합니다. |
| `8675309` | 블록 번호 8,675,309를 조회합니다. |
| `62396745` | 블록 번호 62,396,745를 조회합니다. |

추가 참조: block_api.get_block

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  1
]
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
    "method": "condenser_api.get_block",
    "params": [
      1
    ],
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
    "method": "condenser_api.get_block",
    "params": [
      8675309
    ],
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
    "method": "condenser_api.get_block",
    "params": [
      62396745
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "previous": "0000000000000000000000000000000000000000",
  "timestamp": "2016-03-24T16:05:00",
  "witness": "initminer",
  "transaction_merkle_root": "0000000000000000000000000000000000000000",
  "extensions": [],
  "witness_signature": "204f8ad56a8f5cf722a02b035a61b500aa59b9519b2c33c77a80c0a714680a5a5a7a340d909d19996613c5e4ae92146b9add8a7a663eef37d837ef881477313043",
  "transactions": [],
  "block_id": "0000000109833ce528d5bbfb3f6225b39ee10086",
  "signing_key": "STM8GC13uCZbP44HzMLV6zPZGwVQ8Nt4Kji8PapsPiNq1BK153XTX",
  "transaction_ids": []
}
```

</div>
