---
title: steem-js - Reading Chain Data
description: Full steem-js read API walkthrough - tags, blog, discussions, blocks, global properties, accounts, market, votes, content, witnesses, login, follow, authentication, formatter and utils.
---

# steem-js: Reading Chain Data

This page collects the read-side examples for `steem.api`, migrated from the [steem-js](https://github.com/steemit/steem-js) documentation. Setup, configuration and usage examples live in the [getting-started tutorial](/tutorials/steem-js/index.html); broadcasting is covered in [Broadcasting operations](/tutorials/steem-js/broadcast.html).

> Every helper below wraps a JSON-RPC method that is documented in the generated [API Reference](/api/) - for example `getAccountsAsync` corresponds to [condenser_api.get_accounts](/api/condenser_api/get_accounts.html) and `getContentAsync` to [condenser_api.get_content](/api/condenser_api/get_content.html). The demos here show the steem-js client-side patterns.

## Read API methods

## Read API methods

The sections below document `steem.api` helpers for reading chain state. Unless noted, calls are routed to **`condenser_api`** on the node.

### Tags

#### Get Trending Tags

Returns a list of the currently trending tags in descending order by value.

```javascript
steem.api.getTrendingTagsAsync(afterTag, limit).then(function(result) {
  console.log(result);
});
```

**Parameter Description:**

| Parameter | Description | Data Type | Notes |
|---|---|---|---|
| afterTag | The name of the last tag to begin from | String | Use the empty string `''` to start the list. Subsequent calls can use the last tag name |
| limit | The maximum number of tags to return | Integer | |

**Call Example:**

```javascript
steem.api.getTrendingTagsAsync('', 2).then(function(result) {
  console.log(result);
});
```

**Return Example:**

```javascript
[
  { name: '', total_payouts: '37610793.383 SBD', net_votes: 4211122, top_posts: 411832, comments: 1344461, trending: '5549490701' },
  { name: 'life', total_payouts: '8722947.658 SBD', net_votes: 1498401, top_posts: 127103, comments: 54049, trending: '570954588' }
]
```

**Using the Result:**

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

#### Get Blog

Gets the last `limit` number of posts of `account` before the post with index `entryId`.

```javascript
steem.api.getBlogAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Parameter Description:**

| Parameter | Data Type | Description |
|---------|--------|-----------|
| account | string | A Steem username |
| entryId | number | A positive number - the index from which to start counting (zero-based index) |
| limit | number | A positive number - the max count of posts to be returned |

**Call Example:**

```javascript
steem.api.getBlogAsync("username", 10, 3).then(function(data) {
  console.log(data);
});

// In this case we get [3] posts, the newest of which is the one with index [10]
// (that's the 11th post, because post indexes are zero-based)
// This means the results will be posts [10, 9 and 8]
```

#### Get Blog Authors

Gets a list of all people who wrote in someone's blog, along with how many times they wrote in that blog.

```javascript
steem.api.getBlogAuthorsAsync(blogAccount).then(function(data) {
  console.log(data);
});
```

**Return Example:**

```javascript
[
  ['username1', 1],
  ['username2', 1],
  ['username3', 3],
  ['username4', 2],
  ['username5', 1]
]
```

#### Get Blog Entries

Gets the last `limit` number of posts of `account` before the post with index `entryId`. Very similar to getBlog but with much simpler result objects.

```javascript
steem.api.getBlogEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Return Example:**

```javascript
[
  { author: 'username', permlink: 'post-permlink-10', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 10 },
  { author: 'username', permlink: 'post-permlink-9', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 9 },
  { author: 'username', permlink: 'post-permlink-8', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 8 }
]
```

#### Get Discussions By Trending

Gets the Steem posts as they would be shown in the trending tab of steemit.com.

```javascript
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});
```

**Call Example:**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});

// NOTE! The default limit is 0. Not setting a limit will get you an empty result.
```

#### Other Discussion Query Methods

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

#### Get Discussions By Promoted

Gets the recent posts ordered by how much was spent to promote them.

```javascript
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

**Call Example:**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

### Blocks and Transactions

#### Get Block Header

```javascript
steem.api.getBlockHeaderAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### Get Block

```javascript
steem.api.getBlockAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### Get Ops In Block

Gets all operations in a given block.

```javascript
steem.api.getOpsInBlockAsync(blockNum, onlyVirtual).then(function(data) {
  console.log(data);
});
```

**Parameter Description:**

| Parameter | Data Type | Description |
|---------|--------|-----------|
| blockNum | number | A positive number |
| onlyVirtual | boolean | 'false' to get all operations. 'true' to only get virtual operations |

**Call Example:**

```javascript
steem.api.getOpsInBlockAsync(10000001, false).then(function(data) {
  console.log(data);
});
```

#### Get State

Gets a lot of information about the state of `path`.

```javascript
steem.api.getStateAsync(path).then(function(data) {
  console.log(data);
});
```

**Call Example:**

```javascript
// Valid call examples:
steem.api.getStateAsync("/@username");
steem.api.getStateAsync("/@username/permlink-of-post");
steem.api.getStateAsync("/@username/comments");
steem.api.getStateAsync("/@username/recent-replies");
steem.api.getStateAsync("/trending");
steem.api.getStateAsync("/trending/collorchallenge");
```

### Global Properties

`getConfig`, `getDynamicGlobalProperties`, `getFeedHistory`, and `getWitnessSchedule` use **`database_api`** on the node. `getChainProperties`, `getHardforkVersion`, and `getNextScheduledHardfork` use **`condenser_api`**.

#### Get Config

```javascript
steem.api.getConfigAsync().then(function(result) {
  console.log(result);
});
```

#### Get Dynamic Global Properties

```javascript
steem.api.getDynamicGlobalPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### Get Chain Properties

```javascript
steem.api.getChainPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### Get Feed Entries

Gets the posts in the feed of a user. The feed displays posts of followed users, as well as what they resteemed.

```javascript
steem.api.getFeedEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Parameter Description:**

| Parameter | Data Type | Description |
|---------|--------|-----------|
| account | string | A Steem username |
| entryId | number | The post ID from which to start counting. Write '0' to start from newest post |
| limit | number | A positive number |

**Return Example:**

```javascript
[
  { author: 'otherusername', permlink: 'permlink', reblog_by: ['resteembot'], reblog_on: '2018-02-11T18:42:54', entry_id: 10260 },
  { author: 'otherusername', permlink: 'permlink', reblog_by: [], reblog_on: '2018-02-11T18:39:24', entry_id: 10259 }
]
```

#### Get Feed History

```javascript
steem.api.getFeedHistoryAsync().then(function(result) {
  console.log(result);
});
```

#### Get Current Median History Price

```javascript
steem.api.getCurrentMedianHistoryPriceAsync().then(function(result) {
  console.log(result);
});
```

#### Get Ticker

Gets the latest summarized data from the Steem market.

```javascript
steem.api.getTickerAsync().then(function(data) {
  console.log(data);
});
```

**Return Example:**

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

#### Get Trade History

Gets the trade history for a given period between a `start` date and an `end` date.

```javascript
steem.api.getTradeHistoryAsync(start, end, limit).then(function(data) {
  console.log(data);
});
```

**Parameter Description:**

| Parameter | Data Type | Description |
|---------|--------|-----------|
| start | string | Datetime string in the format "2018-01-01T00:00:00" |
| end | string | Datetime string in the format "2018-01-01T00:00:00" |
| limit | number | A positive number |

**Call Example:**

```javascript
const start = "2018-01-01T00:00:00";
const end = "2018-01-02T00:00:00";

steem.api.getTradeHistoryAsync(start, end, 5).then(function(data) {
  console.log(data);
});
```

#### Get Version

Gets the version of the Steem blockchain you are connected to.

```javascript
steem.api.getVersionAsync().then(function(data) {
  console.log(data);
});
```

**Return Example:**

```javascript
{
  blockchain_version: '0.19.2',
  steem_revision: '07be64314ce9d277eb7da921b459c993c2e2412c',
  fc_revision: '8dd1fd1ec0906509eb722fa7c8d280d59bcca23d'
}
```

#### Get Volume

Gets the Steem and Steem Dollar volumes.

```javascript
steem.api.getVolumeAsync().then(function(data) {
  console.log(data);
});
```

**Return Example:**

```javascript
{
  steem_volume: '8101.888 STEEM',
  sbd_volume: '7287.268 SBD'
}
```

#### Get Hardfork Version

Gets the current hardfork version of the STEEM blockchain.

```javascript
steem.api.getHardforkVersionAsync().then(function(result) {
  console.log(result); // '0.19.0'
});
```

#### Get Next Scheduled Hardfork

```javascript
steem.api.getNextScheduledHardforkAsync().then(function(result) {
  console.log(result);
});
```

#### Get Reward Fund

```javascript
steem.api.getRewardFundAsync(name).then(function(result) {
  console.log(result);
});
```

#### Get Vesting Delegations

Returns a list of delegations made from one `account`. Denominated in VESTS.

```javascript
steem.api.getVestingDelegationsAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**Parameter Description:**

| Parameter | Description | Data Type | Notes |
|---|---|---|---|
| account | Account who is making the delegations | String | |
| from | The name of the last account to begin from | String | Use the empty string `''` to start the list. Subsequent calls can use the last delegatee's account name |
| limit | The maximum number of delegation records to return | Integer | |

**Call Example:**

```javascript
steem.api.getVestingDelegationsAsync('ned', '', 2).then(function(result) {
  console.log(result);
});
```

**Return Example:**

```javascript
[
  { id: 498422, delegator: 'ned', delegatee: 'spaminator', vesting_shares: '409517519.233783 VESTS', min_delegation_time: '2018-01-16T19:30:36' },
  { id: 181809, delegator: 'ned', delegatee: 'surpassinggoogle', vesting_shares: '1029059275.000000 VESTS', min_delegation_time: '2017-08-08T15:25:15' }
]
```

### Keys

#### Get Key References

```javascript
steem.api.getKeyReferencesAsync(key).then(function(result) {
  console.log(result);
});
```

### Accounts

#### Get Accounts

Gets multiple accounts by their names.

```javascript
steem.api.getAccountsAsync(names).then(function(result) {
  console.log(result);
});
```

**Parameter Description:**

| Parameter | Data Type | Description |
|---------|--------|-----------|
| names | array | Array of account names (strings) |

**Call Example:**

```javascript
steem.api.getAccountsAsync(['ned', 'dan']).then(function(accounts) {
  console.log(accounts);
});
```

**Note:** To get a single account, pass an array with one name: `getAccountsAsync(['username'])` and access the first element of the result.

#### Get Account References

```javascript
steem.api.getAccountReferencesAsync(accountId).then(function(result) {
  console.log(result);
});
```

#### Lookup Account Names

```javascript
steem.api.lookupAccountNamesAsync(accountNames).then(function(result) {
  console.log(result);
});
```

#### Lookup Accounts

```javascript
steem.api.lookupAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### Get Account Count

```javascript
steem.api.getAccountCountAsync().then(function(result) {
  console.log(result);
});
```

#### Get Conversion Requests

```javascript
steem.api.getConversionRequestsAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### Get Account History

```javascript
steem.api.getAccountHistoryAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**Signed Version (for private account data):**

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

#### Get Owner History

```javascript
steem.api.getOwnerHistoryAsync(account).then(function(result) {
  console.log(result);
});
```

#### Get Recovery Request

```javascript
steem.api.getRecoveryRequestAsync(account).then(function(result) {
  console.log(result);
});
```

#### Get Account Reputations

Gets the reputation points of `limit` accounts with names most similar to `lowerBoundName`.

```javascript
steem.api.getAccountReputationsAsync(lowerBoundName, limit).then(function(data) {
  console.log(data);
});
```

**Return Example:**

```javascript
[
  { account: 'username', reputation: '26727073581' },
  { account: 'username-taken', reputation: 0 }
]
```

### Market

#### Get Order Book

```javascript
steem.api.getOrderBookAsync(limit).then(function(result) {
  console.log(result);
});
```

#### Get Market Order Book

Takes the top-most `limit` entries in the market order book for both buy and sell orders.

```javascript
steem.api.getMarketOrderBookAsync(limit).then(function(data) {
  console.log(data);
});
```

**Return Example:**

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

#### Get Open Orders

```javascript
steem.api.getOpenOrdersAsync(owner).then(function(result) {
  console.log(result);
});
```

`getOrderBook` uses **`database_api`** on the node; `getMarketOrderBook` uses **`market_history_api`**.

#### Get Market History Buckets

```javascript
steem.api.getMarketHistoryBucketsAsync().then(function(data) {
  console.log(data); // [15, 60, 300, 3600, 86400]
});
```

### Authority / Validation

#### Get Transaction Hex

```javascript
steem.api.getTransactionHexAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Get Transaction

```javascript
steem.api.getTransactionAsync(trxId).then(function(result) {
  console.log(result);
});
```

#### Get Required Signatures

```javascript
steem.api.getRequiredSignaturesAsync(trx, availableKeys).then(function(result) {
  console.log(result);
});
```

#### Get Potential Signatures

```javascript
steem.api.getPotentialSignaturesAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Verify Authority

Uses **`database_api`** on the node.

```javascript
steem.api.verifyAuthorityAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Verify Account Authority

Uses **`database_api`** on the node.

```javascript
steem.api.verifyAccountAuthorityAsync(nameOrId, signers).then(function(result) {
  console.log(result);
});
```

#### Get Tags Used By Author

Gets tags used by a Steem user. Most users have no tags yet, but some do.

```javascript
steem.api.getTagsUsedByAuthorAsync(author).then(function(data) {
  console.log(data);
});
```

**Call Example:**

```javascript
steem.api.getTagsUsedByAuthorAsync("good-karma").then(function(data) {
  console.log(data); // [['challenge', 0]]
});
```

### Votes

#### Get Active Votes

```javascript
steem.api.getActiveVotesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Get Account Votes

```javascript
steem.api.getAccountVotesAsync(voter).then(function(result) {
  console.log(result);
});
```

### Content

#### Get Content

```javascript
steem.api.getContentAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Get Content Replies

```javascript
steem.api.getContentRepliesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Get Discussions By Author Before Date

```javascript
steem.api.getDiscussionsByAuthorBeforeDateAsync(author, startPermlink, beforeDate, limit).then(function(result) {
  console.log(result);
});
```

#### Get Reblogged By

Gives a list of the users that reblogged (resteemed) a given post.

```javascript
steem.api.getRebloggedByAsync(author, permlink).then(function(data) {
  console.log(data);
});
```

**Return Example:**

```javascript
['author', 'user1', 'user2', 'user3', 'user4']
```

#### Get Replies By Last Update

```javascript
steem.api.getRepliesByLastUpdateAsync(startAuthor, startPermlink, limit).then(function(result) {
  console.log(result);
});
```

### Witnesses

#### Get Witnesses

```javascript
steem.api.getWitnessesAsync(witnessIds).then(function(result) {
  console.log(result);
});
```

#### Get Witness By Account

Returns information about a witness with the given `accountName`.

```javascript
steem.api.getWitnessByAccountAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### Get Witnesses By Vote

```javascript
steem.api.getWitnessesByVoteAsync(from, limit).then(function(result) {
  console.log(result);
});
```

#### Lookup Witness Accounts

```javascript
steem.api.lookupWitnessAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### Get Witness Count

```javascript
steem.api.getWitnessCountAsync().then(function(result) {
  console.log(result);
});
```

#### Get Active Witnesses

```javascript
steem.api.getActiveWitnessesAsync().then(function(result) {
  console.log(result);
});
```

#### Get Witness Schedule

Gets some general information about the witnesses.

```javascript
steem.api.getWitnessScheduleAsync().then(function(data) {
  console.log(data);
});
```

**Return Example:**

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

## Login API

## Login API

### Login

⚠️ **It's not safe** to use this method with your username and password. This method always returns `true` and is only used internally with empty values to enable broadcast.

```javascript
steem.api.loginAsync('', '').then(function(result) {
  console.log(result);
});
```

### Get Api By Name

```javascript
steem.api.getApiByNameAsync(apiName).then(function(result) {
  console.log(result);
});
```

---

## Follow API

The follower API queries information about follow relationships between accounts. The API is read-only and does not create changes on the blockchain.

### Get Followers

Returns an alphabetical ordered array of the accounts that are following a particular account.

```javascript
steem.api.getFollowersAsync(following, startFollower, followType, limit).then(function(result) {
  console.log(result);
});
```

**Parameter Description:**

| Parameter | Description | Data Type | Notes |
|---|---|---|---|
| following | The followers of which account | String | No leading @ symbol |
| startFollower | Start the list from which follower? | String | No leading @ symbol. Use the empty string `''` to start the list. Subsequent calls can use the name of the last follower |
| followType | ?? | ?? | Set to 0 or 'blog' - either works |
| limit | The maximum number of followers to return | Integer | |

**Call Example:**

```javascript
steem.api.getFollowersAsync('ned', '', 'blog', 2).then(function(result) {
  console.log(result);
});
```

**Return Example:**

```javascript
[
  { follower: 'a-0-0', following: 'ned', what: ['blog'] },
  { follower: 'a-0-0-0-1abokina', following: 'ned', what: ['blog'] }
]
```

### Get Following

Returns an alphabetical ordered Array of the accounts that are followed by a particular account.

```javascript
steem.api.getFollowingAsync(follower, startFollowing, followType, limit).then(function(result) {
  console.log(result);
});
```

**Return Example:**

```javascript
[
  { follower: 'dan', following: 'dantheman', what: ['blog'] },
  { follower: 'dan', following: 'krnel', what: ['blog'] }
]
```

### Get Follow Count

```javascript
steem.api.getFollowCountAsync(account).then(function(result) {
  console.log(result);
});
```

**Return Example:**

```javascript
{ account: 'ned', follower_count: 16790, following_count: 913 }
```

## Authentication

## Authentication

### Verify

```javascript
steem.auth.verify(name, password, auths);
```

### Generate Keys

```javascript
steem.auth.generateKeys(name, password, roles);
```

### Get Private Keys

```javascript
steem.auth.getPrivateKeys(name, password, roles);
```

### Is Wif

```javascript
steem.auth.isWif(privWif);
```

### To Wif

```javascript
steem.auth.toWif(name, password, role);
```

### Wif Is Valid

```javascript
steem.auth.wifIsValid(privWif, pubWif);
```

### Wif To Public

```javascript
steem.auth.wifToPublic(privWif);
```

### Sign Transaction

Signs a transaction with the provided private keys. The signature is computed
over the digest `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`, where
`chain_id` comes from the configured chain (default all-zero for mainnet).

- **`trx`** — transaction object: `ref_block_num`, `ref_block_prefix`,
  `expiration`, `operations` (array of `[opType, opData]`), and `extensions`.
- **`keys`** — array of WIF private keys used to sign.
- Returns a transaction object with a `signatures` array appended.

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

> **Note:** the `signatures` field is **not** part of the signed digest. Signing
> serializes the transaction *before* attaching signatures, so the digest covers
> only the unsigned transaction body.

### Verify Transaction

Verifies that a signed transaction's signatures were produced by the given
public key. The digest is reconstructed exactly as `signTransaction` computes
it: `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`. Returns `true` if
any signature is valid for `publicKey`, otherwise `false`.

- **`transaction`** — a signed transaction object (must contain a `signatures`
  array). The `signatures` field is stripped before digest calculation, so it
  does not matter how many signatures are present.
- **`publicKey`** — the `STM…` public key to verify against.
- Returns `boolean`.

```javascript
const publicKey = steem.auth.wifToPublic(wif);

// Round-trip: a correctly-signed tx verifies against its signing key
const isValid = steem.auth.verifyTransaction(signedTx, publicKey);
console.log(isValid); // true

// A different public key is rejected
const wrongPub = steem.auth.wifToPublic('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');
console.log(steem.auth.verifyTransaction(signedTx, wrongPub)); // false
```

> **Security use case:** a relay/wallet server can call `verifyTransaction` on a
> client-submitted transaction to prove — *before* forwarding it to the chain —
> that it was signed by a key belonging to the claimed account. This closes a
> defense-in-depth gap where the server previously could only check transaction
> shape, not cryptographic authenticity.

### Serialize Transaction

Serializes a transaction to its **binary** form (FC-style), returning a `Buffer`.
This is the same serializer used internally by `signTransaction`, so the output
matches the Steem node's transaction wire format byte-for-byte. Downstream apps
can use it to reconstruct the signing digest themselves.

- **`trx`** — transaction object (same shape as `signTransaction`'s `trx`).
- Returns `Buffer`.

```javascript
import { sha256 } from '@noble/hashes/sha2';

// Build the exact digest signTransaction signs over:
const buf = steem.auth.serializeTransaction(tx); // Buffer
const chainId = Buffer.alloc(32, 0); // mainnet chain_id (all-zero)
const digest = Buffer.from(sha256(Buffer.concat([chainId, buf])));
console.log(digest.toString('hex')); // 32-byte digest
```

## Formatter

## Formatter

### Amount

Formats number and currency to the valid way for sending (for example - it trims the number's floating point remainder to 3 digits only).

```javascript
steem.formatter.amount(_amount, asset);
```

**Parameter Description:**

| Parameter | Data Type | Description |
|---------|--------|-----------|
| _amount | number | A positive number |
| asset | string | The name of a Steem asset (steem, sbd) |

**Call Example:**

```javascript
steem.formatter.amount(53.442346, "STEEM"); // "53.442 STEEM"
```

### Vesting Steem

Converts the vests of `account` into the number of Steem they represent.

```javascript
steem.formatter.vestingSteem(account, gprops);
```

**Call Example:**

```javascript
steem.api.getAccountsAsync(["username"]).then(function(accounts) {
  steem.api.getStateAsync("/@username").then(function(state) {        
    const vestingSteem = steem.formatter.vestingSteem(accounts[0], state.props);
    console.log(vestingSteem); // 7.42431235
  });
});
```

### Number With Commas

Formats a big number, by adding a comma on every 3 digits. Attention - only works on strings. No numbers can be passed directly.

```javascript
steem.formatter.numberWithCommas(x);
```

**Call Example:**

```javascript
steem.formatter.numberWithCommas("53304432342.432"); // "53,304,432,342.432"
```

### Estimate Account Value

Gets the estimated dollar value of the assets of `account`.

```javascript
steem.formatter.estimateAccountValue(account).then(function(data) {
  console.log(data); // 32.25
});
```

### Create Suggested Password

```javascript
const password = steem.formatter.createSuggestedPassword();
console.log(password); // 'GAz3GYFvvQvgm7t2fQmwMDuXEzDqTzn9'
```

### Comment Permlink

```javascript
const parentAuthor = 'ned';
const parentPermlink = 'a-selfie';
const commentPermlink = steem.formatter.commentPermlink(parentAuthor, parentPermlink);
console.log(commentPermlink); // 're-ned-a-selfie-20170621t080403765z'
```

### Reputation

```javascript
const reputation = steem.formatter.reputation(3512485230915);
console.log(reputation); // 56
```

### Vest To Steem

```javascript
const steemPower = steem.formatter.vestToSteem(vestingShares, totalVestingShares, totalVestingFundSteem);
console.log(steemPower);
```


## Utils

## Utils

### Validate Username

```javascript
const isValidUsername = steem.utils.validateAccountName('test1234');
console.log(isValidUsername); // null

const isValidUsername2 = steem.utils.validateAccountName('a1');
console.log(isValidUsername2); // 'Account name should be longer.'
```

### Camel Case

Formats a string with '_' characters to follow the CamelCase notation instead.

```javascript
steem.utils.camelCase(str);
```

**Call Example:**

```javascript
steem.utils.camelCase("example_string"); // "exampleString"
```

## Where to go next

- To modify chain state, see [Broadcasting operations](/tutorials/steem-js/broadcast.html).
- For authenticated reads and signature verification, see [Signed calls and signature verification](/tutorials/steem-js/signed-calls.html).
- For installation and configuration, return to the [getting-started tutorial](/tutorials/steem-js/index.html).
