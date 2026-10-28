---
title: "hive.db_head_state"
description: "상태/헬스 체크: hivemind 데이터베이스의 헤드 블록 번호와 시각, 그리고 헤드 블록의 경과 시간(초)을 반환합니다."
outline: [2, 3]
---

# hive.db_head_state

## Purpose

상태/헬스 체크: hivemind 데이터베이스의 헤드 블록 번호와 시각, 그리고 헤드 블록의 경과 시간(초)을 반환합니다.

파라미터: 없음

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
[]
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
    "method": "hive.db_head_state",
    "params": [],
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "db_head_block": 110820469,
  "db_head_time": "2026-10-28 04:31:42",
  "db_head_age": 8
}
```

</div>
