---
title: steem-js - leggere i dati della catena
description: Percorso completo dell'API di lettura di steem-js — tag, blog, discussioni, blocchi, proprietà globali, account, mercato, voti, contenuti, witness, login, follow, autenticazione, formatter e utils.
---

# steem-js: Leggere i dati della catena

Questa pagina raccoglie gli esempi di lettura di `steem.api`, tratti dalla documentazione di [steem-js](https://github.com/steemit/steem-js). Installazione, configurazione ed esempi d'uso sono nel [tutorial di avvio](/it/tutorials/steem-js/index.html); il broadcast è trattato in [Operazioni di broadcast](/it/tutorials/steem-js/broadcast.html).

> Ogni helper qui sotto incapsula un metodo JSON-RPC documentato nella [Guida di riferimento API](/it/api/) generata — per esempio `getAccountsAsync` corrisponde a [condenser_api.get_accounts](/it/api/condenser_api/get_accounts.html) e `getContentAsync` a [condenser_api.get_content](/it/api/condenser_api/get_content.html). Le dimostrazioni mostrano i pattern lato client di steem-js.

## Metodi di lettura dell'API

## Metodi di lettura dell'API

Le sezioni seguenti documentano gli helper `steem.api` per leggere lo stato della catena. Salvo diversa indicazione, le chiamate sono instradate a **`condenser_api`** sul nodo.

### Tag

#### Ottenere i tag di tendenza

Restituisce l'elenco dei tag attualmente di tendenza, in ordine decrescente per valore.

```javascript
steem.api.getTrendingTagsAsync(afterTag, limit).then(function(result) {
  console.log(result);
});
```

**Descrizione dei parametri:**

| Parametro | Descrizione | Tipo di dato | Note |
|---|---|---|---|
| afterTag | Il nome dell'ultimo tag da cui partire | String | Usa la stringa vuota `''` per iniziare l'elenco. Le chiamate successive possono usare il nome dell'ultimo tag |
| limit | Il numero massimo di tag da restituire | Integer | |

**Esempio di chiamata:**

```javascript
steem.api.getTrendingTagsAsync('', 2).then(function(result) {
  console.log(result);
});
```

**Esempio di risultato:**

```javascript
[
  { name: '', total_payouts: '37610793.383 SBD', net_votes: 4211122, top_posts: 411832, comments: 1344461, trending: '5549490701' },
  { name: 'life', total_payouts: '8722947.658 SBD', net_votes: 1498401, top_posts: 127103, comments: 54049, trending: '570954588' }
]
```

**Usare il risultato:**

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

#### Ottenere il blog

Ottiene gli ultimi `limit` post di `account` precedenti al post con indice `entryId`.

```javascript
steem.api.getBlogAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Descrizione dei parametri:**

| Parametro | Tipo di dato | Descrizione |
|---------|--------|-----------|
| account | string | Un nome utente Steem |
| entryId | number | Un numero positivo — l'indice da cui iniziare il conteggio (indice a base zero) |
| limit | number | Un numero positivo — il numero massimo di post da restituire |

**Esempio di chiamata:**

```javascript
steem.api.getBlogAsync("username", 10, 3).then(function(data) {
  console.log(data);
});

// In this case we get [3] posts, the newest of which is the one with index [10]
// (that's the 11th post, because post indexes are zero-based)
// This means the results will be posts [10, 9 and 8]
```

#### Ottenere gli autori del blog

Ottiene l'elenco di tutti coloro che hanno scritto nel blog di qualcuno, insieme a quante volte vi hanno scritto.

```javascript
steem.api.getBlogAuthorsAsync(blogAccount).then(function(data) {
  console.log(data);
});
```

**Esempio di risultato:**

```javascript
[
  ['username1', 1],
  ['username2', 1],
  ['username3', 3],
  ['username4', 2],
  ['username5', 1]
]
```

#### Ottenere le voci del blog

Ottiene gli ultimi `limit` post di `account` precedenti al post con indice `entryId`. Molto simile a getBlog, ma con oggetti risultato molto più semplici.

```javascript
steem.api.getBlogEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Esempio di risultato:**

```javascript
[
  { author: 'username', permlink: 'post-permlink-10', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 10 },
  { author: 'username', permlink: 'post-permlink-9', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 9 },
  { author: 'username', permlink: 'post-permlink-8', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 8 }
]
```

#### Ottenere le discussioni di tendenza

Ottiene i post Steem così come verrebbero mostrati nella scheda trending di steemit.com.

```javascript
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});
```

**Esempio di chiamata:**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});

// NOTE! The default limit is 0. Not setting a limit will get you an empty result.
```

#### Altri metodi di query delle discussioni

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

#### Ottenere le discussioni in promozione

Ottiene i post recenti ordinati per quanto è stato speso per promuoverli.

```javascript
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

**Esempio di chiamata:**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

### Blocchi e transazioni

#### Ottenere l'intestazione del blocco

```javascript
steem.api.getBlockHeaderAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### Ottenere un blocco

```javascript
steem.api.getBlockAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### Ottenere le operazioni nel blocco

Ottiene tutte le operazioni di un dato blocco.

```javascript
steem.api.getOpsInBlockAsync(blockNum, onlyVirtual).then(function(data) {
  console.log(data);
});
```

**Descrizione dei parametri:**

| Parametro | Tipo di dato | Descrizione |
|---------|--------|-----------|
| blockNum | number | Un numero positivo |
| onlyVirtual | boolean | 'false' per ottenere tutte le operazioni; 'true' per ottenere solo le operazioni virtuali |

**Esempio di chiamata:**

```javascript
steem.api.getOpsInBlockAsync(10000001, false).then(function(data) {
  console.log(data);
});
```

#### Ottenere lo stato

Ottiene molte informazioni sullo stato di `path`.

```javascript
steem.api.getStateAsync(path).then(function(data) {
  console.log(data);
});
```

**Esempio di chiamata:**

```javascript
// Valid call examples:
steem.api.getStateAsync("/@username");
steem.api.getStateAsync("/@username/permlink-of-post");
steem.api.getStateAsync("/@username/comments");
steem.api.getStateAsync("/@username/recent-replies");
steem.api.getStateAsync("/trending");
steem.api.getStateAsync("/trending/collorchallenge");
```

### Proprietà globali

`getConfig`, `getDynamicGlobalProperties`, `getFeedHistory` e `getWitnessSchedule` usano **`database_api`** sul nodo; `getChainProperties`, `getHardforkVersion` e `getNextScheduledHardfork` usano **`condenser_api`**.

#### Ottenere la configurazione

```javascript
steem.api.getConfigAsync().then(function(result) {
  console.log(result);
});
```

#### Ottenere le proprietà globali dinamiche

```javascript
steem.api.getDynamicGlobalPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### Ottenere le proprietà della catena

```javascript
steem.api.getChainPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### Ottenere le voci del feed

Ottiene i post nel feed di un utente. Il feed mostra i post degli utenti seguiti, nonché ciò che hanno ripostato (resteem).

```javascript
steem.api.getFeedEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Descrizione dei parametri:**

| Parametro | Tipo di dato | Descrizione |
|---------|--------|-----------|
| account | string | Un nome utente Steem |
| entryId | number | L'ID del post da cui iniziare il conteggio. Scrivi '0' per partire dal post più recente |
| limit | number | Un numero positivo |

**Esempio di risultato:**

```javascript
[
  { author: 'otherusername', permlink: 'permlink', reblog_by: ['resteembot'], reblog_on: '2018-02-11T18:42:54', entry_id: 10260 },
  { author: 'otherusername', permlink: 'permlink', reblog_by: [], reblog_on: '2018-02-11T18:39:24', entry_id: 10259 }
]
```

#### Ottenere la cronologia del feed

```javascript
steem.api.getFeedHistoryAsync().then(function(result) {
  console.log(result);
});
```

#### Ottenere il prezzo storico mediano attuale

```javascript
steem.api.getCurrentMedianHistoryPriceAsync().then(function(result) {
  console.log(result);
});
```

#### Ottenere il ticker

Ottiene gli ultimi dati riassuntivi del mercato Steem.

```javascript
steem.api.getTickerAsync().then(function(data) {
  console.log(data);
});
```

**Esempio di risultato:**

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

#### Ottenere la cronologia delle negoziazioni

Ottiene lo storico degli scambi per un dato periodo tra una data `start` e una data `end`.

```javascript
steem.api.getTradeHistoryAsync(start, end, limit).then(function(data) {
  console.log(data);
});
```

**Descrizione dei parametri:**

| Parametro | Tipo di dato | Descrizione |
|---------|--------|-----------|
| start | string | Stringa data-ora nel formato "2018-01-01T00:00:00" |
| end | string | Stringa data-ora nel formato "2018-01-01T00:00:00" |
| limit | number | Un numero positivo |

**Esempio di chiamata:**

```javascript
const start = "2018-01-01T00:00:00";
const end = "2018-01-02T00:00:00";

steem.api.getTradeHistoryAsync(start, end, 5).then(function(data) {
  console.log(data);
});
```

#### Ottenere la versione

Ottiene la versione della blockchain Steem a cui sei connesso.

```javascript
steem.api.getVersionAsync().then(function(data) {
  console.log(data);
});
```

**Esempio di risultato:**

```javascript
{
  blockchain_version: '0.19.2',
  steem_revision: '07be64314ce9d277eb7da921b459c993c2e2412c',
  fc_revision: '8dd1fd1ec0906509eb722fa7c8d280d59bcca23d'
}
```

#### Ottenere il volume

Ottiene i volumi di STEEM e di dollari STEEM (SBD).

```javascript
steem.api.getVolumeAsync().then(function(data) {
  console.log(data);
});
```

**Esempio di risultato:**

```javascript
{
  steem_volume: '8101.888 STEEM',
  sbd_volume: '7287.268 SBD'
}
```

#### Ottenere la versione dell'hardfork

Ottiene la versione di hardfork corrente della blockchain STEEM.

```javascript
steem.api.getHardforkVersionAsync().then(function(result) {
  console.log(result); // '0.19.0'
});
```

#### Ottenere il prossimo hardfork pianificato

```javascript
steem.api.getNextScheduledHardforkAsync().then(function(result) {
  console.log(result);
});
```

#### Ottenere il fondo ricompense

```javascript
steem.api.getRewardFundAsync(name).then(function(result) {
  console.log(result);
});
```

#### Ottenere le deleghe di vesting

Restituisce l'elenco delle delegazioni effettuate da un `account`. Espresse in quote di vesting (VESTS).

```javascript
steem.api.getVestingDelegationsAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**Descrizione dei parametri:**

| Parametro | Descrizione | Tipo di dato | Note |
|---|---|---|---|
| account | L'account che effettua le delegazioni | String | |
| from | Il nome dell'ultimo account da cui iniziare | String | Usa la stringa vuota `''` per iniziare l'elenco. Le chiamate successive possono usare il nome dell'account dell'ultimo delegatario |
| limit | Il numero massimo di record di delegazione da restituire | Integer | |

**Esempio di chiamata:**

```javascript
steem.api.getVestingDelegationsAsync('ned', '', 2).then(function(result) {
  console.log(result);
});
```

**Esempio di risultato:**

```javascript
[
  { id: 498422, delegator: 'ned', delegatee: 'spaminator', vesting_shares: '409517519.233783 VESTS', min_delegation_time: '2018-01-16T19:30:36' },
  { id: 181809, delegator: 'ned', delegatee: 'surpassinggoogle', vesting_shares: '1029059275.000000 VESTS', min_delegation_time: '2017-08-08T15:25:15' }
]
```

### Chiavi

#### Ottenere i riferimenti delle chiavi

```javascript
steem.api.getKeyReferencesAsync(key).then(function(result) {
  console.log(result);
});
```

### Account

#### Ottenere gli account

Ottiene più account in base ai loro nomi.

```javascript
steem.api.getAccountsAsync(names).then(function(result) {
  console.log(result);
});
```

**Descrizione dei parametri:**

| Parametro | Tipo di dato | Descrizione |
|---------|--------|-----------|
| names | array | Array di nomi di account (stringhe) |

**Esempio di chiamata:**

```javascript
steem.api.getAccountsAsync(['ned', 'dan']).then(function(accounts) {
  console.log(accounts);
});
```

**Nota:** per ottenere un singolo account, passa un array con un solo nome: `getAccountsAsync(['username'])`, poi accedi al primo elemento del risultato.

#### Ottenere i riferimenti dell'account

```javascript
steem.api.getAccountReferencesAsync(accountId).then(function(result) {
  console.log(result);
});
```

#### Cercare i nomi degli account

```javascript
steem.api.lookupAccountNamesAsync(accountNames).then(function(result) {
  console.log(result);
});
```

#### Cercare gli account

```javascript
steem.api.lookupAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### Ottenere il numero di account

```javascript
steem.api.getAccountCountAsync().then(function(result) {
  console.log(result);
});
```

#### Ottenere le richieste di conversione

```javascript
steem.api.getConversionRequestsAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### Ottenere la cronologia dell'account

```javascript
steem.api.getAccountHistoryAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**Versione firmata (per i dati privati dell'account):**

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

#### Ottenere la cronologia del proprietario

```javascript
steem.api.getOwnerHistoryAsync(account).then(function(result) {
  console.log(result);
});
```

#### Ottenere la richiesta di recupero

```javascript
steem.api.getRecoveryRequestAsync(account).then(function(result) {
  console.log(result);
});
```

#### Ottenere la reputazione degli account

Ottiene i punti di reputazione dei `limit` account con nomi più simili a `lowerBoundName`.

```javascript
steem.api.getAccountReputationsAsync(lowerBoundName, limit).then(function(data) {
  console.log(data);
});
```

**Esempio di risultato:**

```javascript
[
  { account: 'username', reputation: '26727073581' },
  { account: 'username-taken', reputation: 0 }
]
```

### Mercato

#### Ottenere il book degli ordini

```javascript
steem.api.getOrderBookAsync(limit).then(function(result) {
  console.log(result);
});
```

#### Ottenere il book degli ordini di mercato

Prende le prime `limit` voci del book degli ordini di mercato, sia per gli ordini di acquisto sia per quelli di vendita.

```javascript
steem.api.getMarketOrderBookAsync(limit).then(function(data) {
  console.log(data);
});
```

**Esempio di risultato:**

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

#### Ottenere gli ordini aperti

```javascript
steem.api.getOpenOrdersAsync(owner).then(function(result) {
  console.log(result);
});
```

`getOrderBook` usa **`database_api`** sul nodo; `getMarketOrderBook` usa **`market_history_api`**.

#### Ottenere i bucket della cronologia di mercato

```javascript
steem.api.getMarketHistoryBucketsAsync().then(function(data) {
  console.log(data); // [15, 60, 300, 3600, 86400]
});
```

### Autorità / Validazione

#### Ottenere l'hex della transazione

```javascript
steem.api.getTransactionHexAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Ottenere la transazione

```javascript
steem.api.getTransactionAsync(trxId).then(function(result) {
  console.log(result);
});
```

#### Ottenere le firme richieste

```javascript
steem.api.getRequiredSignaturesAsync(trx, availableKeys).then(function(result) {
  console.log(result);
});
```

#### Ottenere le firme potenziali

```javascript
steem.api.getPotentialSignaturesAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Verificare l'autorità

Usa **`database_api`** sul nodo.

```javascript
steem.api.verifyAuthorityAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Verificare l'autorità dell'account

Usa **`database_api`** sul nodo.

```javascript
steem.api.verifyAccountAuthorityAsync(nameOrId, signers).then(function(result) {
  console.log(result);
});
```

#### Ottenere i tag usati dall'autore

Ottiene i tag usati da un utente Steem. La maggior parte degli utenti non ha ancora tag, ma qualcuno sì.

```javascript
steem.api.getTagsUsedByAuthorAsync(author).then(function(data) {
  console.log(data);
});
```

**Esempio di chiamata:**

```javascript
steem.api.getTagsUsedByAuthorAsync("good-karma").then(function(data) {
  console.log(data); // [['challenge', 0]]
});
```

### Voti

#### Ottenere i voti attivi

```javascript
steem.api.getActiveVotesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Ottenere i voti dell'account

```javascript
steem.api.getAccountVotesAsync(voter).then(function(result) {
  console.log(result);
});
```

### Contenuto

#### Ottenere il contenuto

```javascript
steem.api.getContentAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Ottenere le risposte al contenuto

```javascript
steem.api.getContentRepliesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Ottenere le discussioni dell'autore prima di una data

```javascript
steem.api.getDiscussionsByAuthorBeforeDateAsync(author, startPermlink, beforeDate, limit).then(function(result) {
  console.log(result);
});
```

#### Ottenere i reblog

Fornisce l'elenco degli utenti che hanno ripostato (resteem) un dato post.

```javascript
steem.api.getRebloggedByAsync(author, permlink).then(function(data) {
  console.log(data);
});
```

**Esempio di risultato:**

```javascript
['author', 'user1', 'user2', 'user3', 'user4']
```

#### Ottenere le risposte per ultimo aggiornamento

```javascript
steem.api.getRepliesByLastUpdateAsync(startAuthor, startPermlink, limit).then(function(result) {
  console.log(result);
});
```

### Witness

#### Ottenere i witness

```javascript
steem.api.getWitnessesAsync(witnessIds).then(function(result) {
  console.log(result);
});
```

#### Ottenere un witness per account

Restituisce le informazioni sul witness con il dato `accountName`.

```javascript
steem.api.getWitnessByAccountAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### Ottenere i witness per voti

```javascript
steem.api.getWitnessesByVoteAsync(from, limit).then(function(result) {
  console.log(result);
});
```

#### Cercare gli account witness

```javascript
steem.api.lookupWitnessAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### Ottenere il numero di witness

```javascript
steem.api.getWitnessCountAsync().then(function(result) {
  console.log(result);
});
```

#### Ottenere i witness attivi

```javascript
steem.api.getActiveWitnessesAsync().then(function(result) {
  console.log(result);
});
```

#### Ottenere il programma dei witness

Ottiene alcune informazioni generali sui witness.

```javascript
steem.api.getWitnessScheduleAsync().then(function(data) {
  console.log(data);
});
```

**Esempio di risultato:**

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

## API di login

## API di login

### Login

⚠️ **Non è sicuro** usare questo metodo con il tuo nome utente e la tua password. Il metodo restituisce sempre `true` ed è usato solo internamente con valori vuoti per abilitare il broadcast.

```javascript
steem.api.loginAsync('', '').then(function(result) {
  console.log(result);
});
```

### Ottenere l'API per nome

```javascript
steem.api.getApiByNameAsync(apiName).then(function(result) {
  console.log(result);
});
```

---

## API di follow

L'API dei follower interroga le relazioni di follow tra account. È un'API di sola lettura e non crea modifiche sulla blockchain.

### Ottenere i follower

Restituisce un array ordinato alfabeticamente degli account che seguono un dato account.

```javascript
steem.api.getFollowersAsync(following, startFollower, followType, limit).then(function(result) {
  console.log(result);
});
```

**Descrizione dei parametri:**

| Parametro | Descrizione | Tipo di dato | Note |
|---|---|---|---|
| following | I follower di quale account | String | Senza simbolo @ iniziale |
| startFollower | Da quale follower iniziare l'elenco? | String | Senza simbolo @ iniziale. Usa la stringa vuota `''` per iniziare l'elenco. Le chiamate successive possono usare il nome dell'ultimo follower |
| followType | ?? | ?? | Imposta 0 oppure 'blog' — vanno bene entrambi |
| limit | Il numero massimo di follower da restituire | Integer | |

**Esempio di chiamata:**

```javascript
steem.api.getFollowersAsync('ned', '', 'blog', 2).then(function(result) {
  console.log(result);
});
```

**Esempio di risultato:**

```javascript
[
  { follower: 'a-0-0', following: 'ned', what: ['blog'] },
  { follower: 'a-0-0-0-1abokina', following: 'ned', what: ['blog'] }
]
```

### Ottenere i following

Restituisce un array ordinato alfabeticamente degli account seguiti da un dato account.

```javascript
steem.api.getFollowingAsync(follower, startFollowing, followType, limit).then(function(result) {
  console.log(result);
});
```

**Esempio di risultato:**

```javascript
[
  { follower: 'dan', following: 'dantheman', what: ['blog'] },
  { follower: 'dan', following: 'krnel', what: ['blog'] }
]
```

### Ottenere il conteggio dei follow

```javascript
steem.api.getFollowCountAsync(account).then(function(result) {
  console.log(result);
});
```

**Esempio di risultato:**

```javascript
{ account: 'ned', follower_count: 16790, following_count: 913 }
```

## Autenticazione

## Autenticazione

### Verificare

```javascript
steem.auth.verify(name, password, auths);
```

### Generare le chiavi

```javascript
steem.auth.generateKeys(name, password, roles);
```

### Ottenere le chiavi private

```javascript
steem.auth.getPrivateKeys(name, password, roles);
```

### È un WIF

```javascript
steem.auth.isWif(privWif);
```

### Conversione in WIF

```javascript
steem.auth.toWif(name, password, role);
```

### WIF valido

```javascript
steem.auth.wifIsValid(privWif, pubWif);
```

### Da WIF a chiave pubblica

```javascript
steem.auth.wifToPublic(privWif);
```

### Firmare la transazione

Firma una transazione con le chiavi private fornite. La firma è calcolata sul digest `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`, dove `chain_id` proviene dalla catena configurata (per impostazione predefinita tutti zeri per la mainnet).

- **`trx`** — oggetto transazione: `ref_block_num`, `ref_block_prefix`, `expiration`, `operations` (array di `[opType, opData]`) ed `extensions`.
- **`keys`** — array di chiavi private WIF usate per firmare.
- Restituisce un oggetto transazione con un array `signatures` aggiunto.

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

> **Nota:** il campo `signatures` **non** fa parte del digest firmato. La firma serializza la transazione *prima* di allegare le firme, quindi il digest copre solo il corpo della transazione non firmata.

### Verificare la transazione

Verifica che le firme di una transazione firmata siano state prodotte dalla chiave pubblica indicata. Il digest viene ricostruito esattamente come lo calcola `signTransaction`: `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`. Restituisce `true` se almeno una firma è valida per `publicKey`, altrimenti `false`.

- **`transaction`** — un oggetto transazione firmata (deve contenere un array `signatures`). Il campo `signatures` viene rimosso prima del calcolo del digest, quindi non conta quante firme siano presenti.
- **`publicKey`** — la chiave pubblica `STM…` contro cui verificare.
- Restituisce `boolean`.

```javascript
const publicKey = steem.auth.wifToPublic(wif);

// Round-trip: a correctly-signed tx verifies against its signing key
const isValid = steem.auth.verifyTransaction(signedTx, publicKey);
console.log(isValid); // true

// A different public key is rejected
const wrongPub = steem.auth.wifToPublic('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');
console.log(steem.auth.verifyTransaction(signedTx, wrongPub)); // false
```

> **Caso d'uso di sicurezza:** un server relay/wallet può chiamare `verifyTransaction` su una transazione inviata da un client per dimostrare — *prima* di inoltrarla alla catena — che è stata firmata da una chiave appartenente all'account dichiarato. Questo colma una lacuna di difesa in profondità: prima il server poteva controllare solo la forma della transazione, non la sua autenticità crittografica.

### Serializzare la transazione

Serializza una transazione nella sua forma **binaria** (stile FC), restituendo un `Buffer`. È lo stesso serializzatore usato internamente da `signTransaction`, quindi l'output corrisponde byte per byte al formato di rete delle transazioni del nodo Steem. Le applicazioni a valle possono usarlo per ricostruire da sole il digest di firma.

- **`trx`** — oggetto transazione (stessa forma del `trx` di `signTransaction`).
- Restituisce un `Buffer`.

```javascript
import { sha256 } from '@noble/hashes/sha2';

// Build the exact digest signTransaction signs over:
const buf = steem.auth.serializeTransaction(tx); // Buffer
const chainId = Buffer.alloc(32, 0); // mainnet chain_id (all-zero)
const digest = Buffer.from(sha256(Buffer.concat([chainId, buf])));
console.log(digest.toString('hex')); // 32-byte digest
```

## Formattatore

## Formattatore

### Importo

Formatta numero e valuta in modo valido per l'invio (per esempio — tronca la parte decimale del numero a sole 3 cifre).

```javascript
steem.formatter.amount(_amount, asset);
```

**Descrizione dei parametri:**

| Parametro | Tipo di dato | Descrizione |
|---------|--------|-----------|
| _amount | number | Un numero positivo |
| asset | string | Il nome di un asset Steem (steem, sbd) |

**Esempio di chiamata:**

```javascript
steem.formatter.amount(53.442346, "STEEM"); // "53.442 STEEM"
```

### Vesting STEEM

Converte le quote di vesting (VESTS) di `account` nella quantità di Steem che rappresentano.

```javascript
steem.formatter.vestingSteem(account, gprops);
```

**Esempio di chiamata:**

```javascript
steem.api.getAccountsAsync(["username"]).then(function(accounts) {
  steem.api.getStateAsync("/@username").then(function(state) {        
    const vestingSteem = steem.formatter.vestingSteem(accounts[0], state.props);
    console.log(vestingSteem); // 7.42431235
  });
});
```

### Numero con separatori delle migliaia

Formatta un numero grande aggiungendo una virgola ogni 3 cifre. Attenzione — funziona solo sulle stringhe; nessun numero può essere passato direttamente.

```javascript
steem.formatter.numberWithCommas(x);
```

**Esempio di chiamata:**

```javascript
steem.formatter.numberWithCommas("53304432342.432"); // "53,304,432,342.432"
```

### Stimare il valore dell'account

Ottiene il valore stimato in dollari degli asset di `account`.

```javascript
steem.formatter.estimateAccountValue(account).then(function(data) {
  console.log(data); // 32.25
});
```

### Creare la password suggerita

```javascript
const password = steem.formatter.createSuggestedPassword();
console.log(password); // 'GAz3GYFvvQvgm7t2fQmwMDuXEzDqTzn9'
```

### Permlink del commento

```javascript
const parentAuthor = 'ned';
const parentPermlink = 'a-selfie';
const commentPermlink = steem.formatter.commentPermlink(parentAuthor, parentPermlink);
console.log(commentPermlink); // 're-ned-a-selfie-20170621t080403765z'
```

### Reputazione

```javascript
const reputation = steem.formatter.reputation(3512485230915);
console.log(reputation); // 56
```

### Da vesting a STEEM

```javascript
const steemPower = steem.formatter.vestToSteem(vestingShares, totalVestingShares, totalVestingFundSteem);
console.log(steemPower);
```


## Utility

## Utility

### Validare il nome utente

```javascript
const isValidUsername = steem.utils.validateAccountName('test1234');
console.log(isValidUsername); // null

const isValidUsername2 = steem.utils.validateAccountName('a1');
console.log(isValidUsername2); // 'Account name should be longer.'
```

### camelCase

Formatta una stringa con caratteri '_' per portarla alla notazione CamelCase.

```javascript
steem.utils.camelCase(str);
```

**Esempio di chiamata:**

```javascript
steem.utils.camelCase("example_string"); // "exampleString"
```

## Prossimi passi

- Per modificare lo stato della catena, vedere [Operazioni di broadcast](/it/tutorials/steem-js/broadcast.html).
- Per le letture autenticate e la verifica delle firme, vedere [Chiamate firmate e verifica delle firme](/tutorials/steem-js/signed-calls.html).
- Per installazione e configurazione, tornare al [tutorial di avvio](/it/tutorials/steem-js/index.html).
