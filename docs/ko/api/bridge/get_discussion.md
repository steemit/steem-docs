---
title: "bridge.get_discussion"
description: "author/permlink를 키로 하는 전체 토론 스레드 — 루트 포스트 (게시물)와 그에 달린 답글 전체 — 를 반환합니다. 이는 condenser_api.get_state 중 스레드에 해당하는 부분을 대체하는 hivemind 버전입니다."
outline: [2, 3]
---

# bridge.get_discussion

## Purpose

`author/permlink`를 키로 하는 전체 토론 스레드 — 루트 포스트 (게시물)와 그에 달린 답글 전체 — 를 반환합니다. 이는 `condenser_api.get_state` 중 스레드에 해당하는 부분을 대체하는 hivemind 버전입니다.

파라미터: `author:string`; `permlink:string`

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "author": "steemitblog",
  "permlink": "steemit-update-october-25th-2026-steemit-challenge-season-34-week-10"
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
    "method": "bridge.get_discussion",
    "params": {
      "author": "steemitblog",
      "permlink": "steemit-update-october-25th-2026-steemit-challenge-season-34-week-10"
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
  "steemitblog/steemit-update-october-25th-2026-steemit-challenge-season-34-week-10": {
    "post_id": 114078646,
    "author": "steemitblog",
    "permlink": "steemit-update-october-25th-2026-steemit-challenge-season-34-week-10",
    "category": "steemitchallenge",
    "title": "Steemit Update [October 25th, 2026] : Steemit Challenge Season 34 - Week 10",
    "body": "<div class=\"pull-right\">…</div>",
    "json_metadata": {
      "app": "steemit/0.2",
      "format": "markdown",
      "tags": [
        "steemitchallenge"
      ]
    },
    "created": "2026-10-25T13:56:33",
    "updated": "2026-10-25T13:56:33",
    "depth": 0,
    "children": 15,
    "net_rshares": 33634754934517,
    "is_paidout": false,
    "payout_at": "2026-11-01T13:56:33",
    "payout": 4.272,
    "pending_payout_value": "4.272 SBD",
    "author_payout_value": "0.000 SBD",
    "curator_payout_value": "0.000 SBD",
    "promoted": null,
    "replies": [
      "mireyalongart/tngvrk",
      "tahispadron/tngxr6"
    ],
    "active_votes": [
      {
        "voter": "donatello",
        "rshares": "18175645866"
      }
    ],
    "author_reputation": 77.9,
    "stats": {
      "hide": false,
      "gray": false,
      "total_votes": 179,
      "flag_weight": 0
    },
    "beneficiaries": [
      {
        "account": "null",
        "weight": 10000
      }
    ],
    "max_accepted_payout": "1000000.000 SBD",
    "percent_steem_dollars": 10000,
    "url": "/steemitchallenge/@steemitblog/steemit-update-october-25th-2026-steemit-challenge-season-34-week-10",
    "blacklists": []
  },
  "ahsansharif/tni1ib": {
    "post_id": 114081320,
    "author": "ahsansharif",
    "permlink": "tni1ib",
    "category": "steemitchallenge",
    "title": "RE: Steemit Update [October 25th, 2026] : Steemit Challenge Season 34 - Week 10",
    "body": "For the second challenge, you need to propose questions for Season 35 that do not involve the use of AI.",
    "json_metadata": {
      "app": "steemit/0.2"
    },
    "created": "2026-10-26T05:20:36",
    "updated": "2026-10-26T05:20:36",
    "depth": 2,
    "children": 4,
    "net_rshares": 23171453278013,
    "is_paidout": false,
    "payout_at": "2026-11-02T05:20:36",
    "payout": 2.85,
    "pending_payout_value": "2.850 SBD",
    "author_payout_value": "0.000 SBD",
    "curator_payout_value": "0.000 SBD",
    "promoted": null,
    "replies": [
      "jannat12/tni1mq",
      "steemcurator02/tnin5u"
    ],
    "active_votes": [
      {
        "voter": "steemcurator02",
        "rshares": "22995470216866"
      }
    ],
    "author_reputation": 79.73,
    "stats": {
      "hide": false,
      "gray": false,
      "total_votes": 3,
      "flag_weight": 0
    },
    "beneficiaries": [],
    "max_accepted_payout": "1000000.000 SBD",
    "percent_steem_dollars": 10000,
    "url": "/steemitchallenge/@steemitblog/steemit-update-october-25th-2026-steemit-challenge-season-34-week-10#@ahsansharif/tni1ib",
    "blacklists": []
  }
}
```

</div>
