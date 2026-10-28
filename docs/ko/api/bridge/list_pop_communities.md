---
title: "bridge.list_pop_communities"
description: "새 구독자 수 기준으로 커뮤니티를 나열합니다. 요약 (lite) 형태의 커뮤니티 목록을 반환합니다."
outline: [2, 3]
---

# bridge.list_pop_communities

## Purpose

새 구독자 수 기준으로 커뮤니티를 나열합니다. 요약 (lite) 형태의 커뮤니티 목록을 반환합니다.

파라미터: `limit:int` (선택 사항, 기본값 `25`, 최대 `25`)

참고: 2026-10-28 기준으로, 퍼블릭 노드는 이 호출에 대해 서버 오류를 반환합니다 (배포된 hivemind 빌드는 `cutoff` 쿼리 파라미터를 아예 바인딩하지 않습니다). 아래 응답은 의도된 형태를 보여줍니다.

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
    "method": "bridge.list_pop_communities",
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
    "hive-123456",
    "Wonderland"
  ],
  [
    "hive-654321",
    "Tulgey Wood"
  ]
]
```

</div>
