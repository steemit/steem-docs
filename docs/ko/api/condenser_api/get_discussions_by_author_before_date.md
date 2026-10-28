---
title: "condenser_api.get_discussions_by_author_before_date"
description: "저자와 날짜 기준의 토론 목록을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_discussions_by_author_before_date

## Purpose

저자와 날짜 기준의 토론 목록을 반환합니다.

함께 보기: tags_api.get_discussions_by_author_before_date, Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "steemit",
  "firstpost",
  "2016-04-19T22:49:43",
  1
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
    "method": "condenser_api.get_discussions_by_author_before_date",
    "params": [
      "steemit",
      "firstpost",
      "2016-04-19T22:49:43",
      1
    ],
    "id": 1
  }'
```

</div>
