---
title: "call"
description: "레거시(legacy) 스타일의 call 메서드 요청을 라우팅합니다."
outline: [2, 3]
---

# call

## Purpose

레거시(legacy) 스타일의 `call` 메서드 요청을 라우팅합니다.

파라미터: `api:string` (`condenser_api`만 허용됨); `method:string` (라우팅되는 condenser_api 메서드 중 하나: get_followers, get_following, get_followers_by_page, get_following_by_page, get_follow_count, get_content, get_content_replies, get_trending_tags, get_state, get_discussions_by_trending, get_discussions_by_hot, get_discussions_by_promoted, get_discussions_by_created, get_post_discussions_by_payout, get_comment_discussions_by_payout, get_discussions_by_blog, get_discussions_by_feed, get_discussions_by_comments, get_replies_by_last_update, get_discussions_by_author_before_date, get_blog, get_blog_entries, get_account_votes); `params:array` (라우팅되는 메서드의 파라미터)

그 외의 메서드는 오류를 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "condenser_api",
  "get_follow_count",
  [
    "steemit"
  ]
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
    "method": "call",
    "params": [
      "condenser_api",
      "get_follow_count",
      [
        "steemit"
      ]
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
  "account": "steemit",
  "follower_count": 3550,
  "following_count": 0
}
```

</div>
