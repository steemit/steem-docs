---
title: "condenser_api.get_reward_fund"
description: "현재 보상 펀드 (reward fund)에 대한 정보를 반환합니다."
outline: [2, 3]
---

# condenser_api.get_reward_fund

<p class="api-badges"><span class="badge badge-since">since HF17</span></p>

## Purpose

현재 보상 펀드 (reward fund)에 대한 정보를 반환합니다.

함께 보기: database_api.get_reward_funds

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "post"
]
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
    "method": "condenser_api.get_reward_fund",
    "params": [
      "post"
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
  "id": 0,
  "name": "",
  "reward_balance": "0.000 STEEM",
  "recent_claims": "0",
  "last_update": "1970-01-01T00:00:00",
  "content_constant": "0",
  "percent_curation_rewards": 0,
  "percent_content_rewards": 0,
  "author_reward_curve": "quadratic",
  "curation_reward_curve": "34723648"
}
```

</div>
