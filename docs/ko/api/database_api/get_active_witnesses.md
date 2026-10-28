---
title: "database_api.get_active_witnesses"
description: "활동 중인 위트니스 (witness) 목록을 반환합니다."
outline: [2, 3]
---

# database_api.get_active_witnesses

## Purpose

활동 중인 위트니스 (witness) 목록을 반환합니다.

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
    "method": "database_api.get_active_witnesses",
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "witnesses": [
    "lukestokes.mhth",
    "gtg",
    "ausbitbank",
    "clayop",
    "yabapmatt",
    "curie",
    "thecryptodrive",
    "roelandp",
    "followbtcnews",
    "timcliff",
    "smooth.witness",
    "bhuz",
    "aggroed",
    "blocktrades",
    "cervantes",
    "utopian-io",
    "anyx",
    "jesta",
    "drakos",
    "someguy123",
    "good-karma"
  ]
}
```

</div>
