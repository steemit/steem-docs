---
title: "condenser_api.get_conversion_requests"
description: "전환 요청(conversion request) 목록을 반환합니다. 파라미터: id:integer"
outline: [2, 3]
---

# condenser_api.get_conversion_requests

## Purpose

전환 요청(conversion request) 목록을 반환합니다.  파라미터: `id:integer`

| `id` (int) | |
|-------------------|-|
| `1234` | ID가 1234인 전환 요청을 조회합니다. |

추가 참조: database_api.list_sbd_conversion_requests

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[
  0
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
    "method": "condenser_api.get_conversion_requests",
    "params": [
      1234
    ],
    "id": 1
  }'
```

</div>
