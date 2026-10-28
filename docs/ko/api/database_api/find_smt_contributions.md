---
title: "database_api.find_smt_contributions"
description: "SMT 기여(contribution)를 찾습니다. 기여는 ICO 단계에서 SMT에 대한 개별 기여를 추적하는 데 필요합니다."
outline: [2, 3]
---

# database_api.find_smt_contributions

<p class="api-badges"><span class="badge badge-since">since HF23</span> <span class="badge badge-deprecated">deprecated</span></p>

<p class="api-detail">SMT has been abandoned; this RPC method is no longer provided.</p>

## Purpose

SMT 기여(contribution)를 찾습니다.  기여는 ICO 단계에서 SMT에 대한 개별 기여를 추적하는 데 필요합니다.

참조: [Token Units](https://github.com/steemit/smt-whitepaper/blob/master/smt-manual/manual.md#token-units), [Vesting Contributions](https://github.com/steemit/smt-whitepaper/blob/master/smt-manual/manual.md#vesting-contributions)

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "symbol_contributors": []
}
```

</div>

<p class="dead-note">⚠ 이 메서드는 지원 중단(SMT 시대)되었으며 더 이상 퍼블릭 노드에서 제공되지 않습니다.</p>

## Example

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "database_api.find_smt_contributions",
    "params": {
      "symbol_contributors": []
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
  "contributions": [
    {
      "id": 0,
      "symbol": {
        "nai": "@@422838704",
        "decimals": 0
      },
      "contributor": "alice",
      "contribution_id": 0,
      "contribution": {
        "amount": "1000",
        "precision": 3,
        "nai": "@@000000021"
      }
    }
  ]
}
```

</div>
