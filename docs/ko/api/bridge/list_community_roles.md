---
title: "bridge.list_community_roles"
description: "커뮤니티 안의 각 계정에 대한 커뮤니티 역할과 라벨을 나열합니다."
outline: [2, 3]
---

# bridge.list_community_roles

## Purpose

커뮤니티 안의 각 계정에 대한 커뮤니티 역할과 라벨을 나열합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "community": "hive-123456"
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
    "method": "bridge.list_community_roles",
    "params": {
      "community": "hive-123456"
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
    "owner",
    ""
  ],
  [
    "alice",
    "admin",
    "Miss"
  ]
]
```

</div>
