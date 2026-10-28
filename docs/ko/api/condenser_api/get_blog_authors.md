---
title: "condenser_api.get_blog_authors"
description: "주어진 블로그 계정에서 콘텐츠가 리블로그된 적이 있는 저자 목록을 반환합니다. 파라미터: account:string"
outline: [2, 3]
---

# condenser_api.get_blog_authors

## Purpose

주어진 블로그 계정에서 콘텐츠가 리블로그된 적이 있는 저자 목록을 반환합니다.  파라미터: `account:string`

| `account` (string) | |
|-------------------|-|
| `"steemit"` | "steemit"이라는 이름의 계정을 조회합니다. |
| `"alice"` | alice"이라는 이름의 계정을 조회합니다. |

추가 참조: follow_api.get_blog_authors

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

### Example 1

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.get_blog_authors",
    "params": [
      "steemit"
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
    "method": "condenser_api.get_blog_authors",
    "params": [
      "alice"
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
    "author": "",
    "count": 0
  }
]
```

</div>
