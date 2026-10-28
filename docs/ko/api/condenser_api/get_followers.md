---
title: "condenser_api.get_followers"
description: "계정의 팔로워 목록을 반환합니다. 파라미터: account:string; start:string (시작할 계정); type:string 예: blog; limit:int 최대 1000"
outline: [2, 3]
---

# condenser_api.get_followers

<p class="api-badges"><span class="badge badge-since">since HF9</span> <span class="badge badge-net">testnet: not working — Will not work because this function requires jussi to work correctly which is not available on the testnet</span> <span class="badge badge-net">mainnet: working</span></p>

## Purpose

계정의 팔로워 목록을 반환합니다.  파라미터: `account:string`; `start:string` (시작할 계정); `type:string` 예: `blog`; `limit:int` 최대 1000

| `account` (string) | `start` (string) | `type` (string) | `limit` (int) | |
|--------------------|------------------|-----------------|---------------|-|
| `"steemit"` | `null` | `"blog"` | `10` | `steemit`이라는 이름의 계정의 팔로우를 조회하며, 최대 10개 결과를 반환합니다. |
| `"alice"` | `null` | `"ignore"` | `100` | `alice`이라는 이름의 계정의 뮤트를 조회하며, 최대 100개 결과를 반환합니다. |

추가 참조: follow_api.get_followers, Paginated API Methods

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
    "method": "condenser_api.get_followers",
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
    "method": "condenser_api.get_followers",
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
