---
title: "database_api.find_smt_tokens"
description: "SMT (스마트 미디어 토큰)를 찾습니다."
outline: [2, 3]
---

# database_api.find_smt_tokens

<p class="api-badges"><span class="badge badge-since">since HF23</span> <span class="badge badge-deprecated">deprecated</span></p>

<p class="api-detail">SMT has been abandoned; this RPC method is no longer provided.</p>

## Purpose

SMT (스마트 미디어 토큰)를 찾습니다.

참고: [Smart Media Tokens (SMTs)](https://github.com/steemit/smt-whitepaper/blob/master/smt-manual/manual.md#smart-media-tokens-smts)

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "symbols": [],
  "ignore_precision": false
}
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
    "method": "database_api.find_smt_tokens",
    "params": {
      "symbols": [],
      "ignore_precision": false
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
  "tokens": []
}
```

</div>
