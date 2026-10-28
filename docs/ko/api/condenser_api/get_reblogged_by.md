---
title: "condenser_api.get_reblogged_by"
description: "포스트 (게시물)를 리블로그 (reblog)한 저자 목록을 반환합니다. 파라미터: author:string; permlink:string"
outline: [2, 3]
---

# condenser_api.get_reblogged_by

<p class="api-badges"><span class="badge badge-since">since HF14</span></p>

## Purpose

포스트 (게시물)를 리블로그 (reblog)한 저자 목록을 반환합니다.  파라미터: `author:string`; `permlink:string`

| `author` (string) | `permlink` (string) | |
|----------------------------|---------------|-|
| `"steemit"` | `"firstpost"` | 슬러그 (slug)가 `@steemit/firstpost`인 콘텐츠의 리블로그를 조회합니다 |
| `"alice"` | `"a-post-by-alice"` | 슬러그 (slug)가 `@alice/a-post-by-alice`인 콘텐츠의 리블로그를 조회합니다 |

함께 보기: follow_api.get_reblogged_by

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "",
  ""
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
    "method": "condenser_api.get_reblogged_by",
    "params": [
      "steemit",
      "firstpost"
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
    "method": "condenser_api.get_reblogged_by",
    "params": [
      "alice",
      "a-post-by-alice"
    ],
    "id": 1
  }'
```

</div>

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
unknown key:unknown key:
```

</div>
