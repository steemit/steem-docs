---
title: steem-js - 브로드캐스트 오퍼레이션
description: steem-js 브로드캐스트 전체 카탈로그 — 프로미스와 콜백 패턴, 모든 브로드캐스트 오퍼레이션, 멀티시그 및 이진 트랜잭션 직렬화.
---

# steem-js: 브로드캐스트 오퍼레이션

`steem.broadcast` 네임스페이스는 블록체인에 영구적인 변화를 만듭니다: 투표, 전송, 게시물, 위트니스 오퍼레이션 등. 이 페이지는 [steem-js](https://github.com/steemit/steem-js) 문서의 브로드캐스트 예시 전체를 담고 있으며, 체인 데이터 읽기는 [체인 데이터 읽기](/ko/tutorials/steem-js/read-api.html)에서 다룹니다.

> 모든 오퍼레이션의 와이어 수준 세부 사항은 생성된 [브로드캐스트 오퍼레이션 레퍼런스](/ko/api/broadcast_ops/)에 문서화되어 있습니다.

## 브로드캐스트 API

## 브로드캐스트 API

### 블록 브로드캐스트

Steem 블록체인에 새 블록을 브로드캐스트합니다.

```javascript
steem.api.broadcastBlockAsync(blockObject).then(function(data) {
  console.log(data);
});
```

### 트랜잭션 동기 브로드캐스트

```javascript
steem.api.broadcastTransactionSynchronousAsync(trx).then(function(result) {
  console.log(result);
});
```

## 브로드캐스트 오퍼레이션

## 브로드캐스트 오퍼레이션

`steem.broadcast` 메서드는 블록체인에 영구적인 변화를 만듭니다.

### Promise 지원

모든 브로드캐스트 메서드는 콜백과 프로미스 패턴을 모두 지원합니다. 어느 쪽이든 사용할 수 있습니다:

#### Promise 패턴 (권장)

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

#### 콜백 패턴 (레거시)

```javascript
steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
});
```

### 계정 생성

```javascript
steem.broadcast.accountCreateAsync(wif, fee, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### 위임을 포함한 계정 생성

```javascript
steem.broadcast.accountCreateWithDelegationAsync(wif, fee, delegation, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata, extensions).then(function(result) {
  console.log(result);
});
```

### 베스팅 지분 위임

STEEM Power (SP)를 베스팅 지분 (VESTS) 단위로 `delegator`에서 `delegatee`로 위임합니다. 위임자의 WIF 개인 키가 필요합니다. 위임 수량을 0으로 설정하면 위임이 해제됩니다.

```javascript
steem.broadcast.delegateVestingSharesAsync(wif, delegator, delegatee, vesting_shares).then(function(result) {
  console.log(result);
});
```

### 계정 업데이트

```javascript
steem.broadcast.accountUpdateAsync(wif, account, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### 위트니스 투표 프록시

```javascript
steem.broadcast.accountWitnessProxyAsync(wif, account, proxy).then(function(result) {
  console.log(result);
});
```

### 위트니스 투표

```javascript
steem.broadcast.accountWitnessVoteAsync(wif, account, witness, approve).then(function(result) {
  console.log(result);
});
```

### 복구 계정 변경

```javascript
steem.broadcast.changeRecoveryAccountAsync(wif, accountToRecover, newRecoveryAccount, extensions).then(function(result) {
  console.log(result);
});
```

### 댓글

```javascript
steem.broadcast.commentAsync(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### 댓글 옵션

```javascript
steem.broadcast.commentOptionsAsync(wif, author, permlink, maxAcceptedPayout, percentSteemDollars, allowVotes, allowCurationRewards, extensions).then(function(result) {
  console.log(result);
});
```

`extensions` 파라미터는 수혜자(beneficiary) 확장(tag 0)을 지원합니다. `[tag, value]` 배열을 넘기세요. 예: `[[0, { beneficiaries: [{ account: 'foo', weight: 1000 }, { account: 'bar', weight: 5000 }] }]]`. Steem 프로토콜 규격에 맞추기 위해 수혜자는 직렬화 전에 계정 이름 순으로 자동 정렬됩니다.

### 컨버전

```javascript
steem.broadcast.convertAsync(wif, owner, requestid, amount).then(function(result) {
  console.log(result);
});
```

### 커스텀 오퍼레이션

```javascript
steem.broadcast.customAsync(wif, requiredAuths, id, data).then(function(result) {
  console.log(result);
});
```

### 커스텀 JSON

```javascript
steem.broadcast.customJsonAsync(wif, requiredAuths, requiredPostingAuths, id, json).then(function(result) {
  console.log(result);
});
```

### 댓글 삭제

```javascript
steem.broadcast.deleteCommentAsync(wif, author, permlink).then(function(result) {
  console.log(result);
});
```

### 에스크로 오퍼레이션

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

### 에스크로 조회

```javascript
steem.api.getEscrowAsync(from, escrowId).then(function(data) {
  console.log(data);
});
```

### 피드 가격 발행

```javascript
steem.broadcast.feedPublishAsync(wif, publisher, exchangeRate).then(function(result) {
  console.log(result);
});
```

### 지정가 주문 오퍼레이션

```javascript
// Limit Order Cancel
steem.broadcast.limitOrderCancelAsync(wif, owner, orderid);

// Limit Order Create
steem.broadcast.limitOrderCreateAsync(wif, owner, orderid, amountToSell, minToReceive, fillOrKill, expiration);

// Limit Order Create2
steem.broadcast.limitOrderCreate2Async(wif, owner, orderid, amountToSell, exchangeRate, fillOrKill, expiration);
```

**지정가 주문 파라미터 설명:**

| 파라미터 | 설명 | 데이터 타입 | 비고 |
|---|---|---|---|
| wif | 액티브 키의 개인 키 | String | |
| owner | 계정 이름 | String | 맨 앞의 @ 기호 없이 |
| orderid | 사용자가 정의한 주문 번호 | Integer | 주문 취소에 사용됩니다 |
| amountToSell | 판매할 수량 | String | "X.XXX ASSET"은 소수점 3자리여야 합니다. 예: "25.100 SBD" |
| minToReceive | 원하는 수량 | String | "X.XXX ASSET"은 소수점 3자리여야 합니다. 예: "20.120 STEEM" |
| fillOrKill | 현재 오더북으로 체결하거나 주문을 무효화 | Boolean | `false`는 주문이 취소되거나 체결되거나 만료 시간에 도달할 때까지 오더북에 남습니다 |
| expiration | 주문 만료 시각 | Integer | 단위는 밀리초. 0은 UNIX 원년(epoch)입니다 |

### 계정 복구

```javascript
// Recover Account
steem.broadcast.recoverAccountAsync(wif, accountToRecover, newOwnerAuthority, recentOwnerAuthority, extensions);

// Request Account Recovery
steem.broadcast.requestAccountRecoveryAsync(wif, recoveryAccount, accountToRecover, newOwnerAuthority, extensions);
```

### 전송 오퍼레이션

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

**전송 파라미터 설명:**

| 파라미터 | 설명 | 데이터 타입 | 비고 |
|---|---|---|---|
| wif | `from` 계정의 액티브 키 개인 키 | String | |
| from | 자산을 꺼내 올 계정 이름 | String | 맨 앞의 @ 기호 없이 |
| to | 자산을 넣어 줄 계정 이름 | String | 맨 앞의 @ 기호 없이 |
| amount | 이체할 자산 수량 | String | "X.XXX ASSET"은 소수점 3자리여야 합니다. 예: "5.150 SBD" |

### 투표

```javascript
steem.broadcast.voteAsync(wif, voter, author, permlink, weight).then(function(result) {
  console.log(result);
});
```

### 베스팅 인출

```javascript
steem.broadcast.withdrawVestingAsync(wif, account, vestingShares).then(function(result) {
  console.log(result);
});
```

### 위트니스 업데이트

```javascript
steem.broadcast.witnessUpdateAsync(wif, owner, url, blockSigningKey, props, fee).then(function(result) {
  console.log(result);
});
```

### 베스팅 인출 경로 설정

```javascript
steem.broadcast.setWithdrawVestingRouteAsync(wif, fromAccount, toAccount, percent, autoVest).then(function(result) {
  console.log(result);
});
```

### 인출 경로 조회

인출 경로(STEEM Power 인출)를 가져옵니다.

```javascript
steem.api.getWithdrawRoutesAsync(account, withdrawRouteType).then(function(data) {
  console.log(data);
});
```

### 리워드 잔액 수령

대기 중인 보상을 청구합니다. Steem이든 SBD든 VESTS든 상관없습니다.

```javascript
steem.broadcast.claimRewardBalanceAsync(wif, account, reward_steem, reward_sbd, reward_vests).then(function(data) {
  console.log(data);
});
```

**파라미터 설명:**

| 파라미터 | 데이터 타입 | 설명 |
|---------|--------|-----------|
| wif | string | steem.auth.toWif(user, pass, type)를 사용하세요 |
| account | string | Steem 사용자 이름 |
| reward_steem | string | "0.000 STEEM" 형태의 잔액 |
| reward_sbd | string | "0.000 SBD" 형태의 잔액 |
| reward_vests | string | "0.000006 VESTS" 형태의 잔액 |

### 멀티시그

멀티시그니처를 사용해 오퍼레이션을 브로드캐스트할 수 있습니다.

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

### 트랜잭션 직렬화 (바이너리)

브로드캐스트와 서명은 Steem 프로토콜과 호환되는 **이진 트랜잭션 포맷**(FC 스타일)을 사용합니다. 직렬화기는 `src/auth/serializer/transaction.ts`에 있으며, `steem.auth.signTransaction`과 `steem.broadcast.sendAsync`가 내부적으로 사용합니다.

**사용법**

- **서명 / 다이제스트용**: `steem.auth.serializeTransaction(trx)` — 서명을 위해 해시되는 `Buffer`를 반환합니다. 이진 직렬화기의 공개 API이며, `steem.auth.transaction.toBuffer(trx)`는 이에 상응하는 내부 진입점입니다.

```javascript
// The public serializer (preferred for app code):
const buf = steem.auth.serializeTransaction(trx); // Buffer
```
- **트랜잭션 구조**: `trx`에는 `ref_block_num`, `ref_block_prefix`, `expiration`, `operations`(`[opType, opData]` 배열)가 반드시 포함되어야 하고, `extensions`와 `signatures`는 선택적입니다.

**직렬화기 지원 범위**

`operations`에 사용되는 모든 Steem 오퍼레이션 유형이 지원됩니다(오퍼레이션 유형 인덱스 0–54). 예를 들어:

- **콘텐츠 & 소셜**: vote, comment, delete_comment, comment_options, custom_json
- **계정 & 권한**: account_create, account_update, account_update2, account_create_with_delegation, create_claimed_account, request_account_recovery, recover_account, change_recovery_account, reset_account, set_reset_account, decline_voting_rights
- **전송 & 베스팅**: transfer, transfer_to_vesting, withdraw_vesting, set_withdraw_vesting_route, transfer_to_savings, transfer_from_savings, cancel_transfer_from_savings, delegate_vesting_shares
- **마켓 & 컨버전**: limit_order_create, limit_order_create2, limit_order_cancel, feed_publish, convert, fill_order
- **에스크로**: escrow_transfer, escrow_dispute, escrow_release, escrow_approve
- **보상 & 시스템**: claim_reward_balance, claim_reward_balance2, comment_reward, liquidity_reward, interest, fill_vesting_withdraw, fill_convert_request, fill_transfer_from_savings
- **위트니스 & 커스텀**: pow, pow2, witness_update, witness_set_properties, account_witness_vote, account_witness_proxy, custom, custom_binary

필드 순서와 인코딩(자산, 권한, 시간, extensions)은 C++ FC_REFLECT / [steemutil](https://github.com/steemit/steemutil) 프로토콜과 동일한 레이아웃을 따릅니다. `test/fixtures/serializer/` 아래의 교차 언어 픽스처는, 해당되는 경우 JS 출력이 steemutil 인코더와 일치하도록 유지하는 데 사용됩니다.

**호환성 참고 사항**

- 수량 필드에는 **STEEM / SBD / VESTS** 자산 문자열을 사용하세요 (예: `"1.000 STEEM"`).
- 권한(authority): `owner` / `active` / `posting`은 `weight_threshold`, `account_auths`, `key_auths`(`[key, weight]` 배열)를 사용하며, 공개 키는 STM… 형태의 문자열입니다.
- 선택적 필드(예: account_update의 `owner`)는 프로토콜이 요구하는 곳에서 존재 바이트(presence byte)로 인코딩됩니다.
- 직렬화기 지원은 위에 나열된 모든 오퍼레이션에 고수준 `steem.broadcast.*` 래퍼, JSON 정규화, 문자열 전용 메타데이터 처리가 있다는 뜻이 **아닙니다**.


## 다음 단계

- 투표 / 전송 / 게시 엔드투엔드 예시: [시작하기 — 사용 예시](/ko/tutorials/steem-js/index.html#usage-examples).
- 트랜잭션을 직접 서명하고 검증하기: [서명된 호출과 서명 검증](/tutorials/steem-js/signed-calls.html).
