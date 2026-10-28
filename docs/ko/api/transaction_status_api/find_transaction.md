---
title: "transaction_status_api.find_transaction"
description: "주어진 트랜잭션 ID의 상태를 반환합니다. 파라미터: trx_id:string; expiration:timestamp (선택)"
outline: [2, 3]
---

# transaction_status_api.find_transaction

<p class="api-badges"><span class="badge badge-since">since The Mysterious Future</span> <span class="badge badge-disabled">disabled</span> <span class="badge badge-net">testnet: not working — Not yet enabled.</span> <span class="badge badge-net">mainnet: not working — Not yet enabled.</span></p>

<p class="api-detail">Defined in the steem source (52dcfabb) but not served by public nodes.</p>

## Purpose

주어진 트랜잭션 ID의 상태를 반환합니다.  파라미터: `trx_id:string`; `expiration:timestamp` (선택)

결과에는 다음 `status` 값 중 하나가 담깁니다:

| 상태 | 의미 |
|--------|---------|
| `unknown` | 만료 시각이 미래이며, 트랜잭션이 블록이나 멤피프(mempool)에 포함되지 않았습니다 |
| `within_mempool` | 트랜잭션이 멤피프(mempool)에 있습니다 |
| `within_reversible_block` | 트랜잭션이 블록에 포함되었으며, 블록은 아직 비가역적(irreversible)이지 않습니다 |
| `within_irreversible_block` | 트랜잭션이 블록에 포함되었으며, 블록은 비가역적(irreversible)입니다 |
| `expired_reversible` | 트랜잭션이 만료되었으며, 트랜잭션은 비가역적이지 않습니다(포크에 있을 수 있음) |
| `expired_irreversible` | 트랜잭션이 만료되었으며, 트랜잭션은 비가역적입니다(포크에 있을 수 없음) |
| `too_old` | 트랜잭션이 너무 오래되어 알 수 없습니다 |

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "transaction_id": "0000000000000000000000000000000000000000",
  "expiration": "2016-03-24T18:00:21"
}
```

</div>

<p class="dead-note">⚠ steem 소스 코드에 정의되어 있지만, 퍼블릭 노드에서는 활성화되지 않았습니다.</p>

## Example

### Example 1

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "transaction_status_api.find_transaction",
    "params": {
      "transaction_id": "0000000000000000000000000000000000000000"
    },
    "id": 1
  }'
```

</div>

### Example 2

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "transaction_status_api.find_transaction",
    "params": {
      "transaction_id": "0000000000000000000000000000000000000000",
      "expiration": "2016-03-24T18:00:21"
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
  "status": "unknown"
}
```

</div>
