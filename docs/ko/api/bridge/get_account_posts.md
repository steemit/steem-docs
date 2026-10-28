---
title: "bridge.get_account_posts"
description: "계정의 포스트 (게시물)를 조회합니다 — 블로그, 피드, 댓글 또는 답글."
outline: [2, 3]
---

# bridge.get_account_posts

## Purpose

계정의 포스트 (게시물)를 조회합니다 — 블로그, 피드, 댓글 또는 답글.

`sort`에 사용할 수 있는 값:
  * `blog`
  * `feed`
  * `posts`
  * `comments`
  * `replies`
  * `payout`

파라미터: `sort:string`; `account:string`; `start_author:string` (선택 사항, 기본값은 빈 값); `start_permlink:string` (선택 사항, 기본값은 빈 값); `limit:int` (선택 사항, 기본값 `20`, 최대 `100`); `observer:string` (선택 사항)

함께 보기: bridge.get_ranked_posts

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "sort": "blog",
  "account": "steemit",
  "limit": 1
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
    "method": "bridge.get_account_posts",
    "params": {
      "sort": "blog",
      "account": "steemit",
      "limit": 1
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
    "post_id": 1,
    "author": "steemit",
    "permlink": "firstpost",
    "category": "meta",
    "title": "Welcome to Steem!",
    "body": "Steemit is a social media platform where anyone can earn STEEM points by posting and liking posts.",
    "json_metadata": {},
    "created": "2016-03-30T18:30:18",
    "updated": "2016-03-30T18:30:18",
    "depth": 0,
    "children": 445,
    "net_rshares": 830053779138,
    "is_paidout": true,
    "payout_at": "2016-08-24T19:59:42",
    "payout": 1.698,
    "pending_payout_value": "0.000 SBD",
    "author_payout_value": "0.942 SBD",
    "curator_payout_value": "0.756 SBD",
    "promoted": null,
    "replies": [],
    "active_votes": [
      {
        "voter": "dantheman",
        "rshares": "375241"
      }
    ],
    "author_reputation": 35.01,
    "stats": {
      "hide": false,
      "gray": false,
      "total_votes": 92,
      "flag_weight": 0
    },
    "beneficiaries": [],
    "max_accepted_payout": "1000000.000 SBD",
    "percent_steem_dollars": 10000,
    "url": "/meta/@steemit/firstpost",
    "blacklists": []
  }
]
```

</div>
