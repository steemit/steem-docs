---
title: Steem DAO
description: The Steem DAO — the on-chain treasury and proposal funding behind the Steem Proposal System.
---

# Steem DAO

The Steem DAO is the on-chain funding mechanism behind the **Steem Proposal System (SPS)**, introduced by Hardfork 21 in August 2019. It consists of a treasury account, `@steem.dao`, and a set of **proposals** — funding requests stored on the blockchain, voted on by stakeholders with their stake, and paid out daily in SBD from the treasury.

Proposals are how the chain funds development and infrastructure work: anyone can create one, stake decides how much support it has, and the treasury pays whichever proposals the stakeholders rank high enough.

## How it works

- **Creation** — a `create_proposal` operation stores a proposal on chain. A proposal has a creator, a **receiver** account (who gets the payouts), a start and end date, a daily pay denominated in SBD, and a subject with a permlink pointing at the discussion post that describes it.
- **Voting** — accounts vote for (or on) proposals with an `update_proposal_votes` operation. Voting power is stake-weighted, like witness voting: each proposal accumulates a `total_votes` figure in VESTS.
- **Daily funding** — each day, active proposals are ranked by `total_votes` and funded in rank order until the day's proposal budget is exhausted. Proposals ranked beyond the budget receive nothing that day.
- **The Return Proposal** — proposal id 0 ("Return Proposal" by @gtg) is a standing convention. It carries an enormous `daily_pay` and is kept voted-up so it drains whatever is left of the day's budget back into the treasury. In practice it acts as the spending ceiling: votes moved between the Return Proposal and working proposals decide how much the DAO actually spends each day.
- **Removal** — a proposal's creator can remove it with a `remove_proposal` operation while it is ongoing; votes can be added or revoked at any time.

## Treasury

The treasury is the `@steem.dao` account. It holds the unspent budget — a share of daily inflation plus whatever the Return Proposal returns — and grows over time when stakeholders vote to spend less than accrues. Current treasury balance: <DaoTreasuryBalance fallback="about 2.59 million SBD (November 2026)" />.

Query it live:

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.get_accounts","params":[["steem.dao"]],"id":1}'
```

## Querying proposals

Fetch specific proposals by id:

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.find_proposals","params":[[0,1,2]],"id":1}'
```

Each proposal object carries `proposal_id`, `creator`, `receiver`, `start_date`, `end_date`, `daily_pay`, `subject`, `permlink`, and `total_votes`. The full list, sorted and filtered by status, is available through `list_proposals`; the individual votes behind `total_votes` are listed by `list_proposal_votes`.

## Lifecycle

A proposal becomes **active** at its `start_date`, stays funded while it remains active and ranks within the daily budget, and turns **expired** at its `end_date`. The earliest proposals date from the system's launch on August 27, 2019 — proposal id 0, the Return Proposal, is still ongoing with an end date of December 31, 2029.

## API reference

| API | Purpose |
|---|---|
| [condenser_api.find_proposals](/api/condenser_api/find_proposals.html) | Fetch proposals by id |
| [condenser_api.list_proposals](/api/condenser_api/list_proposals.html) | List proposals, sorted and filtered by status |
| [condenser_api.list_proposal_votes](/api/condenser_api/list_proposal_votes.html) | List the votes behind `total_votes` |
| [database_api.find_proposals](/api/database_api/find_proposals.html) | Plugin-native variant |
| [database_api.list_proposals](/api/database_api/list_proposals.html) | Plugin-native variant |
| [database_api.list_proposal_votes](/api/database_api/list_proposal_votes.html) | Plugin-native variant |

Creating, voting on, and removing proposals (`create_proposal`, `update_proposal_votes`, `remove_proposal`) are broadcast operations — they need a signed transaction, so they belong to the broadcasting workflows of the client libraries rather than plain RPC calls.
