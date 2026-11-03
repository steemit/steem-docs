---
title: steem-js — 체인 데이터 읽기
description: steem-js 읽기 API 전체 안내 — 태그, 블로그, 디스커션, 블록, 전역 속성, 계정, 마켓, 투표, 콘텐츠, 위트니스, 로그인, 팔로우, 인증, formatter 및 utils.
---

# steem-js: 체인 데이터 읽기

이 페이지는 [steem-js](https://github.com/steemit/steem-js) 문서에서 옮겨 온 `steem.api`의 읽기 예시를 모아 둡니다. 설치·설정·사용 예시는 [시작하기 튜토리얼](/ko/tutorials/steem-js/index.html)에, 브로드캐스트는 [브로드캐스트 오퍼레이션](/ko/tutorials/steem-js/broadcast.html)에 있습니다.

> 아래의 모든 헬퍼는 생성된 [API 레퍼런스](/ko/api/)에 문서화된 JSON-RPC 메서드를 감싼 것입니다 — 예컨대 `getAccountsAsync`는 [condenser_api.get_accounts](/ko/api/condenser_api/get_accounts.html)에, `getContentAsync`는 [condenser_api.get_content](/ko/api/condenser_api/get_content.html)에 대응합니다. 여기의 데모는 steem-js 클라이언트 측 패턴을 보여 줍니다.

## 읽기 API 메서드

## 읽기 API 메서드

아래 섹션은 체인 상태를 읽는 `steem.api` 헬퍼를 설명합니다. 별도의 언급이 없는 한, 호출은 노드에서 **`condenser_api`**로 라우팅됩니다.

### 태그

#### 트렌딩 태그 조회

현재 인기 있는 태그 목록을 값 기준 내림차순으로 반환합니다.

```javascript
steem.api.getTrendingTagsAsync(afterTag, limit).then(function(result) {
  console.log(result);
});
```

**파라미터 설명:**

| 파라미터 | 설명 | 데이터 타입 | 비고 |
|---|---|---|---|
| afterTag | 시작 기준이 되는 마지막 태그의 이름 | String | 목록을 시작하려면 빈 문자열 `''`을 사용하세요. 이후 호출에서는 마지막 태그의 이름을 사용할 수 있습니다 |
| limit | 반환할 태그의 최대 개수 | Integer | |

**호출 예시:**

```javascript
steem.api.getTrendingTagsAsync('', 2).then(function(result) {
  console.log(result);
});
```

**반환 예시:**

```javascript
[
  { name: '', total_payouts: '37610793.383 SBD', net_votes: 4211122, top_posts: 411832, comments: 1344461, trending: '5549490701' },
  { name: 'life', total_payouts: '8722947.658 SBD', net_votes: 1498401, top_posts: 127103, comments: 54049, trending: '570954588' }
]
```

**결과 활용하기:**

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

#### 블로그 조회

`account`의 게시물 중 인덱스가 `entryId`인 게시물 이전의 마지막 `limit`개 게시물을 가져옵니다.

```javascript
steem.api.getBlogAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**파라미터 설명:**

| 파라미터 | 데이터 타입 | 설명 |
|---------|--------|-----------|
| account | string | Steem 사용자 이름 |
| entryId | number | 양수 — 셈을 시작하는 인덱스 (0부터 시작) |
| limit | number | 양수 — 반환할 게시물의 최대 개수 |

**호출 예시:**

```javascript
steem.api.getBlogAsync("username", 10, 3).then(function(data) {
  console.log(data);
});

// In this case we get [3] posts, the newest of which is the one with index [10]
// (that's the 11th post, because post indexes are zero-based)
// This means the results will be posts [10, 9 and 8]
```

#### 블로그 저자 조회

누군가의 블로그에 글을 쓴 모든 사람의 목록과, 각자 그 블로그에 글을 쓴 횟수를 가져옵니다.

```javascript
steem.api.getBlogAuthorsAsync(blogAccount).then(function(data) {
  console.log(data);
});
```

**반환 예시:**

```javascript
[
  ['username1', 1],
  ['username2', 1],
  ['username3', 3],
  ['username4', 2],
  ['username5', 1]
]
```

#### 블로그 항목 조회

`account`의 게시물 중 인덱스가 `entryId`인 게시물 이전의 마지막 `limit`개 게시물을 가져옵니다. getBlog와 매우 비슷하지만 결과 객체가 훨씬 단순합니다.

```javascript
steem.api.getBlogEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**반환 예시:**

```javascript
[
  { author: 'username', permlink: 'post-permlink-10', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 10 },
  { author: 'username', permlink: 'post-permlink-9', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 9 },
  { author: 'username', permlink: 'post-permlink-8', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 8 }
]
```

#### 트렌딩 기준 논의 조회

steemit.com의 trending 탭에 표시될 Steem 게시물을 가져옵니다.

```javascript
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});
```

**호출 예시:**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});

// NOTE! The default limit is 0. Not setting a limit will get you an empty result.
```

#### 기타 논의 조회 메서드

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

#### 프로모션 기준 논의 조회

홍보에 지출된 금액 순서로 최근 게시물을 가져옵니다.

```javascript
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

**호출 예시:**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

### 블록과 트랜잭션

#### 블록 헤더 조회

```javascript
steem.api.getBlockHeaderAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### 블록 조회

```javascript
steem.api.getBlockAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### 블록 내 오퍼레이션 조회

주어진 블록의 모든 오퍼레이션을 가져옵니다.

```javascript
steem.api.getOpsInBlockAsync(blockNum, onlyVirtual).then(function(data) {
  console.log(data);
});
```

**파라미터 설명:**

| 파라미터 | 데이터 타입 | 설명 |
|---------|--------|-----------|
| blockNum | number | 양수 |
| onlyVirtual | boolean | 'false'는 모든 오퍼레이션, 'true'는 가상 오퍼레이션만 가져옵니다 |

**호출 예시:**

```javascript
steem.api.getOpsInBlockAsync(10000001, false).then(function(data) {
  console.log(data);
});
```

#### 상태 조회

`path` 상태에 대한 많은 정보를 가져옵니다.

```javascript
steem.api.getStateAsync(path).then(function(data) {
  console.log(data);
});
```

**호출 예시:**

```javascript
// Valid call examples:
steem.api.getStateAsync("/@username");
steem.api.getStateAsync("/@username/permlink-of-post");
steem.api.getStateAsync("/@username/comments");
steem.api.getStateAsync("/@username/recent-replies");
steem.api.getStateAsync("/trending");
steem.api.getStateAsync("/trending/collorchallenge");
```

### 전역 속성

`getConfig`, `getDynamicGlobalProperties`, `getFeedHistory`, `getWitnessSchedule`는 노드에서 **`database_api`**를 사용하고, `getChainProperties`, `getHardforkVersion`, `getNextScheduledHardfork`는 **`condenser_api`**를 사용합니다.

#### 설정 조회

```javascript
steem.api.getConfigAsync().then(function(result) {
  console.log(result);
});
```

#### 동적 전역 속성 조회

```javascript
steem.api.getDynamicGlobalPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### 체인 속성 조회

```javascript
steem.api.getChainPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### 피드 항목 조회

사용자 피드의 게시물을 가져옵니다. 피드에는 팔로우한 사용자의 게시물과 그들이 리스팀(resteem)한 내용이 표시됩니다.

```javascript
steem.api.getFeedEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**파라미터 설명:**

| 파라미터 | 데이터 타입 | 설명 |
|---------|--------|-----------|
| account | string | Steem 사용자 이름 |
| entryId | number | 셈을 시작할 게시물 ID. 가장 최신 게시물부터 시작하려면 '0'을 씁니다 |
| limit | number | 양수 |

**반환 예시:**

```javascript
[
  { author: 'otherusername', permlink: 'permlink', reblog_by: ['resteembot'], reblog_on: '2018-02-11T18:42:54', entry_id: 10260 },
  { author: 'otherusername', permlink: 'permlink', reblog_by: [], reblog_on: '2018-02-11T18:39:24', entry_id: 10259 }
]
```

#### 피드 기록 조회

```javascript
steem.api.getFeedHistoryAsync().then(function(result) {
  console.log(result);
});
```

#### 현재 중간 히스토리 가격 조회

```javascript
steem.api.getCurrentMedianHistoryPriceAsync().then(function(result) {
  console.log(result);
});
```

#### 티커 조회

Steem 마켓의 최신 요약 데이터를 가져옵니다.

```javascript
steem.api.getTickerAsync().then(function(data) {
  console.log(data);
});
```

**반환 예시:**

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

#### 거래 기록 조회

`start` 날짜와 `end` 날짜 사이의 주어진 기간에 대한 체결 내역을 가져옵니다.

```javascript
steem.api.getTradeHistoryAsync(start, end, limit).then(function(data) {
  console.log(data);
});
```

**파라미터 설명:**

| 파라미터 | 데이터 타입 | 설명 |
|---------|--------|-----------|
| start | string | "2018-01-01T00:00:00" 형식의 날짜·시간 문자열 |
| end | string | "2018-01-01T00:00:00" 형식의 날짜·시간 문자열 |
| limit | number | 양수 |

**호출 예시:**

```javascript
const start = "2018-01-01T00:00:00";
const end = "2018-01-02T00:00:00";

steem.api.getTradeHistoryAsync(start, end, 5).then(function(data) {
  console.log(data);
});
```

#### 버전 조회

연결된 Steem 블록체인의 버전을 가져옵니다.

```javascript
steem.api.getVersionAsync().then(function(data) {
  console.log(data);
});
```

**반환 예시:**

```javascript
{
  blockchain_version: '0.19.2',
  steem_revision: '07be64314ce9d277eb7da921b459c993c2e2412c',
  fc_revision: '8dd1fd1ec0906509eb722fa7c8d280d59bcca23d'
}
```

#### 거래량 조회

STEEM과 스팀 달러 (SBD)의 거래량을 가져옵니다.

```javascript
steem.api.getVolumeAsync().then(function(data) {
  console.log(data);
});
```

**반환 예시:**

```javascript
{
  steem_volume: '8101.888 STEEM',
  sbd_volume: '7287.268 SBD'
}
```

#### 하드포크 버전 조회

STEEM 블록체인의 현재 하드포크 버전을 가져옵니다.

```javascript
steem.api.getHardforkVersionAsync().then(function(result) {
  console.log(result); // '0.19.0'
});
```

#### 다음 예정된 하드포크 조회

```javascript
steem.api.getNextScheduledHardforkAsync().then(function(result) {
  console.log(result);
});
```

#### 리워드 펀드 조회

```javascript
steem.api.getRewardFundAsync(name).then(function(result) {
  console.log(result);
});
```

#### 베스팅 위임 조회

한 `account`가 만든 위임 목록을 반환합니다. 베스팅 지분 (VESTS) 단위입니다.

```javascript
steem.api.getVestingDelegationsAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**파라미터 설명:**

| 파라미터 | 설명 | 데이터 타입 | 비고 |
|---|---|---|---|
| account | 위임을 수행하는 계정 | String | |
| from | 목록을 시작할 마지막 계정의 이름 | String | 목록을 시작하려면 빈 문자열 `''`을 사용하세요. 이후 호출에서는 마지막 수임인의 계정 이름을 사용할 수 있습니다 |
| limit | 반환할 위임 기록의 최대 개수 | Integer | |

**호출 예시:**

```javascript
steem.api.getVestingDelegationsAsync('ned', '', 2).then(function(result) {
  console.log(result);
});
```

**반환 예시:**

```javascript
[
  { id: 498422, delegator: 'ned', delegatee: 'spaminator', vesting_shares: '409517519.233783 VESTS', min_delegation_time: '2018-01-16T19:30:36' },
  { id: 181809, delegator: 'ned', delegatee: 'surpassinggoogle', vesting_shares: '1029059275.000000 VESTS', min_delegation_time: '2017-08-08T15:25:15' }
]
```

### 키

#### 키 참조 조회

```javascript
steem.api.getKeyReferencesAsync(key).then(function(result) {
  console.log(result);
});
```

### 계정

#### 계정 조회

이름으로 여러 계정을 가져옵니다.

```javascript
steem.api.getAccountsAsync(names).then(function(result) {
  console.log(result);
});
```

**파라미터 설명:**

| 파라미터 | 데이터 타입 | 설명 |
|---------|--------|-----------|
| names | array | 계정 이름(문자열)의 배열 |

**호출 예시:**

```javascript
steem.api.getAccountsAsync(['ned', 'dan']).then(function(accounts) {
  console.log(accounts);
});
```

**참고:** 계정 하나를 가져오려면 이름 하나만 담은 배열을 넘기세요: `getAccountsAsync(['username'])`, 그리고 결과의 첫 번째 요소에 접근합니다.

#### 계정 참조 조회

```javascript
steem.api.getAccountReferencesAsync(accountId).then(function(result) {
  console.log(result);
});
```

#### 계정 이름 탐색

```javascript
steem.api.lookupAccountNamesAsync(accountNames).then(function(result) {
  console.log(result);
});
```

#### 계정 탐색

```javascript
steem.api.lookupAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### 계정 수 조회

```javascript
steem.api.getAccountCountAsync().then(function(result) {
  console.log(result);
});
```

#### 컨버전 요청 조회

```javascript
steem.api.getConversionRequestsAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### 계정 기록 조회

```javascript
steem.api.getAccountHistoryAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**서명 버전 (비공개 계정 데이터용):**

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

#### 오너 기록 조회

```javascript
steem.api.getOwnerHistoryAsync(account).then(function(result) {
  console.log(result);
});
```

#### 복구 요청 조회

```javascript
steem.api.getRecoveryRequestAsync(account).then(function(result) {
  console.log(result);
});
```

#### 계정 평판 조회

`lowerBoundName`과 가장 비슷한 이름을 가진 `limit`개 계정의 평판 점수를 가져옵니다.

```javascript
steem.api.getAccountReputationsAsync(lowerBoundName, limit).then(function(data) {
  console.log(data);
});
```

**반환 예시:**

```javascript
[
  { account: 'username', reputation: '26727073581' },
  { account: 'username-taken', reputation: 0 }
]
```

### 마켓

#### 오더북 조회

```javascript
steem.api.getOrderBookAsync(limit).then(function(result) {
  console.log(result);
});
```

#### 마켓 오더북 조회

마켓 오더북에서 매수·매도 양쪽 모두 가장 위의 `limit`개 항목을 가져옵니다.

```javascript
steem.api.getMarketOrderBookAsync(limit).then(function(data) {
  console.log(data);
});
```

**반환 예시:**

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

#### 미체결 주문 조회

```javascript
steem.api.getOpenOrdersAsync(owner).then(function(result) {
  console.log(result);
});
```

`getOrderBook`은 노드에서 **`database_api`**를 사용하고, `getMarketOrderBook`은 **`market_history_api`**를 사용합니다.

#### 마켓 히스토리 버킷 조회

```javascript
steem.api.getMarketHistoryBucketsAsync().then(function(data) {
  console.log(data); // [15, 60, 300, 3600, 86400]
});
```

### 권한 / 검증

#### 트랜잭션 HEX 조회

```javascript
steem.api.getTransactionHexAsync(trx).then(function(result) {
  console.log(result);
});
```

#### 트랜잭션 조회

```javascript
steem.api.getTransactionAsync(trxId).then(function(result) {
  console.log(result);
});
```

#### 필수 서명 조회

```javascript
steem.api.getRequiredSignaturesAsync(trx, availableKeys).then(function(result) {
  console.log(result);
});
```

#### 후보 서명 조회

```javascript
steem.api.getPotentialSignaturesAsync(trx).then(function(result) {
  console.log(result);
});
```

#### 권한 검증

노드에서 **`database_api`**를 사용합니다.

```javascript
steem.api.verifyAuthorityAsync(trx).then(function(result) {
  console.log(result);
});
```

#### 계정 권한 검증

노드에서 **`database_api`**를 사용합니다.

```javascript
steem.api.verifyAccountAuthorityAsync(nameOrId, signers).then(function(result) {
  console.log(result);
});
```

#### 저자가 사용한 태그 조회

Steem 사용자가 사용한 태그를 가져옵니다. 대부분의 사용자는 아직 태그가 없지만, 있는 사용자도 있습니다.

```javascript
steem.api.getTagsUsedByAuthorAsync(author).then(function(data) {
  console.log(data);
});
```

**호출 예시:**

```javascript
steem.api.getTagsUsedByAuthorAsync("good-karma").then(function(data) {
  console.log(data); // [['challenge', 0]]
});
```

### 투표

#### 활성 투표 조회

```javascript
steem.api.getActiveVotesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### 계정 투표 조회

```javascript
steem.api.getAccountVotesAsync(voter).then(function(result) {
  console.log(result);
});
```

### 콘텐츠

#### 콘텐츠 조회

```javascript
steem.api.getContentAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### 콘텐츠 답글 조회

```javascript
steem.api.getContentRepliesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### 저자와 날짜 기준 논의 조회

```javascript
steem.api.getDiscussionsByAuthorBeforeDateAsync(author, startPermlink, beforeDate, limit).then(function(result) {
  console.log(result);
});
```

#### 리블로그 조회

주어진 게시물을 리블로그(리스팀)한 사용자 목록을 반환합니다.

```javascript
steem.api.getRebloggedByAsync(author, permlink).then(function(data) {
  console.log(data);
});
```

**반환 예시:**

```javascript
['author', 'user1', 'user2', 'user3', 'user4']
```

#### 마지막 업데이트 기준 답글 조회

```javascript
steem.api.getRepliesByLastUpdateAsync(startAuthor, startPermlink, limit).then(function(result) {
  console.log(result);
});
```

### 위트니스

#### 위트니스 조회

```javascript
steem.api.getWitnessesAsync(witnessIds).then(function(result) {
  console.log(result);
});
```

#### 계정으로 위트니스 조회

주어진 `accountName`을 가진 위트니스 (witness)의 정보를 반환합니다.

```javascript
steem.api.getWitnessByAccountAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### 투표 기준 위트니스 조회

```javascript
steem.api.getWitnessesByVoteAsync(from, limit).then(function(result) {
  console.log(result);
});
```

#### 위트니스 계정 탐색

```javascript
steem.api.lookupWitnessAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### 위트니스 수 조회

```javascript
steem.api.getWitnessCountAsync().then(function(result) {
  console.log(result);
});
```

#### 활성 위트니스 조회

```javascript
steem.api.getActiveWitnessesAsync().then(function(result) {
  console.log(result);
});
```

#### 위트니스 스케줄 조회

위트니스에 대한 일반적인 정보를 가져옵니다.

```javascript
steem.api.getWitnessScheduleAsync().then(function(data) {
  console.log(data);
});
```

**반환 예시:**

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

## 로그인 API

## 로그인 API

### 로그인

⚠️ 이 메서드를 사용자 이름과 비밀번호로 사용하는 것은 **안전하지 않습니다**. 이 메서드는 항상 `true`를 반환하며, 브로드캐스트를 활성화하기 위해 빈 값으로 내부에서만 사용됩니다.

```javascript
steem.api.loginAsync('', '').then(function(result) {
  console.log(result);
});
```

### 이름으로 API 조회

```javascript
steem.api.getApiByNameAsync(apiName).then(function(result) {
  console.log(result);
});
```

---

## 팔로우 API

팔로우 API는 계정 간 팔로우 관계에 대한 정보를 조회합니다. 이 API는 읽기 전용이며 블록체인에 변경을 만들지 않습니다.

### 팔로워 조회

특정 계정을 팔로우하는 계정들의 배열을 알파벳 순서로 반환합니다.

```javascript
steem.api.getFollowersAsync(following, startFollower, followType, limit).then(function(result) {
  console.log(result);
});
```

**파라미터 설명:**

| 파라미터 | 설명 | 데이터 타입 | 비고 |
|---|---|---|---|
| following | 어느 계정의 팔로워인지 | String | 맨 앞의 @ 기호 없이 |
| startFollower | 어느 팔로워부터 목록을 시작할까요? | String | 맨 앞의 @ 기호 없이. 목록을 시작하려면 빈 문자열 `''`을 사용하세요. 이후 호출에서는 마지막 팔로워의 이름을 사용할 수 있습니다 |
| followType | ?? | ?? | 0 또는 'blog'로 설정 — 어느 쪽이든 동작합니다 |
| limit | 반환할 팔로워의 최대 개수 | Integer | |

**호출 예시:**

```javascript
steem.api.getFollowersAsync('ned', '', 'blog', 2).then(function(result) {
  console.log(result);
});
```

**반환 예시:**

```javascript
[
  { follower: 'a-0-0', following: 'ned', what: ['blog'] },
  { follower: 'a-0-0-0-1abokina', following: 'ned', what: ['blog'] }
]
```

### 팔로잉 조회

특정 계정이 팔로우하는 계정들의 배열을 알파벳 순서로 반환합니다.

```javascript
steem.api.getFollowingAsync(follower, startFollowing, followType, limit).then(function(result) {
  console.log(result);
});
```

**반환 예시:**

```javascript
[
  { follower: 'dan', following: 'dantheman', what: ['blog'] },
  { follower: 'dan', following: 'krnel', what: ['blog'] }
]
```

### 팔로우 수 조회

```javascript
steem.api.getFollowCountAsync(account).then(function(result) {
  console.log(result);
});
```

**반환 예시:**

```javascript
{ account: 'ned', follower_count: 16790, following_count: 913 }
```

## 인증

## 인증

### 검증

```javascript
steem.auth.verify(name, password, auths);
```

### 키 생성

```javascript
steem.auth.generateKeys(name, password, roles);
```

### 개인 키 조회

```javascript
steem.auth.getPrivateKeys(name, password, roles);
```

### WIF 여부 확인

```javascript
steem.auth.isWif(privWif);
```

### WIF로 변환

```javascript
steem.auth.toWif(name, password, role);
```

### WIF 유효성 검사

```javascript
steem.auth.wifIsValid(privWif, pubWif);
```

### WIF에서 공개 키로

```javascript
steem.auth.wifToPublic(privWif);
```

### 트랜잭션 서명

제공된 개인 키로 트랜잭션에 서명합니다. 서명은 다이제스트 `sha256(chain_id ‖ serializeTransaction(normalizedTrx))` 위에서 계산되며, `chain_id`는 설정된 체인에서 가져옵니다(메인넷 기본값은 전부 0).

- **`trx`** — 트랜잭션 객체: `ref_block_num`, `ref_block_prefix`, `expiration`, `operations`(`[opType, opData]` 배열) 및 `extensions`.
- **`keys`** — 서명에 사용되는 WIF 개인 키 배열.
- `signatures` 배열이 추가된 트랜잭션 객체를 반환합니다.

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

> **참고:** `signatures` 필드는 서명 다이제스트의 일부가 **아닙니다**. 서명 과정에서는 서명을 붙이기 *전에* 트랜잭션을 직렬화하므로, 다이제스트는 서명되지 않은 트랜잭션 본문만을 대상으로 합니다.

### 트랜잭션 검증

서명된 트랜잭션의 서명들이 주어진 공개 키로 생성된 것인지 검증합니다. 다이제스트는 `signTransaction`이 계산하는 방식과 정확히 동일하게 재구성됩니다: `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`. 어느 하나의 서명이라도 `publicKey`에 대해 유효하면 `true`, 그렇지 않으면 `false`를 반환합니다.

- **`transaction`** — 서명된 트랜잭션 객체(`signatures` 배열을 반드시 포함해야 함). 다이제스트 계산 전에 `signatures` 필드는 제거되므로, 서명이 몇 개 있든 상관없습니다.
- **`publicKey`** — 검증 대상인 `STM…` 공개 키.
- `boolean`을 반환합니다.

```javascript
const publicKey = steem.auth.wifToPublic(wif);

// Round-trip: a correctly-signed tx verifies against its signing key
const isValid = steem.auth.verifyTransaction(signedTx, publicKey);
console.log(isValid); // true

// A different public key is rejected
const wrongPub = steem.auth.wifToPublic('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');
console.log(steem.auth.verifyTransaction(signedTx, wrongPub)); // false
```

> **보안 활용 사례:** 릴레이/월렛 서버는 클라이언트가 제출한 트랜잭션에 대해 `verifyTransaction`을 호출하여, 체인에 전달하기 *전에* 그 트랜잭션이 주장된 계정의 키로 서명되었음을 증명할 수 있습니다. 이는 그동안 서버가 트랜잭션의 형태만 검사하고 암호학적 진위는 확인할 수 없었던 다계층 방어 공백을 메웁니다.

### 트랜잭션 직렬화

트랜잭션을 **이진(binary)** 형태(FC 스타일)로 직렬화하여 `Buffer`를 반환합니다. `signTransaction`이 내부적으로 사용하는 것과 동일한 직렬화기이므로, 출력은 Steem 노드의 트랜잭션 와이어 포맷과 바이트 단위로 일치합니다. 다운스트림 애플리케이션은 이를 사용해 서명 다이제스트를 직접 재구성할 수 있습니다.

- **`trx`** — 트랜잭션 객체(`signTransaction`의 `trx`와 동일한 구조).
- `Buffer`를 반환합니다.

```javascript
import { sha256 } from '@noble/hashes/sha2';

// Build the exact digest signTransaction signs over:
const buf = steem.auth.serializeTransaction(tx); // Buffer
const chainId = Buffer.alloc(32, 0); // mainnet chain_id (all-zero)
const digest = Buffer.from(sha256(Buffer.concat([chainId, buf])));
console.log(digest.toString('hex')); // 32-byte digest
```

## 포매터

## 포매터

### 금액

숫자와 통화를 전송에 유효한 형태로 포맷합니다 (예를 들어 — 숫자의 소수점 이하를 3자리까지만 남깁니다).

```javascript
steem.formatter.amount(_amount, asset);
```

**파라미터 설명:**

| 파라미터 | 데이터 타입 | 설명 |
|---------|--------|-----------|
| _amount | number | 양수 |
| asset | string | Steem 자산의 이름 (steem, sbd) |

**호출 예시:**

```javascript
steem.formatter.amount(53.442346, "STEEM"); // "53.442 STEEM"
```

### 베스팅 STEEM

`account`의 베스팅 지분 (VESTS)을 이에 해당하는 Steem 수량으로 변환합니다.

```javascript
steem.formatter.vestingSteem(account, gprops);
```

**호출 예시:**

```javascript
steem.api.getAccountsAsync(["username"]).then(function(accounts) {
  steem.api.getStateAsync("/@username").then(function(state) {        
    const vestingSteem = steem.formatter.vestingSteem(accounts[0], state.props);
    console.log(vestingSteem); // 7.42431235
  });
});
```

### 천 단위 구분 숫자

큰 숫자를 3자리마다 쉼표를 넣어 포맷합니다. 주의 — 문자열에만 동작하며, 숫자는 직접 넘길 수 없습니다.

```javascript
steem.formatter.numberWithCommas(x);
```

**호출 예시:**

```javascript
steem.formatter.numberWithCommas("53304432342.432"); // "53,304,432,342.432"
```

### 계정 가치 추정

`account` 자산의 달러 환산 추정치를 가져옵니다.

```javascript
steem.formatter.estimateAccountValue(account).then(function(data) {
  console.log(data); // 32.25
});
```

### 제안 비밀번호 생성

```javascript
const password = steem.formatter.createSuggestedPassword();
console.log(password); // 'GAz3GYFvvQvgm7t2fQmwMDuXEzDqTzn9'
```

### 댓글 퍼머링크

```javascript
const parentAuthor = 'ned';
const parentPermlink = 'a-selfie';
const commentPermlink = steem.formatter.commentPermlink(parentAuthor, parentPermlink);
console.log(commentPermlink); // 're-ned-a-selfie-20170621t080403765z'
```

### 평판

```javascript
const reputation = steem.formatter.reputation(3512485230915);
console.log(reputation); // 56
```

### 베스팅을 STEEM으로

```javascript
const steemPower = steem.formatter.vestToSteem(vestingShares, totalVestingShares, totalVestingFundSteem);
console.log(steemPower);
```


## 유틸

## 유틸

### 사용자 이름 검증

```javascript
const isValidUsername = steem.utils.validateAccountName('test1234');
console.log(isValidUsername); // null

const isValidUsername2 = steem.utils.validateAccountName('a1');
console.log(isValidUsername2); // 'Account name should be longer.'
```

### 카멜 케이스

'_' 문자가 들어간 문자열을 CamelCase 표기로 바꿔 포맷합니다.

```javascript
steem.utils.camelCase(str);
```

**호출 예시:**

```javascript
steem.utils.camelCase("example_string"); // "exampleString"
```

## 다음 단계

- 체인 상태를 수정하려면 [브로드캐스트 오퍼레이션](/ko/tutorials/steem-js/broadcast.html)을 보세요.
- 인증이 필요한 읽기와 서명 검증은 [서명된 호출과 서명 검증](/tutorials/steem-js/signed-calls.html)을 보세요.
- 설치와 설정은 [시작하기 튜토리얼](/ko/tutorials/steem-js/index.html)로 돌아가세요.
