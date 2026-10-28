---
title: "database_api.get_reward_funds"
description: "현재 보상 펀드(reward fund)에 대한 정보를 반환합니다."
outline: [2, 3]
---

# database_api.get_reward_funds

<p class="api-badges"><span class="badge badge-since">since HF17</span></p>

## Purpose

현재 보상 펀드(reward fund)에 대한 정보를 반환합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{}
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
    "method": "database_api.get_reward_funds",
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "funds": []
}
```

</div>
