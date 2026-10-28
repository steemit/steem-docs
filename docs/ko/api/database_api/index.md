---
title: "Database API"
description: "Used to query information about accounts, transactions, and blockchain data."
outline: [2, 3]
---

# Database API

Used to query information about accounts, transactions, and blockchain data.



To enable this API for `steemd`, the following is required in `config.ini`
by specifying:

```ini
plugin = database_api
```

**These AppBase API methods are still under development and subject to
change.**

> 이것은 한국어 인덱스 페이지입니다: 메서드 페이지는 아직 한국어로 번역되지 않았습니다 — 표의 모든 링크는 영어 메서드 페이지로 연결됩니다.

## 메서드 (57)

| 메서드 | 도입 버전 | 상태 |
| --- | --- | --- |
| [find_account_recovery_requests](/api/database_api/find_account_recovery_requests.html) | HF11 |  |
| [find_accounts](/api/database_api/find_accounts.html) |  |  |
| [find_change_recovery_account_requests](/api/database_api/find_change_recovery_account_requests.html) | HF11 |  |
| [find_comments](/api/database_api/find_comments.html) |  |  |
| [find_decline_voting_rights_requests](/api/database_api/find_decline_voting_rights_requests.html) | HF14 |  |
| [find_escrows](/api/database_api/find_escrows.html) | HF14 |  |
| [find_limit_orders](/api/database_api/find_limit_orders.html) |  |  |
| [find_owner_histories](/api/database_api/find_owner_histories.html) |  |  |
| [find_savings_withdrawals](/api/database_api/find_savings_withdrawals.html) | HF14 |  |
| [find_sbd_conversion_requests](/api/database_api/find_sbd_conversion_requests.html) |  |  |
| [find_vesting_delegation_expirations](/api/database_api/find_vesting_delegation_expirations.html) | HF17 |  |
| [find_vesting_delegations](/api/database_api/find_vesting_delegations.html) | HF17 |  |
| [find_votes](/api/database_api/find_votes.html) |  |  |
| [find_withdraw_vesting_routes](/api/database_api/find_withdraw_vesting_routes.html) |  |  |
| [find_witnesses](/api/database_api/find_witnesses.html) |  |  |
| [get_active_witnesses](/api/database_api/get_active_witnesses.html) |  |  |
| [get_config](/api/database_api/get_config.html) |  |  |
| [get_current_price_feed](/api/database_api/get_current_price_feed.html) |  |  |
| [get_dynamic_global_properties](/api/database_api/get_dynamic_global_properties.html) |  |  |
| [get_feed_history](/api/database_api/get_feed_history.html) |  |  |
| [get_hardfork_properties](/api/database_api/get_hardfork_properties.html) |  |  |
| [get_order_book](/api/database_api/get_order_book.html) |  |  |
| [get_potential_signatures](/api/database_api/get_potential_signatures.html) |  |  |
| [get_required_signatures](/api/database_api/get_required_signatures.html) |  |  |
| [get_reward_funds](/api/database_api/get_reward_funds.html) | HF17 |  |
| [get_transaction_hex](/api/database_api/get_transaction_hex.html) |  |  |
| [get_version](/api/database_api/get_version.html) | HF20 |  |
| [get_witness_schedule](/api/database_api/get_witness_schedule.html) |  |  |
| [list_account_recovery_requests](/api/database_api/list_account_recovery_requests.html) | HF11 |  |
| [list_accounts](/api/database_api/list_accounts.html) |  |  |
| [list_change_recovery_account_requests](/api/database_api/list_change_recovery_account_requests.html) | HF11 |  |
| [list_comments](/api/database_api/list_comments.html) |  |  |
| [list_decline_voting_rights_requests](/api/database_api/list_decline_voting_rights_requests.html) | HF14 |  |
| [list_escrows](/api/database_api/list_escrows.html) | HF14 |  |
| [list_limit_orders](/api/database_api/list_limit_orders.html) |  |  |
| [list_owner_histories](/api/database_api/list_owner_histories.html) |  |  |
| [list_savings_withdrawals](/api/database_api/list_savings_withdrawals.html) | HF14 |  |
| [list_sbd_conversion_requests](/api/database_api/list_sbd_conversion_requests.html) |  |  |
| [list_vesting_delegation_expirations](/api/database_api/list_vesting_delegation_expirations.html) | HF17 |  |
| [list_vesting_delegations](/api/database_api/list_vesting_delegations.html) | HF17 |  |
| [list_votes](/api/database_api/list_votes.html) |  |  |
| [list_withdraw_vesting_routes](/api/database_api/list_withdraw_vesting_routes.html) |  |  |
| [list_witness_votes](/api/database_api/list_witness_votes.html) |  |  |
| [list_witnesses](/api/database_api/list_witnesses.html) |  |  |
| [verify_account_authority](/api/database_api/verify_account_authority.html) |  | disabled |
| [verify_authority](/api/database_api/verify_authority.html) |  |  |
| [verify_signatures](/api/database_api/verify_signatures.html) |  |  |
| [find_proposals](/api/database_api/find_proposals.html) |  |  |
| [list_proposal_votes](/api/database_api/list_proposal_votes.html) |  |  |
| [list_proposals](/api/database_api/list_proposals.html) |  |  |
| [find_smt_contributions](/api/database_api/find_smt_contributions.html) | HF23 | deprecated |
| [find_smt_token_emissions](/api/database_api/find_smt_token_emissions.html) | HF23 | deprecated |
| [find_smt_tokens](/api/database_api/find_smt_tokens.html) | HF23 | deprecated |
| [get_nai_pool](/api/database_api/get_nai_pool.html) | HF23 | deprecated |
| [list_smt_contributions](/api/database_api/list_smt_contributions.html) | HF23 | deprecated |
| [list_smt_token_emissions](/api/database_api/list_smt_token_emissions.html) | HF23 | deprecated |
| [list_smt_tokens](/api/database_api/list_smt_tokens.html) | HF23 | deprecated |
