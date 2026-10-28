---
title: "tags_api.get_discussions_by_author_before_date"
description: "author before date 기준 토론 목록을 반환합니다."
outline: [2, 3]
---

# tags_api.get_discussions_by_author_before_date

## Purpose

author before date 기준 토론 목록을 반환합니다.

추가 참조: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "author": "steemit",
  "start_permlink": "firstpost",
  "before_date": "2016-04-19T22:49:43",
  "limit": 1
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
    "method": "tags_api.get_discussions_by_author_before_date",
    "params": {
      "author": "steemit",
      "start_permlink": "firstpost",
      "before_date": "2016-04-19T22:49:43",
      "limit": 1
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
  "discussions": []
}
```

</div>
