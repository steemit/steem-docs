---
title: "condenser_api.get_witness_schedule"
description: "현재 위트니스 스케줄(witness schedule)을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_witness_schedule

## Purpose

현재 위트니스 스케줄(witness schedule)을 반환합니다.

추가 참조: database_api.get_witness_schedule

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
    "method": "condenser_api.get_witness_schedule",
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
  "id": 0,
  "current_virtual_time": "0",
  "next_shuffle_block_num": 1,
  "current_shuffled_witnesses": [],
  "num_scheduled_witnesses": 1,
  "top19_weight": 1,
  "timeshare_weight": 5,
  "miner_weight": 1,
  "witness_pay_normalization_factor": 25,
  "median_props": {
    "account_creation_fee": "0.000 STEEM",
    "maximum_block_size": 131072,
    "sbd_interest_rate": 1000
  },
  "majority_version": "0.0.0",
  "max_voted_witnesses": 19,
  "max_miner_witnesses": 1,
  "max_runner_witnesses": 1,
  "hardfork_required_witnesses": 17
}
```

</div>
