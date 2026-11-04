---
title: steem-js - широковещательные операции
description: Полный каталог широковещательных операций steem-js — паттерны Promise и колбэков, все операции широковещания, мультиподпись и двоичная сериализация транзакций.
---

# steem-js: Широковещательные операции

Пространство имён `steem.broadcast` вносит в блокчейн необратимые изменения: голоса, переводы, посты, операции свидетелей и другое. На этой странице собраны полные примеры широковещания из документации [steem-js](https://github.com/steemit/steem-js); чтение данных цепочки описано в разделе [Чтение данных цепочки](/ru/tutorials/steem-js/read-api.html).

> Сетевые детали каждой операции задокументированы в сгенерированном [справочнике операций широковещания](/ru/api/broadcast_ops/).

## API широковещания

## API широковещания

### Широковещание блока

Транслирует (broadcast) новый блок в блокчейн Steem.

```javascript
steem.api.broadcastBlockAsync(blockObject).then(function(data) {
  console.log(data);
});
```

### Синхронное широковещание транзакции

```javascript
steem.api.broadcastTransactionSynchronousAsync(trx).then(function(result) {
  console.log(result);
});
```

## Операции широковещания

## Операции широковещания

Методы `steem.broadcast` вносят в блокчейн необратимые изменения.

### Поддержка Promise

Все методы широковещания поддерживают и колбэки, и Promise — можно использовать любой подход:

#### Паттерн Promise (рекомендуется)

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

#### Паттерн с колбэками (устаревший)

```javascript
steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
});
```

### Создание аккаунта

```javascript
steem.broadcast.accountCreateAsync(wif, fee, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Создание аккаунта с делегированием

```javascript
steem.broadcast.accountCreateWithDelegationAsync(wif, fee, delegation, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata, extensions).then(function(result) {
  console.log(result);
});
```

### Делегирование долей вестинга

Делегирует Силу STEEM (SP), выраженную в долях вестинга (VESTS), от `delegator` к `delegatee`. Требуется приватный WIF-ключ делегата. Чтобы отменить делегирование, установите сумму 0.

```javascript
steem.broadcast.delegateVestingSharesAsync(wif, delegator, delegatee, vesting_shares).then(function(result) {
  console.log(result);
});
```

### Обновление аккаунта

```javascript
steem.broadcast.accountUpdateAsync(wif, account, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Прокси для голосования за свидетеля

```javascript
steem.broadcast.accountWitnessProxyAsync(wif, account, proxy).then(function(result) {
  console.log(result);
});
```

### Голосование за свидетеля

```javascript
steem.broadcast.accountWitnessVoteAsync(wif, account, witness, approve).then(function(result) {
  console.log(result);
});
```

### Смена аккаунта восстановления

```javascript
steem.broadcast.changeRecoveryAccountAsync(wif, accountToRecover, newRecoveryAccount, extensions).then(function(result) {
  console.log(result);
});
```

### Комментарий

```javascript
steem.broadcast.commentAsync(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Опции комментария

```javascript
steem.broadcast.commentOptionsAsync(wif, author, permlink, maxAcceptedPayout, percentSteemDollars, allowVotes, allowCurationRewards, extensions).then(function(result) {
  console.log(result);
});
```

Параметр `extensions` поддерживает расширение получателей выгоды (beneficiaries, тег 0). Передайте массив пар `[tag, value]`, например `[[0, { beneficiaries: [{ account: 'foo', weight: 1000 }, { account: 'bar', weight: 5000 }] }]]`. Перед сериализацией получатели выгоды автоматически сортируются по имени аккаунта в соответствии с протоколом Steem.

### Конвертация

```javascript
steem.broadcast.convertAsync(wif, owner, requestid, amount).then(function(result) {
  console.log(result);
});
```

### Произвольная операция

```javascript
steem.broadcast.customAsync(wif, requiredAuths, id, data).then(function(result) {
  console.log(result);
});
```

### Произвольный JSON

```javascript
steem.broadcast.customJsonAsync(wif, requiredAuths, requiredPostingAuths, id, json).then(function(result) {
  console.log(result);
});
```

### Удаление комментария

```javascript
steem.broadcast.deleteCommentAsync(wif, author, permlink).then(function(result) {
  console.log(result);
});
```

### Операции эскроу

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

### Получение эскроу

```javascript
steem.api.getEscrowAsync(from, escrowId).then(function(data) {
  console.log(data);
});
```

### Публикация цены фида

```javascript
steem.broadcast.feedPublishAsync(wif, publisher, exchangeRate).then(function(result) {
  console.log(result);
});
```

### Операции лимитных ордеров

```javascript
// Limit Order Cancel
steem.broadcast.limitOrderCancelAsync(wif, owner, orderid);

// Limit Order Create
steem.broadcast.limitOrderCreateAsync(wif, owner, orderid, amountToSell, minToReceive, fillOrKill, expiration);

// Limit Order Create2
steem.broadcast.limitOrderCreate2Async(wif, owner, orderid, amountToSell, exchangeRate, fillOrKill, expiration);
```

**Описание параметров лимитных заявок:**

| Параметр | Описание | Тип данных | Примечания |
|---|---|---|---|
| wif | Приватный активный ключ | String | |
| owner | Имя аккаунта | String | Без начального символа @ |
| orderid | Определённый пользователем номер заказа | Integer | Используется для отмены заявок |
| amountToSell | Количество на продажу | String | "X.XXX ASSET" — обязательно 3 знака после запятой, например "25.100 SBD" |
| minToReceive | Желаемое количество | String | "X.XXX ASSET" — обязательно 3 знака после запятой, например "20.120 STEEM" |
| fillOrKill | Исполнить заявку по текущему стакану или отменить её | Boolean | При `false` заявка попадает в биржевой стакан и остаётся там, пока не будет отменена, исполнена или не истечёт срок |
| expiration | Время истечения заявки | Integer | Единица — миллисекунды. Ноль — эпоха UNIX |

### Восстановление аккаунта

```javascript
// Recover Account
steem.broadcast.recoverAccountAsync(wif, accountToRecover, newOwnerAuthority, recentOwnerAuthority, extensions);

// Request Account Recovery
steem.broadcast.requestAccountRecoveryAsync(wif, recoveryAccount, accountToRecover, newOwnerAuthority, extensions);
```

### Операции перевода

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

**Описание параметров перевода:**

| Параметр | Описание | Тип данных | Примечания |
|---|---|---|---|
| wif | Приватный активный ключ аккаунта `from` | String | |
| from | Имя аккаунта, с которого списывается актив | String | Без начального символа @ |
| to | Имя аккаунта, на который зачисляется актив | String | Без начального символа @ |
| amount | Количество переводимого актива | String | "X.XXX ASSET" — обязательно 3 знака после запятой, например "5.150 SBD" |

### Голосование

```javascript
steem.broadcast.voteAsync(wif, voter, author, permlink, weight).then(function(result) {
  console.log(result);
});
```

### Вывод вестинга

```javascript
steem.broadcast.withdrawVestingAsync(wif, account, vestingShares).then(function(result) {
  console.log(result);
});
```

### Обновление свидетеля

```javascript
steem.broadcast.witnessUpdateAsync(wif, owner, url, blockSigningKey, props, fee).then(function(result) {
  console.log(result);
});
```

### Настройка маршрута вывода вестинга

```javascript
steem.broadcast.setWithdrawVestingRouteAsync(wif, fromAccount, toAccount, percent, autoVest).then(function(result) {
  console.log(result);
});
```

### Получение маршрутов вывода

Получает маршруты вывода (вывод Силы STEEM).

```javascript
steem.api.getWithdrawRoutesAsync(account, withdrawRouteType).then(function(data) {
  console.log(data);
});
```

### Получение вознаграждений

Получает невостребованные награды — будь то Steem, SBD или вестинги.

```javascript
steem.broadcast.claimRewardBalanceAsync(wif, account, reward_steem, reward_sbd, reward_vests).then(function(data) {
  console.log(data);
});
```

**Описание параметров:**

| Параметр | Тип данных | Описание |
|---------|--------|-----------|
| wif | string | Используйте steem.auth.toWif(user, pass, type) |
| account | string | Имя пользователя Steem |
| reward_steem | string | Баланс вида "0.000 STEEM" |
| reward_sbd | string | Баланс вида "0.000 SBD" |
| reward_vests | string | Баланс вида "0.000006 VESTS" |

### Мультиподпись

Для широковещания операции можно использовать мультиподпись.

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

### Сериализация транзакции (двоичная)

Широковещание и подписание используют **двоичный формат транзакций**, совместимый с протоколом Steem (в стиле FC). Сериализатор находится в `src/auth/serializer/transaction.ts` и используется внутри `steem.auth.signTransaction` и `steem.broadcast.sendAsync`.

**Использование**

- **Для подписи / дайджеста**: `steem.auth.serializeTransaction(trx)` — возвращает `Buffer`, который хешируется для подписи. Это публичный API двоичного сериализатора; `steem.auth.transaction.toBuffer(trx)` — эквивалентная внутренняя точка входа.

```javascript
// The public serializer (preferred for app code):
const buf = steem.auth.serializeTransaction(trx); // Buffer
```
- **Структура транзакции**: `trx` должен содержать `ref_block_num`, `ref_block_prefix`, `expiration`, `operations` (массив пар `[opType, opData]`), а опционально `extensions` и `signatures`.

**Покрытие сериализатора**

Поддерживаются все типы операций Steem, используемые в `operations` (индексы типов 0–54), в том числе:

- **Контент и социалка**: vote, comment, delete_comment, comment_options, custom_json;
- **Аккаунты и полномочия**: account_create, account_update, account_update2, account_create_with_delegation, create_claimed_account, request_account_recovery, recover_account, change_recovery_account, reset_account, set_reset_account, decline_voting_rights;
- **Переводы и вестинг**: transfer, transfer_to_vesting, withdraw_vesting, set_withdraw_vesting_route, transfer_to_savings, transfer_from_savings, cancel_transfer_from_savings, delegate_vesting_shares;
- **Рынок и конвертация**: limit_order_create, limit_order_create2, limit_order_cancel, feed_publish, convert, fill_order;
- **Эскроу**: escrow_transfer, escrow_dispute, escrow_release, escrow_approve;
- **Награды и система**: claim_reward_balance, claim_reward_balance2, comment_reward, liquidity_reward, interest, fill_vesting_withdraw, fill_convert_request, fill_transfer_from_savings;
- **Свидетели и custom**: pow, pow2, witness_update, witness_set_properties, account_witness_vote, account_witness_proxy, custom, custom_binary.

Порядок полей и кодирование (активы, полномочия, время, extensions) следуют той же схеме, что и протокол C++ FC_REFLECT / [steemutil](https://github.com/steemit/steemutil). Кросс-языковые фикстуры в `test/fixtures/serializer/` используются, где применимо, чтобы вывод JS совпадал с кодировщиком steemutil.

**Замечания о совместимости**

- Для полей количества используйте строки активов **STEEM / SBD / VESTS** (например, `"1.000 STEEM"`).
- Полномочия (authority): `owner` / `active` / `posting` используют `weight_threshold`, `account_auths` и `key_auths` (массив пар `[key, weight]`); публичные ключи — строки вида STM….
- Опциональные поля (например, `owner` в account_update) там, где этого требует протокол, кодируются байтом присутствия (presence byte).
- Поддержка сериализации **не означает**, что для каждой из перечисленных операций есть высокоуровневая обёртка `steem.broadcast.*`, нормализация JSON или обработка метаданных только в виде строк.


## Что дальше

- Сквозные примеры голосования / перевода / публикации: [Начало работы — примеры использования](/ru/tutorials/steem-js/index.html#usage-examples).
- Ручное подписание и проверка транзакций: [Подписанные вызовы и проверка подписи](/tutorials/steem-js/signed-calls.html).
