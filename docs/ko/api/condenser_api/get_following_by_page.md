---
title: "condenser_api.get_following_by_page"
description: "페이지 단위로 한 계정이 팔로우하는 계정을 반환합니다. (EOL) 파라미터: account:string; page:int (0부터 시작 -- 페이지 0이 첫 페이지이며, 페이지가 하나씩 늘어날 때마다 page_size행을 건너뜁니다); page_size:int (필수, 최대…"
outline: [2, 3]
---

# condenser_api.get_following_by_page

## Purpose

페이지 단위로 한 계정이 팔로우하는 계정을 반환합니다.  (EOL)  파라미터: `account:string`; `page:int` (0부터 시작 -- 페이지 `0`이 첫 페이지이며, 페이지가 하나씩 늘어날 때마다 `page_size`행을 건너뜁니다); `page_size:int` (필수, 최대 `100`); `follow_type:string` (선택, 예: `blog`, 기본값 `blog`)

**참고:** 행 오프셋은 `page * page_size`입니다. `page_size`는 필수이며, 생략하면 위치 형식과 이름 형식 모두 `-32602`를 반환합니다.

| `account` (string) | `page` (int) | `page_size` (int) | |
|--------------------|--------------|-------------------|-|
| `"steemitblog"` | `0` | `2` | 첫 번째 페이지(페이지 `0`)에 있는 `steemitblog`이 팔로우하는 계정들을 조회합니다. 페이지당 2개. |
| `"alice"` | `1` | `100` | 페이지 `1` -- 앞의 100행을 건너뜁니다 -- 의 `alice`이 팔로우하는 계정들을 조회합니다. 페이지당 100개. |

추가 참조: condenser_api.get_following, follow_api.get_following_by_page

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "steemitblog",
  0,
  2
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
    "method": "condenser_api.get_following_by_page",
    "params": [
      "steemitblog",
      0,
      2
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
  {"follower":"steemitblog","following":"rishabh99946","reputation":74.46,"what":["blog",""]},
  {"follower":"steemitblog","following":"oluwatobiloba","reputation":69.24,"what":["blog",""]}
]
Note: response examples are captured at documentation-build time and may drift as chain state changes.
```

</div>
