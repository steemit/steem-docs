---
title: "database_api.get_version"
description: "블록체인, steem, FC의 컴파일 타임 버전을 반환합니다. 체인 id의 부팅 시점 버전도 함께 반환합니다 (테스트넷 / 메인넷 중 테스트넷을 볼 때에만 컴파일 타임 값과 다를 수 있습니다)"
outline: [2, 3]
---

# database_api.get_version

<p class="api-badges"><span class="badge badge-since">since HF20</span></p>

## Purpose

블록체인, steem, FC의 컴파일 타임 버전을 반환합니다. 체인 id의 부팅 시점 버전도 함께 반환합니다 (테스트넷 / 메인넷 중 테스트넷을 볼 때에만 컴파일 타임 값과 다를 *수* 있습니다)

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
    "method": "database_api.get_version",
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "blockchain_version": "",
  "steem_revision": "",
  "fc_revision": "",
  "chain_id": "0000000000000000000000000000000000000000000000000000000000000000"
}
```

</div>
