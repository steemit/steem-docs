---
title: "condenser_api.get_account_votes"
description: "한 계정이 행한 모든 투표를 반환합니다. 파라미터: account:string"
outline: [2, 3]
---

# condenser_api.get_account_votes

## Purpose

한 계정이 행한 모든 투표를 반환합니다.  파라미터: `account:string`

| `account` (string) | |
|-------------------|-|
| `"steemit"` | "steemit"의 투표를 조회합니다. |
| `"alice"` | "alice"의 투표를 조회합니다. |

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  ""
]
```

</div>

## Example

### Example 1

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.get_account_votes",
    "params": [
      "steemit"
    ],
    "id": 1
  }'
```

</div>

### Example 2

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "condenser_api.get_account_votes",
    "params": [
      "alice"
    ],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
[
  {
    "authorperm": "",
    "weight": "",
    "rshares": "",
    "percent": null,
    "time": "2016-04-29T22:27:42"
  }
]
```

</div>
