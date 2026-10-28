---
title: "condenser_api.find_proposals"
description: "proposal.id 기준으로 프로포절 (제안)을 찾습니다 (proposal.proposal_id가 아님)."
outline: [2, 3]
---

# condenser_api.find_proposals

## Purpose

`proposal.id` 기준으로 프로포절 (제안)을 찾습니다 (`proposal.proposal_id`가 아님).

함께 보기: database_api.find_proposals

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
    "method": "condenser_api.find_proposals",
    "params": [
      [
        0
      ]
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
    "id": 0,
    "proposal_id": "139924505899904",
    "creator": "alice",
    "receiver": "bob",
    "start_date": "2019-07-01T00:00:00",
    "end_date": "2019-08-01T23:59:59",
    "daily_pay": "4800.000 SBD",
    "subject": "My Proposal",
    "permlink": "creator-proposal-permlink",
    "total_votes": "77351826710",
    "status": "active"
  }
]
```

</div>
