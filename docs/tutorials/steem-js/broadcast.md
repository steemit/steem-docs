---
title: steem-js - Broadcasting Operations
description: The full steem-js broadcast catalogue - promise and callback patterns, every broadcast operation, multisig and binary transaction serialization.
---

# steem-js: Broadcasting Operations

The `steem.broadcast` namespace causes permanent changes on the blockchain: votes, transfers, posts, witness operations and more. This page carries the complete broadcast examples from the [steem-js](https://github.com/steemit/steem-js) documentation; reading chain data is covered in [Reading chain data](/tutorials/steem-js/read-api.html).

> On-the-wire details of every operation are documented in the generated [broadcast operations reference](/api/broadcast_ops/).

## Broadcast API

## Broadcast API

### Broadcast Block

Broadcast a new block on the Steem blockchain.

```javascript
steem.api.broadcastBlockAsync(blockObject).then(function(data) {
  console.log(data);
});
```

### Broadcast Transaction Synchronous

```javascript
steem.api.broadcastTransactionSynchronousAsync(trx).then(function(result) {
  console.log(result);
});
```

## Broadcast Operations

## Broadcast Operations

The `steem.broadcast` methods cause permanent changes on the blockchain.

### Promise Support

All broadcast methods support both callback and Promise patterns. You can use either approach:

#### Promise Pattern (Recommended)

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

#### Callback Pattern (Legacy)

```javascript
steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
});
```

### Account Create

```javascript
steem.broadcast.accountCreateAsync(wif, fee, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Account Create With Delegation

```javascript
steem.broadcast.accountCreateWithDelegationAsync(wif, fee, delegation, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata, extensions).then(function(result) {
  console.log(result);
});
```

### Delegate Vesting Shares

Delegates STEEM POWER, denominated in VESTS, from a `delegator` to the `delegatee`. Requires the `delegator`'s private WIF key. Set the delegation to 0 to undelegate.

```javascript
steem.broadcast.delegateVestingSharesAsync(wif, delegator, delegatee, vesting_shares).then(function(result) {
  console.log(result);
});
```

### Account Update

```javascript
steem.broadcast.accountUpdateAsync(wif, account, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Account Witness Proxy

```javascript
steem.broadcast.accountWitnessProxyAsync(wif, account, proxy).then(function(result) {
  console.log(result);
});
```

### Account Witness Vote

```javascript
steem.broadcast.accountWitnessVoteAsync(wif, account, witness, approve).then(function(result) {
  console.log(result);
});
```

### Change Recovery Account

```javascript
steem.broadcast.changeRecoveryAccountAsync(wif, accountToRecover, newRecoveryAccount, extensions).then(function(result) {
  console.log(result);
});
```

### Comment

```javascript
steem.broadcast.commentAsync(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Comment Options

```javascript
steem.broadcast.commentOptionsAsync(wif, author, permlink, maxAcceptedPayout, percentSteemDollars, allowVotes, allowCurationRewards, extensions).then(function(result) {
  console.log(result);
});
```

The `extensions` parameter supports the beneficiaries extension (tag 0). Pass an array of `[tag, value]`, e.g. `[[0, { beneficiaries: [{ account: 'foo', weight: 1000 }, { account: 'bar', weight: 5000 }] }]]`. Beneficiaries are automatically sorted by account name before serialization to comply with the Steem protocol.

### Convert

```javascript
steem.broadcast.convertAsync(wif, owner, requestid, amount).then(function(result) {
  console.log(result);
});
```

### Custom

```javascript
steem.broadcast.customAsync(wif, requiredAuths, id, data).then(function(result) {
  console.log(result);
});
```

### Custom Json

```javascript
steem.broadcast.customJsonAsync(wif, requiredAuths, requiredPostingAuths, id, json).then(function(result) {
  console.log(result);
});
```

### Delete Comment

```javascript
steem.broadcast.deleteCommentAsync(wif, author, permlink).then(function(result) {
  console.log(result);
});
```

### Escrow Operations

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

### Get Escrow

```javascript
steem.api.getEscrowAsync(from, escrowId).then(function(data) {
  console.log(data);
});
```

### Feed Publish

```javascript
steem.broadcast.feedPublishAsync(wif, publisher, exchangeRate).then(function(result) {
  console.log(result);
});
```

### Limit Order Operations

```javascript
// Limit Order Cancel
steem.broadcast.limitOrderCancelAsync(wif, owner, orderid);

// Limit Order Create
steem.broadcast.limitOrderCreateAsync(wif, owner, orderid, amountToSell, minToReceive, fillOrKill, expiration);

// Limit Order Create2
steem.broadcast.limitOrderCreate2Async(wif, owner, orderid, amountToSell, exchangeRate, fillOrKill, expiration);
```

**Limit Order Parameter Description:**

| Parameter | Description | Data Type | Notes |
|---|---|---|---|
| wif | Active private key | String | |
| owner | Account name | String | No leading @ symbol |
| orderid | User defined ordernumber | Integer | Used to cancel orders |
| amountToSell | Amount to sell | String | "X.XXX ASSET" must have 3 decimal places. e.g. "25.100 SBD" |
| minToReceive | Amount desired | String | "X.XXX ASSET" must have 3 decimal places. e.g. "20.120 STEEM" |
| fillOrKill | Fill order from current order book or kill the order | Boolean | `false` places the order into the Order Book until either cancelled, filled, or the expiration time is reached |
| expiration | Time when order expires | Integer | Unit milliseconds. Zero is UNIX epoch |

### Account Recovery

```javascript
// Recover Account
steem.broadcast.recoverAccountAsync(wif, accountToRecover, newOwnerAuthority, recentOwnerAuthority, extensions);

// Request Account Recovery
steem.broadcast.requestAccountRecoveryAsync(wif, recoveryAccount, accountToRecover, newOwnerAuthority, extensions);
```

### Transfer Operations

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

**Transfer Parameter Description:**

| Parameter | Description | Data Type | Notes |
|---|---|---|---|
| wif | Active private key for the `from` account | String | |
| from | Account name to take asset from | String | No leading @ symbol |
| to | Account name to place asset into | String | No leading @ symbol |
| amount | Amount of asset to transfer | String | "X.XXX ASSET" must have 3 decimal places. e.g. "5.150 SBD" |

### Vote

```javascript
steem.broadcast.voteAsync(wif, voter, author, permlink, weight).then(function(result) {
  console.log(result);
});
```

### Withdraw Vesting

```javascript
steem.broadcast.withdrawVestingAsync(wif, account, vestingShares).then(function(result) {
  console.log(result);
});
```

### Witness Update

```javascript
steem.broadcast.witnessUpdateAsync(wif, owner, url, blockSigningKey, props, fee).then(function(result) {
  console.log(result);
});
```

### Set Withdraw Vesting Route

```javascript
steem.broadcast.setWithdrawVestingRouteAsync(wif, fromAccount, toAccount, percent, autoVest).then(function(result) {
  console.log(result);
});
```

### Get Withdraw Routes

Gets withdraw routes (Steem Power withdraws).

```javascript
steem.api.getWithdrawRoutesAsync(account, withdrawRouteType).then(function(data) {
  console.log(data);
});
```

### Claim Reward Balance

Claims pending rewards, be they Steem, SBD or Vests.

```javascript
steem.broadcast.claimRewardBalanceAsync(wif, account, reward_steem, reward_sbd, reward_vests).then(function(data) {
  console.log(data);
});
```

**Parameter Description:**

| Parameter | Data Type | Description |
|---------|--------|-----------|
| wif | string | Use steem.auth.toWif(user, pass, type) |
| account | string | A Steem username |
| reward_steem | string | Balance like "0.000 STEEM" |
| reward_sbd | string | Balance like "0.000 SBD" |
| reward_vests | string | Balance like "0.000006 VESTS" |

### Multisig

You can use multisignature to broadcast an operation.

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

### Transaction serialization (binary)

Broadcast and signing use a **binary transaction format** compatible with the Steem protocol (FC-style). The serializer lives in `src/auth/serializer/transaction.ts` and is used internally by `steem.auth.signTransaction` and `steem.broadcast.sendAsync`.

**Usage**

- **For signing / digest**: `steem.auth.serializeTransaction(trx)` — returns the `Buffer` that is hashed for the signature. This is the public API for the binary serializer; `steem.auth.transaction.toBuffer(trx)` is the equivalent internal entry point.

```javascript
// The public serializer (preferred for app code):
const buf = steem.auth.serializeTransaction(trx); // Buffer
```
- **Transaction shape**: `trx` must include `ref_block_num`, `ref_block_prefix`, `expiration`, `operations` (array of `[opType, opData]`), and optionally `extensions` and `signatures`.

**Serializer coverage**

All Steem operation types used in `operations` are supported (op type indices 0–54), including:

- **Content & social**: vote, comment, delete_comment, comment_options, custom_json
- **Accounts & authority**: account_create, account_update, account_update2, account_create_with_delegation, create_claimed_account, request_account_recovery, recover_account, change_recovery_account, reset_account, set_reset_account, decline_voting_rights
- **Transfers & vesting**: transfer, transfer_to_vesting, withdraw_vesting, set_withdraw_vesting_route, transfer_to_savings, transfer_from_savings, cancel_transfer_from_savings, delegate_vesting_shares
- **Market & convert**: limit_order_create, limit_order_create2, limit_order_cancel, feed_publish, convert, fill_order
- **Escrow**: escrow_transfer, escrow_dispute, escrow_release, escrow_approve
- **Rewards & system**: claim_reward_balance, claim_reward_balance2, comment_reward, liquidity_reward, interest, fill_vesting_withdraw, fill_convert_request, fill_transfer_from_savings
- **Witness & custom**: pow, pow2, witness_update, witness_set_properties, account_witness_vote, account_witness_proxy, custom, custom_binary

Field order and encoding (assets, authorities, time, extensions) follow the same layout as the C++ FC_REFLECT / [steemutil](https://github.com/steemit/steemutil) protocol. Cross-language fixtures under `test/fixtures/serializer/` are used to keep the JS output aligned with steemutil’s encoder where applicable.

**Compatibility notes**

- Use **STEEM / SBD / VESTS** asset strings (e.g. `"1.000 STEEM"`) for amount fields.
- Authorities: `owner` / `active` / `posting` use `weight_threshold`, `account_auths`, and `key_auths` (array of `[key, weight]`); public keys as STM… strings.
- Optional fields (e.g. `owner` in account_update) are encoded with a presence byte where the protocol requires it.
- Serializer support **does not imply** a high-level `steem.broadcast.*` wrapper, JSON normalization, or string-only metadata handling for every operation listed above.


## Where to go next

- End-to-end vote / transfer / publish snippets: [Getting started - Usage Examples](/tutorials/steem-js/index.html#usage-examples).
- Signing and verifying transactions by hand: [Signed calls and signature verification](/tutorials/steem-js/signed-calls.html).
