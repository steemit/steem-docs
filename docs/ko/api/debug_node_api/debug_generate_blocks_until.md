---
title: "debug_node_api.debug_generate_blocks_until"
description: "지정된 헤드 블록 시각까지 로컬에서 블록을 생성합니다. 블록을 드문드문(sparse) 생성할 수도 있습니다."
outline: [2, 3]
---

# debug_node_api.debug_generate_blocks_until

<p class="api-badges"><span class="badge badge-disabled">disabled</span></p>

<p class="api-detail">Defined in the steem source (52dcfabb); the debug_node plugin is not enabled on public nodes.</p>

## Purpose

지정된 헤드 블록 시각까지 로컬에서 블록을 생성합니다.  블록을 드문드문(sparse) 생성할 수도 있습니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "debug_key": "",
  "head_block_time": "1970-01-01T00:00:00",
  "generate_sparsely": true
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
    "method": "debug_node_api.debug_generate_blocks_until",
    "params": {
      "debug_key": "",
      "head_block_time": "1970-01-01T00:00:00",
      "generate_sparsely": true
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
  "blocks": 0
}
```

</div>
