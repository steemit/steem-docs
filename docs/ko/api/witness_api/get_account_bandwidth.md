---
title: "witness_api.get_account_bandwidth"
description: "0.20.6부터 비활성화되었습니다. 참조: 3029"
outline: [2, 3]
---

# witness_api.get_account_bandwidth

<p class="api-badges"><span class="badge badge-disabled">disabled</span> <span class="badge badge-removed">removed</span></p>

<p class="api-detail">The witness_api namespace is not registered on public nodes.</p>

## Purpose

**0.20.6부터 비활성화되었습니다. 참조: [#3029](https://github.com/steemit/steem/issues/3029#issuecomment-428404844)**

계정의 사용 가능한 대역폭(bandwidth)을 반환합니다.  참조: Forum/Market Bandwidth

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": "",
  "type": "post"
}
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
    "method": "witness_api.get_account_bandwidth",
    "params": {
      "account": "steemit",
      "type": "forum"
    },
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
    "method": "witness_api.get_account_bandwidth",
    "params": {
      "account": "alice",
      "type": "market"
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

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
Could not find API witness_api
```

```text
Could not find API witness_api
```

</div>
