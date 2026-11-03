---
title: steem-js - 广播操作
description: steem-js 广播操作全目录——Promise 与回调两种模式、全部广播操作、多重签名与二进制交易序列化。
---

# steem-js: 广播操作

`steem.broadcast` 命名空间会对区块链造成永久性变更：投票、转账、发帖、见证人操作等等。本页收录了 [steem-js](https://github.com/steemit/steem-js) 文档中完整的广播示例；读取链上数据见[读取链上数据](/zh/tutorials/steem-js/read-api.html)。

> 每个操作在线路上的细节见生成的[广播操作参考](/zh/api/broadcast_ops/)。

## 广播 API

## 广播 API

### 广播区块

在 Steem 区块链上广播一个新区块。

```javascript
steem.api.broadcastBlockAsync(blockObject).then(function(data) {
  console.log(data);
});
```

### 同步广播交易

```javascript
steem.api.broadcastTransactionSynchronousAsync(trx).then(function(result) {
  console.log(result);
});
```

## 广播操作

## 广播操作

`steem.broadcast` 方法会对区块链造成永久性变更。

### Promise 支持

所有广播方法同时支持回调与 Promise 两种模式，任选其一：

#### Promise 模式（推荐）

```javascript
// Using Promises directly
steem.broadcast.voteAsync(wif, voter, author, permlink, weight)
  .then(result => console.log(result))
  .catch(error => console.error(error));

// Using async/await
async function castVote() {
  try {
    const result = await steem.broadcast.voteAsync(wif, voter, author, permlink, weight);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
```

#### 回调模式（旧式）

```javascript
steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
});
```

### 创建账户

```javascript
steem.broadcast.accountCreateAsync(wif, fee, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### 带代理创建账户

```javascript
steem.broadcast.accountCreateWithDelegationAsync(wif, fee, delegation, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata, extensions).then(function(result) {
  console.log(result);
});
```

### 代理质押份额

把 STEEM 权益（SP）以权益份额（VESTS）的形式从 `delegator` 委托给 `delegatee`。需要 `delegator` 的 WIF 私钥。把委托数量设为 0 即可取消委托。

```javascript
steem.broadcast.delegateVestingSharesAsync(wif, delegator, delegatee, vesting_shares).then(function(result) {
  console.log(result);
});
```

### 更新账户

```javascript
steem.broadcast.accountUpdateAsync(wif, account, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### 见证人投票代理

```javascript
steem.broadcast.accountWitnessProxyAsync(wif, account, proxy).then(function(result) {
  console.log(result);
});
```

### 见证人投票

```javascript
steem.broadcast.accountWitnessVoteAsync(wif, account, witness, approve).then(function(result) {
  console.log(result);
});
```

### 更改恢复账户

```javascript
steem.broadcast.changeRecoveryAccountAsync(wif, accountToRecover, newRecoveryAccount, extensions).then(function(result) {
  console.log(result);
});
```

### 评论

```javascript
steem.broadcast.commentAsync(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### 评论选项

```javascript
steem.broadcast.commentOptionsAsync(wif, author, permlink, maxAcceptedPayout, percentSteemDollars, allowVotes, allowCurationRewards, extensions).then(function(result) {
  console.log(result);
});
```

`extensions` 参数支持受益人（beneficiary）扩展（tag 0）。传入 `[tag, value]` 数组，例如 `[[0, { beneficiaries: [{ account: 'foo', weight: 1000 }, { account: 'bar', weight: 5000 }] }]]`。为符合 Steem 协议，受益人会在序列化前按账户名自动排序。

### 转换

```javascript
steem.broadcast.convertAsync(wif, owner, requestid, amount).then(function(result) {
  console.log(result);
});
```

### 自定义操作

```javascript
steem.broadcast.customAsync(wif, requiredAuths, id, data).then(function(result) {
  console.log(result);
});
```

### 自定义 JSON

```javascript
steem.broadcast.customJsonAsync(wif, requiredAuths, requiredPostingAuths, id, json).then(function(result) {
  console.log(result);
});
```

### 删除评论

```javascript
steem.broadcast.deleteCommentAsync(wif, author, permlink).then(function(result) {
  console.log(result);
});
```

### 托管操作

```javascript
// Escrow Dispute
steem.broadcast.escrowDisputeAsync(wif, from, to, agent, who, escrowId);

// Escrow Release
steem.broadcast.escrowReleaseAsync(wif, from, to, agent, who, receiver, escrowId, sbdAmount, steemAmount);

// Escrow Transfer
steem.broadcast.escrowTransferAsync(wif, from, to, agent, escrowId, sbdAmount, steemAmount, fee, ratificationDeadline, escrowExpiration, jsonMeta);

// Escrow Approve
steem.broadcast.escrowApproveAsync(wif, from, to, agent, who, escrowId, approve);
```

### 获取托管

```javascript
steem.api.getEscrowAsync(from, escrowId).then(function(data) {
  console.log(data);
});
```

### 发布喂价

```javascript
steem.broadcast.feedPublishAsync(wif, publisher, exchangeRate).then(function(result) {
  console.log(result);
});
```

### 限价单操作

```javascript
// Limit Order Cancel
steem.broadcast.limitOrderCancelAsync(wif, owner, orderid);

// Limit Order Create
steem.broadcast.limitOrderCreateAsync(wif, owner, orderid, amountToSell, minToReceive, fillOrKill, expiration);

// Limit Order Create2
steem.broadcast.limitOrderCreate2Async(wif, owner, orderid, amountToSell, exchangeRate, fillOrKill, expiration);
```

**限价单参数说明：**

| 参数 | 说明 | 数据类型 | 备注 |
|---|---|---|---|
| wif | 活动密钥（active key）对应的私钥 | String | |
| owner | 账户名 | String | 不带前导 @ 符号 |
| orderid | 用户自定义订单号 | Integer | 用于取消订单 |
| amountToSell | 卖出数量 | String | "X.XXX ASSET" 必须保留 3 位小数，例如 "25.100 SBD" |
| minToReceive | 期望获得的数量 | String | "X.XXX ASSET" 必须保留 3 位小数，例如 "20.120 STEEM" |
| fillOrKill | 按当前订单簿成交或取消该订单 | Boolean | `false` 表示订单进入订单簿，直到被取消、成交或到达过期时间 |
| expiration | 订单过期时间 | Integer | 单位为毫秒。0 表示 UNIX 纪元 |

### 账户恢复

```javascript
// Recover Account
steem.broadcast.recoverAccountAsync(wif, accountToRecover, newOwnerAuthority, recentOwnerAuthority, extensions);

// Request Account Recovery
steem.broadcast.requestAccountRecoveryAsync(wif, recoveryAccount, accountToRecover, newOwnerAuthority, extensions);
```

### 转账操作

```javascript
// Transfer
steem.broadcast.transferAsync(wif, from, to, amount, memo);

// Transfer To Vesting
steem.broadcast.transferToVestingAsync(wif, from, to, amount);

// Transfer To Savings
steem.broadcast.transferToSavingsAsync(wif, from, to, amount, memo);

// Transfer From Savings
steem.broadcast.transferFromSavingsAsync(wif, from, requestId, to, amount, memo);

// Cancel Transfer From Savings
steem.broadcast.cancelTransferFromSavingsAsync(wif, from, requestId);
```

**转账参数说明：**

| 参数 | 说明 | 数据类型 | 备注 |
|---|---|---|---|
| wif | `from` 账户的活动密钥（active key）私钥 | String | |
| from | 转出资产的账户名 | String | 不带前导 @ 符号 |
| to | 转入资产的账户名 | String | 不带前导 @ 符号 |
| amount | 要转账的资产数量 | String | "X.XXX ASSET" 必须保留 3 位小数，例如 "5.150 SBD" |

### 投票

```javascript
steem.broadcast.voteAsync(wif, voter, author, permlink, weight).then(function(result) {
  console.log(result);
});
```

### 提取质押

```javascript
steem.broadcast.withdrawVestingAsync(wif, account, vestingShares).then(function(result) {
  console.log(result);
});
```

### 更新见证人

```javascript
steem.broadcast.witnessUpdateAsync(wif, owner, url, blockSigningKey, props, fee).then(function(result) {
  console.log(result);
});
```

### 设置质押提取路径

```javascript
steem.broadcast.setWithdrawVestingRouteAsync(wif, fromAccount, toAccount, percent, autoVest).then(function(result) {
  console.log(result);
});
```

### 获取提取路径

获取提取路线（STEEM 权益提现）。

```javascript
steem.api.getWithdrawRoutesAsync(account, withdrawRouteType).then(function(data) {
  console.log(data);
});
```

### 领取奖励余额

领取待领取的奖励，无论是 Steem、SBD 还是 VESTS。

```javascript
steem.broadcast.claimRewardBalanceAsync(wif, account, reward_steem, reward_sbd, reward_vests).then(function(data) {
  console.log(data);
});
```

**参数说明：**

| 参数 | 数据类型 | 说明 |
|---------|--------|-----------|
| wif | string | 使用 steem.auth.toWif(user, pass, type) |
| account | string | Steem 用户名 |
| reward_steem | string | 形如 "0.000 STEEM" 的余额 |
| reward_sbd | string | 形如 "0.000 SBD" 的余额 |
| reward_vests | string | 形如 "0.000006 VESTS" 的余额 |

### 多重签名

可以使用多重签名来广播操作。

```javascript
steem.broadcast.sendAsync({
  extensions: [],
  operations: [
    ['vote', {
      voter: 'guest123',
      author: 'fabien',
      permlink: 'test',
      weight: 1000
    }]
  ]
}, [privPostingWif1, privPostingWif2]).then(result => {
  console.log(result);
});
```

### 交易序列化（二进制）

广播与签名使用兼容 Steem 协议（FC 风格）的**二进制交易格式**。序列化器位于 `src/auth/serializer/transaction.ts`，由 `steem.auth.signTransaction` 和 `steem.broadcast.sendAsync` 内部使用。

**用法**

- **用于签名 / 摘要**：`steem.auth.serializeTransaction(trx)`——返回用于签名哈希的 `Buffer`。这是二进制序列化器的公开 API；`steem.auth.transaction.toBuffer(trx)` 是等价的内部入口。

```javascript
// The public serializer (preferred for app code):
const buf = steem.auth.serializeTransaction(trx); // Buffer
```
- **交易结构**：`trx` 必须包含 `ref_block_num`、`ref_block_prefix`、`expiration`、`operations`（`[opType, opData]` 数组），可选 `extensions` 和 `signatures`。

**序列化器覆盖范围**

`operations` 中用到的所有 Steem 操作类型都受支持（操作类型索引 0–54），包括：

- **内容与社交**：vote、comment、delete_comment、comment_options、custom_json
- **账户与权限**：account_create、account_update、account_update2、account_create_with_delegation、create_claimed_account、request_account_recovery、recover_account、change_recovery_account、reset_account、set_reset_account、decline_voting_rights
- **转账与质押**：transfer、transfer_to_vesting、withdraw_vesting、set_withdraw_vesting_route、transfer_to_savings、transfer_from_savings、cancel_transfer_from_savings、delegate_vesting_shares
- **市场与转换**：limit_order_create、limit_order_create2、limit_order_cancel、feed_publish、convert、fill_order
- **托管**：escrow_transfer、escrow_dispute、escrow_release、escrow_approve
- **奖励与系统**：claim_reward_balance、claim_reward_balance2、comment_reward、liquidity_reward、interest、fill_vesting_withdraw、fill_convert_request、fill_transfer_from_savings
- **见证人与自定义**：pow、pow2、witness_update、witness_set_properties、account_witness_vote、account_witness_proxy、custom、custom_binary

字段顺序与编码（资产、权限、时间、extensions）遵循与 C++ FC_REFLECT / [steemutil](https://github.com/steemit/steemutil) 协议相同的布局。`test/fixtures/serializer/` 下的跨语言 fixture 用于在适用处保持 JS 输出与 steemutil 的编码器对齐。

**兼容性说明**

- 数量字段使用 **STEEM / SBD / VESTS** 资产字符串（例如 `"1.000 STEEM"`）。
- 权限（authority）：`owner` / `active` / `posting` 使用 `weight_threshold`、`account_auths` 和 `key_auths`（`[key, weight]` 数组）；公钥为 `STM…` 形式的字符串。
- 可选字段（例如 account_update 中的 `owner`）在协议要求时以存在字节（presence byte）编码。
- 支持序列化**并不代表**上列每个操作都有高级 `steem.broadcast.*` 封装、JSON 规范化或仅字符串的元数据处理。


## 下一步

- 端到端的投票 / 转账 / 发帖示例：[快速上手 - 使用示例](/zh/tutorials/steem-js/index.html#usage-examples)。
- 手动签名与验证交易：[签名调用与签名验证](/tutorials/steem-js/signed-calls.html)。
