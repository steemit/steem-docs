---
title: "bridge.list_subscribers"
description: "커뮤니티의 구독자(최대 250명, 최신 항목 우선)를 name/role/title/created_at 튜플 형태로 나열합니다."
outline: [2, 3]
---

# bridge.list_subscribers

## Purpose

커뮤니티의 구독자(최대 250명, 최신 항목 우선)를 `name`/`role`/`title`/`created_at` 튜플 형태로 나열합니다.

파라미터: `community:string` (예: `hive-123456`)

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "community": "hive-108451"
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
    "method": "bridge.list_subscribers",
    "params": {
      "community": "hive-108451"
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
    "obizone45",
    "guest",
    null,
    "2026-10-20 16:09:09"
  ],
  [
    "hamzax",
    "guest",
    null,
    "2026-10-17 01:23:36"
  ]
]
```

</div>
