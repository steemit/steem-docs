---
title: "bridge.get_post_header"
description: "포스트 (게시물)의 기본 데이터를 가져옵니다: 저자, 퍼머링크 (permlink), 카테고리, 깊이."
outline: [2, 3]
---

# bridge.get_post_header

## Purpose

포스트 (게시물)의 기본 데이터를 가져옵니다: 저자, 퍼머링크 (permlink), 카테고리, 깊이.

파라미터: `author:string`; `permlink:string`

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "author": "steemitblog",
  "permlink": "steemit-update-october-25th-2026-steemit-challenge-season-34-week-10"
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
    "method": "bridge.get_post_header",
    "params": {
      "author": "steemitblog",
      "permlink": "steemit-update-october-25th-2026-steemit-challenge-season-34-week-10"
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
  "author": "steemitblog",
  "category": "steemitchallenge",
  "depth": 0,
  "permlink": "steemit-update-october-25th-2026-steemit-challenge-season-34-week-10"
}
```

</div>
