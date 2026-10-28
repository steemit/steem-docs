---
title: "condenser_api.get_replies_by_last_update"
description: "마지막 업데이트 기준의 답글 목록을 반환합니다. start_parent_author:string, start_permlink:string, limit:int 최대 100"
outline: [2, 3]
---

# condenser_api.get_replies_by_last_update

## Purpose

마지막 업데이트 기준의 답글 목록을 반환합니다.  `start_parent_author:string`, `start_permlink:string`, `limit:int` 최대 100

함께 보기: tags_api.get_replies_by_last_update, Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "steemit",
  "firstpost",
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
    "method": "condenser_api.get_replies_by_last_update",
    "params": [
      "steemit",
      "firstpost",
      1
    ],
    "id": 1
  }'
```

</div>
