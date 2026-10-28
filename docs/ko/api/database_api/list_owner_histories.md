---
title: "database_api.list_owner_histories"
description: "오너 권한(owner authority) 이력 목록을 반환합니다. 파라미터: start:array, limit:int"
outline: [2, 3]
---

# database_api.list_owner_histories

## Purpose

오너 권한(owner authority) 이력 목록을 반환합니다.  파라미터: `start:array`, `limit:int`

| `start` (array) | `limit` (int) | |
|--------------------|-|-|
| `["steemit", "1970-01-01T00:00:00"]` | 10 | "steemit"이라는 이름의 계정을 "1970-01-01T00:00:00"부터 오너 키 이력을 조회하며, 10개 결과로 제한합니다. |
| `["alice", "1970-01-01T00:00:00"]` | 10 | "alice"이라는 이름의 계정의 오너 키 이력을 조회하며, 10개 결과로 제한합니다. |

추가 참조: Paginated API Methods

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "start": null,
  "limit": 0
}
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
    "method": "database_api.list_owner_histories",
    "params": {
      "start": [
        "steemit",
        "1970-01-01T00:00:00"
      ],
      "limit": 10
    },
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
    "method": "database_api.list_owner_histories",
    "params": {
      "start": [
        "alice",
        "1970-01-01T00:00:00"
      ],
      "limit": 10
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
  "owner_auths": [
    {
      "id": 129742,
      "account": "a-m",
      "previous_owner_authority": {
        "weight_threshold": 1,
        "account_auths": [],
        "key_auths": [
          [
            "STM7J6gXoztfTscNzmzL11DFtTPCFCTeZzsFtFxsQrQw91KnN1YxQ",
            1
          ]
        ]
      },
      "last_valid_time": "2018-11-24T02:35:27"
    }
  ]
}
```

</div>
