---
title: "tags_api.get_account_votes"
description: "지원되지 않음: hivemind는 이 메서드 이름을 안내용 오류를 반환하기 위한 목적으로만 등록합니다: \"get_account_votes is no longer supported, for details see…"
outline: [2, 3]
---

# tags_api.get_account_votes

## Purpose

**지원되지 않음:** hivemind는 이 메서드 이름을 안내용 오류를 반환하기 위한 목적으로만 등록합니다: "get_account_votes is no longer supported, for details see https://steemit.com/steemit/@steemitdev/additional-public-api-change".

파라미터: `account:string`

추가 참조: condenser_api.get_account_votes

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "account": "steemit"
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
    "method": "tags_api.get_account_votes",
    "params": {
      "account": "steemit"
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
  "error": {
    "code": -32000,
    "message": "Server error",
    "data": "ApiError: get_account_votes is no longer supported, for details see https://steemit.com/steemit/@steemitdev/additional-public-api-change"
  },
  "id": 1,
  "jsonrpc": "2.0"
}
```

</div>
