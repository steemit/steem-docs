---
title: "bridge.get_profile"
description: "계정/프로필 데이터를 로드합니다: 메타데이터, 평판, 팔로우 통계, 블랙리스트."
outline: [2, 3]
---

# bridge.get_profile

## Purpose

계정/프로필 데이터를 로드합니다: 메타데이터, 평판, 팔로우 통계, 블랙리스트.

파라미터: `account:string`; `observer:string` (선택)

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
    "method": "bridge.get_profile",
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
  "id": 32,
  "name": "steemit",
  "active": "2020-03-27T08:46:24",
  "created": "2016-03-24T17:00:21",
  "post_count": 1,
  "reputation": 35.01,
  "metadata": {
    "profile": {
      "about": "",
      "cover_image": "",
      "location": "",
      "name": "",
      "profile_image": "",
      "website": ""
    }
  },
  "stats": {
    "followers": 3550,
    "following": 0,
    "rank": 1354,
    "sp": 3502
  },
  "blacklists": []
}
```

</div>
