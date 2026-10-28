---
title: "tags_api.get_discussion"
description: "저자와 퍼머링크(permlink)가 주어지면 해당 토론을 반환합니다."
outline: [2, 3]
---

# tags_api.get_discussion

## Purpose

저자와 퍼머링크(permlink)가 주어지면 해당 토론을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "author": "steemit",
  "permlink": "firstpost"
}
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
    "method": "tags_api.get_discussion",
    "params": {
      "author": "steemit",
      "permlink": "firstpost"
    },
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
    "method": "tags_api.get_discussion",
    "params": {
      "author": "alice",
      "permlink": "a-post-by-alice"
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
  "id": 0,
  "author": "",
  "permlink": "",
  "category": "",
  "parent_author": "",
  "parent_permlink": "",
  "title": "",
  "body": "",
  "json_metadata": "",
  "last_update": "1970-01-01T00:00:00",
  "created": "1970-01-01T00:00:00",
  "active": "1970-01-01T00:00:00",
  "last_payout": "1970-01-01T00:00:00",
  "depth": 0,
  "children": 0,
  "net_rshares": 0,
  "abs_rshares": 0,
  "vote_rshares": 0,
  "children_abs_rshares": 0,
  "cashout_time": "1970-01-01T00:00:00",
  "max_cashout_time": "1970-01-01T00:00:00",
  "total_vote_weight": 0,
  "reward_weight": 0,
  "total_payout_value": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000021"
  },
  "curator_payout_value": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000021"
  },
  "author_rewards": 0,
  "net_votes": 0,
  "root_author": "",
  "root_permlink": "",
  "max_accepted_payout": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000021"
  },
  "percent_steem_dollars": 0,
  "allow_replies": false,
  "allow_votes": false,
  "allow_curation_rewards": false,
  "beneficiaries": [],
  "url": "",
  "root_title": "",
  "pending_payout_value": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000021"
  },
  "total_pending_payout_value": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000021"
  },
  "active_votes": [],
  "replies": [],
  "author_reputation": 0,
  "promoted": {
    "amount": "0",
    "precision": 3,
    "nai": "@@000000013"
  },
  "body_length": 0,
  "reblogged_by": []
}
```

</div>
