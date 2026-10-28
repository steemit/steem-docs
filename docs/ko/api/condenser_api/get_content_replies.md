---
title: "condenser_api.get_content_replies"
description: "답글 목록을 반환합니다. 파라미터: author:string; permlink:string"
outline: [2, 3]
---

# condenser_api.get_content_replies

## Purpose

답글 목록을 반환합니다.  파라미터: `author:string`; `permlink:string`


| `author` (string) | `permlink` (string) | |
|----------------------------|---------------|-|
| `"steemit"` | `"firstpost"` | 슬러그 (slug)가 `@steemit/firstpost`인 콘텐츠의 답글을 조회합니다 |
| `"alice"` | `"a-post-by-alice"` | 슬러그 (slug)가 `@alice/a-post-by-alice`인 콘텐츠의 답글을 조회합니다 |

함께 보기: tags_api.get_content_replies

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "",
  ""
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
    "method": "condenser_api.get_content_replies",
    "params": [
      "steemit",
      "firstpost"
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
    "method": "condenser_api.get_content_replies",
    "params": [
      "alice",
      "a-post-by-alice"
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
  "total_payout_value": "0.000 STEEM",
  "curator_payout_value": "0.000 STEEM",
  "author_rewards": 0,
  "net_votes": 0,
  "root_author": "",
  "root_permlink": "",
  "max_accepted_payout": "0.000 STEEM",
  "percent_steem_dollars": 0,
  "allow_replies": false,
  "allow_votes": false,
  "allow_curation_rewards": false,
  "beneficiaries": [],
  "url": "",
  "root_title": "",
  "pending_payout_value": "0.000 STEEM",
  "total_pending_payout_value": "0.000 STEEM",
  "active_votes": [],
  "replies": [],
  "author_reputation": 0,
  "promoted": "0.000 STEEM",
  "body_length": 0,
  "reblogged_by": []
}
```

</div>
