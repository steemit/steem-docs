---
title: "database_api.get_nai_pool"
description: "새로 생성할 SMT (스마트 미디어 토큰)에 사용할 수 있는, 숫자 자산 식별자 (NAI, Numeric Asset Identifier) 배열을 반환합니다."
outline: [2, 3]
---

# database_api.get_nai_pool

<p class="api-badges"><span class="badge badge-since">since HF23</span> <span class="badge badge-deprecated">deprecated</span></p>

<p class="api-detail">SMT has been abandoned; this RPC method is no longer provided.</p>

## Purpose

새로 생성할 SMT (스마트 미디어 토큰)에 사용할 수 있는, 숫자 자산 식별자 (NAI, Numeric Asset Identifier) 배열을 반환합니다.

참고: [Numerical Asset Identifiers](https://github.com/steemit/smt-whitepaper/blob/master/smt-manual/manual.md#numerical-asset-identifiers)

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{}
```

</div>

<p class="dead-note">⚠ 이 메서드는 지원 중단(deprecated, SMT 시대)되었으며 더 이상 퍼블릭 노드에서 제공되지 않습니다.</p>

## Example

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.get_nai_pool",
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
  "nai_pool": []
}
```

</div>
