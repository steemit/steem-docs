---
title: "database_api.list_votes"
description: "지정된 투표자 및/또는 저자와 퍼머링크(permlink)부터 모든 투표를 반환합니다. 파라미터: start:array; limit:int; order:string"
outline: [2, 3]
---

# database_api.list_votes

## Purpose

지정된 투표자 및/또는 저자와 퍼머링크(permlink)부터 모든 투표를 반환합니다.  파라미터: `start:array`; `limit:int`; `order:string`

* `start`는 `order`에 따라 달라집니다(아래 참조)
  * `voter`는 선택 사항입니다
  * `author`와 `permlink`는 선택 사항이지만, 하나가 비어 있으면 둘 다 비어 있어야 합니다
* `limit`는 최대 1000입니다.
* `order`는 다음 중 하나입니다:
  * `by_comment_voter` - 댓글 투표자 기준 정렬
    * `start`는 세 선택 값(`author`, `permlink`, `voter`)의 배열
  * `by_voter_comment` - 투표자 댓글 기준 정렬
    * `start`는 세 선택 값(`voter`, `author`, `permlink`)의 배열

| `start` (array) | `limit` (int) | `order` (string) | |
|----------------------------|---------------|-|
| `["", "", ""]` | 10 | `"by_comment_voter"` | 첫 10개 투표를 댓글 투표자 기준 정렬로 조회합니다 |
| `["", "", ""]` | 10 | `"by_voter_comment"` | 첫 10개 투표를 투표자 댓글 기준 정렬로 조회합니다 |
| `["xeroc", "vanteem-config", ""]` | 10 | `"by_comment_voter"` | 포스트 `@xeroc/vanteem-config`부터 다음 10개 투표를 댓글 투표자 기준 정렬로 조회합니다 |
| `["alice", "xeroc", "vanteem-config"]` | 10 | `"by_voter_comment"` | 포스트 `@xeroc/vanteem-config`에서 alice부터 다음 10개 투표를 투표자 댓글 기준 정렬로 조회합니다 |

추가 참조: Paginated API Methods

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
