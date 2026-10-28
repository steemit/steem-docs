---
title: "bridge.get_ranked_posts"
description: "랭킹이 매겨진 포스트를 조회합니다."
outline: [2, 3]
---

# bridge.get_ranked_posts

## Purpose

랭킹이 매겨진 포스트를 조회합니다.

`sort`에 사용할 수 있는 값:
  * `trending`
  * `hot`
  * `created`
  * `promoted`
  * `payout`
  * `payout_comments`
  * `muted`
  
`tag` 값에는 유효한 모든 태그를 사용할 수 있습니다.

`observer` 값에는 유효한 모든 계정 또는 빈 문자열을 사용할 수 있습니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "sort": "trending",
  "tag": "",
  "observer": "alice"
}
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
    "method": "bridge.get_ranked_posts",
    "params": {
      "sort": "trending",
      "tag": "",
      "observer": "alice"
    },
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
    "post_id": 12345678,
    "author": "alice",
    "permlink": "that-march-hare",
    "category": "wonderland",
    "title": "That March Hare",
    "body": "I think he went mad.",
    "json_metadata": {
      "tags": [
        "wonderland"
      ],
      "app": "steemit/0.2"
    },
    "created": "2019-12-05T16:29:12",
    "updated": "2019-12-05T16:29:12",
    "depth": 0,
    "children": 0,
    "net_rshares": 1539574839484,
    "is_paidout": false,
    "payout_at": "2019-12-12T16:29:12",
    "payout": 0.286,
    "pending_payout_value": "0.286 SBD",
    "author_payout_value": "0.000 SBD",
    "curator_payout_value": "0.000 SBD",
    "promoted": "0.000 SBD",
    "replies": [],
    "active_votes": [
      {
        "voter": "bob",
        "rshares": "67759296290"
      }
    ],
    "author_reputation": 47.15,
    "stats": {
      "hide": false,
      "gray": false,
      "total_votes": 12,
      "flag_weight": 0
    },
    "beneficiaries": [],
    "max_accepted_payout": "1000000.000 SBD",
    "percent_steem_dollars": 10000,
    "url": "/wonderland/@alice/that-march-hare",
    "blacklists": []
  }
]
```

</div>
