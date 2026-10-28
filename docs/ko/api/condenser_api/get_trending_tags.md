---
title: "condenser_api.get_trending_tags"
description: "인기(trending) 태그 목록을 반환합니다. 파라미터: start_tag:string; limit:int 최대 100"
outline: [2, 3]
---

# condenser_api.get_trending_tags

## Purpose

인기(trending) 태그 목록을 반환합니다.  파라미터: `start_tag:string`; `limit:int` 최대 100

| `tag` (string) | `limit` (int) | |
|----------------|---------------|-|
| `null` | 100 | 상위 100개 인기 태그를 조회합니다. |
| `"steem"` | 10 | "steem" 이후의 태그를 최대 10개 조회합니다. |

추가 참조: tags_api.get_trending_tags, Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "",
  1
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
    "method": "condenser_api.get_trending_tags",
    "params": [
      null,
      100
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
    "method": "condenser_api.get_trending_tags",
    "params": [
      "steem",
      10
    ],
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
    "name": "",
    "total_payouts": "0.000 SBD",
    "net_votes": 0,
    "top_posts": 0,
    "comments": 0,
    "trending": ""
  }
]
```

</div>
