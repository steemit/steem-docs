---
title: "condenser_api.get_follow_count"
description: "계정의 팔로워(follower)/팔로잉(following) 수를 반환합니다. 파라미터: account:string"
outline: [2, 3]
---

# condenser_api.get_follow_count

<p class="api-badges"><span class="badge badge-since">since HF9</span></p>

## Purpose

계정의 팔로워(follower)/팔로잉(following) 수를 반환합니다.  파라미터: `account:string`

| `account` (string) | |
|-------------------|-|
| `"steemit"` | `steemit`이라는 이름의 계정을 조회합니다. |
| `"alice"` | `alice`이라는 이름의 계정을 조회합니다. |

추가 참조: follow_api.get_follow_count

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "steemit"
]
```

</div>

## Example

### Example 1

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.get_follow_count",
    "params": [
      "steemit"
    ],
    "id": 1
  }'
```

</div>

### Example 2

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.get_follow_count",
    "params": [
      "alice"
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "account": "",
  "follower_count": 0,
  "following_count": 0
}
```

</div>
