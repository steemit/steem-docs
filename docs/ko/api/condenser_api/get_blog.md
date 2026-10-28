---
title: "condenser_api.get_blog"
description: "계정의 블로그 항목 목록을 반환합니다. 파라미터: account:string; start_entry_id:int; limit:int 최대 500"
outline: [2, 3]
---

# condenser_api.get_blog

## Purpose

계정의 블로그 항목 목록을 반환합니다.  파라미터: `account:string`; `start_entry_id:int`; `limit:int` 최대 500

| `account` (string) | `start_entry_id` (int) | `limit` (int) | |
|-------------------|------------------------|---------------|-|
| "steemit" | `0` | `1` | "steemit"이라는 이름의 계정의 블로그를 조회하며, 최대 하나의 결과를 반환합니다. |
| "alice" | `0` | `50` | "alice"이라는 이름의 계정의 블로그를 조회하며, 최대 50개 결과를 반환합니다. |

추가 참조: follow_api.get_blog, Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "steemit",
  0,
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
    "method": "condenser_api.get_blog",
    "params": [
      "steemit",
      0,
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
    "method": "condenser_api.get_blog",
    "params": [
      "alice",
      0,
      50
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
    "comment": {
      "id": 0,
      "author": "steemit",
      "permlink": "firstpost",
      "category": "meta",
      "parent_author": "",
      "parent_permlink": "meta",
      "title": "Welcome to Steem!",
      "body": "Steemit is a social media platform where anyone can earn STEEM points by posting. The more people who like a post, the more STEEM the poster earns. Anyone can sell their STEEM for cash or vest it to boost their voting power.",
      "json_metadata": "",
      "last_update": "2016-03-30T18:30:18",
      "created": "2016-03-30T18:30:18",
      "active": "2018-04-09T12:00:42",
      "last_payout": "2016-08-24T19:59:42",
      "depth": 0,
      "children": 336,
      "net_rshares": 0,
      "abs_rshares": 0,
      "vote_rshares": 0,
      "children_abs_rshares": "26169324897669",
      "cashout_time": "1969-12-31T23:59:59",
      "max_cashout_time": "1969-12-31T23:59:59",
      "total_vote_weight": 0,
      "reward_weight": 10000,
      "total_payout_value": {
        "amount": "942",
        "precision": 3,
        "nai": "@@000000013"
      },
      "curator_payout_value": {
        "amount": "756",
        "precision": 3,
        "nai": "@@000000013"
      },
      "author_rewards": 3548,
      "net_votes": 90,
      "root_author": "steemit",
      "root_permlink": "firstpost",
      "max_accepted_payout": {
        "amount": "1000000000",
        "pecision": 3,
        "nai": "@@000000013"
      },
      "percent_steem_dollars": 10000,
      "allow_replies": true,
      "allow_votes": true,
      "allow_curation_rewards": true,
      "beneficiaries": []
    },
    "blog": "steemit",
    "reblog_on": "1970-01-01T00:00:00",
    "entry_id": 0
  }
]
```

</div>
