---
title: "database_api.list_smt_tokens"
description: "SMT를 나열합니다. 파라미터: start:object; limit:int; order:string"
outline: [2, 3]
---

# database_api.list_smt_tokens

<p class="api-badges"><span class="badge badge-since">since HF23</span> <span class="badge badge-deprecated">deprecated</span></p>

<p class="api-detail">SMT has been abandoned; this RPC method is no longer provided.</p>

## Purpose

SMT를 나열합니다.  파라미터: `start:object`; `limit:int`; `order:string`

* `start`는 `order`에 따라 달라집니다(아래 참조)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나입니다:
  * `by_symbol` - 심볼(symbol) 기준 정렬
  * `by_control_account` - 컨트롤 계정(control account) 기준 정렬

| `start` (object) | `limit` (int) | `order` (string) |
|-------------------|-|-|-|-|-|
| `{"nai": "@@422838704", "decimals": 0}` | 10 | `by_symbol` | 10개 토큰을 심볼 기준으로 나열합니다 |
| `""` | 10 | `by_control_account` | 10개 토큰을 컨트롤 계정 기준으로 나열합니다 |
| `["", {"nai": "@@422838704", "decimals": 0}]` | 10 | `by_control_account` | 10개 토큰을 컨트롤 계정, 심볼 기준으로 나열합니다 |

참조: [Smart Media Tokens (SMTs)](https://github.com/steemit/smt-whitepaper/blob/master/smt-manual/manual.md#smart-media-tokens-smts)

추가 참조: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "start": null,
  "limit": 0,
  "order": "by_symbol"
}
```

</div>

<p class="dead-note">⚠ 이 메서드는 지원 중단(SMT 시대)되었으며 더 이상 퍼블릭 노드에서 제공되지 않습니다.</p>

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
    "method": "database_api.list_smt_tokens",
    "params": {
      "start": {
        "nai": "@@422838704",
        "decimals": 0
      },
      "limit": 10,
      "order": "by_symbol"
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
    "method": "database_api.list_smt_tokens",
    "params": {
      "start": "",
      "limit": 10,
      "order": "by_control_account"
    },
    "id": 1
  }'
```

</div>

### Example 3

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.list_smt_tokens",
    "params": {
      "start": [
        "",
        {
          "nai": "@@422838704",
          "decimals": 0
        }
      ],
      "limit": 10,
      "order": "by_control_account"
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
  "tokens": [
    {
      "token": {
        "id": 0,
        "liquid_symbol": {
          "nai": "@@422838704",
          "decimals": 0
        },
        "control_account": "alice",
        "phase": "setup",
        "current_supply": 0,
        "total_vesting_fund_smt": 0,
        "total_vesting_shares": 0,
        "total_vesting_fund_ballast": 0,
        "total_vesting_shares_ballast": 0,
        "pending_rewarded_vesting_shares": 0,
        "pending_rewarded_vesting_smt": 0,
        "reward_balance": {
          "amount": "0",
          "precision": 3,
          "nai": "@@000000021"
        },
        "recent_claims": "0",
        "last_reward_update": "1970-01-01T00:00:00",
        "last_virtual_emission_time": "1970-01-01T00:00:00",
        "allow_downvotes": true,
        "market_maker": {
          "steem_balance": {
            "amount": "0",
            "precision": 3,
            "nai": "@@000000021"
          },
          "token_balance": {
            "amount": "0",
            "precision": 0,
            "nai": "@@422838704"
          },
          "reserve_ratio": 0
        },
        "allow_voting": true,
        "cashout_window_seconds": 3600,
        "reverse_auction_window_seconds": 900,
        "vote_regeneration_period_seconds": 432000,
        "votes_per_regeneration_period": 50,
        "content_constant": "2000000000000",
        "percent_curation_rewards": 2500,
        "author_reward_curve": "linear",
        "curation_reward_curve": "square_root",
        "max_supply": 0
      }
    }
  ]
}
```

</div>
