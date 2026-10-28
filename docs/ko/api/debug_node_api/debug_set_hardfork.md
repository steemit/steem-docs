---
title: "debug_node_api.debug_set_hardfork"
description: "디버그 노드에 정상 일정보다 앞서 하드포크를 적용합니다."
outline: [2, 3]
---

# debug_node_api.debug_set_hardfork

<p class="api-badges"><span class="badge badge-disabled">disabled</span></p>

<p class="api-detail">Defined in the steem source (52dcfabb); the debug_node plugin is not enabled on public nodes.</p>

## Purpose

디버그 노드에 정상 일정보다 앞서 하드포크를 적용합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "hardfork_id": 0
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
    "method": "debug_node_api.debug_set_hardfork",
    "params": {
      "hardfork_id": 0
    },
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{}
```

</div>
