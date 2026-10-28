---
title: "condenser_api.get_active_votes"
description: "주어진 포스트 (게시물)에 대한 모든 투표를 반환합니다. 파라미터: author:string; permlink:string"
outline: [2, 3]
---

# condenser_api.get_active_votes

## Purpose

주어진 포스트 (게시물)에 대한 모든 투표를 반환합니다.  파라미터: `author:string`; `permlink:string`

| `author` (string) | `permlink` (string) | |
|----------------------------|---------------|-|
| `"steemit"` | `"firstpost"` | 슬러그 (slug)가 `@steemit/firstpost`인 콘텐츠의 투표를 조회합니다 |
| `"alice"` | `"a-post-by-alice"` | 슬러그 (slug)가 `@alice/a-post-by-alice`인 콘텐츠의 투표를 조회합니다 |

함께 보기: tags_api.get_active_votes

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
    "method": "condenser_api.get_active_votes",
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
    "method": "condenser_api.get_active_votes",
    "params": [
      "alice",
      "a-post-by-alice"
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
  {
    "voter": "",
    "weight": "",
    "rshares": 0,
    "percent": 0,
    "reputation": "",
    "time": "1970-01-01T00:00:00"
  }
]
```

</div>

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
unknown key:unknown key
```

</div>
