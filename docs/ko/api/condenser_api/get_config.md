---
title: "condenser_api.get_config"
description: "컴파일 타임 상수에 대한 정보를 반환합니다. 참고: Understanding Configuration Values"
outline: [2, 3]
---

# condenser_api.get_config

## Purpose

컴파일 타임 상수에 대한 정보를 반환합니다.  참고: Understanding Configuration Values

함께 보기: database_api.get_config

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
    "method": "condenser_api.get_config",
    "params": [],
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
