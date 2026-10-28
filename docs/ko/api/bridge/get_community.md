---
title: "bridge.get_community"
description: "커뮤니티 상세 정보를 가져옵니다."
outline: [2, 3]
---

# bridge.get_community

## Purpose

커뮤니티 상세 정보를 가져옵니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "name": "hive-123456",
  "observer": "alice"
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
    "method": "bridge.get_community",
    "params": {
      "name": "hive-123456",
      "observer": "alice"
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
  "id": 1332149,
  "name": "hive-123456",
  "title": "@hive-123456",
  "about": "Wonderland",
  "lang": "en",
  "type_id": 1,
  "is_nsfw": false,
  "subscribers": 0,
  "sum_pending": 0,
  "num_pending": 0,
  "created_at": "2019-10-27 08:28:54",
  "context": {
    "role": "admin",
    "title": "Miss",
    "subscribed": true
  },
  "description": "",
  "flag_text": "",
  "settings": {},
  "team": [
    [
      "hive-123456",
      "owner",
      ""
    ],
    [
      "alice",
      "admin",
      "Miss"
    ]
  ]
}
```

</div>
