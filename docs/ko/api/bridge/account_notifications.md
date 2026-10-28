---
title: "bridge.account_notifications"
description: "계정 알림 (notification)입니다."
outline: [2, 3]
---

# bridge.account_notifications

## Purpose

계정 알림 (notification)입니다.

`type`에 사용할 수 있는 값:
  * `new_community` - 새 커뮤니티가 생성됨
  * `set_role` - mod/admin이 계정에 역할을 추가함
  * `set_props` - 커뮤니티 속성이 설정됨
  * `set_label` - 계정에 칭호/배지/라벨이 설정됨
  * `mute_post` - 포스트 (게시물)가 사유와 함께 뮤트(mute)됨
  * `unmute_post` - 포스트가 사유와 함께 뮤트 해제됨
  * `pin_post` - 포스트가 고정됨
  * `unpin_post` - 포스트가 고정 해제됨
  * `flag_post` - 포스트가 회원에 의해 사유와 함께 신고(flag)됨
  * `error` - 해석할 수 없는 오퍼레이션에 대해 개발자에게 피드백을 전달함
  * `subscribe` - 계정이 커뮤니티를 구독함
  * `reply` - 포스트에 답글이 달림
  * `reblog` - 포스트가 리블로그(resteem)됨
  * `follow` - 계정이 다른 계정을 팔로우함
  * `mention` - 저자가 계정을 멘션함
  * `vote` - 투표자가 저자에게 투표함

`score` 값은 알림이 발생한 계정의 랭크를 기준으로 합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": "alice",
  "limit": 100
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
    "method": "bridge.account_notifications",
    "params": {
      "account": "alice",
      "limit": 100
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
