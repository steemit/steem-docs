---
title: "tags_api.get_discussions_by_feed"
description: "feed 기준 토론 목록을 반환합니다."
outline: [2, 3]
---

# tags_api.get_discussions_by_feed

<p class="api-badges"><span class="badge badge-since">since HF14</span> <span class="badge badge-disabled">disabled</span></p>

<p class="api-detail">Defined in the steem source (52dcfabb) but not served by public nodes.</p>

## Purpose

feed 기준 토론 목록을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "tag": "",
  "limit": 0,
  "filter_tags": [],
  "select_authors": [],
  "select_tags": [],
  "truncate_body": 0
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
    "method": "tags_api.get_discussions_by_feed",
    "params": {
      "tag": "steem",
      "limit": 1
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
    "method": "tags_api.get_discussions_by_feed",
    "params": {
      "tag": "photography",
      "limit": 10,
      "truncate_body": 0
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
