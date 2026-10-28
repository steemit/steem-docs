---
title: "bridge.account_notifications"
description: "계정 알림(notification)입니다."
outline: [2, 3]
---

# bridge.account_notifications

## Purpose

계정 알림(notification)입니다.

`type`에 지원되는 값:
  * `new_community` - 새 커뮤니티가 생성되었습니다
  * `set_role` - 모더레이터/관리자가 계정에 역할을 추가합니다
  * `set_props` - 커뮤니티 속성이 설정됩니다
  * `set_label` - 계정에 칭호/배지/라벨이 설정됩니다
  * `mute_post` - 포스트가 사유와 함께 뮤트되었습니다
  * `unmute_post` - 포스트가 사유와 함께 뮤트 해제되었습니다
  * `pin_post` - 포스트가 고정되었습니다
  * `unpin_post` - 포스트의 고정이 해제되었습니다
  * `flag_post` - 포스트가 멤버에 의해 사유와 함께 신고되었습니다
  * `error` - 해석할 수 없는 오퍼레이션에 대해 개발자에게 피드백을 제공합니다
  * `subscribe` - 계정이 커뮤니티를 구독했습니다
  * `reply` - 포스트에 답글이 달렸습니다
  * `reblog` - 포스트가 리블로그되거나 리스팀(resteem)되었습니다
  * `follow` - 계정이 다른 계정을 팔로우했습니다
  * `mention` - 저자가 계정을 멘션했습니다
  * `vote` - 투표자가 저자에게 투표했습니다

`score` 값은 발신 계정의 랭크를 기준으로 합니다.

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
