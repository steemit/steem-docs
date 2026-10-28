---
title: "database_api.list_votes"
description: "지정된 투표자 및/또는 저자와 퍼머링크 (permlink)부터 모든 투표를 반환합니다. 파라미터: start:array; limit:int; order:string"
outline: [2, 3]
---

# database_api.list_votes

## Purpose

지정된 투표자 및/또는 저자와 퍼머링크 (permlink)부터 모든 투표를 반환합니다.  파라미터: `start:array`; `limit:int`; `order:string`

* `start`는 `order`에 따라 달라집니다 (아래 참고)
  * `voter`는 선택 사항입니다
  * `author`와 `permlink`는 선택 사항이지만, 하나가 빈 값이면 둘 다 빈 값이어야 합니다
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나:
  * `by_comment_voter` - 댓글 투표자 순
    * `start`는 선택 값 세 개로 이루어진 배열입니다: `author`, `permlink`, `voter`
  * `by_voter_comment` - 투표자 댓글 순
    * `start`는 선택 값 세 개로 이루어진 배열입니다: `voter`, `author`, `permlink`

| `start` (array) | `limit` (int) | `order` (string) | |
|----------------------------|---------------|-|
| `["", "", ""]` | 10 | `"by_comment_voter"` | 처음 10개 투표를, 댓글 투표자 순으로 조회합니다 |
| `["", "", ""]` | 10 | `"by_voter_comment"` | 처음 10개 투표를, 투표자 댓글 순으로 조회합니다 |
| `["xeroc", "vanteem-config", ""]` | 10 | `"by_comment_voter"` | `@xeroc/vanteem-config` 포스트부터 다음 10개 투표를, 댓글 투표자 순으로 조회합니다 |
| `["alice", "xeroc", "vanteem-config"]` | 10 | `"by_voter_comment"` | `@xeroc/vanteem-config` 포스트의 alice부터 다음 10개 투표를, 투표자 댓글 순으로 조회합니다 |

함께 보기: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "start": [
    "",
    "",
    ""
  ],
  "limit": 10,
  "order": "by_comment_voter"
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
    "method": "database_api.list_votes",
    "params": {
      "start": [
        "",
        "",
        ""
      ],
      "limit": 10,
      "order": "by_comment_voter"
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
    "method": "database_api.list_votes",
    "params": {
      "start": [
        "",
        "",
        ""
      ],
      "limit": 10,
      "order": "by_voter_comment"
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
    "method": "database_api.list_votes",
    "params": {
      "start": [
        "",
        "",
        "steemit"
      ],
      "limit": 10,
      "order": "by_comment_voter"
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
    "method": "database_api.list_votes",
    "params": {
      "start": [
        "alice",
        "xeroc",
        "vanteem-config"
      ],
      "limit": 10,
      "order": "by_voter_comment"
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
  "votes": [
    {
      "id": 9,
      "voter": "dantheman",
      "author": "steemit",
      "permlink": "firstpost",
      "weight": "32866333630",
      "rshares": 375241,
      "vote_percent": 100,
      "last_update": "2016-04-07T19:15:36",
      "num_changes": -1
    }
  ]
}
```

</div>
