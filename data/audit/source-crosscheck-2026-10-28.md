# Source × docs × node crosscheck matrix — 2026-10-28

- inputs: steem inventory 211 methods (steem@52dcfab [ingest_plugin]) · hivemind inventory 68 bindings (hivemind_legacy@278775b [pr398]) · manifest 238 methods / 22 files · drift `drift-2026-10-28.json` (2026-10-28)
- probe nodes (undocumented body names): https://api.steem.fans [`fans`] + https://api.steemit.com [`steemit`] · mode: write
- universe 241 = matrix body 237 + excluded 4 · combo census: `src+ doc+ node-alive`=200 · `src- doc+ node-alive`=1 · `src+ doc- node-alive`=1 · `src+ doc+ node-dead`=32 · `src- doc+ node-dead`=3

Combo→disposition table (every body row resolves through exactly one cell):

| combo | disposition | action | basis |
| --- | --- | --- | --- |
| src+ doc+ node-alive | `all-good` | keep the page as-is | 常规组合：三源一致（node `changed` 行附带 contract-drift 注记 → T23 输入；alive 但带 deprecated/disabled/removed 软标注的行附带 soft-flag 注记） |
| src+ doc+ node-dead | `annotation-refresh` | 按死亡标注三族复核（决策 3）：deprecated 维持 / disabled 口径刷新为「源码仍定义；插件未在公共节点启用」/ removed 口径不成立（源码仍定义）→ 标注需刷新 | 决策 3-①②③ + 对照表 |
| src+ doc- node-alive | `add-page` | T22 补页（en+zh 方法页 + 手写总览页计数守卫） | 对照表：源码有+文档无+节点活 → 补页（T22 输入） |
| src+ doc- node-dead | `add-page+dead-note` | T22 补页且携带 dead-note 警示块 | 对照表：源码有+文档无+节点死 → 补页+警示块 |
| src- doc+ node-alive | `keep-annotation` | witness 型：保留页面与标注（两源均无定义而节点仍服务） | 对照表：源码无+文档有+节点活 → keep-annotation（witness 型） |
| src- doc+ node-dead | `removed-keep` | 维持 removed 标注，理由升级为源码缺失实证（两源清单均无此名） | 决策 3-③：removed 源码均无定义，标注维持且理由更硬 |
| src- doc- node-* | `unreachable` | impossible by construction（universe = 两源 ∪ 文档） | 构造性排除；出现即断言失败 |
| node-dependent（任意 src/doc 组合） | `node-dependent-review` | 两节点结论分歧，单节点异常不足以致死 — 仲裁后归入对应组合 | drift/coverage「never auto-kill」语义 |
| node-undetermined（探测双失败） | `needs-live-confirmation` | 节点不可达或探测通道结构性失败 — 换可达节点重跑 | node 维度未定，无法落入 8 组合 |

## ① Add-page list (source-has + docs-lacks → T22 input)

1 alive + 0 dead (pages carry a dead-note block). Each needs en+zh method pages plus the hand-written overview count guard (plan decision 5).

| api_method | source | node | param_style | note |
| --- | --- | --- | --- | --- |
| call.call | hivemind | alive | named | 线名为裸 `call`（legacy call 约定，hivemind serve.py:119）；清单名 `call.call` 是 T20 命名空间拼接的产物 — 实测按线名携带 call 约定数组参数探测 |

## ② Death-annotation review (plan decision 3, three families re-checked against the source inventories)

- **deprecated — keep (7)**: source still defines every one; deprecation semantics do not contradict source presence. database_api.find_smt_contributions, database_api.find_smt_token_emissions, database_api.find_smt_tokens, database_api.get_nai_pool, database_api.list_smt_contributions, database_api.list_smt_token_emissions, database_api.list_smt_tokens.
- **disabled — reword (11)**: source still defines all nine in the private debug_node plugin; wording refreshes to "defined in source; plugin not enabled on public nodes" (decision 3-②). chain_api.push_block, chain_api.push_transaction, debug_node_api.debug_generate_blocks, debug_node_api.debug_generate_blocks_until, debug_node_api.debug_get_hardfork_property_object, debug_node_api.debug_get_json_schema, debug_node_api.debug_get_witness_schedule, debug_node_api.debug_has_hardfork, debug_node_api.debug_pop_block, debug_node_api.debug_push_blocks, debug_node_api.debug_set_hardfork.
- **removed — keep with harder evidence (3)**: absent from BOTH source inventories — the annotation survives with source-absence as proof. condenser_api.get_account_bandwidth, witness_api.get_account_bandwidth, witness_api.get_reserve_ratio.
- **removed — annotation falsified (14)**: these removed-flagged pages describe methods the steem inventory (52dcfab) STILL DEFINES — "Removed from the API" is not true at source level; the true statement is "defined in source, not enabled on public nodes". Annotation refresh is T22/T23 work (no YAML edited in this task). follow_api.get_blog_authors, follow_api.get_feed, follow_api.get_feed_entries, rewards_api.simulate_curve_payouts, tags_api.get_active_votes, tags_api.get_discussions_by_active, tags_api.get_discussions_by_cashout, tags_api.get_discussions_by_children, tags_api.get_discussions_by_feed, tags_api.get_discussions_by_votes, tags_api.get_replies_by_last_update, tags_api.get_tags_used_by_author, tags_api.get_trending_tags, transaction_status_api.find_transaction.
- **soft flags on live methods (5)**: era-2018 `disabled`/"Not Implemented" and `deprecated` annotations on methods that still dispatch — kept as-is here, confirm during T22/T23 edits. account_history_api.get_transaction, condenser_api.get_account_references, condenser_api.get_state, condenser_api.verify_account_authority, database_api.verify_account_authority.
- **contract drift on alive methods (3)**: all-good pages whose node signature differs from the documented parameter_json (drift verdict `changed`) — page stays, contract fix belongs to T23. database_api.find_comments, database_api.find_proposals, database_api.list_votes.

## ③ Double-source methods (hivemind-served names the steem source also defines)

42 methods carry both a steem and a hivemind definition (plan decision 1: steem=positional/named per DECLARE_API args, hivemind=named per serve.py validators, dummy=dummy binding). When both sides have statically enumerable params and the sequences differ, the row is flagged — node reality wins; contract reconciliation is T23 input.

| api_method | steem style | steem params | hivemind style | hivemind params | mismatch |
| --- | --- | --- | --- | --- | --- |
| condenser_api.get_account_reputations | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_account_votes | positional | n/a (hivemind side is a dummy binding (registered, no validator params)) | dummy | dummy | not comparable |
| condenser_api.get_blog | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_blog_entries | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_comment_discussions_by_payout | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_content | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_content_replies | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_discussions_by_author_before_date | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_discussions_by_blog | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_discussions_by_comments | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_discussions_by_created | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_discussions_by_feed | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_discussions_by_hot | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_discussions_by_promoted | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_discussions_by_trending | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_follow_count | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_followers | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_following | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_post_discussions_by_payout | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_reblogged_by | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_replies_by_last_update | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_state | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_transaction | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| condenser_api.get_trending_tags | positional | n/a (steem side is positional (no parameter names)) | named | named (defaults omitted) | not comparable |
| follow_api.get_account_reputations | named | account_lower_bound, limit | named | account_lower_bound, limit | no |
| follow_api.get_blog | named | account, start_entry_id, limit | named | account, start_entry_id, limit | no |
| follow_api.get_blog_entries | named | account, start_entry_id, limit | named | account, start_entry_id, limit | no |
| follow_api.get_follow_count | named | account | named | account | no |
| follow_api.get_followers | named | account, start, type, limit | named | account, start, follow_type, limit | **YES** |
| follow_api.get_following | named | account, start, type, limit | named | account, start, follow_type, limit | **YES** |
| follow_api.get_reblogged_by | named | author, permlink | named | author, permlink | no |
| tags_api.get_comment_discussions_by_payout | named | tag, limit, filter_tags, select_authors, select_tags, truncate_body, start_author, start_permlink, parent_author, parent_permlink | named | start_author, start_permlink, limit, tag, truncate_body | **YES** |
| tags_api.get_content_replies | named | author, permlink | named | author, permlink | no |
| tags_api.get_discussion | named | author, permlink | named | author, permlink | no |
| tags_api.get_discussions_by_author_before_date | named | author, start_permlink, before_date, limit | named | author, start_permlink, before_date, limit | no |
| tags_api.get_discussions_by_blog | named | tag, limit, filter_tags, select_authors, select_tags, truncate_body, start_author, start_permlink, parent_author, parent_permlink | named | tag, start_author, start_permlink, limit, truncate_body, filter_tags | **YES** |
| tags_api.get_discussions_by_comments | named | tag, limit, filter_tags, select_authors, select_tags, truncate_body, start_author, start_permlink, parent_author, parent_permlink | named | start_author, start_permlink, limit, truncate_body, filter_tags | **YES** |
| tags_api.get_discussions_by_created | named | tag, limit, filter_tags, select_authors, select_tags, truncate_body, start_author, start_permlink, parent_author, parent_permlink | named | start_author, start_permlink, limit, tag, truncate_body, filter_tags | **YES** |
| tags_api.get_discussions_by_hot | named | tag, limit, filter_tags, select_authors, select_tags, truncate_body, start_author, start_permlink, parent_author, parent_permlink | named | start_author, start_permlink, limit, tag, truncate_body, filter_tags | **YES** |
| tags_api.get_discussions_by_promoted | named | tag, limit, filter_tags, select_authors, select_tags, truncate_body, start_author, start_permlink, parent_author, parent_permlink | named | start_author, start_permlink, limit, tag, truncate_body, filter_tags | **YES** |
| tags_api.get_discussions_by_trending | named | tag, limit, filter_tags, select_authors, select_tags, truncate_body, start_author, start_permlink, parent_author, parent_permlink | named | start_author, start_permlink, limit, tag, truncate_body, filter_tags | **YES** |
| tags_api.get_post_discussions_by_payout | named | tag, limit, filter_tags, select_authors, select_tags, truncate_body, start_author, start_permlink, parent_author, parent_permlink | named | start_author, start_permlink, limit, tag, truncate_body | **YES** |

Signature mismatches: 10 of 18 comparable rows (42 double-source total) — follow_api.get_followers, follow_api.get_following, tags_api.get_comment_discussions_by_payout, tags_api.get_discussions_by_blog, tags_api.get_discussions_by_comments, tags_api.get_discussions_by_created, tags_api.get_discussions_by_hot, tags_api.get_discussions_by_promoted, tags_api.get_discussions_by_trending, tags_api.get_post_discussions_by_payout.

## ④ Exclusions (plan decision 2) — NOT matrix rows

| name | source | node | reason |
| --- | --- | --- | --- |
| jsonrpc.get_methods | steem | alive | JSON-RPC infrastructure self-description (get_methods/get_signature); protocol plumbing, not a business API (plan decision 2) |
| jsonrpc.get_signature | steem | alive | JSON-RPC infrastructure self-description (get_methods/get_signature); protocol plumbing, not a business API (plan decision 2) |
| test_api.test_api_a | steem | not-probed (excluded) | test-only API plugin (test_api_plugin); never mounted on public nodes, not part of the public API surface (plan decision 2) |
| test_api.test_api_b | steem | not-probed (excluded) | test-only API plugin (test_api_plugin); never mounted on public nodes, not part of the public API surface (plan decision 2) |
| ingest (steem) | — | — | 纯 appbase 插件（ingest_plugin 分支定制）：无 json_rpc 依赖、无 DECLARE_API，不是 API 插件 → 不产生方法，不入矩阵（plan §1 / 决策 2）。机检：steem inventory 无 ingest 命名空间。 |
| community.py unregistered defs (hivemind) | — | — | hivemind community.py/notify/stats 的函数只有经 serve.py 注册点暴露的部分才入清单（bridge./hive. 前缀）；未注册 def 不构成 JSON-RPC 方法 → 不入矩阵。机检：hivemind inventory 绑定数 == 68（T20 基线）。 |

## Matrix (all body rows)

| api_method | src | doc | flags | node | node source | combo | disposition | note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| account_by_key_api.get_key_references | steem | account_by_key_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| account_history_api.enum_virtual_ops | steem | account_history_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| account_history_api.get_account_history | steem | account_history_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| account_history_api.get_ops_in_block | steem | account_history_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| account_history_api.get_transaction | steem | account_history_api.yml | deprecated | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` | alive 但页面带 deprecated 软标注（2018 抓取期语义）— 维持，T22/T23 复核时顺带确认 |
| block_api.get_block | steem | block_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| block_api.get_block_header | steem | block_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.account_notifications | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.get_account_posts | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.get_community | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.get_community_context | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.get_discussion | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.get_payout_stats | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.get_post | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.get_post_header | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.get_profile | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.get_ranked_posts | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.get_trending_topics | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.list_all_subscriptions | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.list_communities | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.list_community_roles | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.list_pop_communities | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.list_subscribers | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.normalize_post | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.post_notifications | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| bridge.unread_notifications | hivemind | bridge.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| call | none | call.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src- doc+ node-alive | `keep-annotation` |  |
| call.call | hivemind | - | - | alive | live-probe 2026-10-28 (fans+steemit, empty-params existence probe) | src+ doc- node-alive | `add-page` | 线名为裸 `call`（legacy call 约定，hivemind serve.py:119）；清单名 `call.call` 是 T20 命名空间拼接的产物 — 实测按线名携带 call 约定数组参数探测 |
| chain_api.push_block | steem | chain_api.yml | disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/disabled-refresh | 口径刷新为「源码仍定义；插件未在公共节点启用」（决策 3-②） |
| chain_api.push_transaction | steem | chain_api.yml | disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/disabled-refresh | 口径刷新为「源码仍定义；插件未在公共节点启用」（决策 3-②） |
| condenser_api.broadcast_block | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.broadcast_transaction | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.broadcast_transaction_synchronous | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.find_proposals | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_account_bandwidth | none | condenser_api.yml | removed+disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src- doc+ node-dead | `removed-keep` | 两源清单均无此名 — removed 标注维持，理由升级为源码缺失实证（决策 3-③） |
| condenser_api.get_account_count | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_account_history | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_account_references | steem | condenser_api.yml | disabled | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` | alive 但页面带 disabled 软标注（2018 抓取期语义）— 维持，T22/T23 复核时顺带确认 |
| condenser_api.get_account_reputations | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_account_votes | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` | hivemind 侧为 dummy 绑定（serve.py 注册了方法名但无独立实现，返回空壳） |
| condenser_api.get_accounts | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_active_votes | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_active_witnesses | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_block | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_block_header | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_blog | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_blog_authors | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_blog_entries | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_chain_properties | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_comment_discussions_by_payout | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_config | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_content | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_content_replies | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_conversion_requests | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_current_median_history_price | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_discussions_by_active | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_discussions_by_author_before_date | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_discussions_by_blog | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_discussions_by_cashout | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_discussions_by_children | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_discussions_by_comments | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_discussions_by_created | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_discussions_by_feed | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_discussions_by_hot | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_discussions_by_promoted | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_discussions_by_trending | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_discussions_by_votes | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_dynamic_global_properties | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_escrow | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_expiring_vesting_delegations | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_feed | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_feed_entries | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_feed_history | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_follow_count | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_followers | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_followers_by_page | hivemind | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_following | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_following_by_page | hivemind | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_hardfork_version | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_key_references | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_market_history | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_market_history_buckets | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_next_scheduled_hardfork | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_open_orders | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_ops_in_block | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_order_book | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_owner_history | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_post_discussions_by_payout | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_potential_signatures | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_reblogged_by | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_recent_trades | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_recovery_request | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_replies_by_last_update | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_required_signatures | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_reward_fund | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_savings_withdraw_from | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_savings_withdraw_to | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_state | both | condenser_api.yml | deprecated | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` | alive 但页面带 deprecated 软标注（2018 抓取期语义）— 维持，T22/T23 复核时顺带确认 |
| condenser_api.get_tags_used_by_author | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_ticker | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_trade_history | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_transaction | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_transaction_hex | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_trending_tags | both | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_version | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_vesting_delegations | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_volume | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_withdraw_routes | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_witness_by_account | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_witness_count | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_witness_schedule | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_witnesses | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.get_witnesses_by_vote | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.list_proposal_votes | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.list_proposals | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.lookup_account_names | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.lookup_accounts | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.lookup_witness_accounts | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| condenser_api.verify_account_authority | steem | condenser_api.yml | disabled | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` | alive 但页面带 disabled 软标注（2018 抓取期语义）— 维持，T22/T23 复核时顺带确认 |
| condenser_api.verify_authority | steem | condenser_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_account_recovery_requests | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_accounts | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_change_recovery_account_requests | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_comments | steem | database_api.yml | - | alive (changed) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` | 节点契约与文档 parameter_json 不一致（drift verdict: changed）— all-good 维持页面，契约刷新归 T23 |
| database_api.find_decline_voting_rights_requests | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_escrows | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_limit_orders | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_owner_histories | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_proposals | steem | database_api.yml | - | alive (changed) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` | 节点契约与文档 parameter_json 不一致（drift verdict: changed）— all-good 维持页面，契约刷新归 T23 |
| database_api.find_savings_withdrawals | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_sbd_conversion_requests | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_smt_contributions | steem | database_api.yml | deprecated | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/deprecated-keep | 弃用语义与源码存在不矛盾，标注维持（决策 3-①） |
| database_api.find_smt_token_emissions | steem | database_api.yml | deprecated | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/deprecated-keep | 弃用语义与源码存在不矛盾，标注维持（决策 3-①） |
| database_api.find_smt_tokens | steem | database_api.yml | deprecated | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/deprecated-keep | 弃用语义与源码存在不矛盾，标注维持（决策 3-①） |
| database_api.find_vesting_delegation_expirations | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_vesting_delegations | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_votes | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_withdraw_vesting_routes | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.find_witnesses | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_active_witnesses | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_config | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_current_price_feed | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_dynamic_global_properties | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_feed_history | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_hardfork_properties | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_nai_pool | steem | database_api.yml | deprecated | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/deprecated-keep | 弃用语义与源码存在不矛盾，标注维持（决策 3-①） |
| database_api.get_order_book | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_potential_signatures | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_required_signatures | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_reward_funds | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_transaction_hex | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_version | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.get_witness_schedule | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_account_recovery_requests | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_accounts | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_change_recovery_account_requests | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_comments | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_decline_voting_rights_requests | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_escrows | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_limit_orders | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_owner_histories | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_proposal_votes | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_proposals | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_savings_withdrawals | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_sbd_conversion_requests | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_smt_contributions | steem | database_api.yml | deprecated | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/deprecated-keep | 弃用语义与源码存在不矛盾，标注维持（决策 3-①） |
| database_api.list_smt_token_emissions | steem | database_api.yml | deprecated | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/deprecated-keep | 弃用语义与源码存在不矛盾，标注维持（决策 3-①） |
| database_api.list_smt_tokens | steem | database_api.yml | deprecated | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/deprecated-keep | 弃用语义与源码存在不矛盾，标注维持（决策 3-①） |
| database_api.list_vesting_delegation_expirations | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_vesting_delegations | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_votes | steem | database_api.yml | - | alive (changed) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` | 节点契约与文档 parameter_json 不一致（drift verdict: changed）— all-good 维持页面，契约刷新归 T23 |
| database_api.list_withdraw_vesting_routes | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_witness_votes | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.list_witnesses | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.verify_account_authority | steem | database_api.yml | disabled | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` | alive 但页面带 disabled 软标注（2018 抓取期语义）— 维持，T22/T23 复核时顺带确认 |
| database_api.verify_authority | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| database_api.verify_signatures | steem | database_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| debug_node_api.debug_generate_blocks | steem | debug_node_api.yml | disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/disabled-refresh | 口径刷新为「源码仍定义；插件未在公共节点启用」（决策 3-②） |
| debug_node_api.debug_generate_blocks_until | steem | debug_node_api.yml | disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/disabled-refresh | 口径刷新为「源码仍定义；插件未在公共节点启用」（决策 3-②） |
| debug_node_api.debug_get_hardfork_property_object | steem | debug_node_api.yml | disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/disabled-refresh | 口径刷新为「源码仍定义；插件未在公共节点启用」（决策 3-②） |
| debug_node_api.debug_get_json_schema | steem | debug_node_api.yml | disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/disabled-refresh | 口径刷新为「源码仍定义；插件未在公共节点启用」（决策 3-②） |
| debug_node_api.debug_get_witness_schedule | steem | debug_node_api.yml | disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/disabled-refresh | 口径刷新为「源码仍定义；插件未在公共节点启用」（决策 3-②） |
| debug_node_api.debug_has_hardfork | steem | debug_node_api.yml | disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/disabled-refresh | 口径刷新为「源码仍定义；插件未在公共节点启用」（决策 3-②） |
| debug_node_api.debug_pop_block | steem | debug_node_api.yml | disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/disabled-refresh | 口径刷新为「源码仍定义；插件未在公共节点启用」（决策 3-②） |
| debug_node_api.debug_push_blocks | steem | debug_node_api.yml | disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/disabled-refresh | 口径刷新为「源码仍定义；插件未在公共节点启用」（决策 3-②） |
| debug_node_api.debug_set_hardfork | steem | debug_node_api.yml | disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/disabled-refresh | 口径刷新为「源码仍定义；插件未在公共节点启用」（决策 3-②） |
| follow_api.get_account_reputations | both | follow_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| follow_api.get_blog | both | follow_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| follow_api.get_blog_authors | steem | follow_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| follow_api.get_blog_entries | both | follow_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| follow_api.get_feed | steem | follow_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| follow_api.get_feed_entries | steem | follow_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| follow_api.get_follow_count | both | follow_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| follow_api.get_followers | both | follow_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| follow_api.get_followers_by_page | hivemind | follow_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| follow_api.get_following | both | follow_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| follow_api.get_following_by_page | hivemind | follow_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| follow_api.get_reblogged_by | both | follow_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| hive.db_head_state | hivemind | hive.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| market_history_api.get_market_history | steem | market_history_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| market_history_api.get_market_history_buckets | steem | market_history_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| market_history_api.get_order_book | steem | market_history_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| market_history_api.get_recent_trades | steem | market_history_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| market_history_api.get_ticker | steem | market_history_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| market_history_api.get_trade_history | steem | market_history_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| market_history_api.get_volume | steem | market_history_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| network_broadcast_api.broadcast_block | steem | network_broadcast_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| network_broadcast_api.broadcast_transaction | steem | network_broadcast_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| rc_api.find_rc_accounts | steem | rc_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| rc_api.get_resource_params | steem | rc_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| rc_api.get_resource_pool | steem | rc_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| reputation_api.get_account_reputations | steem | reputation_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| rewards_api.simulate_curve_payouts | steem | rewards_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| tags_api.get_account_votes | hivemind | tags_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` | hivemind 侧为 dummy 绑定（serve.py 注册了方法名但无独立实现，返回空壳） |
| tags_api.get_active_votes | steem | tags_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| tags_api.get_comment_discussions_by_payout | both | tags_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| tags_api.get_content_replies | both | tags_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| tags_api.get_discussion | both | tags_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| tags_api.get_discussions_by_active | steem | tags_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| tags_api.get_discussions_by_author_before_date | both | tags_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| tags_api.get_discussions_by_blog | both | tags_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| tags_api.get_discussions_by_cashout | steem | tags_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| tags_api.get_discussions_by_children | steem | tags_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| tags_api.get_discussions_by_comments | both | tags_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| tags_api.get_discussions_by_created | both | tags_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| tags_api.get_discussions_by_feed | steem | tags_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| tags_api.get_discussions_by_hot | both | tags_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| tags_api.get_discussions_by_promoted | both | tags_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| tags_api.get_discussions_by_trending | both | tags_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| tags_api.get_discussions_by_votes | steem | tags_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| tags_api.get_post_discussions_by_payout | both | tags_api.yml | - | alive (alive) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-alive | `all-good` |  |
| tags_api.get_replies_by_last_update | steem | tags_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| tags_api.get_tags_used_by_author | steem | tags_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| tags_api.get_trending_tags | steem | tags_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| transaction_status_api.find_transaction | steem | transaction_status_api.yml | removed | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src+ doc+ node-dead | `annotation-refresh`/removed-unsupported | 源码清单仍定义此方法，「Removed from the API」口径不成立；标注需刷新（T22/T23 输入） |
| witness_api.get_account_bandwidth | none | witness_api.yml | removed+disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src- doc+ node-dead | `removed-keep` | 两源清单均无此名 — removed 标注维持，理由升级为源码缺失实证（决策 3-③） |
| witness_api.get_reserve_ratio | none | witness_api.yml | removed+disabled | dead (dead) | drift-snapshot 2026-10-28 (drift-2026-10-28.json) | src- doc+ node-dead | `removed-keep` | 两源清单均无此名 — removed 标注维持，理由升级为源码缺失实证（决策 3-③） |

Verdict rules: `alive` = dispatched on both probe nodes (or drift snapshot alive/changed); `dead` = structured not-found on both; a single-node anomaly never kills. Undocumented names were existence-probed live (empty params; the legacy `call` adapter probed with its array-params convention — see the row note); provenance is in `node source`.
