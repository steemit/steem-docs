---
title: "debug_node_api.debug_get_hardfork_property_object"
description: "하드포크 속성 객체를 반환하며, 디버그 노드 (debug node)에 적용된 하드포크를 알려줍니다."
outline: [2, 3]
---

# debug_node_api.debug_get_hardfork_property_object

<p class="api-badges"><span class="badge badge-disabled">disabled</span></p>

<p class="api-detail">Defined in the steem source (52dcfabb); the debug_node plugin is not enabled on public nodes.</p>

## Purpose

하드포크 속성 객체를 반환하며, 디버그 노드 (debug node)에 적용된 하드포크를 알려줍니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{}
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
    "method": "debug_node_api.debug_get_hardfork_property_object",
    "params": {},
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "id": 0,
  "processed_hardforks": [],
  "last_hardfork": 0,
  "current_hardfork_version": "0.0.0",
  "next_hardfork": "0.0.0",
  "next_hardfork_time": "1970-01-01T00:00:00"
}
```

</div>
