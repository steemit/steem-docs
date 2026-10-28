---
title: "tags_api.get_replies_by_last_update"
description: "마지막 업데이트 기준 답글 목록을 반환합니다."
outline: [2, 3]
---

# tags_api.get_replies_by_last_update

<p class="api-badges"><span class="badge badge-disabled">disabled</span></p>

<p class="api-detail">Defined in the steem source (52dcfabb) but not served by public nodes.</p>

## Purpose

마지막 업데이트 기준 답글 목록을 반환합니다.

추가 참조: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "start_parent_author": "",
  "start_permlink": "",
  "limit": 100
}
```

</div>

<p class="dead-note">⚠ steem 소스 코드에 정의되어 있지만, 퍼블릭 노드에서는 활성화되지 않았습니다.</p>

## Example

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "tags_api.get_replies_by_last_update",
    "params": {
      "start_parent_author": "steemit",
      "start_permlink": "firstpost",
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
