---
title: "condenser_api.get_post_discussions_by_payout"
description: "지급 (payout) 기준의 포스트 (게시물) 토론 목록을 반환합니다."
outline: [2, 3]
---

# condenser_api.get_post_discussions_by_payout

<p class="api-badges"><span class="badge badge-since">since HF17</span></p>

## Purpose

지급 (payout) 기준의 포스트 (게시물) 토론 목록을 반환합니다.

함께 보기: tags_api.get_post_discussions_by_payout

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  {
    "tag": "steem",
    "limit": 1
  }
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
    "method": "condenser_api.get_post_discussions_by_payout",
    "params": [
      {
        "tag": "steem",
        "limit": 1
      }
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
    "method": "condenser_api.get_post_discussions_by_payout",
    "params": [
      {
        "tag": "photography",
        "limit": 10,
        "truncate_body": 0
      }
    ],
    "id": 1
  }'
```

</div>
