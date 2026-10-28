---
title: "bridge.normalize_post"
description: "steemd 포스트 객체(condenser_api.get_content가 반환하는 형태)를 받아 bridge-api 정규화 버전을 출력합니다."
outline: [2, 3]
---

# bridge.normalize_post

## Purpose

steemd 포스트 객체(`condenser_api.get_content`가 반환하는 형태)를 받아 bridge-api 정규화 버전을 출력합니다.

파라미터: `post:object` (`condenser_api.get_content`가 반환하는 것과 정확히 동일한, 전체 steemd 포스트 객체. 요소 하나짜리 배열로 감싸서 전달: `params: [{ <post object> }]`)

**참고:** 포스트 객체는 steemd 필드 전체를 담고 있어야 합니다 -- 아래 예시는 가독성을 위해 `body`만 축약되어 있습니다. `params`에 배열로 감싸지 않은 객체를 그대로 전달하면 `-32602`가 반환되고, 불완전한 객체(예: `active_votes` 항목에 `percent`/`reputation`이 없는 경우, 또는 `cashout_time` 같은 정산 필드가 누락된 경우)는 `-32000`을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  {
    "abs_rshares": "11558309371",
    "active": "2026-10-28T05:08:09",
    "active_votes": [
      {
        "percent": 72,
        "reputation": 0,
        "rshares": "11558309371",
        "time": "2026-10-28T05:10:12",
        "voter": "boylikegirl.wit",
        "weight": 2363
      }
    ],
    "allow_curation_rewards": true,
    "allow_replies": true,
    "allow_votes": true,
    "author": "skal",
    "author_reputation": "2312340634759",
    "author_rewards": 0,
    "beneficiaries": [],
    "body": "…",
    "body_length": 0,
    "cashout_time": "2026-11-04T05:08:09",
    "category": "music",
    "children": 0,
    "children_abs_rshares": "11558309371",
    "created": "2026-10-28T05:08:09",
    "curator_payout_value": "0.000 SBD",
    "depth": 0,
    "id": 114260698,
    "json_metadata": "{\"tags\": [\"music\", \"life\", \"iweb3\", \"wherein\", \"steemzzang\", \"krsuccess\"]}",
    "last_payout": "1970-01-01T00:00:00",
    "last_update": "2026-10-28T05:08:09",
    "max_accepted_payout": "1000000.000 SBD",
    "max_cashout_time": "1969-12-31T23:59:59",
    "net_rshares": "11558309371",
    "net_votes": 1,
    "parent_author": "",
    "parent_permlink": "music",
    "pending_payout_value": "0.000 SBD",
    "percent_steem_dollars": 10000,
    "permlink": "skal-post-2026-10-28",
    "promoted": "0.000 STEEM",
    "reblogged_by": [],
    "replies": [],
    "reward_weight": 10000,
    "root_author": "skal",
    "root_permlink": "skal-post-2026-10-28",
    "root_title": "물론입니다! 여행과 관련된 트위터용 짧은 게시물 제목 몇 가지",
    "title": "물론입니다! 여행과 관련된 트위터용 짧은 게시물 제목 몇 가지",
    "total_payout_value": "0.000 SBD",
    "total_pending_payout_value": "0.000 STEEM",
    "total_vote_weight": 5764,
    "url": "/music/@skal/skal-post-2026-10-28",
    "vote_rshares": "11558309371"
  }
]
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
    "method": "bridge.normalize_post",
    "params": [
      {
        "abs_rshares": "11558309371",
        "active": "2026-10-28T05:08:09",
        "active_votes": [
          {
            "percent": 72,
            "reputation": 0,
            "rshares": "11558309371",
            "time": "2026-10-28T05:10:12",
            "voter": "boylikegirl.wit",
            "weight": 2363
          }
        ],
        "allow_curation_rewards": true,
        "allow_replies": true,
        "allow_votes": true,
        "author": "skal",
        "author_reputation": "2312340634759",
        "author_rewards": 0,
        "beneficiaries": [],
        "body": "…",
        "body_length": 0,
        "cashout_time": "2026-11-04T05:08:09",
        "category": "music",
        "children": 0,
        "children_abs_rshares": "11558309371",
        "created": "2026-10-28T05:08:09",
        "curator_payout_value": "0.000 SBD",
        "depth": 0,
        "id": 114260698,
        "json_metadata": "{\"tags\": [\"music\", \"life\", \"iweb3\", \"wherein\", \"steemzzang\", \"krsuccess\"]}",
        "last_payout": "1970-01-01T00:00:00",
        "last_update": "2026-10-28T05:08:09",
        "max_accepted_payout": "1000000.000 SBD",
        "max_cashout_time": "1969-12-31T23:59:59",
        "net_rshares": "11558309371",
        "net_votes": 1,
        "parent_author": "",
        "parent_permlink": "music",
        "pending_payout_value": "0.000 SBD",
        "percent_steem_dollars": 10000,
        "permlink": "skal-post-2026-10-28",
        "promoted": "0.000 STEEM",
        "reblogged_by": [],
        "replies": [],
        "reward_weight": 10000,
        "root_author": "skal",
        "root_permlink": "skal-post-2026-10-28",
        "root_title": "물론입니다! 여행과 관련된 트위터용 짧은 게시물 제목 몇 가지",
        "title": "물론입니다! 여행과 관련된 트위터용 짧은 게시물 제목 몇 가지",
        "total_payout_value": "0.000 SBD",
        "total_pending_payout_value": "0.000 STEEM",
        "total_vote_weight": 5764,
        "url": "/music/@skal/skal-post-2026-10-28",
        "vote_rshares": "11558309371"
      }
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
  "post_id": 114078646,
  "author": "steemitblog",
  "permlink": "steemit-update-october-25th-2026-steemit-challenge-season-34-week-10",
  "category": "steemitchallenge",
  "title": "Steemit Update [October 25th, 2026] : Steemit Challenge Season 34 - Week 10",
  "body": "<div class=\"pull-right\">…</div>",
  "json_metadata": {"app":"steemit/0.2","format":"markdown","tags":["steemitchallenge"]},
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
  "active_votes": [{"voter":"donatello","rshares":"18175645866"}],
  "author_reputation": 77.9,
  "stats": {"hide":false,"gray":false,"total_votes":179,"flag_weight":0},
  "beneficiaries": [{"account":"null","weight":10000}],
  "max_accepted_payout": "1000000.000 SBD",
  "percent_steem_dollars": 10000,
  "url": "/steemitchallenge/@steemitblog/steemit-update-october-25th-2026-steemit-challenge-season-34-week-10",
  "blacklists": []
}
Note: response examples are captured at documentation-build time and may drift as chain state changes.
```

</div>
