---
title: "condenser_api.get_dynamic_global_properties"
description: "현재 동적 전역 속성(dynamic global properties)을 반환합니다. 참조: Understanding Dynamic Global Properties"
outline: [2, 3]
---

# condenser_api.get_dynamic_global_properties

## Purpose

현재 동적 전역 속성(dynamic global properties)을 반환합니다.  참조: Understanding Dynamic Global Properties

추가 참조: database_api.get_dynamic_global_properties

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
    "method": "condenser_api.get_dynamic_global_properties",
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
  "head_block_number": 0,
  "head_block_id": "0000000000000000000000000000000000000000",
  "time": "1970-01-01T00:00:00",
  "current_witness": "",
  "total_pow": "18446744073709551615",
  "num_pow_witnesses": 0,
  "virtual_supply": "0.000 STEEM",
  "current_supply": "0.000 STEEM",
  "confidential_supply": "0.000 STEEM",
  "current_sbd_supply": "0.000 STEEM",
  "confidential_sbd_supply": "0.000 STEEM",
  "total_vesting_fund_steem": "0.000 STEEM",
  "total_vesting_shares": "0.000 STEEM",
  "total_reward_fund_steem": "0.000 STEEM",
  "total_reward_shares2": "0",
  "pending_rewarded_vesting_shares": "0.000 STEEM",
  "pending_rewarded_vesting_steem": "0.000 STEEM",
  "sbd_interest_rate": 0,
  "sbd_print_rate": 10000,
  "maximum_block_size": 0,
  "current_aslot": 0,
  "recent_slots_filled": "0",
  "participation_count": 0,
  "last_irreversible_block_num": 0,
  "vote_power_reserve_rate": 40
}
```

</div>
