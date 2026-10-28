---
title: "database_api.find_proposals"
description: "proposal.id(proposal.proposal_id가 아님)로 프로포절(제안)을 찾습니다."
outline: [2, 3]
---

# database_api.find_proposals

## Purpose

`proposal.id`(`proposal.proposal_id`가 아님)로 프로포절(제안)을 찾습니다.

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "proposal_ids": [
    0
  ]
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
    "method": "database_api.find_proposals",
    "params": {
      "proposal_ids": [
        0
      ]
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
  "proposals": [
    {
      "id": 0,
      "proposal_id": "139925218365120",
      "creator": "alice",
      "receiver": "bob",
      "start_date": "2019-07-01T00:00:00",
      "end_date": "2019-08-01T23:59:59",
      "daily_pay": {
        "amount": "4800000",
        "precision": 3,
        "nai": "@@000000013"
      },
      "subject": "My Proposal",
      "permlink": "creator-proposal-permlink",
      "total_votes": "77351826710",
      "status": "active"
    }
  ]
}
```

</div>
