---
title: "condenser_api.get_account_bandwidth"
description: "0.20.6부터 비활성화되었습니다. 참조: 3029"
outline: [2, 3]
---

# condenser_api.get_account_bandwidth

<p class="api-badges"><span class="badge badge-disabled">disabled</span> <span class="badge badge-removed">removed</span></p>

<p class="api-detail">Bandwidth was disabled in 0.20.6; public nodes no longer serve this method.</p>

## Purpose

**0.20.6부터 비활성화되었습니다. 참조: [#3029](https://github.com/steemit/steem/issues/3029#issuecomment-428404844)**

계정의 사용 가능한 대역폭(bandwidth)을 반환합니다.  파라미터: `account:string`; `type:string`, 예: `forum` 또는 `market`

| `account` (string) | `type` (string) | |
|--------------------|-----------------|-|
| `"steemit"` | `"forum"` | "steemit"이라는 이름의 계정에 대해 사용 가능한 forum 대역폭을 조회합니다. |
| `"alice"` | `"market"` | "alice"이라는 이름의 계정에 대해 사용 가능한 market 대역폭을 조회합니다. |

참조: Forum/Market Bandwidth

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "steemit",
  "forum"
]
```

</div>

<p class="dead-note">⚠ 이 RPC 메서드는 더 이상 퍼블릭 노드에서 제공되지 않습니다.</p>

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
    "method": "condenser_api.get_account_bandwidth",
    "params": [
      "steemit",
      "forum"
    ],
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
    "method": "condenser_api.get_account_bandwidth",
    "params": [
      "alice",
      "market"
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "id": 8,
  "account": "steemit",
  "type": "forum",
  "average_bandwidth": 214996934,
  "lifetime_bandwidth": "48395000000",
  "last_bandwidth_update": "2018-02-16T03:11:00"
}
```

</div>

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
Could not find method get_account_bandwidth
```

```text
Could not find method get_account_bandwidth
```

</div>
