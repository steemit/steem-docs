---
title: "follow_api.get_blog_authors"
description: "주어진 블로그 계정에서 콘텐츠가 리블로그된 적이 있는 저자 목록을 반환합니다."
outline: [2, 3]
---

# follow_api.get_blog_authors

<p class="api-badges"><span class="badge badge-disabled">disabled</span></p>

<p class="api-detail">Defined in the steem source (52dcfabb) but not served by public nodes.</p>

## Purpose

주어진 블로그 계정에서 콘텐츠가 리블로그된 적이 있는 저자 목록을 반환합니다.

추가 참조: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "blog_account": ""
}
```

</div>

<p class="dead-note">⚠ steem 소스 코드에 정의되어 있지만, 퍼블릭 노드에서는 활성화되지 않았습니다.</p>

## Example

### Example 1

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "follow_api.get_blog_authors",
    "params": {
      "blog_account": "steemit"
    },
    "id": 1
  }'
```

</div>

### Example 2

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "follow_api.get_blog_authors",
    "params": {
      "blog_account": "alice"
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
  "blog_authors": []
}
```

</div>
