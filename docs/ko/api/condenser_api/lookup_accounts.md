---
title: "condenser_api.lookup_accounts"
description: "이름이 지정한 접두사로 시작하는 계정을 조회합니다. 파라미터lower_bound_name:string; limit:int 최대 1000"
outline: [2, 3]
---

# condenser_api.lookup_accounts

## Purpose

이름이 지정한 접두사로 시작하는 계정을 조회합니다.  파라미터`lower_bound_name:string`; `limit:int` 최대 1000

| `lower_bound_name` (string) | `limit` (int) | |
|--------------------|---------------|-|
| `"a"` | 10 | "a"로 시작하는 계정을 최대 10개 조회합니다.

함께 보기: database_api.list_accounts

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  "",
  1
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
    "method": "condenser_api.lookup_accounts",
    "params": [
      "a",
      10
    ],
    "id": 1
  }'
```

</div>
