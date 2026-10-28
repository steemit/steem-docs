---
title: "condenser_api.get_ops_in_block"
description: "블록에 포함된 모든 오퍼레이션을 반환합니다. 파라미터: block_num:int; only_virtual:boolean"
outline: [2, 3]
---

# condenser_api.get_ops_in_block

## Purpose

블록에 포함된 모든 오퍼레이션을 반환합니다.  파라미터: `block_num:int`; `only_virtual:boolean`

| `block_num` (int) | `only_virtual` (boolean) | |
|-------------------|--------------------------|-|
| `1` | `false` | 블록 #1의 오퍼레이션을 조회합니다. |
| `5443322` | `true` | 블록 #5,443,322의 가상 오퍼레이션만 조회합니다. |

추가 참조: account_history_api.get_ops_in_block

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  0,
  false
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
    "method": "condenser_api.get_ops_in_block",
    "params": [
      1,
      false
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
    "method": "condenser_api.get_ops_in_block",
    "params": [
      5443322,
      true
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
[
  {
    "trx_id": "0000000000000000000000000000000000000000",
    "block": 0,
    "trx_in_block": 0,
    "op_in_trx": 0,
    "virtual_op": 0,
    "timestamp": "2016-10-01T06:31:24",
    "op": [
      "producer_reward",
      {
        "producer": "",
        "vesting_shares": "0.000000 VESTS"
      }
    ]
  }
]
```

</div>
