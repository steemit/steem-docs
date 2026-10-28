---
title: "bridge.get_payout_stats"
description: "트리맵 (treemap)을 만들기 위한 지급 (payout) 통계를 조회합니다: 전체 블로그 지급액에 더해, 상위 커뮤니티마다 하나의 (url, label, payout, posts, authors) 튜플."
outline: [2, 3]
---

# bridge.get_payout_stats

## Purpose

트리맵 (treemap)을 만들기 위한 지급 (payout) 통계를 조회합니다: 전체 블로그 지급액에 더해, 상위 커뮤니티마다 하나의 `(url, label, payout, posts, authors)` 튜플.

파라미터: `limit:int` (선택 사항, 기본값 `250`, 최대 `250`)

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
    "method": "bridge.get_payout_stats",
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
{
  "blogs": 14318.128,
  "total": 39571.85,
  "items": [
    [
      "hive-129948",
      "আমার বাংলা ব্লগ",
      6891.869,
      288,
      70
    ],
    [
      "hive-150122",
      "Steem Alliance",
      2051.709,
      74,
      29
    ]
  ]
}
```

</div>
