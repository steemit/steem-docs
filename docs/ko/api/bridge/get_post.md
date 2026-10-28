---
title: "bridge.get_post"
description: "포스트 하나를 가져옵니다."
outline: [2, 3]
---

# bridge.get_post

## Purpose

포스트 하나를 가져옵니다.

파라미터: `author:string`; `permlink:string`; `observer:string` (선택 사항)

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
    "method": "bridge.get_post",
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
  "replies": [],
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
}
```

</div>
