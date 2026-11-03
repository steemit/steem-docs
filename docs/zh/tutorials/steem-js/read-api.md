---
title: steem-js - 读取链上数据
description: steem-js 读 API 全览——标签、博客、讨论、区块、全局属性、账户、市场、投票、内容、见证人、登录、关注、身份验证、formatter 与 utils。
---

# steem-js: 读取链上数据

本页汇总 `steem.api` 的读取端示例，迁移自 [steem-js](https://github.com/steemit/steem-js) 文档。安装、配置与使用示例见[快速上手教程](/zh/tutorials/steem-js/index.html)；广播操作见[广播操作](/zh/tutorials/steem-js/broadcast.html)。

> 下方每个辅助方法都封装了一个 JSON-RPC 方法，详见生成的 [API 参考](/zh/api/)——例如 `getAccountsAsync` 对应 [condenser_api.get_accounts](/zh/api/condenser_api/get_accounts.html)，`getContentAsync` 对应 [condenser_api.get_content](/zh/api/condenser_api/get_content.html)。这里的示例展示的是 steem-js 客户端侧的用法。

## 读取 API 方法

## 读取 API 方法

下文记录用于读取链上状态的 `steem.api` 辅助方法。除特别说明外，调用都会路由到节点上的 **`condenser_api`**。

### 标签

#### 获取趋势标签

按热度值降序返回当前热门标签的列表。

```javascript
steem.api.getTrendingTagsAsync(afterTag, limit).then(function(result) {
  console.log(result);
});
```

**参数说明：**

| 参数 | 说明 | 数据类型 | 备注 |
|---|---|---|---|
| afterTag | 起始的最后一个标签名 | String | 使用空字符串 `''` 开始列表。后续调用可传入上一次返回的最后一个标签名 |
| limit | 返回标签的最大数量 | Integer | |

**调用示例：**

```javascript
steem.api.getTrendingTagsAsync('', 2).then(function(result) {
  console.log(result);
});
```

**返回示例：**

```javascript
[
  { name: '', total_payouts: '37610793.383 SBD', net_votes: 4211122, top_posts: 411832, comments: 1344461, trending: '5549490701' },
  { name: 'life', total_payouts: '8722947.658 SBD', net_votes: 1498401, top_posts: 127103, comments: 54049, trending: '570954588' }
]
```

**使用返回结果：**

```javascript
// Extract tag names from the result into an array
const tagNames = result.map(function(item) { return item.name; });
console.log(tagNames);

// Get the last tag for subsequent calls
const lastKnownTag = result[result.length - 1].name;

// Use the last known tag to get the next group of tags
steem.api.getTrendingTagsAsync(lastKnownTag, 2).then(function(result) {
  console.log(result);
});
```

#### 获取博客

获取 `account` 在索引为 `entryId` 的帖子之前的最后 `limit` 篇帖子。

```javascript
steem.api.getBlogAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**参数说明：**

| 参数 | 数据类型 | 说明 |
|---------|--------|-----------|
| account | string | Steem 用户名 |
| entryId | number | 正数——开始计数的索引（从零开始） |
| limit | number | 正数——返回帖子的最大数量 |

**调用示例：**

```javascript
steem.api.getBlogAsync("username", 10, 3).then(function(data) {
  console.log(data);
});

// In this case we get [3] posts, the newest of which is the one with index [10]
// (that's the 11th post, because post indexes are zero-based)
// This means the results will be posts [10, 9 and 8]
```

#### 获取博客作者

获取曾在某人博客中发帖的所有作者，以及各自在该博客中的发帖次数。

```javascript
steem.api.getBlogAuthorsAsync(blogAccount).then(function(data) {
  console.log(data);
});
```

**返回示例：**

```javascript
[
  ['username1', 1],
  ['username2', 1],
  ['username3', 3],
  ['username4', 2],
  ['username5', 1]
]
```

#### 获取博客条目

获取 `account` 在索引为 `entryId` 的帖子之前的最后 `limit` 篇帖子。与 getBlog 非常相似，但返回的结果对象更简单。

```javascript
steem.api.getBlogEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**返回示例：**

```javascript
[
  { author: 'username', permlink: 'post-permlink-10', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 10 },
  { author: 'username', permlink: 'post-permlink-9', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 9 },
  { author: 'username', permlink: 'post-permlink-8', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 8 }
]
```

#### 按趋势获取讨论

获取 Steem 帖子，效果如同 steemit.com 上的热门（trending）标签页。

```javascript
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});
```

**调用示例：**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});

// NOTE! The default limit is 0. Not setting a limit will get you an empty result.
```

#### 其他讨论查询方法

```javascript
// By created time
steem.api.getDiscussionsByCreatedAsync(query);

// By activity
steem.api.getDiscussionsByActiveAsync(query);

// By cashout time
steem.api.getDiscussionsByCashoutAsync(query);

// By votes
steem.api.getDiscussionsByVotesAsync(query);

// By children
steem.api.getDiscussionsByChildrenAsync(query);

// By hot
steem.api.getDiscussionsByHotAsync(query);

// By feed
steem.api.getDiscussionsByFeedAsync(query);

// By blog
steem.api.getDiscussionsByBlogAsync(query);

// By comments
steem.api.getDiscussionsByCommentsAsync(query);
```

#### 按推广获取讨论

按推广花费从多到少获取近期帖子。

```javascript
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

**调用示例：**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

### 区块与交易

#### 获取区块头

```javascript
steem.api.getBlockHeaderAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### 获取区块

```javascript
steem.api.getBlockAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### 获取区块内操作

获取给定区块中的全部操作。

```javascript
steem.api.getOpsInBlockAsync(blockNum, onlyVirtual).then(function(data) {
  console.log(data);
});
```

**参数说明：**

| 参数 | 数据类型 | 说明 |
|---------|--------|-----------|
| blockNum | number | 正数 |
| onlyVirtual | boolean | 'false' 返回全部操作；'true' 仅返回虚拟操作 |

**调用示例：**

```javascript
steem.api.getOpsInBlockAsync(10000001, false).then(function(data) {
  console.log(data);
});
```

#### 获取状态

获取关于 `path` 状态的大量信息。

```javascript
steem.api.getStateAsync(path).then(function(data) {
  console.log(data);
});
```

**调用示例：**

```javascript
// Valid call examples:
steem.api.getStateAsync("/@username");
steem.api.getStateAsync("/@username/permlink-of-post");
steem.api.getStateAsync("/@username/comments");
steem.api.getStateAsync("/@username/recent-replies");
steem.api.getStateAsync("/trending");
steem.api.getStateAsync("/trending/collorchallenge");
```

### 全局属性

`getConfig`、`getDynamicGlobalProperties`、`getFeedHistory` 和 `getWitnessSchedule` 在节点上使用 **`database_api`**；`getChainProperties`、`getHardforkVersion` 和 `getNextScheduledHardfork` 使用 **`condenser_api`**。

#### 获取配置

```javascript
steem.api.getConfigAsync().then(function(result) {
  console.log(result);
});
```

#### 获取动态全局属性

```javascript
steem.api.getDynamicGlobalPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### 获取链属性

```javascript
steem.api.getChainPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### 获取 Feed 条目

获取用户动态（feed）中的帖子。动态会展示已关注用户的帖子，以及他们转发的内容。

```javascript
steem.api.getFeedEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**参数说明：**

| 参数 | 数据类型 | 说明 |
|---------|--------|-----------|
| account | string | Steem 用户名 |
| entryId | number | 开始计数的帖子 ID。写 '0' 表示从最新帖子开始 |
| limit | number | 正数 |

**返回示例：**

```javascript
[
  { author: 'otherusername', permlink: 'permlink', reblog_by: ['resteembot'], reblog_on: '2018-02-11T18:42:54', entry_id: 10260 },
  { author: 'otherusername', permlink: 'permlink', reblog_by: [], reblog_on: '2018-02-11T18:39:24', entry_id: 10259 }
]
```

#### 获取 Feed 历史

```javascript
steem.api.getFeedHistoryAsync().then(function(result) {
  console.log(result);
});
```

#### 获取当前中间历史价

```javascript
steem.api.getCurrentMedianHistoryPriceAsync().then(function(result) {
  console.log(result);
});
```

#### 获取行情摘要

获取 Steem 市场的最新汇总数据。

```javascript
steem.api.getTickerAsync().then(function(data) {
  console.log(data);
});
```

**返回示例：**

```javascript
{
  latest: '0.89732142857142860',
  lowest_ask: '0.89684014869888484',
  highest_bid: '0.89600000000000002',
  percent_change: '-14.56712923228768730',
  steem_volume: '7397.697 STEEM',
  sbd_volume: '6662.316 SBD'
}
```

#### 获取交易历史

获取 `start` 日期到 `end` 日期之间给定时间段的成交历史。

```javascript
steem.api.getTradeHistoryAsync(start, end, limit).then(function(data) {
  console.log(data);
});
```

**参数说明：**

| 参数 | 数据类型 | 说明 |
|---------|--------|-----------|
| start | string | 格式为 "2018-01-01T00:00:00" 的日期时间字符串 |
| end | string | 格式为 "2018-01-01T00:00:00" 的日期时间字符串 |
| limit | number | 正数 |

**调用示例：**

```javascript
const start = "2018-01-01T00:00:00";
const end = "2018-01-02T00:00:00";

steem.api.getTradeHistoryAsync(start, end, 5).then(function(data) {
  console.log(data);
});
```

#### 获取版本

获取你所连接的 Steem 区块链版本。

```javascript
steem.api.getVersionAsync().then(function(data) {
  console.log(data);
});
```

**返回示例：**

```javascript
{
  blockchain_version: '0.19.2',
  steem_revision: '07be64314ce9d277eb7da921b459c993c2e2412c',
  fc_revision: '8dd1fd1ec0906509eb722fa7c8d280d59bcca23d'
}
```

#### 获取成交量

获取 STEEM 与 STEEM 美元（SBD）的交易量。

```javascript
steem.api.getVolumeAsync().then(function(data) {
  console.log(data);
});
```

**返回示例：**

```javascript
{
  steem_volume: '8101.888 STEEM',
  sbd_volume: '7287.268 SBD'
}
```

#### 获取硬分叉版本

获取 STEEM 区块链当前的硬分叉版本。

```javascript
steem.api.getHardforkVersionAsync().then(function(result) {
  console.log(result); // '0.19.0'
});
```

#### 获取下一个计划硬分叉

```javascript
steem.api.getNextScheduledHardforkAsync().then(function(result) {
  console.log(result);
});
```

#### 获取奖励基金

```javascript
steem.api.getRewardFundAsync(name).then(function(result) {
  console.log(result);
});
```

#### 获取质押代理

返回某个 `account` 发起的委托列表，以权益份额（VESTS）计。

```javascript
steem.api.getVestingDelegationsAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**参数说明：**

| 参数 | 说明 | 数据类型 | 备注 |
|---|---|---|---|
| account | 发起委托的账户 | String | |
| from | 起始的最后一个账户名 | String | 使用空字符串 `''` 开始列表。后续调用可传入上一个被委托人的账户名 |
| limit | 返回委托记录的最大数量 | Integer | |

**调用示例：**

```javascript
steem.api.getVestingDelegationsAsync('ned', '', 2).then(function(result) {
  console.log(result);
});
```

**返回示例：**

```javascript
[
  { id: 498422, delegator: 'ned', delegatee: 'spaminator', vesting_shares: '409517519.233783 VESTS', min_delegation_time: '2018-01-16T19:30:36' },
  { id: 181809, delegator: 'ned', delegatee: 'surpassinggoogle', vesting_shares: '1029059275.000000 VESTS', min_delegation_time: '2017-08-08T15:25:15' }
]
```

### 密钥

#### 获取密钥引用

```javascript
steem.api.getKeyReferencesAsync(key).then(function(result) {
  console.log(result);
});
```

### 账户

#### 获取账户

按名称获取多个账户。

```javascript
steem.api.getAccountsAsync(names).then(function(result) {
  console.log(result);
});
```

**参数说明：**

| 参数 | 数据类型 | 说明 |
|---------|--------|-----------|
| names | array | 账户名（字符串）数组 |

**调用示例：**

```javascript
steem.api.getAccountsAsync(['ned', 'dan']).then(function(accounts) {
  console.log(accounts);
});
```

**注意：** 要获取单个账户，请传入只含一个名字的数组：`getAccountsAsync(['username'])`，然后取结果中的第一个元素。

#### 获取账户引用

```javascript
steem.api.getAccountReferencesAsync(accountId).then(function(result) {
  console.log(result);
});
```

#### 查找账户名

```javascript
steem.api.lookupAccountNamesAsync(accountNames).then(function(result) {
  console.log(result);
});
```

#### 查找账户

```javascript
steem.api.lookupAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### 获取账户数量

```javascript
steem.api.getAccountCountAsync().then(function(result) {
  console.log(result);
});
```

#### 获取转换请求

```javascript
steem.api.getConversionRequestsAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### 获取账户历史

```javascript
steem.api.getAccountHistoryAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**签名版本（用于私有账户数据）：**

```javascript
// For accessing private or authenticated account data
const privateKey = steem.auth.toWif('username', 'password', 'active');

steem.api.signedCall(
  'condenser_api.get_account_history',
  ['username', -1, 100],
  'username',
  privateKey,
  function(err, result) {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Private account history:', result);
    }
  }
);
```

#### 获取所有者历史

```javascript
steem.api.getOwnerHistoryAsync(account).then(function(result) {
  console.log(result);
});
```

#### 获取恢复请求

```javascript
steem.api.getRecoveryRequestAsync(account).then(function(result) {
  console.log(result);
});
```

#### 获取账户声誉

获取名称与 `lowerBoundName` 最相似的 `limit` 个账户的声誉值。

```javascript
steem.api.getAccountReputationsAsync(lowerBoundName, limit).then(function(data) {
  console.log(data);
});
```

**返回示例：**

```javascript
[
  { account: 'username', reputation: '26727073581' },
  { account: 'username-taken', reputation: 0 }
]
```

### 市场

#### 获取订单簿

```javascript
steem.api.getOrderBookAsync(limit).then(function(result) {
  console.log(result);
});
```

#### 获取市场订单簿

从市场订单簿中取出买卖两向最前面的 `limit` 条目。

```javascript
steem.api.getMarketOrderBookAsync(limit).then(function(data) {
  console.log(data);
});
```

**返回示例：**

```javascript
{
  bids: [
    { price: '0.91116173120728938', steem: 2195, sbd: 2000 },
    { price: '0.91089965397923878', steem: 1156, sbd: 1053 }
  ],
  asks: [
    { price: '0.91145625249700357', steem: 9053, sbd: 8251 },
    { price: '0.91159226975214813', steem: 16184, sbd: 14753 }
  ]
}
```

#### 获取挂单

```javascript
steem.api.getOpenOrdersAsync(owner).then(function(result) {
  console.log(result);
});
```

`getOrderBook` 在节点上使用 **`database_api`**；`getMarketOrderBook` 使用 **`market_history_api`**。

#### 获取市场历史分桶

```javascript
steem.api.getMarketHistoryBucketsAsync().then(function(data) {
  console.log(data); // [15, 60, 300, 3600, 86400]
});
```

### 权限与校验

#### 获取交易十六进制

```javascript
steem.api.getTransactionHexAsync(trx).then(function(result) {
  console.log(result);
});
```

#### 获取交易

```javascript
steem.api.getTransactionAsync(trxId).then(function(result) {
  console.log(result);
});
```

#### 获取所需签名

```javascript
steem.api.getRequiredSignaturesAsync(trx, availableKeys).then(function(result) {
  console.log(result);
});
```

#### 获取候选签名

```javascript
steem.api.getPotentialSignaturesAsync(trx).then(function(result) {
  console.log(result);
});
```

#### 校验权限

在节点上使用 **`database_api`**。

```javascript
steem.api.verifyAuthorityAsync(trx).then(function(result) {
  console.log(result);
});
```

#### 校验账户权限

在节点上使用 **`database_api`**。

```javascript
steem.api.verifyAccountAuthorityAsync(nameOrId, signers).then(function(result) {
  console.log(result);
});
```

#### 获取作者使用的标签

获取某 Steem 用户使用过的标签。大多数用户还没有标签，但有些用户有。

```javascript
steem.api.getTagsUsedByAuthorAsync(author).then(function(data) {
  console.log(data);
});
```

**调用示例：**

```javascript
steem.api.getTagsUsedByAuthorAsync("good-karma").then(function(data) {
  console.log(data); // [['challenge', 0]]
});
```

### 投票

#### 获取有效投票

```javascript
steem.api.getActiveVotesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### 获取账户投票

```javascript
steem.api.getAccountVotesAsync(voter).then(function(result) {
  console.log(result);
});
```

### 内容

#### 获取内容

```javascript
steem.api.getContentAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### 获取内容回复

```javascript
steem.api.getContentRepliesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### 按作者与日期获取讨论

```javascript
steem.api.getDiscussionsByAuthorBeforeDateAsync(author, startPermlink, beforeDate, limit).then(function(result) {
  console.log(result);
});
```

#### 获取转发账户

列出转发（resteem）了给定帖子的用户。

```javascript
steem.api.getRebloggedByAsync(author, permlink).then(function(data) {
  console.log(data);
});
```

**返回示例：**

```javascript
['author', 'user1', 'user2', 'user3', 'user4']
```

#### 按最后更新时间获取回复

```javascript
steem.api.getRepliesByLastUpdateAsync(startAuthor, startPermlink, limit).then(function(result) {
  console.log(result);
});
```

### 见证人

#### 获取见证人

```javascript
steem.api.getWitnessesAsync(witnessIds).then(function(result) {
  console.log(result);
});
```

#### 按账户获取见证人

返回给定 `accountName` 对应的见证人（witness）信息。

```javascript
steem.api.getWitnessByAccountAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### 按票数获取见证人

```javascript
steem.api.getWitnessesByVoteAsync(from, limit).then(function(result) {
  console.log(result);
});
```

#### 查找见证人账户

```javascript
steem.api.lookupWitnessAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### 获取见证人数量

```javascript
steem.api.getWitnessCountAsync().then(function(result) {
  console.log(result);
});
```

#### 获取活跃见证人

```javascript
steem.api.getActiveWitnessesAsync().then(function(result) {
  console.log(result);
});
```

#### 获取见证人调度表

获取关于见证人的一些基本信息。

```javascript
steem.api.getWitnessScheduleAsync().then(function(data) {
  console.log(data);
});
```

**返回示例：**

```javascript
{
  id: 0,
  current_virtual_time: '292589412128104496649868821',
  next_shuffle_block_num: 19756485,
  current_shuffled_witnesses: '31797..................00000000',
  num_scheduled_witnesses: 21,
  top19_weight: 1,
  timeshare_weight: 5,
  miner_weight: 1,
  witness_pay_normalization_factor: 25,
  median_props: {
    account_creation_fee: '0.100 STEEM',
    maximum_block_size: 65536,
    sbd_interest_rate: 0
  },
  majority_version: '0.19.2',
  max_voted_witnesses: 20,
  max_miner_witnesses: 0,
  max_runner_witnesses: 1,
  hardfork_required_witnesses: 17
}
```

## 登录 API

## 登录 API

### 登录

⚠️ 使用你的用户名和密码调用该方法**并不安全**。该方法始终返回 `true`，仅在内部以空值调用以启用广播。

```javascript
steem.api.loginAsync('', '').then(function(result) {
  console.log(result);
});
```

### 按名称获取 API

```javascript
steem.api.getApiByNameAsync(apiName).then(function(result) {
  console.log(result);
});
```

---

## 关注 API

关注（follow）API 查询账户之间关注关系的信息。该 API 是只读的，不会在区块链上产生任何变更。

### 获取关注者

按字母顺序返回关注某个特定账户的账户数组。

```javascript
steem.api.getFollowersAsync(following, startFollower, followType, limit).then(function(result) {
  console.log(result);
});
```

**参数说明：**

| 参数 | 说明 | 数据类型 | 备注 |
|---|---|---|---|
| following | 查询哪个账户的关注者 | String | 不带前导 @ 符号 |
| startFollower | 从哪个关注者开始列出？ | String | 不带前导 @ 符号。使用空字符串 `''` 开始列表。后续调用可传入上一个关注者的名字 |
| followType | ?? | ?? | 设为 0 或 'blog' 均可 |
| limit | 返回关注者的最大数量 | Integer | |

**调用示例：**

```javascript
steem.api.getFollowersAsync('ned', '', 'blog', 2).then(function(result) {
  console.log(result);
});
```

**返回示例：**

```javascript
[
  { follower: 'a-0-0', following: 'ned', what: ['blog'] },
  { follower: 'a-0-0-0-1abokina', following: 'ned', what: ['blog'] }
]
```

### 获取关注列表

按字母顺序返回某个特定账户所关注的账户数组。

```javascript
steem.api.getFollowingAsync(follower, startFollowing, followType, limit).then(function(result) {
  console.log(result);
});
```

**返回示例：**

```javascript
[
  { follower: 'dan', following: 'dantheman', what: ['blog'] },
  { follower: 'dan', following: 'krnel', what: ['blog'] }
]
```

### 获取关注计数

```javascript
steem.api.getFollowCountAsync(account).then(function(result) {
  console.log(result);
});
```

**返回示例：**

```javascript
{ account: 'ned', follower_count: 16790, following_count: 913 }
```

## 身份验证

## 身份验证

### 校验

```javascript
steem.auth.verify(name, password, auths);
```

### 生成密钥

```javascript
steem.auth.generateKeys(name, password, roles);
```

### 获取私钥

```javascript
steem.auth.getPrivateKeys(name, password, roles);
```

### 判断是否为 WIF

```javascript
steem.auth.isWif(privWif);
```

### 转换为 WIF

```javascript
steem.auth.toWif(name, password, role);
```

### 校验 WIF 是否有效

```javascript
steem.auth.wifIsValid(privWif, pubWif);
```

### WIF 转公钥

```javascript
steem.auth.wifToPublic(privWif);
```

### 签名交易

使用提供的私钥对交易签名。签名的摘要为 `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`，其中 `chain_id` 来自所配置的链（主网默认为全零）。

- **`trx`** — 交易对象：`ref_block_num`、`ref_block_prefix`、`expiration`、`operations`（`[opType, opData]` 数组）和 `extensions`。
- **`keys`** — 用于签名的 WIF 私钥数组。
- 返回追加了 `signatures` 数组的交易对象。

```javascript
const wif = '5JLw5dgQAx6rhZEgNN5C2ds1V47RweGshynFSWFbaMohsYsBvE8';
const tx = {
  ref_block_num: 123,
  ref_block_prefix: 456789,
  expiration: '2026-07-10T00:00:00',
  operations: [['transfer', {
    from: 'alice', to: 'bob', amount: '1.000 STEEM', memo: ''
  }]],
  extensions: [],
};

const signedTx = steem.auth.signTransaction(tx, [wif]);
console.log(signedTx.signatures); // ['1f23...']  (hex signatures)
```

> **注意：** `signatures` 字段**不是**签名摘要的一部分。签名过程在附加签名*之前*先序列化交易，因此摘要只覆盖未签名的交易主体。

### 校验交易

校验已签名交易的签名是否由给定的公钥产生。摘要的重建方式与 `signTransaction` 完全一致：`sha256(chain_id ‖ serializeTransaction(normalizedTrx))`。若任一签名对 `publicKey` 有效则返回 `true`，否则返回 `false`。

- **`transaction`** — 已签名的交易对象（必须包含 `signatures` 数组）。计算摘要前会先剥离 `signatures` 字段，因此签名数量无关紧要。
- **`publicKey`** — 用于校验的 `STM…` 公钥。
- 返回 `boolean`。

```javascript
const publicKey = steem.auth.wifToPublic(wif);

// Round-trip: a correctly-signed tx verifies against its signing key
const isValid = steem.auth.verifyTransaction(signedTx, publicKey);
console.log(isValid); // true

// A different public key is rejected
const wrongPub = steem.auth.wifToPublic('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');
console.log(steem.auth.verifyTransaction(signedTx, wrongPub)); // false
```

> **安全应用场景：** 中继/钱包服务器可以在客户端提交交易后调用 `verifyTransaction`，在将交易转发到链上*之前*证明该交易确实由声称账户的密钥签名。这弥补了此前服务器只能检查交易结构、无法验证密码学真实性的纵深防御缺口。

### 序列化交易

将交易序列化为**二进制**形式（FC 风格），返回 `Buffer`。它就是 `signTransaction` 内部使用的同一个序列化器，因此输出与 Steem 节点的交易线上格式逐字节一致。下游应用可以用它自行重建签名摘要。

- **`trx`** — 交易对象（形状与 `signTransaction` 的 `trx` 相同）。
- 返回 `Buffer`。

```javascript
import { sha256 } from '@noble/hashes/sha2';

// Build the exact digest signTransaction signs over:
const buf = steem.auth.serializeTransaction(tx); // Buffer
const chainId = Buffer.alloc(32, 0); // mainnet chain_id (all-zero)
const digest = Buffer.from(sha256(Buffer.concat([chainId, buf])));
console.log(digest.toString('hex')); // 32-byte digest
```

## 格式化工具

## 格式化工具

### 金额

把数值和币种格式化为可发送的合法形式（例如——把小数点后的余数裁剪到只保留 3 位）。

```javascript
steem.formatter.amount(_amount, asset);
```

**参数说明：**

| 参数 | 数据类型 | 说明 |
|---------|--------|-----------|
| _amount | number | 正数 |
| asset | string | Steem 资产的名称（steem、sbd） |

**调用示例：**

```javascript
steem.formatter.amount(53.442346, "STEEM"); // "53.442 STEEM"
```

### Vesting STEEM

把 `account` 持有的权益份额（VESTS）换算成它们所代表的 Steem 数量。

```javascript
steem.formatter.vestingSteem(account, gprops);
```

**调用示例：**

```javascript
steem.api.getAccountsAsync(["username"]).then(function(accounts) {
  steem.api.getStateAsync("/@username").then(function(state) {        
    const vestingSteem = steem.formatter.vestingSteem(accounts[0], state.props);
    console.log(vestingSteem); // 7.42431235
  });
});
```

### 千分位数字

格式化大数字，每 3 位添加一个逗号。注意——只对字符串有效，不能直接传入数字。

```javascript
steem.formatter.numberWithCommas(x);
```

**调用示例：**

```javascript
steem.formatter.numberWithCommas("53304432342.432"); // "53,304,432,342.432"
```

### 估算账户价值

估算 `account` 资产的美元价值。

```javascript
steem.formatter.estimateAccountValue(account).then(function(data) {
  console.log(data); // 32.25
});
```

### 生成建议密码

```javascript
const password = steem.formatter.createSuggestedPassword();
console.log(password); // 'GAz3GYFvvQvgm7t2fQmwMDuXEzDqTzn9'
```

### 评论永久链接（permlink）

```javascript
const parentAuthor = 'ned';
const parentPermlink = 'a-selfie';
const commentPermlink = steem.formatter.commentPermlink(parentAuthor, parentPermlink);
console.log(commentPermlink); // 're-ned-a-selfie-20170621t080403765z'
```

### 声誉

```javascript
const reputation = steem.formatter.reputation(3512485230915);
console.log(reputation); // 56
```

### Vesting 转 STEEM

```javascript
const steemPower = steem.formatter.vestToSteem(vestingShares, totalVestingShares, totalVestingFundSteem);
console.log(steemPower);
```


## 工具

## 工具

### 校验用户名

```javascript
const isValidUsername = steem.utils.validateAccountName('test1234');
console.log(isValidUsername); // null

const isValidUsername2 = steem.utils.validateAccountName('a1');
console.log(isValidUsername2); // 'Account name should be longer.'
```

### 驼峰命名

把带 '_' 字符的字符串格式化为 CamelCase 形式。

```javascript
steem.utils.camelCase(str);
```

**调用示例：**

```javascript
steem.utils.camelCase("example_string"); // "exampleString"
```

## 下一步

- 要修改链上状态，见[广播操作](/zh/tutorials/steem-js/broadcast.html)。
- 需要鉴权的读取与签名验证，见[签名调用与签名验证](/tutorials/steem-js/signed-calls.html)。
- 安装与配置请回到[快速上手教程](/zh/tutorials/steem-js/index.html)。
