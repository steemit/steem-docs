---
title: "condenser_api"
description: "To help with this transition, we created condenser_api, which contains all of the API methods that currently exist and uses the existing argument formatting.…"
outline: [2, 3]
---

# condenser_api

To help with this transition, we created `condenser_api`, which contains all of the API methods that currently exist and uses the existing argument formatting. The easiest way to get your app to work with Appbase is to change the api to `condenser_api`.

All calls in `condenser_api` will return `[]` as the argument, as the array argument passing is opaque and implemented in the API calls themselves. They follow the current argument formatting. Existing apps should only need to skip using login_api and send all of their calls to condenser_api without any other changes required to use Appbase.

For example, calling `get_dynamic_global_properties` with `condenser_api` vs `database_api`:

```json
{"jsonrpc":"2.0", "method":"condenser_api.get_dynamic_global_properties", "params":[], "id":1}
```

```json
{"jsonrpc":"2.0", "method":"database_api.get_dynamic_global_properties", "id":1}
```

Because the method has no arguments, the params field can be omitted when not using `condenser_api`. However, it can optionally be included as the void type (e.g. `"params":{}`) but it is not required.

> 이것은 한국어 인덱스 페이지입니다: 모든 메서드가 한국어로 번역되었으며, 표의 링크는 한국어 메서드 페이지로 연결됩니다.

## 메서드 (90)

| 메서드 | 도입 버전 | 상태 |
| --- | --- | --- |
| [broadcast_block](/ko/api/condenser_api/broadcast_block.html) |  |  |
| [broadcast_transaction](/ko/api/condenser_api/broadcast_transaction.html) |  |  |
| [broadcast_transaction_synchronous](/ko/api/condenser_api/broadcast_transaction_synchronous.html) |  |  |
| [get_account_bandwidth](/ko/api/condenser_api/get_account_bandwidth.html) |  | disabled, removed |
| [get_account_count](/ko/api/condenser_api/get_account_count.html) |  |  |
| [get_account_history](/ko/api/condenser_api/get_account_history.html) |  |  |
| [get_account_reputations](/ko/api/condenser_api/get_account_reputations.html) | HF13 |  |
| [get_account_votes](/ko/api/condenser_api/get_account_votes.html) |  |  |
| [get_accounts](/ko/api/condenser_api/get_accounts.html) |  |  |
| [get_active_votes](/ko/api/condenser_api/get_active_votes.html) |  |  |
| [get_active_witnesses](/ko/api/condenser_api/get_active_witnesses.html) |  |  |
| [get_block](/ko/api/condenser_api/get_block.html) |  |  |
| [get_block_header](/ko/api/condenser_api/get_block_header.html) |  |  |
| [get_blog](/ko/api/condenser_api/get_blog.html) |  |  |
| [get_blog_authors](/ko/api/condenser_api/get_blog_authors.html) |  |  |
| [get_blog_entries](/ko/api/condenser_api/get_blog_entries.html) |  |  |
| [get_chain_properties](/ko/api/condenser_api/get_chain_properties.html) |  |  |
| [get_comment_discussions_by_payout](/ko/api/condenser_api/get_comment_discussions_by_payout.html) | HF17 |  |
| [get_config](/ko/api/condenser_api/get_config.html) |  |  |
| [get_content](/ko/api/condenser_api/get_content.html) |  |  |
| [get_content_replies](/ko/api/condenser_api/get_content_replies.html) |  |  |
| [get_conversion_requests](/ko/api/condenser_api/get_conversion_requests.html) |  |  |
| [get_current_median_history_price](/ko/api/condenser_api/get_current_median_history_price.html) |  |  |
| [get_discussions_by_active](/ko/api/condenser_api/get_discussions_by_active.html) |  |  |
| [get_discussions_by_author_before_date](/ko/api/condenser_api/get_discussions_by_author_before_date.html) |  |  |
| [get_discussions_by_blog](/ko/api/condenser_api/get_discussions_by_blog.html) |  |  |
| [get_discussions_by_cashout](/ko/api/condenser_api/get_discussions_by_cashout.html) |  |  |
| [get_discussions_by_children](/ko/api/condenser_api/get_discussions_by_children.html) |  |  |
| [get_discussions_by_comments](/ko/api/condenser_api/get_discussions_by_comments.html) |  |  |
| [get_discussions_by_created](/ko/api/condenser_api/get_discussions_by_created.html) |  |  |
| [get_discussions_by_feed](/ko/api/condenser_api/get_discussions_by_feed.html) | HF14 |  |
| [get_discussions_by_hot](/ko/api/condenser_api/get_discussions_by_hot.html) |  |  |
| [get_discussions_by_promoted](/ko/api/condenser_api/get_discussions_by_promoted.html) | HF13 |  |
| [get_discussions_by_trending](/ko/api/condenser_api/get_discussions_by_trending.html) |  |  |
| [get_discussions_by_votes](/ko/api/condenser_api/get_discussions_by_votes.html) |  |  |
| [get_dynamic_global_properties](/ko/api/condenser_api/get_dynamic_global_properties.html) |  |  |
| [get_escrow](/ko/api/condenser_api/get_escrow.html) | HF14 |  |
| [get_expiring_vesting_delegations](/ko/api/condenser_api/get_expiring_vesting_delegations.html) | HF17 |  |
| [get_feed](/ko/api/condenser_api/get_feed.html) | HF14 |  |
| [get_feed_entries](/ko/api/condenser_api/get_feed_entries.html) | HF14 |  |
| [get_feed_history](/ko/api/condenser_api/get_feed_history.html) |  |  |
| [get_follow_count](/ko/api/condenser_api/get_follow_count.html) | HF9 |  |
| [get_followers](/ko/api/condenser_api/get_followers.html) | HF9 |  |
| [get_followers_by_page](/ko/api/condenser_api/get_followers_by_page.html) |  |  |
| [get_following](/ko/api/condenser_api/get_following.html) | HF9 |  |
| [get_following_by_page](/ko/api/condenser_api/get_following_by_page.html) |  |  |
| [get_hardfork_version](/ko/api/condenser_api/get_hardfork_version.html) |  |  |
| [get_key_references](/ko/api/condenser_api/get_key_references.html) | HF16 |  |
| [get_market_history](/ko/api/condenser_api/get_market_history.html) |  |  |
| [get_market_history_buckets](/ko/api/condenser_api/get_market_history_buckets.html) |  |  |
| [get_next_scheduled_hardfork](/ko/api/condenser_api/get_next_scheduled_hardfork.html) |  |  |
| [get_open_orders](/ko/api/condenser_api/get_open_orders.html) |  |  |
| [get_ops_in_block](/ko/api/condenser_api/get_ops_in_block.html) |  |  |
| [get_order_book](/ko/api/condenser_api/get_order_book.html) |  |  |
| [get_owner_history](/ko/api/condenser_api/get_owner_history.html) |  |  |
| [get_post_discussions_by_payout](/ko/api/condenser_api/get_post_discussions_by_payout.html) | HF17 |  |
| [get_potential_signatures](/ko/api/condenser_api/get_potential_signatures.html) |  |  |
| [get_reblogged_by](/ko/api/condenser_api/get_reblogged_by.html) | HF14 |  |
| [get_recent_trades](/ko/api/condenser_api/get_recent_trades.html) |  |  |
| [get_recovery_request](/ko/api/condenser_api/get_recovery_request.html) | HF11 |  |
| [get_replies_by_last_update](/ko/api/condenser_api/get_replies_by_last_update.html) |  |  |
| [get_required_signatures](/ko/api/condenser_api/get_required_signatures.html) |  |  |
| [get_reward_fund](/ko/api/condenser_api/get_reward_fund.html) | HF17 |  |
| [get_savings_withdraw_from](/ko/api/condenser_api/get_savings_withdraw_from.html) | HF14 |  |
| [get_savings_withdraw_to](/ko/api/condenser_api/get_savings_withdraw_to.html) | HF14 |  |
| [get_state](/ko/api/condenser_api/get_state.html) |  | deprecated |
| [get_tags_used_by_author](/ko/api/condenser_api/get_tags_used_by_author.html) |  |  |
| [get_ticker](/ko/api/condenser_api/get_ticker.html) |  |  |
| [get_trade_history](/ko/api/condenser_api/get_trade_history.html) |  |  |
| [get_transaction](/ko/api/condenser_api/get_transaction.html) |  |  |
| [get_transaction_hex](/ko/api/condenser_api/get_transaction_hex.html) |  |  |
| [get_trending_tags](/ko/api/condenser_api/get_trending_tags.html) |  |  |
| [get_version](/ko/api/condenser_api/get_version.html) |  |  |
| [get_vesting_delegations](/ko/api/condenser_api/get_vesting_delegations.html) | HF17 |  |
| [get_volume](/ko/api/condenser_api/get_volume.html) |  |  |
| [get_withdraw_routes](/ko/api/condenser_api/get_withdraw_routes.html) |  |  |
| [get_witness_by_account](/ko/api/condenser_api/get_witness_by_account.html) |  |  |
| [get_witness_count](/ko/api/condenser_api/get_witness_count.html) |  |  |
| [get_witness_schedule](/ko/api/condenser_api/get_witness_schedule.html) |  |  |
| [get_witnesses](/ko/api/condenser_api/get_witnesses.html) |  |  |
| [get_witnesses_by_vote](/ko/api/condenser_api/get_witnesses_by_vote.html) |  |  |
| [lookup_account_names](/ko/api/condenser_api/lookup_account_names.html) |  |  |
| [lookup_accounts](/ko/api/condenser_api/lookup_accounts.html) |  |  |
| [lookup_witness_accounts](/ko/api/condenser_api/lookup_witness_accounts.html) |  |  |
| [verify_account_authority](/ko/api/condenser_api/verify_account_authority.html) |  | disabled |
| [verify_authority](/ko/api/condenser_api/verify_authority.html) |  |  |
| [get_account_references](/ko/api/condenser_api/get_account_references.html) |  | disabled |
| [find_proposals](/ko/api/condenser_api/find_proposals.html) |  |  |
| [list_proposal_votes](/ko/api/condenser_api/list_proposal_votes.html) |  |  |
| [list_proposals](/ko/api/condenser_api/list_proposals.html) |  |  |
