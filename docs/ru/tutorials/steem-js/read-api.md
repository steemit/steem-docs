---
title: steem-js - чтение данных цепочки
description: Полный обзор читающего API steem-js — теги, блог, обсуждения, блоки, глобальные свойства, аккаунты, рынок, голоса, контент, свидетели, вход, подписки, аутентификация, formatter и utils.
---

# steem-js: Чтение данных цепочки

На этой странице собраны примеры чтения через `steem.api`, перенесённые из документации [steem-js](https://github.com/steemit/steem-js). Установка, настройка и примеры использования — в [туториале по началу работы](/ru/tutorials/steem-js/index.html); широковещательные операции — в разделе [Широковещательные операции](/ru/tutorials/steem-js/broadcast.html).

> Каждый вспомогательный метод ниже оборачивает JSON-RPC-метод, задокументированный в сгенерированном [Справочнике API](/ru/api/) — например, `getAccountsAsync` соответствует [condenser_api.get_accounts](/ru/api/condenser_api/get_accounts.html), а `getContentAsync` — [condenser_api.get_content](/ru/api/condenser_api/get_content.html). Демо здесь показывают клиентские приёмы работы steem-js.

## Методы чтения API

## Методы чтения API

Разделы ниже описывают вспомогательные методы `steem.api` для чтения состояния цепочки. Если не оговорено иное, вызовы маршрутизируются на узле в **`condenser_api`**.

### Теги

#### Получение трендовых тегов

Возвращает список текущих популярных тегов по убыванию значения.

```javascript
steem.api.getTrendingTagsAsync(afterTag, limit).then(function(result) {
  console.log(result);
});
```

**Описание параметров:**

| Параметр | Описание | Тип данных | Примечания |
|---|---|---|---|
| afterTag | Имя последнего тега, с которого начать | String | Используйте пустую строку `''`, чтобы начать список. В последующих вызовах можно указать имя последнего тега |
| limit | Максимальное количество возвращаемых тегов | Integer | |

**Пример вызова:**

```javascript
steem.api.getTrendingTagsAsync('', 2).then(function(result) {
  console.log(result);
});
```

**Пример результата:**

```javascript
[
  { name: '', total_payouts: '37610793.383 SBD', net_votes: 4211122, top_posts: 411832, comments: 1344461, trending: '5549490701' },
  { name: 'life', total_payouts: '8722947.658 SBD', net_votes: 1498401, top_posts: 127103, comments: 54049, trending: '570954588' }
]
```

**Использование результата:**

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

#### Получение блога

Получает последние `limit` постов аккаунта `account` до поста с индексом `entryId`.

```javascript
steem.api.getBlogAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Описание параметров:**

| Параметр | Тип данных | Описание |
|---------|--------|-----------|
| account | string | Имя пользователя Steem |
| entryId | number | Положительное число — индекс, с которого начинается отсчёт (индексация с нуля) |
| limit | number | Положительное число — максимальное количество возвращаемых постов |

**Пример вызова:**

```javascript
steem.api.getBlogAsync("username", 10, 3).then(function(data) {
  console.log(data);
});

// In this case we get [3] posts, the newest of which is the one with index [10]
// (that's the 11th post, because post indexes are zero-based)
// This means the results will be posts [10, 9 and 8]
```

#### Получение авторов блога

Получает список всех, кто публиковал записи в чужом блоге, и сколько раз они это делали.

```javascript
steem.api.getBlogAuthorsAsync(blogAccount).then(function(data) {
  console.log(data);
});
```

**Пример результата:**

```javascript
[
  ['username1', 1],
  ['username2', 1],
  ['username3', 3],
  ['username4', 2],
  ['username5', 1]
]
```

#### Получение записей блога

Получает последние `limit` постов аккаунта `account` до поста с индексом `entryId`. Очень похоже на getBlog, но объекты результата значительно проще.

```javascript
steem.api.getBlogEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Пример результата:**

```javascript
[
  { author: 'username', permlink: 'post-permlink-10', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 10 },
  { author: 'username', permlink: 'post-permlink-9', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 9 },
  { author: 'username', permlink: 'post-permlink-8', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 8 }
]
```

#### Получение обсуждений по трендам

Получает посты Steem так, как они показывались бы на вкладке trending сайта steemit.com.

```javascript
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});
```

**Пример вызова:**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});

// NOTE! The default limit is 0. Not setting a limit will get you an empty result.
```

#### Другие методы запроса обсуждений

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

#### Получение обсуждений по промо

Получает недавние посты, упорядоченные по сумме, потраченной на их продвижение.

```javascript
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

**Пример вызова:**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

### Блоки и транзакции

#### Получение заголовка блока

```javascript
steem.api.getBlockHeaderAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### Получение блока

```javascript
steem.api.getBlockAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### Получение операций в блоке

Получает все операции в заданном блоке.

```javascript
steem.api.getOpsInBlockAsync(blockNum, onlyVirtual).then(function(data) {
  console.log(data);
});
```

**Описание параметров:**

| Параметр | Тип данных | Описание |
|---------|--------|-----------|
| blockNum | number | Положительное число |
| onlyVirtual | boolean | 'false' — получить все операции; 'true' — только виртуальные операции |

**Пример вызова:**

```javascript
steem.api.getOpsInBlockAsync(10000001, false).then(function(data) {
  console.log(data);
});
```

#### Получение состояния

Получает много сведений о состоянии `path`.

```javascript
steem.api.getStateAsync(path).then(function(data) {
  console.log(data);
});
```

**Пример вызова:**

```javascript
// Valid call examples:
steem.api.getStateAsync("/@username");
steem.api.getStateAsync("/@username/permlink-of-post");
steem.api.getStateAsync("/@username/comments");
steem.api.getStateAsync("/@username/recent-replies");
steem.api.getStateAsync("/trending");
steem.api.getStateAsync("/trending/collorchallenge");
```

### Глобальные свойства

`getConfig`, `getDynamicGlobalProperties`, `getFeedHistory` и `getWitnessSchedule` используют на узле **`database_api`**; `getChainProperties`, `getHardforkVersion` и `getNextScheduledHardfork` — **`condenser_api`**.

#### Получение конфигурации

```javascript
steem.api.getConfigAsync().then(function(result) {
  console.log(result);
});
```

#### Получение динамических глобальных свойств

```javascript
steem.api.getDynamicGlobalPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### Получение свойств цепочки

```javascript
steem.api.getChainPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### Получение записей фида

Получает посты из ленты пользователя. Лента показывает посты пользователей, на которых вы подписаны, а также то, что они репостнули (resteem).

```javascript
steem.api.getFeedEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Описание параметров:**

| Параметр | Тип данных | Описание |
|---------|--------|-----------|
| account | string | Имя пользователя Steem |
| entryId | number | ID поста, с которого начинается отсчёт. Укажите '0', чтобы начать с самого нового поста |
| limit | number | Положительное число |

**Пример результата:**

```javascript
[
  { author: 'otherusername', permlink: 'permlink', reblog_by: ['resteembot'], reblog_on: '2018-02-11T18:42:54', entry_id: 10260 },
  { author: 'otherusername', permlink: 'permlink', reblog_by: [], reblog_on: '2018-02-11T18:39:24', entry_id: 10259 }
]
```

#### Получение истории фида

```javascript
steem.api.getFeedHistoryAsync().then(function(result) {
  console.log(result);
});
```

#### Получение текущей медианной исторической цены

```javascript
steem.api.getCurrentMedianHistoryPriceAsync().then(function(result) {
  console.log(result);
});
```

#### Получение тикера

Получает последние сводные данные рынка Steem.

```javascript
steem.api.getTickerAsync().then(function(data) {
  console.log(data);
});
```

**Пример результата:**

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

#### Получение истории сделок

Получает историю сделок за период между датами `start` и `end`.

```javascript
steem.api.getTradeHistoryAsync(start, end, limit).then(function(data) {
  console.log(data);
});
```

**Описание параметров:**

| Параметр | Тип данных | Описание |
|---------|--------|-----------|
| start | string | Строка даты-времени в формате "2018-01-01T00:00:00" |
| end | string | Строка даты-времени в формате "2018-01-01T00:00:00" |
| limit | number | Положительное число |

**Пример вызова:**

```javascript
const start = "2018-01-01T00:00:00";
const end = "2018-01-02T00:00:00";

steem.api.getTradeHistoryAsync(start, end, 5).then(function(data) {
  console.log(data);
});
```

#### Получение версии

Получает версию блокчейна Steem, к которому вы подключены.

```javascript
steem.api.getVersionAsync().then(function(data) {
  console.log(data);
});
```

**Пример результата:**

```javascript
{
  blockchain_version: '0.19.2',
  steem_revision: '07be64314ce9d277eb7da921b459c993c2e2412c',
  fc_revision: '8dd1fd1ec0906509eb722fa7c8d280d59bcca23d'
}
```

#### Получение объёма

Получает объёмы торгов по STEEM и долларам STEEM (SBD).

```javascript
steem.api.getVolumeAsync().then(function(data) {
  console.log(data);
});
```

**Пример результата:**

```javascript
{
  steem_volume: '8101.888 STEEM',
  sbd_volume: '7287.268 SBD'
}
```

#### Получение версии хардфорка

Получает текущую версию хардфорка блокчейна STEEM.

```javascript
steem.api.getHardforkVersionAsync().then(function(result) {
  console.log(result); // '0.19.0'
});
```

#### Получение следующего запланированного хардфорка

```javascript
steem.api.getNextScheduledHardforkAsync().then(function(result) {
  console.log(result);
});
```

#### Получение фонда вознаграждений

```javascript
steem.api.getRewardFundAsync(name).then(function(result) {
  console.log(result);
});
```

#### Получение делегаций вестинга

Возвращает список долей вестинга (VESTS), делегированных с одного аккаунта `account`. Суммы указаны в VESTS.

```javascript
steem.api.getVestingDelegationsAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**Описание параметров:**

| Параметр | Описание | Тип данных | Примечания |
|---|---|---|---|
| account | Аккаунт, который делегирует | String | |
| from | Имя последнего аккаунта, с которого начать | String | Используйте пустую строку `''`, чтобы начать список. В последующих вызовах можно указать имя последнего получателя делегирования |
| limit | Максимальное количество возвращаемых записей о делегировании | Integer | |

**Пример вызова:**

```javascript
steem.api.getVestingDelegationsAsync('ned', '', 2).then(function(result) {
  console.log(result);
});
```

**Пример результата:**

```javascript
[
  { id: 498422, delegator: 'ned', delegatee: 'spaminator', vesting_shares: '409517519.233783 VESTS', min_delegation_time: '2018-01-16T19:30:36' },
  { id: 181809, delegator: 'ned', delegatee: 'surpassinggoogle', vesting_shares: '1029059275.000000 VESTS', min_delegation_time: '2017-08-08T15:25:15' }
]
```

### Ключи

#### Получение ссылок на ключи

```javascript
steem.api.getKeyReferencesAsync(key).then(function(result) {
  console.log(result);
});
```

### Аккаунты

#### Получение аккаунтов

Получает несколько аккаунтов по их именам.

```javascript
steem.api.getAccountsAsync(names).then(function(result) {
  console.log(result);
});
```

**Описание параметров:**

| Параметр | Тип данных | Описание |
|---------|--------|-----------|
| names | array | Массив имён аккаунтов (строк) |

**Пример вызова:**

```javascript
steem.api.getAccountsAsync(['ned', 'dan']).then(function(accounts) {
  console.log(accounts);
});
```

**Примечание:** чтобы получить один аккаунт, передайте массив с одним именем: `getAccountsAsync(['username'])` и возьмите первый элемент результата.

#### Получение ссылок на аккаунт

```javascript
steem.api.getAccountReferencesAsync(accountId).then(function(result) {
  console.log(result);
});
```

#### Поиск имён аккаунтов

```javascript
steem.api.lookupAccountNamesAsync(accountNames).then(function(result) {
  console.log(result);
});
```

#### Поиск аккаунтов

```javascript
steem.api.lookupAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### Получение количества аккаунтов

```javascript
steem.api.getAccountCountAsync().then(function(result) {
  console.log(result);
});
```

#### Получение запросов на конвертацию

```javascript
steem.api.getConversionRequestsAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### Получение истории аккаунта

```javascript
steem.api.getAccountHistoryAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**Подписанная версия (для приватных данных аккаунта):**

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

#### Получение истории владельца

```javascript
steem.api.getOwnerHistoryAsync(account).then(function(result) {
  console.log(result);
});
```

#### Получение запроса на восстановление

```javascript
steem.api.getRecoveryRequestAsync(account).then(function(result) {
  console.log(result);
});
```

#### Получение репутации аккаунтов

Получает очки репутации `limit` аккаунтов, имена которых ближе всего к `lowerBoundName`.

```javascript
steem.api.getAccountReputationsAsync(lowerBoundName, limit).then(function(data) {
  console.log(data);
});
```

**Пример результата:**

```javascript
[
  { account: 'username', reputation: '26727073581' },
  { account: 'username-taken', reputation: 0 }
]
```

### Рынок

#### Получение стакана ордеров

```javascript
steem.api.getOrderBookAsync(limit).then(function(result) {
  console.log(result);
});
```

#### Получение рыночного стакана ордеров

Берёт первые `limit` записей биржевого стакана (order book) и по заявкам на покупку, и по заявкам на продажу.

```javascript
steem.api.getMarketOrderBookAsync(limit).then(function(data) {
  console.log(data);
});
```

**Пример результата:**

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

#### Получение открытых ордеров

```javascript
steem.api.getOpenOrdersAsync(owner).then(function(result) {
  console.log(result);
});
```

`getOrderBook` использует на узле **`database_api`**; `getMarketOrderBook` — **`market_history_api`**.

#### Получение корзин рыночной истории

```javascript
steem.api.getMarketHistoryBucketsAsync().then(function(data) {
  console.log(data); // [15, 60, 300, 3600, 86400]
});
```

### Авторизация / Проверка

#### Получение hex транзакции

```javascript
steem.api.getTransactionHexAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Получение транзакции

```javascript
steem.api.getTransactionAsync(trxId).then(function(result) {
  console.log(result);
});
```

#### Получение необходимых подписей

```javascript
steem.api.getRequiredSignaturesAsync(trx, availableKeys).then(function(result) {
  console.log(result);
});
```

#### Получение потенциальных подписей

```javascript
steem.api.getPotentialSignaturesAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Проверка полномочий

Использует на узле **`database_api`**.

```javascript
steem.api.verifyAuthorityAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Проверка полномочий аккаунта

Использует на узле **`database_api`**.

```javascript
steem.api.verifyAccountAuthorityAsync(nameOrId, signers).then(function(result) {
  console.log(result);
});
```

#### Получение тегов, используемых автором

Получает теги, используемые пользователем Steem. У большинства пользователей тегов ещё нет, но у некоторых есть.

```javascript
steem.api.getTagsUsedByAuthorAsync(author).then(function(data) {
  console.log(data);
});
```

**Пример вызова:**

```javascript
steem.api.getTagsUsedByAuthorAsync("good-karma").then(function(data) {
  console.log(data); // [['challenge', 0]]
});
```

### Голоса

#### Получение активных голосов

```javascript
steem.api.getActiveVotesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Получение голосов аккаунта

```javascript
steem.api.getAccountVotesAsync(voter).then(function(result) {
  console.log(result);
});
```

### Контент

#### Получение контента

```javascript
steem.api.getContentAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Получение ответов на контент

```javascript
steem.api.getContentRepliesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Получение обсуждений автора до даты

```javascript
steem.api.getDiscussionsByAuthorBeforeDateAsync(author, startPermlink, beforeDate, limit).then(function(result) {
  console.log(result);
});
```

#### Получение реблогов

Возвращает список пользователей, сделавших репост (resteem) данного поста.

```javascript
steem.api.getRebloggedByAsync(author, permlink).then(function(data) {
  console.log(data);
});
```

**Пример результата:**

```javascript
['author', 'user1', 'user2', 'user3', 'user4']
```

#### Получение ответов по последнему обновлению

```javascript
steem.api.getRepliesByLastUpdateAsync(startAuthor, startPermlink, limit).then(function(result) {
  console.log(result);
});
```

### Свидетели

#### Получение свидетелей

```javascript
steem.api.getWitnessesAsync(witnessIds).then(function(result) {
  console.log(result);
});
```

#### Получение свидетеля по аккаунту

Возвращает информацию о свидетеле (witness) с указанным `accountName`.

```javascript
steem.api.getWitnessByAccountAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### Получение свидетелей по голосам

```javascript
steem.api.getWitnessesByVoteAsync(from, limit).then(function(result) {
  console.log(result);
});
```

#### Поиск аккаунтов свидетелей

```javascript
steem.api.lookupWitnessAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### Получение количества свидетелей

```javascript
steem.api.getWitnessCountAsync().then(function(result) {
  console.log(result);
});
```

#### Получение активных свидетелей

```javascript
steem.api.getActiveWitnessesAsync().then(function(result) {
  console.log(result);
});
```

#### Получение расписания свидетелей

Получает общие сведения о свидетелях.

```javascript
steem.api.getWitnessScheduleAsync().then(function(data) {
  console.log(data);
});
```

**Пример результата:**

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

## API входа

## API входа

### Вход

⚠️ Использовать этот метод с вашим именем пользователя и паролем **небезопасно**. Метод всегда возвращает `true` и используется только внутри с пустыми значениями, чтобы включить широковещание.

```javascript
steem.api.loginAsync('', '').then(function(result) {
  console.log(result);
});
```

### Получение API по имени

```javascript
steem.api.getApiByNameAsync(apiName).then(function(result) {
  console.log(result);
});
```

---

## API подписок

API подписок (follower API) запрашивает сведения об отношениях подписки между аккаунтами. API только для чтения и не создаёт изменений в блокчейне.

### Получение подписчиков

Возвращает упорядоченный по алфавиту массив аккаунтов, подписанных на данный аккаунт.

```javascript
steem.api.getFollowersAsync(following, startFollower, followType, limit).then(function(result) {
  console.log(result);
});
```

**Описание параметров:**

| Параметр | Описание | Тип данных | Примечания |
|---|---|---|---|
| following | Подписчики какого аккаунта | String | Без начального символа @ |
| startFollower | С какого подписчика начать список? | String | Без начального символа @. Используйте пустую строку `''`, чтобы начать список. В последующих вызовах можно указать имя последнего подписчика |
| followType | ?? | ?? | Установите 0 или 'blog' — работает и так, и так |
| limit | Максимальное количество возвращаемых подписчиков | Integer | |

**Пример вызова:**

```javascript
steem.api.getFollowersAsync('ned', '', 'blog', 2).then(function(result) {
  console.log(result);
});
```

**Пример результата:**

```javascript
[
  { follower: 'a-0-0', following: 'ned', what: ['blog'] },
  { follower: 'a-0-0-0-1abokina', following: 'ned', what: ['blog'] }
]
```

### Получение подписок

Возвращает упорядоченный по алфавиту массив аккаунтов, на которые подписан данный аккаунт.

```javascript
steem.api.getFollowingAsync(follower, startFollowing, followType, limit).then(function(result) {
  console.log(result);
});
```

**Пример результата:**

```javascript
[
  { follower: 'dan', following: 'dantheman', what: ['blog'] },
  { follower: 'dan', following: 'krnel', what: ['blog'] }
]
```

### Получение количества подписок

```javascript
steem.api.getFollowCountAsync(account).then(function(result) {
  console.log(result);
});
```

**Пример результата:**

```javascript
{ account: 'ned', follower_count: 16790, following_count: 913 }
```

## Аутентификация

## Аутентификация

### Проверка

```javascript
steem.auth.verify(name, password, auths);
```

### Генерация ключей

```javascript
steem.auth.generateKeys(name, password, roles);
```

### Получение приватных ключей

```javascript
steem.auth.getPrivateKeys(name, password, roles);
```

### Проверка WIF

```javascript
steem.auth.isWif(privWif);
```

### Преобразование в WIF

```javascript
steem.auth.toWif(name, password, role);
```

### Валидность WIF

```javascript
steem.auth.wifIsValid(privWif, pubWif);
```

### WIF в публичный ключ

```javascript
steem.auth.wifToPublic(privWif);
```

### Подписание транзакции

Подписывает транзакцию предоставленными приватными ключами. Подпись вычисляется по дайджесту `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`, где `chain_id` берётся из настроенной цепочки (по умолчанию — все нули для mainnet).

- **`trx`** — объект транзакции: `ref_block_num`, `ref_block_prefix`, `expiration`, `operations` (массив пар `[opType, opData]`) и `extensions`.
- **`keys`** — массив WIF-приватных ключей для подписи.
- Возвращает объект транзакции с добавленным массивом `signatures`.

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

> **Примечание:** поле `signatures` **не** входит в подписываемый дайджест. При подписании транзакция сериализуется *до* добавления подписей, поэтому дайджест покрывает только тело неподписанной транзакции.

### Проверка транзакции

Проверяет, что подписи подписанной транзакции созданы данным публичным ключом. Дайджест восстанавливается точно так же, как его вычисляет `signTransaction`: `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`. Возвращает `true`, если хотя бы одна подпись действительна для `publicKey`, иначе `false`.

- **`transaction`** — объект подписанной транзакции (должен содержать массив `signatures`). Перед вычислением дайджеста поле `signatures` удаляется, поэтому количество подписей не имеет значения.
- **`publicKey`** — публичный ключ вида `STM…` для проверки.
- Возвращает `boolean`.

```javascript
const publicKey = steem.auth.wifToPublic(wif);

// Round-trip: a correctly-signed tx verifies against its signing key
const isValid = steem.auth.verifyTransaction(signedTx, publicKey);
console.log(isValid); // true

// A different public key is rejected
const wrongPub = steem.auth.wifToPublic('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');
console.log(steem.auth.verifyTransaction(signedTx, wrongPub)); // false
```

> **Сценарий безопасности:** сервер-ретранслятор или кошелёк может вызвать `verifyTransaction` для транзакции, присланной клиентом, чтобы — *до* пересылки в цепочку — доказать, что она подписана ключом, принадлежащим указанному аккаунту. Это закрывает пробел эшелонированной защиты: раньше сервер мог проверить только форму транзакции, но не её криптографическую подлинность.

### Сериализация транзакции

Сериализует транзакцию в **двоичную** форму (в стиле FC) и возвращает `Buffer`. Это тот же сериализатор, что используется внутри `signTransaction`, поэтому результат побайтово совпадает с сетевым форматом транзакций узла Steem. Приложения могут использовать его, чтобы самостоятельно восстановить подписываемый дайджест.

- **`trx`** — объект транзакции (та же форма, что у `trx` в `signTransaction`).
- Возвращает `Buffer`.

```javascript
import { sha256 } from '@noble/hashes/sha2';

// Build the exact digest signTransaction signs over:
const buf = steem.auth.serializeTransaction(tx); // Buffer
const chainId = Buffer.alloc(32, 0); // mainnet chain_id (all-zero)
const digest = Buffer.from(sha256(Buffer.concat([chainId, buf])));
console.log(digest.toString('hex')); // 32-byte digest
```

## Форматтер

## Форматтер

### Сумма

Форматирует число и валюту к корректному для отправки виду (например — обрезает дробный остаток числа до 3 знаков).

```javascript
steem.formatter.amount(_amount, asset);
```

**Описание параметров:**

| Параметр | Тип данных | Описание |
|---------|--------|-----------|
| _amount | number | Положительное число |
| asset | string | Имя актива Steem (steem, sbd) |

**Пример вызова:**

```javascript
steem.formatter.amount(53.442346, "STEEM"); // "53.442 STEEM"
```

### Vesting STEEM

Преобразует вестинги (VESTS) аккаунта `account` в эквивалентное количество Steem.

```javascript
steem.formatter.vestingSteem(account, gprops);
```

**Пример вызова:**

```javascript
steem.api.getAccountsAsync(["username"]).then(function(accounts) {
  steem.api.getStateAsync("/@username").then(function(state) {        
    const vestingSteem = steem.formatter.vestingSteem(accounts[0], state.props);
    console.log(vestingSteem); // 7.42431235
  });
});
```

### Число с разделителями

Форматирует большое число, добавляя запятую каждые 3 цифры. Внимание — работает только со строками; числа напрямую передавать нельзя.

```javascript
steem.formatter.numberWithCommas(x);
```

**Пример вызова:**

```javascript
steem.formatter.numberWithCommas("53304432342.432"); // "53,304,432,342.432"
```

### Оценка стоимости аккаунта

Получает оценочную стоимость активов аккаунта `account` в долларах.

```javascript
steem.formatter.estimateAccountValue(account).then(function(data) {
  console.log(data); // 32.25
});
```

### Создание предложенного пароля

```javascript
const password = steem.formatter.createSuggestedPassword();
console.log(password); // 'GAz3GYFvvQvgm7t2fQmwMDuXEzDqTzn9'
```

### Пермалинк комментария

```javascript
const parentAuthor = 'ned';
const parentPermlink = 'a-selfie';
const commentPermlink = steem.formatter.commentPermlink(parentAuthor, parentPermlink);
console.log(commentPermlink); // 're-ned-a-selfie-20170621t080403765z'
```

### Репутация

```javascript
const reputation = steem.formatter.reputation(3512485230915);
console.log(reputation); // 56
```

### Вестинг в STEEM

```javascript
const steemPower = steem.formatter.vestToSteem(vestingShares, totalVestingShares, totalVestingFundSteem);
console.log(steemPower);
```


## Утилиты

## Утилиты

### Проверка имени пользователя

```javascript
const isValidUsername = steem.utils.validateAccountName('test1234');
console.log(isValidUsername); // null

const isValidUsername2 = steem.utils.validateAccountName('a1');
console.log(isValidUsername2); // 'Account name should be longer.'
```

### Верблюжий регистр

Форматирует строку с символами '_' в нотацию CamelCase.

```javascript
steem.utils.camelCase(str);
```

**Пример вызова:**

```javascript
steem.utils.camelCase("example_string"); // "exampleString"
```

## Что дальше

- Чтобы изменять состояние цепочки, см. [Широковещательные операции](/ru/tutorials/steem-js/broadcast.html).
- Об авторизованных чтениях и проверке подписи — см. [Подписанные вызовы и проверка подписи](/tutorials/steem-js/signed-calls.html).
- Об установке и настройке — вернитесь к [туториалу по началу работы](/ru/tutorials/steem-js/index.html).
