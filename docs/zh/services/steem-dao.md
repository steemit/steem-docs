---
title: Steem DAO
description: Steem DAO——Steem 提案系统（Steem Proposal System）背后的链上金库与提案资金机制。
---

# Steem DAO

Steem DAO 是 **Steem Proposal System（SPS，Steem 提案系统）** 背后的链上资金机制，由 Hardfork 21 于 2019 年 8 月引入。它由一个金库账户 `@steem.dao` 和一组**提案（proposal）**组成——提案是存储在区块链上的资金申请，由利益相关者按其质押量投票，并每天以 STEEM 美元（SBD）从金库中支付。

提案是链上为开发与基础设施工作提供资金的方式：任何人都可以创建提案，质押量决定它获得多少支持，金库则向利益相关者排名足够高的提案付款。

## 工作原理

- **创建** —— 一条 `create_proposal` 操作将提案存储到链上。提案有一个创建者（creator）、一个**接收方（receiver）**账户（由其领取支付）、起止日期、以 SBD 计价的每日报酬，以及一个主题（subject）和一条指向描述该提案的讨论帖的永久链接（permlink）。
- **投票** —— 账户通过 `update_proposal_votes` 操作对提案投票（支持或反对）。投票权重按质押量加权，与见证人（witness）投票一样：每个提案都会累计一个以权益份额（VESTS）计的 `total_votes` 数值。
- **每日拨款** —— 每天，活跃提案按 `total_votes` 排名，并按名次顺序获得拨款，直到当日的提案预算耗尽为止。排名在预算之外的提案当天得不到任何资金。
- **Return Proposal（返还提案）** —— 提案 id 0（@gtg 创建的 "Return Proposal"）是一项长期约定。它带有极高的 `daily_pay`，并始终保持被投赞成票的状态，从而把当日预算的剩余部分回收进金库。在实践中它充当支出上限：在 Return Proposal 与工作提案之间移动投票，决定了 DAO 每天的实际支出规模。
- **移除** —— 提案进行期间，其创建者可以用一条 `remove_proposal` 操作将其移除；投票随时可以增加或撤销。

## 金库

金库就是 `@steem.dao` 账户。它持有未支出的预算——每日通胀的一部分加上 Return Proposal 返还的部分——当利益相关者投票选择让支出低于新增积累时，金库会随时间增长。金库当前余额：<DaoTreasuryBalance fallback="约 259 万 SBD（2026 年 11 月）" />。

实时查询金库：

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.get_accounts","params":[["steem.dao"]],"id":1}'
```

## 查询提案

按 id 获取特定提案：

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.find_proposals","params":[[0,1,2]],"id":1}'
```

每个提案对象都带有 `proposal_id`、`creator`、`receiver`、`start_date`、`end_date`、`daily_pay`、`subject`、`permlink` 和 `total_votes`。完整列表可按状态排序和过滤，通过 `list_proposals` 获取；`total_votes` 背后的逐条投票可通过 `list_proposal_votes` 列出。

## 生命周期

提案在其 `start_date` 变为**活跃**，只要保持活跃且排名处于每日预算之内就持续获得拨款，并在其 `end_date` 变为**过期**。最早的提案可以追溯到该系统 2019 年 8 月 27 日上线之时——提案 id 0，即 Return Proposal，至今仍在进行中，结束日期为 2029 年 12 月 31 日。

## API 参考

| API | 用途 |
|---|---|
| [condenser_api.find_proposals](/api/condenser_api/find_proposals.html) | 按 id 获取提案 |
| [condenser_api.list_proposals](/api/condenser_api/list_proposals.html) | 列出提案，按状态排序和过滤 |
| [condenser_api.list_proposal_votes](/api/condenser_api/list_proposal_votes.html) | 列出 `total_votes` 背后的投票 |
| [database_api.find_proposals](/api/database_api/find_proposals.html) | 插件原生变体 |
| [database_api.list_proposals](/api/database_api/list_proposals.html) | 插件原生变体 |
| [database_api.list_proposal_votes](/api/database_api/list_proposal_votes.html) | 插件原生变体 |

创建提案、为提案投票和移除提案（`create_proposal`、`update_proposal_votes`、`remove_proposal`）都是广播操作——它们需要签名的交易，因此属于客户端库的广播工作流，而不是简单的 RPC 调用。
