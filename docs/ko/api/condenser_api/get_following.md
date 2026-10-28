---
title: "condenser_api.get_following"
description: "한 계정을 팔로우하는 계정 목록을 반환합니다. 파라미터: account:string; start:string (시작할 계정); type:string 예: blog; limit:int 최대 1000"
outline: [2, 3]
---

# condenser_api.get_following

<p class="api-badges"><span class="badge badge-since">since HF9</span></p>

## Purpose

한 계정을 팔로우하는 계정 목록을 반환합니다.  파라미터: `account:string`; `start:string` (시작할 계정); `type:string` 예: `blog`; `limit:int` 최대 1000

| `account` (string) | `start` (string) | `type` (string) | `limit` (int) | |
|--------------------|------------------|-----------------|---------------|-|
| `"steemit"` | `null` | `"blog"` | `10` | `steemit` 계정의 팔로우를 조회합니다. 최대 10개 결과입니다. |
| `"alice"` | `null` | `"ignore"` | `100` | `alice` 계정의 뮤트를 조회합니다. 최대 100개 결과입니다. |

함께 보기: follow_api.get_following, Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "steemit",
  null,
  "blog",
  10
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
    "method": "condenser_api.get_following",
    "params": [
      "steemit",
      null,
      "blog",
      10
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
    "method": "condenser_api.get_following",
    "params": [
      "alice",
      null,
      "ignore",
      100
    ],
    "id": 1
  }'
```

</div>
