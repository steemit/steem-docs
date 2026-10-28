---
title: "bridge.get_community_context"
description: "커뮤니티/계정 쌍에 대해, 해당 계정의 역할과 칭호, 구독 여부를 반환합니다."
outline: [2, 3]
---

# bridge.get_community_context

## Purpose

커뮤니티/계정 쌍에 대해, 해당 계정의 역할과 칭호, 구독 여부를 반환합니다.

파라미터: `name:string` (커뮤니티 이름, 예: `hive-123456`); `account:string`

함께 보기: bridge.get_community

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "name": "hive-108451",
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
    "method": "bridge.get_community_context",
    "params": {
      "name": "hive-108451",
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
  "role": "guest",
  "title": "",
  "subscribed": false
}
```

</div>
