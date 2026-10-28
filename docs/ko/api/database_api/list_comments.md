---
title: "database_api.list_comments"
description: "지정된 옵션부터 모든 댓글을 반환합니다. 파라미터: start:array; limit:int; order:string"
outline: [2, 3]
---

# database_api.list_comments

## Purpose

지정된 옵션부터 모든 댓글을 반환합니다.  파라미터: `start:array`; `limit:int`; `order:string`

* `start`는 `order`에 따라 달라집니다 (아래 참고)
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_cashout_time` - 정산 시간 (cashout time) 순
    * `start`는 필수 값 하나와 선택 값 두 개로 이루어진 배열입니다: `timestamp`, `author`, `permlink`
  * `by_permlink` - 퍼머링크 (permlink) 순
    * `start`는 선택 값 두 개로 이루어진 배열입니다: `author`, `permlink`
  * `by_root` - 루트 순
    * `start`는 필수 값 두 개와 선택 값 두 개로 이루어진 배열입니다: `root_author`, `root_permlink`, `child_author`, `child_permlink`
  * `by_parent` - 부모 순
    * `start`는 필수 값 두 개와 선택 값 두 개로 이루어진 배열입니다: `parent_author`, `parent_permlink`, `child_author`, `child_permlink`

| `start` (array) | `limit` (int) | `order` (string) | |
|----------------------------|---------------|-|
| `["1970-01-01T00:00:00", "", ""]` | 10 | `"by_cashout_time"` | 처음 10개 댓글을, 정산 시간 순으로 조회합니다 |
| `["", ""]` | 10 | `"by_permlink"` | 처음 10개 댓글을, 퍼머링크 순으로 조회합니다 |
| `["steemit","firstpost", "", ""]` | 10 | `"by_root"` | @steemit/firstpost부터 다음 10개 댓글을, 루트 순으로 조회합니다 |
| `["steemit","firstpost", "", ""]` | 10 | `"by_parent"` | @steemit/firstpost부터 다음 10개 댓글을, 부모 순으로 조회합니다 |

함께 보기: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "start": null,
  "limit": 0,
  "order": "by_name"
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
    "method": "database_api.list_comments",
    "params": {
      "start": [
        "1970-01-01T00:00:00",
        "",
        ""
      ],
      "limit": 10,
      "order": "by_cashout_time"
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
    "method": "database_api.list_comments",
    "params": {
      "start": [
        "",
        ""
      ],
      "limit": 10,
      "order": "by_permlink"
    },
    "id": 1
  }'
```

</div>

### Example 3

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.list_comments",
    "params": {
      "start": [
        "steemit",
        "firstpost",
        "",
        ""
      ],
      "limit": 10,
      "order": "by_root"
    },
    "id": 1
  }'
```

</div>

### Example 4

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.list_comments",
    "params": {
      "start": [
        "steemit",
        "firstpost",
        "",
        ""
      ],
      "limit": 10,
      "order": "by_parent"
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
  "comments": [
    {
      "id": 66710716,
      "author": "libert",
      "permlink": "libert-re-runicar-re-libert-libert-re-runicar-re-libert-libert-re-runicar-ykwyxgj6-20181128t063355338z",
      "category": "steem",
      "parent_author": "runicar",
      "parent_permlink": "re-libert-libert-re-runicar-re-libert-libert-re-runicar-ykwyxgj6-20181128t063100538z",
      "title": "",
      "body": "13\n\nPosted using [Partiko Android](https://steemit.com/@partiko-android)",
      "json_metadata": "{\"app\":\"partiko\"}",
      "last_update": "2018-11-28T06:33:57",
      "created": "2018-11-28T06:33:57",
      "active": "2018-11-28T06:34:30",
      "last_payout": "1970-01-01T00:00:00",
      "depth": 5,
      "children": 1,
      "net_rshares": 0,
      "abs_rshares": 0,
      "vote_rshares": 0,
      "children_abs_rshares": 0,
      "cashout_time": "2018-12-05T06:33:57",
      "max_cashout_time": "1969-12-31T23:59:59",
      "total_vote_weight": 0,
      "reward_weight": 10000,
      "total_payout_value": {
        "amount": "0",
        "precision": 3,
        "nai": "@@000000013"
      },
      "curator_payout_value": {
        "amount": "0",
        "precision": 3,
        "nai": "@@000000013"
      },
      "author_rewards": 0,
      "net_votes": 0,
      "root_author": "runicar",
      "root_permlink": "ykwyxgj6",
      "max_accepted_payout": {
        "amount": "1000000000",
        "precision": 3,
        "nai": "@@000000013"
      },
      "percent_steem_dollars": 10000,
      "allow_replies": true,
      "allow_votes": true,
      "allow_curation_rewards": true,
      "beneficiaries": []
    }
  ]
}
```

</div>
