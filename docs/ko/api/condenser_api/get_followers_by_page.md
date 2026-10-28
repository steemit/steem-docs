---
title: "condenser_api.get_followers_by_page"
description: "계정의 팔로워를 페이지 단위로 반환합니다. (EOL) 파라미터: account:string; page:int (0부터 시작 — 페이지 0이 첫 페이지이며, 페이지가 하나 늘어날 때마다 page_size행을 건너뜁니다); page_size:int (필수, 최대 100);…"
outline: [2, 3]
---

# condenser_api.get_followers_by_page

## Purpose

계정의 팔로워를 페이지 단위로 반환합니다.  (EOL)  파라미터: `account:string`; `page:int` (0부터 시작 — 페이지 `0`이 첫 페이지이며, 페이지가 하나 늘어날 때마다 `page_size`행을 건너뜁니다); `page_size:int` (필수, 최대 `100`); `follow_type:string` (선택 사항, 예: `blog`, 기본값 `blog`)

**참고:** 행 오프셋은 `page * page_size`입니다. `page_size`는 필수이며, 생략하면 위치 형식이든 이름 형식이든 `-32602`를 반환합니다.

| `account` (string) | `page` (int) | `page_size` (int) | |
|--------------------|--------------|-------------------|-|
| `"steemit"` | `0` | `5` | `steemit`을 팔로우하는 계정 중 첫 페이지(페이지 `0`)를, 페이지당 5개씩 조회합니다. |
| `"alice"` | `1` | `100` | `alice`을 팔로우하는 계정 중 페이지 `1` — 처음 100행을 건너뜀 — 를, 페이지당 100개씩 조회합니다. |

함께 보기: condenser_api.get_followers, follow_api.get_followers_by_page

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "steemit",
  0,
  5
]
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
    "method": "condenser_api.get_followers_by_page",
    "params": [
      "steemit",
      0,
      5
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
[
  {"follower":"etette","following":"steemit","reputation":73.4,"what":["blog",""]},
  {"follower":"victorlives","following":"steemit","reputation":60.17,"what":["blog",""]}
]
Note: response examples are captured at documentation-build time and may drift as chain state changes.
```

</div>
