---
title: "bridge.unread_notifications"
description: "지정된 계정의 알림 상태를 조회합니다: 마지막으로 읽은 시각과, min_score 이상의 점수를 가진 읽지 않은 알림 수."
outline: [2, 3]
---

# bridge.unread_notifications

## Purpose

지정된 계정의 알림 상태를 조회합니다: 마지막으로 읽은 시각과, `min_score` 이상의 점수를 가진 읽지 않은 알림 수.

파라미터: `account:string`; `min_score:int` (선택 사항, 기본값 `25`)

함께 보기: bridge.account_notifications

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": "steemit"
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
    "method": "bridge.unread_notifications",
    "params": {
      "account": "steemit"
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
  "lastread": "1970-01-01 00:00:00",
  "unread": 11922
}
```

</div>
