---
title: "condenser_api.get_block_header"
description: "블록 헤더를 반환합니다. 파라미터: block_num:int"
outline: [2, 3]
---

# condenser_api.get_block_header

## Purpose

블록 헤더를 반환합니다.  파라미터: `block_num:int`

| `block_num` (int) | |
|-------------------|-|
| `1` | 가장 첫 번째 블록의 블록 헤더를 조회합니다. |
| `8675309` | 블록 번호 8,675,309의 블록 헤더를 조회합니다. |
| `62396745` | 블록 번호 62,396,745의 블록 헤더를 조회합니다. |

함께 보기: block_api.get_block_header

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
    "method": "condenser_api.get_block_header",
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
    "method": "condenser_api.get_block_header",
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
    "method": "condenser_api.get_block_header",
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
  "extensions": []
}
```

</div>
