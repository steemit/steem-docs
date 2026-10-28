---
title: "witness_api.get_reserve_ratio"
description: "0.20.6부터 비활성화됨(disabled), 참고: 3029"
outline: [2, 3]
---

# witness_api.get_reserve_ratio

<p class="api-badges"><span class="badge badge-disabled">disabled</span> <span class="badge badge-removed">removed</span></p>

<p class="api-detail">The witness_api namespace is not registered on public nodes.</p>

## Purpose

**0.20.6부터 비활성화됨(disabled), 참고: [#3029](https://github.com/steemit/steem/issues/3029#issuecomment-428404844)**

현재 준비비율 (reserve ratio)을 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{}
```

</div>

<p class="dead-note">⚠ 이 RPC 메서드는 더 이상 퍼블릭 노드에서 제공되지 않습니다.</p>

## Example

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "witness_api.get_reserve_ratio",
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
  "average_block_size": 0,
  "current_reserve_ratio": 1,
  "max_virtual_bandwidth": "0"
}
```

</div>
