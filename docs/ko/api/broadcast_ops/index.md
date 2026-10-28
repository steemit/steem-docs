---
title: "broadcast_ops"
description: "An operation on Steem is a way of expressing intention on the blockchain."
---

# broadcast_ops

An operation on Steem is a way of expressing intention on the blockchain.
They are also known as Broadcast Operations.  They have types, like `vote`
or `comment`.  They pass parameters like `author` and `permlink`, depending
on what their purpose is.

Operations are grouped into transactions and passed as parameters to
methods like `network_broadcast_api.broadcast_transaction`, in
the `operations` array.  Transactions must be signed in order for the
blockchain to accept them.  Here is an example of a transaction that
contains one operation (shown without signatures).

```json
{
   "jsonrpc":"2.0",
   "method":"condenser_api.broadcast_transaction",
   "params":{
      "trx":{
         "ref_block_num":1097,
         "ref_block_prefix":2181793527,
         "expiration":"2016-03-24T18:00:21",
         "operations":[
            [
               "vote",
               {
                  "voter":"steemit",
                  "author":"alice",
                  "permlink":"a-post-by-alice",
                  "weight":10000
               }
            ]
         ],
         "extensions":[],
         "signatures":[]
      }
   },
   "id":1
}
```

Also see: Broadcast Transaction

> 이것은 한국어 인덱스 페이지입니다: 작업 페이지는 아직 한국어로 번역되지 않았습니다 — 작업 이름을 클릭하면 영어 페이지의 해당 섹션으로 이동합니다.

## 작업 (75)

| 작업 | 상태 |
| --- | --- |
| [vote](/api/broadcast_ops/#vote) |  |
| [comment](/api/broadcast_ops/#comment) |  |
| [transfer](/api/broadcast_ops/#transfer) |  |
| [transfer_to_vesting](/api/broadcast_ops/#transfer-to-vesting) |  |
| [withdraw_vesting](/api/broadcast_ops/#withdraw-vesting) |  |
| [limit_order_create](/api/broadcast_ops/#limit-order-create) |  |
| [limit_order_cancel](/api/broadcast_ops/#limit-order-cancel) |  |
| [price](/api/broadcast_ops/#price) |  |
| [feed_publish](/api/broadcast_ops/#feed-publish) |  |
| [convert](/api/broadcast_ops/#convert) |  |
| [account_create](/api/broadcast_ops/#account-create) |  |
| [create_claimed_account](/api/broadcast_ops/#create-claimed-account) |  |
| [claim_account](/api/broadcast_ops/#claim-account) |  |
| [witness_set_properties](/api/broadcast_ops/#witness-set-properties) |  |
| [account_update](/api/broadcast_ops/#account-update) |  |
| [report_over_production](/api/broadcast_ops/#report-over-production) | disabled |
| [witness_update](/api/broadcast_ops/#witness-update) |  |
| [account_witness_vote](/api/broadcast_ops/#account-witness-vote) |  |
| [account_witness_proxy](/api/broadcast_ops/#account-witness-proxy) |  |
| [pow](/api/broadcast_ops/#pow) | disabled |
| [custom](/api/broadcast_ops/#custom) |  |
| [delete_comment](/api/broadcast_ops/#delete-comment) |  |
| [custom_json](/api/broadcast_ops/#custom-json) |  |
| [comment_options](/api/broadcast_ops/#comment-options) |  |
| [set_withdraw_vesting_route](/api/broadcast_ops/#set-withdraw-vesting-route) |  |
| [limit_order_create2](/api/broadcast_ops/#limit-order-create2) |  |
| [challenge_authority](/api/broadcast_ops/#challenge-authority) | disabled |
| [prove_authority](/api/broadcast_ops/#prove-authority) |  |
| [request_account_recovery](/api/broadcast_ops/#request-account-recovery) |  |
| [recover_account](/api/broadcast_ops/#recover-account) |  |
| [change_recovery_account](/api/broadcast_ops/#change-recovery-account) |  |
| [escrow_transfer](/api/broadcast_ops/#escrow-transfer) |  |
| [escrow_dispute](/api/broadcast_ops/#escrow-dispute) |  |
| [escrow_release](/api/broadcast_ops/#escrow-release) |  |
| [pow2](/api/broadcast_ops/#pow2) | disabled |
| [escrow_approve](/api/broadcast_ops/#escrow-approve) |  |
| [transfer_to_savings](/api/broadcast_ops/#transfer-to-savings) |  |
| [transfer_from_savings](/api/broadcast_ops/#transfer-from-savings) |  |
| [cancel_transfer_from_savings](/api/broadcast_ops/#cancel-transfer-from-savings) |  |
| [custom_binary](/api/broadcast_ops/#custom-binary) |  |
| [decline_voting_rights](/api/broadcast_ops/#decline-voting-rights) |  |
| [reset_account](/api/broadcast_ops/#reset-account) | disabled |
| [set_reset_account](/api/broadcast_ops/#set-reset-account) | disabled |
| [claim_reward_balance](/api/broadcast_ops/#claim-reward-balance) |  |
| [delegate_vesting_shares](/api/broadcast_ops/#delegate-vesting-shares) |  |
| [account_create_with_delegation](/api/broadcast_ops/#account-create-with-delegation) | deprecated |
| [create_proposal](/api/broadcast_ops/#create-proposal) |  |
| [remove_proposal](/api/broadcast_ops/#remove-proposal) |  |
| [update_proposal_votes](/api/broadcast_ops/#update-proposal-votes) |  |
| [claim_reward_balance2](/api/broadcast_ops/#claim-reward-balance2) |  |
| [vote2](/api/broadcast_ops/#vote2) |  |
| [smt_setup](/api/broadcast_ops/#smt-setup) |  |
| [smt_setup_emissions](/api/broadcast_ops/#smt-setup-emissions) |  |
| [smt_set_setup_parameters](/api/broadcast_ops/#smt-set-setup-parameters) |  |
| [smt_set_runtime_parameters](/api/broadcast_ops/#smt-set-runtime-parameters) |  |
| [smt_create](/api/broadcast_ops/#smt-create) |  |
| [smt_contribute](/api/broadcast_ops/#smt-contribute) |  |
| [clear_null_account_balance](/api/broadcast_ops/#clear-null-account-balance) | virtual, deprecated |
| [proposal_pay](/api/broadcast_ops/#proposal-pay) | virtual |
| [sps_fund](/api/broadcast_ops/#sps-fund) | virtual |
| [fill_convert_request](/api/broadcast_ops/#fill-convert-request) | virtual |
| [author_reward](/api/broadcast_ops/#author-reward) | virtual |
| [curation_reward](/api/broadcast_ops/#curation-reward) | virtual |
| [comment_reward](/api/broadcast_ops/#comment-reward) | virtual |
| [liquidity_reward](/api/broadcast_ops/#liquidity-reward) | virtual, disabled |
| [interest](/api/broadcast_ops/#interest) | virtual |
| [fill_vesting_withdraw](/api/broadcast_ops/#fill-vesting-withdraw) | virtual |
| [fill_order](/api/broadcast_ops/#fill-order) | virtual |
| [shutdown_witness](/api/broadcast_ops/#shutdown-witness) | virtual |
| [fill_transfer_from_savings](/api/broadcast_ops/#fill-transfer-from-savings) | virtual |
| [hardfork](/api/broadcast_ops/#hardfork) | virtual |
| [comment_payout_update](/api/broadcast_ops/#comment-payout-update) | virtual |
| [return_vesting_delegation](/api/broadcast_ops/#return-vesting-delegation) | virtual |
| [comment_benefactor_reward](/api/broadcast_ops/#comment-benefactor-reward) | virtual |
| [producer_reward](/api/broadcast_ops/#producer-reward) | virtual |
