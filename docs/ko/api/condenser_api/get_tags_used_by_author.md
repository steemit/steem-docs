---
title: "condenser_api.get_tags_used_by_author"
description: "한 저자가 사용한 태그 목록을 반환합니다. 파라미터: author:string"
outline: [2, 3]
---

# condenser_api.get_tags_used_by_author

## Purpose

한 저자가 사용한 태그 목록을 반환합니다.  파라미터: `author:string`

| `account` (string) | |
|--------------------|-|
| `"steemit"` | "steemit"이라는 이름의 계정이 사용한 태그를 조회합니다. |

추가 참조: tags_api.get_tags_used_by_author

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  ""
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
    "method": "condenser_api.get_tags_used_by_author",
    "params": [
      "steemit"
    ],
    "id": 1
  }'
```

</div>
