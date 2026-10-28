---
title: "rewards_api.simulate_curve_payouts"
description: "지급 곡선 (payout curve)에 대한 보상 펀드 (reward fund) 지급을, 실제로 적용하지 않고 시뮬레이션합니다."
outline: [2, 3]
---

# rewards_api.simulate_curve_payouts

<p class="api-badges"><span class="badge badge-disabled">disabled</span></p>

<p class="api-detail">Defined in the steem source (52dcfabb) but not served by public nodes.</p>

## Purpose

지급 곡선 (payout curve)에 대한 보상 펀드 (reward fund) 지급을, 실제로 적용하지 않고 시뮬레이션합니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "curve": "quadratic",
  "var1": "2000000000000"
}
```

</div>

<p class="dead-note">⚠ steem 소스 코드에 정의되어 있지만, 퍼블릭 노드에서는 활성화되지 않았습니다.</p>

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
    "method": "rewards_api.simulate_curve_payouts",
    "params": {
      "curve": "quadratic",
      "var1": "2000000000000"
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
    "method": "rewards_api.simulate_curve_payouts",
    "params": {
      "curve": "bounded_curation",
      "var1": "2000000000000"
    },
    "id": 1
  }'
```

</div>

### Example 3

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "rewards_api.simulate_curve_payouts",
    "params": {
      "curve": "linear",
      "var1": "2000000000000"
    },
    "id": 1
  }'
```

</div>

### Example 4

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "rewards_api.simulate_curve_payouts",
    "params": {
      "curve": "square_root",
      "var1": "2000000000000"
    },
    "id": 1
  }'
```

</div>

### Example 5

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "rewards_api.simulate_curve_payouts",
    "params": {
      "curve": "convergent_linear",
      "var1": "2000000000000"
    },
    "id": 1
  }'
```

</div>

### Example 6

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
# NOTE: this method is no longer served by public nodes
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "rewards_api.simulate_curve_payouts",
    "params": {
      "curve": "convergent_square_root",
      "var1": "2000000000000"
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
  "recent_claims": "",
  "payouts": []
}
```

</div>
