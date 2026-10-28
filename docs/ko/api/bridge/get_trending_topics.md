---
title: "bridge.get_trending_topics"
description: "대기 중인 포스트 전반(커뮤니티와 태그가 섞여 있음)에서 상위 인기 (trending) 주제를 반환합니다."
outline: [2, 3]
---

# bridge.get_trending_topics

## Purpose

대기 중인 포스트 전반(커뮤니티와 태그가 섞여 있음)에서 상위 인기 (trending) 주제를 반환합니다.

파라미터: `limit:int` (선택 사항, 기본값 `10`, 최대 `25`); `observer:string` (선택 사항, 아직 사용되지 않음)

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
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
    "method": "bridge.get_trending_topics",
    "params": {
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
  [
    "hive-108451",
    "SteemitCryptoAcademy"
  ],
  [
    "hive-172186",
    "Newcomers' Community"
  ]
]
```

</div>
