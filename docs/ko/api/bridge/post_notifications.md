---
title: "bridge.post_notifications"
description: "특정 포스트의 알림을 조회합니다."
outline: [2, 3]
---

# bridge.post_notifications

## Purpose

특정 포스트의 알림을 조회합니다.

파라미터: `author:string`; `permlink:string`; `min_score:int` (선택 사항, 기본값 `25`); `last_id:int` (선택 사항, 이 알림 id부터 탐색); `limit:int` (선택 사항, 기본값 `100`, 최대 `100`)

참고: 2026-10-28 기준으로, 알림이 있는 포스트에 대해 퍼블릭 노드는 이 호출에서 내부 오류를 반환합니다. 아래 응답은 의도된 형태를 보여줍니다.

함께 보기: bridge.account_notifications

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "author": "steemitblog",
  "permlink": "steemit-update-october-25th-2026-steemit-challenge-season-34-week-10",
  "limit": 2
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
    "method": "bridge.post_notifications",
    "params": {
      "author": "steemitblog",
      "permlink": "steemit-update-october-25th-2026-steemit-challenge-season-34-week-10",
      "limit": 2
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
    "id": 3629306,
    "type": "vote",
    "score": 25,
    "date": "2019-11-20T07:48:06",
    "msg": "@bob voted on your post ($0.013)",
    "url": "@alice/a-post-by-alice"
  }
]
```

</div>
