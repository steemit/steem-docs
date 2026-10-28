---
title: "API 参考"
description: "由 data/apidefinitions 生成的 JSON-RPC API 参考总览（中文）"
---

<!--
zh API 总览（T11，手写静态页）。本页是 docs/api/index.md（构建期生成）的中文
对应版：卡片数量与计数必须与其保持同步（数据文件变化时 docs:gen 会更新英文
总览，本页需人工同步）。20 个方法类 API 卡片指向 /zh/api/ 下的中文索引页；
2 个操作列表 API（broadcast_ops*）暂无中文版，直接桥接到英文页。
注意：frontmatter 必须位于文件最前面（否则构建器无法解析 title/description），
维护注释只能放在其后。
-->

下方 JSON-RPC API 参考由 `data/apidefinitions/*.yml` 在构建期生成。各 API 的中文索引页列出全部方法并链接到对应的英文方法页（方法页全文暂为英文，中文翻译将由后续批次补齐）。

# API 参考

<div class="api-cards">

<div class="api-card">

[account_by_key_api](/zh/api/account_by_key_api/) <span class="badge badge-count">1 个方法</span>

<p class="api-card-summary">按公钥反查账户信息。AppBase API，仍在开发中，接口可能变更。</p>

</div>

<div class="api-card">

[account_history_api](/zh/api/account_history_api/) <span class="badge badge-count">4 个方法</span>

<p class="api-card-summary">查询账户历史（操作流水）。AppBase API，仍在开发中，接口可能变更。</p>

</div>

<div class="api-card">

[block_api](/zh/api/block_api/) <span class="badge badge-count">2 个方法</span>

<p class="api-card-summary">查询区块插件相关的数据。AppBase API，仍在开发中，接口可能变更。</p>

</div>

<div class="api-card">

[bridge](/zh/api/bridge/) <span class="badge badge-count">19 个方法</span>

<p class="api-card-summary">以 JSON-RPC 形式呈现 hivemind 数据库的解析结果。</p>

</div>

<div class="api-card">

[call](/zh/api/call/) <span class="badge badge-count">1 个方法</span>

<p class="api-card-summary">旧式 JSON-RPC `call` 约定适配器，由 hivemind API 服务器提供。</p>

</div>

<div class="api-card">

[chain_api](/zh/api/chain_api/) <span class="badge badge-count">2 个方法</span>

<p class="api-card-summary">区块/交易的直接推送端点。chain_api 插件在源码中仍有定义，但未在公共节点启用。</p>

</div>

<div class="api-card">

[condenser_api](/zh/api/condenser_api/) <span class="badge badge-count">90 个方法</span>

<p class="api-card-summary">为平滑迁移而设的聚合 API：包含当前存在的全部方法，沿用既有参数格式，老应用只需把请求指向 condenser_api 即可接入 Appbase。</p>

</div>

<div class="api-card">

[database_api](/zh/api/database_api/) <span class="badge badge-count">57 个方法</span>

<p class="api-card-summary">查询账户、交易与区块链数据。</p>

</div>

<div class="api-card">

[debug_node_api](/zh/api/debug_node_api/) <span class="badge badge-count">9 个方法</span>

<p class="api-card-summary">私有插件，支持各类链上“假设推演”实验；公网节点不提供该方法族。</p>

</div>

<div class="api-card">

[follow_api](/zh/api/follow_api/) <span class="badge badge-count">12 个方法</span>

<p class="api-card-summary">查询声誉与账户关注等社交关系数据。AppBase API，仍在开发中，接口可能变更。</p>

</div>

<div class="api-card">

[hive](/zh/api/hive/) <span class="badge badge-count">1 个方法</span>

<p class="api-card-summary">由 hivemind API 服务器提供的状态与诊断方法。</p>

</div>

<div class="api-card">

[jsonrpc](/zh/api/jsonrpc/) <span class="badge badge-count">2 个方法</span>

<p class="api-card-summary">查询 JSON-RPC 层自身的元信息（如可用 API 列表）。AppBase API，仍在开发中，接口可能变更。</p>

</div>

<div class="api-card">

[market_history_api](/zh/api/market_history_api/) <span class="badge badge-count">7 个方法</span>

<p class="api-card-summary">查询市场历史数据（价格与成交量）。AppBase API，仍在开发中，接口可能变更。</p>

</div>

<div class="api-card">

[network_broadcast_api](/zh/api/network_broadcast_api/) <span class="badge badge-count">2 个方法</span>

<p class="api-card-summary">广播交易与区块。AppBase API，仍在开发中，接口可能变更。</p>

</div>

<div class="api-card">

[rc_api](/zh/api/rc_api/) <span class="badge badge-count">3 个方法</span>

<p class="api-card-summary">查询资源信用（RC）相关指标。参见：RC 带宽系统、0.20.2 发布说明、开发者指南：资源信用系统。</p>

</div>

<div class="api-card">

[reputation_api](/zh/api/reputation_api/) <span class="badge badge-count">1 个方法</span>

<p class="api-card-summary">账户声誉值查询，供 condenser_api 按需调用 follow_api 或 reputation_api。</p>

</div>

<div class="api-card">

[rewards_api](/zh/api/rewards_api/) <span class="badge badge-count">1 个方法</span>

<p class="api-card-summary">返回收益曲线的模拟计算。参数：curve:string；var1:string。</p>

</div>

<div class="api-card">

[tags_api](/zh/api/tags_api/) <span class="badge badge-count">21 个方法</span>

<p class="api-card-summary">查询标签、帖子与讨论串。AppBase API，仍在开发中，接口可能变更。</p>

</div>

<div class="api-card">

[transaction_status_api](/zh/api/transaction_status_api/) <span class="badge badge-count">1 个方法</span>

<p class="api-card-summary">在调用 condenser_api.broadcast_transaction 之后评估交易在链上的状态。</p>

</div>

<div class="api-card">

[witness_api](/zh/api/witness_api/) <span class="badge badge-count">2 个方法</span>

<p class="api-card-summary">见证人（witness）相关 API，0.20.6 起已移除，仅作存档。</p>

</div>

<div class="api-card">

[broadcast_ops](/api/broadcast_ops/) <span class="badge badge-count">75 个操作（英文页）</span>

<p class="api-card-summary">Steem 链上的广播操作全集——操作（operation）是向链上表达意图的基本单元，按类型组织并被组装进交易后广播。</p>

</div>

<div class="api-card">

[broadcast_ops_communities](/api/broadcast_ops_communities/) <span class="badge badge-count">10 个操作（英文页）</span>

<p class="api-card-summary">与社区框架交互的 custom_json 操作（id 为 community；follow、reblog 等其他 id 也被社区解析）。</p>

</div>

</div>
