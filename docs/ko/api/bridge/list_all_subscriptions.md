---
title: "bridge.list_all_subscriptions"
description: "한 계정의 커뮤니티 구독 전체를 나열합니다."
outline: [2, 3]
---

# bridge.list_all_subscriptions

## Purpose

한 계정의 커뮤니티 구독 전체를 나열합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": "alice"
}
```

</div>

## Example

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "bridge.list_all_subscriptions",
    "params": {
      "account": "alice"
    },
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
[
  [
    "hive-123456",
    "Wonderland"
  ],
  [
    "hive-654321",
    "Tulgey Wood"
  ]
]
```

</div>
