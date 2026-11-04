---
title: steem-js - Chain-Daten lesen
description: Kompletter Durchgang durch das Lese-API von steem-js — Tags, Blog, Diskussionen, Blöcke, globale Eigenschaften, Konten, Markt, Votes, Inhalte, Witness, Login, Follow, Authentifizierung, Formatter und Utils.
---

# steem-js: Chain-Daten lesen

Diese Seite sammelt die Lese-Beispiele für `steem.api`, übernommen aus der Dokumentation von [steem-js](https://github.com/steemit/steem-js). Einrichtung, Konfiguration und Anwendungsbeispiele finden Sie im [Erste-Schritte-Tutorial](/de/tutorials/steem-js/index.html); Broadcasting in [Broadcast-Operationen senden](/de/tutorials/steem-js/broadcast.html).

> Jeder Helper unten kapselt eine JSON-RPC-Methode, die in der generierten [API-Referenz](/de/api/) dokumentiert ist — `getAccountsAsync` entspricht beispielsweise [condenser_api.get_accounts](/de/api/condenser_api/get_accounts.html) und `getContentAsync` [condenser_api.get_content](/de/api/condenser_api/get_content.html). Die Demos zeigen die clientseitigen Muster von steem-js.

## Lese-API-Methoden

## Lese-API-Methoden

Die folgenden Abschnitte dokumentieren `steem.api`-Helper zum Lesen des Chain-Zustands. Sofern nicht anders angegeben, werden Aufrufe auf dem Knoten an **`condenser_api`** geroutet.

### Tags

#### Trending-Tags abrufen

Gibt die Liste der aktuell angesagten Tags in absteigender Reihenfolge nach Wert zurück.

```javascript
steem.api.getTrendingTagsAsync(afterTag, limit).then(function(result) {
  console.log(result);
});
```

**Parameterbeschreibung:**

| Parameter | Beschreibung | Datentyp | Hinweise |
|---|---|---|---|
| afterTag | Der Name des letzten Tags, ab dem begonnen wird | String | Verwenden Sie den leeren String `''`, um die Liste zu starten. Folgende Aufrufe können den Namen des letzten Tags nutzen |
| limit | Die maximale Anzahl zurückgegebener Tags | Integer | |

**Aufrufbeispiel:**

```javascript
steem.api.getTrendingTagsAsync('', 2).then(function(result) {
  console.log(result);
});
```

**Ausgabebeispiel:**

```javascript
[
  { name: '', total_payouts: '37610793.383 SBD', net_votes: 4211122, top_posts: 411832, comments: 1344461, trending: '5549490701' },
  { name: 'life', total_payouts: '8722947.658 SBD', net_votes: 1498401, top_posts: 127103, comments: 54049, trending: '570954588' }
]
```

**Mit dem Ergebnis arbeiten:**

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

#### Blog abrufen

Holt die letzten `limit` Beiträge von `account` vor dem Beitrag mit dem Index `entryId`.

```javascript
steem.api.getBlogAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Parameterbeschreibung:**

| Parameter | Datentyp | Beschreibung |
|---------|--------|-----------|
| account | string | Ein Steem-Benutzername |
| entryId | number | Eine positive Zahl — der Index, ab dem gezählt wird (nullbasiert) |
| limit | number | Eine positive Zahl — die maximale Anzahl zurückgegebener Beiträge |

**Aufrufbeispiel:**

```javascript
steem.api.getBlogAsync("username", 10, 3).then(function(data) {
  console.log(data);
});

// In this case we get [3] posts, the newest of which is the one with index [10]
// (that's the 11th post, because post indexes are zero-based)
// This means the results will be posts [10, 9 and 8]
```

#### Blog-Autoren abrufen

Holt die Liste aller Personen, die im Blog einer anderen Person geschrieben haben, samt der Häufigkeit ihrer Beiträge in diesem Blog.

```javascript
steem.api.getBlogAuthorsAsync(blogAccount).then(function(data) {
  console.log(data);
});
```

**Ausgabebeispiel:**

```javascript
[
  ['username1', 1],
  ['username2', 1],
  ['username3', 3],
  ['username4', 2],
  ['username5', 1]
]
```

#### Blog-Einträge abrufen

Holt die letzten `limit` Beiträge von `account` vor dem Beitrag mit dem Index `entryId`. Sehr ähnlich zu getBlog, aber mit deutlich einfacheren Ergebnisobjekten.

```javascript
steem.api.getBlogEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Ausgabebeispiel:**

```javascript
[
  { author: 'username', permlink: 'post-permlink-10', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 10 },
  { author: 'username', permlink: 'post-permlink-9', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 9 },
  { author: 'username', permlink: 'post-permlink-8', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 8 }
]
```

#### Diskussionen nach Trends abrufen

Holt die Steem-Beiträge so, wie sie im Trending-Tab von steemit.com angezeigt würden.

```javascript
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});
```

**Aufrufbeispiel:**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});

// NOTE! The default limit is 0. Not setting a limit will get you an empty result.
```

#### Weitere Diskussionsabfragemethoden

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

#### Diskussionen nach Promotion abrufen

Holt die neuesten Beiträge, sortiert nach der Summe, die für ihre Bewerbung ausgegeben wurde.

```javascript
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

**Aufrufbeispiel:**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

### Blöcke und Transaktionen

#### Block-Header abrufen

```javascript
steem.api.getBlockHeaderAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### Block abrufen

```javascript
steem.api.getBlockAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### Operationen im Block abrufen

Holt alle Operationen eines bestimmten Blocks.

```javascript
steem.api.getOpsInBlockAsync(blockNum, onlyVirtual).then(function(data) {
  console.log(data);
});
```

**Parameterbeschreibung:**

| Parameter | Datentyp | Beschreibung |
|---------|--------|-----------|
| blockNum | number | Eine positive Zahl |
| onlyVirtual | boolean | 'false' für alle Operationen; 'true' für nur virtuelle Operationen |

**Aufrufbeispiel:**

```javascript
steem.api.getOpsInBlockAsync(10000001, false).then(function(data) {
  console.log(data);
});
```

#### Zustand abrufen

Holt viele Informationen zum Zustand von `path`.

```javascript
steem.api.getStateAsync(path).then(function(data) {
  console.log(data);
});
```

**Aufrufbeispiel:**

```javascript
// Valid call examples:
steem.api.getStateAsync("/@username");
steem.api.getStateAsync("/@username/permlink-of-post");
steem.api.getStateAsync("/@username/comments");
steem.api.getStateAsync("/@username/recent-replies");
steem.api.getStateAsync("/trending");
steem.api.getStateAsync("/trending/collorchallenge");
```

### Globale Eigenschaften

`getConfig`, `getDynamicGlobalProperties`, `getFeedHistory` und `getWitnessSchedule` verwenden auf dem Knoten **`database_api`**; `getChainProperties`, `getHardforkVersion` und `getNextScheduledHardfork` verwenden **`condenser_api`**.

#### Konfiguration abrufen

```javascript
steem.api.getConfigAsync().then(function(result) {
  console.log(result);
});
```

#### Dynamische globale Eigenschaften abrufen

```javascript
steem.api.getDynamicGlobalPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### Chain-Eigenschaften abrufen

```javascript
steem.api.getChainPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### Feed-Einträge abrufen

Holt die Beiträge im Feed eines Benutzers. Der Feed zeigt Beiträge gefolgter Benutzer sowie deren Resteems.

```javascript
steem.api.getFeedEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Parameterbeschreibung:**

| Parameter | Datentyp | Beschreibung |
|---------|--------|-----------|
| account | string | Ein Steem-Benutzername |
| entryId | number | Die Beitrags-ID, ab der gezählt wird. Geben Sie '0' an, um beim neuesten Beitrag zu beginnen |
| limit | number | Eine positive Zahl |

**Ausgabebeispiel:**

```javascript
[
  { author: 'otherusername', permlink: 'permlink', reblog_by: ['resteembot'], reblog_on: '2018-02-11T18:42:54', entry_id: 10260 },
  { author: 'otherusername', permlink: 'permlink', reblog_by: [], reblog_on: '2018-02-11T18:39:24', entry_id: 10259 }
]
```

#### Feed-Historie abrufen

```javascript
steem.api.getFeedHistoryAsync().then(function(result) {
  console.log(result);
});
```

#### Aktuellen medianen historischen Preis abrufen

```javascript
steem.api.getCurrentMedianHistoryPriceAsync().then(function(result) {
  console.log(result);
});
```

#### Ticker abrufen

Holt die neuesten zusammengefassten Daten vom Steem-Markt.

```javascript
steem.api.getTickerAsync().then(function(data) {
  console.log(data);
});
```

**Ausgabebeispiel:**

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

#### Handelshistorie abrufen

Holt die Handelshistorie für einen Zeitraum zwischen einem `start`- und einem `end`-Datum.

```javascript
steem.api.getTradeHistoryAsync(start, end, limit).then(function(data) {
  console.log(data);
});
```

**Parameterbeschreibung:**

| Parameter | Datentyp | Beschreibung |
|---------|--------|-----------|
| start | string | Datums-/Zeitzeichenfolge im Format "2018-01-01T00:00:00" |
| end | string | Datums-/Zeitzeichenfolge im Format "2018-01-01T00:00:00" |
| limit | number | Eine positive Zahl |

**Aufrufbeispiel:**

```javascript
const start = "2018-01-01T00:00:00";
const end = "2018-01-02T00:00:00";

steem.api.getTradeHistoryAsync(start, end, 5).then(function(data) {
  console.log(data);
});
```

#### Version abrufen

Holt die Version der Steem-Blockchain, mit der Sie verbunden sind.

```javascript
steem.api.getVersionAsync().then(function(data) {
  console.log(data);
});
```

**Ausgabebeispiel:**

```javascript
{
  blockchain_version: '0.19.2',
  steem_revision: '07be64314ce9d277eb7da921b459c993c2e2412c',
  fc_revision: '8dd1fd1ec0906509eb722fa7c8d280d59bcca23d'
}
```

#### Volumen abrufen

Holt die Handelsvolumina von STEEM und STEEM-Dollar (SBD).

```javascript
steem.api.getVolumeAsync().then(function(data) {
  console.log(data);
});
```

**Ausgabebeispiel:**

```javascript
{
  steem_volume: '8101.888 STEEM',
  sbd_volume: '7287.268 SBD'
}
```

#### Hardfork-Version abrufen

Holt die aktuelle Hardfork-Version der STEEM-Blockchain.

```javascript
steem.api.getHardforkVersionAsync().then(function(result) {
  console.log(result); // '0.19.0'
});
```

#### Nächsten geplanten Hardfork abrufen

```javascript
steem.api.getNextScheduledHardforkAsync().then(function(result) {
  console.log(result);
});
```

#### Reward-Fund abrufen

```javascript
steem.api.getRewardFundAsync(name).then(function(result) {
  console.log(result);
});
```

#### Vesting-Delegierungen abrufen

Gibt die von einem `account` vorgenommenen Delegierungen zurück. Angegeben in Vesting-Anteilen (VESTS).

```javascript
steem.api.getVestingDelegationsAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**Parameterbeschreibung:**

| Parameter | Beschreibung | Datentyp | Hinweise |
|---|---|---|---|
| account | Das Konto, das die Delegierungen vornimmt | String | |
| from | Der Name des letzten Kontos, ab dem begonnen wird | String | Verwenden Sie den leeren String `''`, um die Liste zu starten. Folgende Aufrufe können den Kontonamen des letzten Delegierungsempfängers nutzen |
| limit | Die maximale Anzahl zurückgegebener Delegierungseinträge | Integer | |

**Aufrufbeispiel:**

```javascript
steem.api.getVestingDelegationsAsync('ned', '', 2).then(function(result) {
  console.log(result);
});
```

**Ausgabebeispiel:**

```javascript
[
  { id: 498422, delegator: 'ned', delegatee: 'spaminator', vesting_shares: '409517519.233783 VESTS', min_delegation_time: '2018-01-16T19:30:36' },
  { id: 181809, delegator: 'ned', delegatee: 'surpassinggoogle', vesting_shares: '1029059275.000000 VESTS', min_delegation_time: '2017-08-08T15:25:15' }
]
```

### Schlüssel

#### Schlüsselreferenzen abrufen

```javascript
steem.api.getKeyReferencesAsync(key).then(function(result) {
  console.log(result);
});
```

### Konten

#### Konten abrufen

Holt mehrere Konten anhand ihrer Namen.

```javascript
steem.api.getAccountsAsync(names).then(function(result) {
  console.log(result);
});
```

**Parameterbeschreibung:**

| Parameter | Datentyp | Beschreibung |
|---------|--------|-----------|
| names | array | Array von Kontonamen (Strings) |

**Aufrufbeispiel:**

```javascript
steem.api.getAccountsAsync(['ned', 'dan']).then(function(accounts) {
  console.log(accounts);
});
```

**Hinweis:** Um ein einzelnes Konto zu holen, übergeben Sie ein Array mit einem Namen: `getAccountsAsync(['username'])`, und greifen Sie auf das erste Element des Ergebnisses zu.

#### Kontoreferenzen abrufen

```javascript
steem.api.getAccountReferencesAsync(accountId).then(function(result) {
  console.log(result);
});
```

#### Kontonamen nachschlagen

```javascript
steem.api.lookupAccountNamesAsync(accountNames).then(function(result) {
  console.log(result);
});
```

#### Konten nachschlagen

```javascript
steem.api.lookupAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### Kontoanzahl abrufen

```javascript
steem.api.getAccountCountAsync().then(function(result) {
  console.log(result);
});
```

#### Konvertierungsanfragen abrufen

```javascript
steem.api.getConversionRequestsAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### Kontoverlauf abrufen

```javascript
steem.api.getAccountHistoryAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**Signierte Version (für private Kontodaten):**

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

#### Owner-Historie abrufen

```javascript
steem.api.getOwnerHistoryAsync(account).then(function(result) {
  console.log(result);
});
```

#### Wiederherstellungsanfrage abrufen

```javascript
steem.api.getRecoveryRequestAsync(account).then(function(result) {
  console.log(result);
});
```

#### Kontoreputationen abrufen

Holt die Reputationspunkte der `limit` Konten, deren Namen `lowerBoundName` am ähnlichsten sind.

```javascript
steem.api.getAccountReputationsAsync(lowerBoundName, limit).then(function(data) {
  console.log(data);
});
```

**Ausgabebeispiel:**

```javascript
[
  { account: 'username', reputation: '26727073581' },
  { account: 'username-taken', reputation: 0 }
]
```

### Markt

#### Orderbuch abrufen

```javascript
steem.api.getOrderBookAsync(limit).then(function(result) {
  console.log(result);
});
```

#### Markt-Orderbuch abrufen

Nimmt die obersten `limit` Einträge des Marktdruck-Orderbuchs — für Kauf- wie für Verkaufsaufträge.

```javascript
steem.api.getMarketOrderBookAsync(limit).then(function(data) {
  console.log(data);
});
```

**Ausgabebeispiel:**

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

#### Offene Orders abrufen

```javascript
steem.api.getOpenOrdersAsync(owner).then(function(result) {
  console.log(result);
});
```

`getOrderBook` verwendet auf dem Knoten **`database_api`**; `getMarketOrderBook` verwendet **`market_history_api`**.

#### Markthistorien-Buckets abrufen

```javascript
steem.api.getMarketHistoryBucketsAsync().then(function(data) {
  console.log(data); // [15, 60, 300, 3600, 86400]
});
```

### Berechtigung / Validierung

#### Transaktions-HEX abrufen

```javascript
steem.api.getTransactionHexAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Transaktion abrufen

```javascript
steem.api.getTransactionAsync(trxId).then(function(result) {
  console.log(result);
});
```

#### Erforderliche Signaturen abrufen

```javascript
steem.api.getRequiredSignaturesAsync(trx, availableKeys).then(function(result) {
  console.log(result);
});
```

#### Potenzielle Signaturen abrufen

```javascript
steem.api.getPotentialSignaturesAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Berechtigung prüfen

Verwendet auf dem Knoten **`database_api`**.

```javascript
steem.api.verifyAuthorityAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Konto-Berechtigung prüfen

Verwendet auf dem Knoten **`database_api`**.

```javascript
steem.api.verifyAccountAuthorityAsync(nameOrId, signers).then(function(result) {
  console.log(result);
});
```

#### Vom Autor verwendete Tags abrufen

Holt die Tags, die ein Steem-Benutzer verwendet. Die meisten Benutzer haben noch keine Tags, aber manche doch.

```javascript
steem.api.getTagsUsedByAuthorAsync(author).then(function(data) {
  console.log(data);
});
```

**Aufrufbeispiel:**

```javascript
steem.api.getTagsUsedByAuthorAsync("good-karma").then(function(data) {
  console.log(data); // [['challenge', 0]]
});
```

### Votes

#### Aktive Votes abrufen

```javascript
steem.api.getActiveVotesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Konto-Votes abrufen

```javascript
steem.api.getAccountVotesAsync(voter).then(function(result) {
  console.log(result);
});
```

### Inhalt

#### Inhalt abrufen

```javascript
steem.api.getContentAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Inhaltsantworten abrufen

```javascript
steem.api.getContentRepliesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Diskussionen des Autors vor Datum abrufen

```javascript
steem.api.getDiscussionsByAuthorBeforeDateAsync(author, startPermlink, beforeDate, limit).then(function(result) {
  console.log(result);
});
```

#### Reblogs abrufen

Liefert die Liste der Benutzer, die einen bestimmten Beitrag gerebloggt (resteemed) haben.

```javascript
steem.api.getRebloggedByAsync(author, permlink).then(function(data) {
  console.log(data);
});
```

**Ausgabebeispiel:**

```javascript
['author', 'user1', 'user2', 'user3', 'user4']
```

#### Antworten nach letzter Aktualisierung abrufen

```javascript
steem.api.getRepliesByLastUpdateAsync(startAuthor, startPermlink, limit).then(function(result) {
  console.log(result);
});
```

### Witness

#### Witness abrufen

```javascript
steem.api.getWitnessesAsync(witnessIds).then(function(result) {
  console.log(result);
});
```

#### Witness nach Konto abrufen

Gibt Informationen zum Witness mit dem angegebenen `accountName` zurück.

```javascript
steem.api.getWitnessByAccountAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### Witness nach Votes abrufen

```javascript
steem.api.getWitnessesByVoteAsync(from, limit).then(function(result) {
  console.log(result);
});
```

#### Witness-Konten nachschlagen

```javascript
steem.api.lookupWitnessAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### Witness-Anzahl abrufen

```javascript
steem.api.getWitnessCountAsync().then(function(result) {
  console.log(result);
});
```

#### Aktive Witness abrufen

```javascript
steem.api.getActiveWitnessesAsync().then(function(result) {
  console.log(result);
});
```

#### Witness-Zeitplan abrufen

Holt einige allgemeine Informationen über die Witness.

```javascript
steem.api.getWitnessScheduleAsync().then(function(data) {
  console.log(data);
});
```

**Ausgabebeispiel:**

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

## Login-API

## Login-API

### Login

⚠️ Es ist **nicht sicher**, diese Methode mit Ihrem Benutzernamen und Passwort zu verwenden. Sie gibt immer `true` zurück und wird intern nur mit leeren Werten genutzt, um Broadcasting zu ermöglichen.

```javascript
steem.api.loginAsync('', '').then(function(result) {
  console.log(result);
});
```

### API nach Namen abrufen

```javascript
steem.api.getApiByNameAsync(apiName).then(function(result) {
  console.log(result);
});
```

---

## Follow-API

Die Follower-API fragt Informationen über Follow-Beziehungen zwischen Konten ab. Sie ist nur lesend und erzeugt keine Änderungen an der Blockchain.

### Follower abrufen

Gibt ein alphabetisch sortiertes Array der Konten zurück, die einem bestimmten Konto folgen.

```javascript
steem.api.getFollowersAsync(following, startFollower, followType, limit).then(function(result) {
  console.log(result);
});
```

**Parameterbeschreibung:**

| Parameter | Beschreibung | Datentyp | Hinweise |
|---|---|---|---|
| following | Follower welchen Kontos | String | Ohne führendes @-Zeichen |
| startFollower | Ab welchem Follower die Liste beginnen? | String | Ohne führendes @-Zeichen. Verwenden Sie den leeren String `''`, um die Liste zu starten. Folgende Aufrufe können den Namen des letzten Followers nutzen |
| followType | ?? | ?? | Auf 0 oder 'blog' setzen — beides funktioniert |
| limit | Die maximale Anzahl zurückgegebener Follower | Integer | |

**Aufrufbeispiel:**

```javascript
steem.api.getFollowersAsync('ned', '', 'blog', 2).then(function(result) {
  console.log(result);
});
```

**Ausgabebeispiel:**

```javascript
[
  { follower: 'a-0-0', following: 'ned', what: ['blog'] },
  { follower: 'a-0-0-0-1abokina', following: 'ned', what: ['blog'] }
]
```

### Following abrufen

Gibt ein alphabetisch sortiertes Array der Konten zurück, denen ein bestimmtes Konto folgt.

```javascript
steem.api.getFollowingAsync(follower, startFollowing, followType, limit).then(function(result) {
  console.log(result);
});
```

**Ausgabebeispiel:**

```javascript
[
  { follower: 'dan', following: 'dantheman', what: ['blog'] },
  { follower: 'dan', following: 'krnel', what: ['blog'] }
]
```

### Follow-Anzahl abrufen

```javascript
steem.api.getFollowCountAsync(account).then(function(result) {
  console.log(result);
});
```

**Ausgabebeispiel:**

```javascript
{ account: 'ned', follower_count: 16790, following_count: 913 }
```

## Authentifizierung

## Authentifizierung

### Verifizieren

```javascript
steem.auth.verify(name, password, auths);
```

### Schlüssel generieren

```javascript
steem.auth.generateKeys(name, password, roles);
```

### Private Schlüssel abrufen

```javascript
steem.auth.getPrivateKeys(name, password, roles);
```

### Ist es ein WIF

```javascript
steem.auth.isWif(privWif);
```

### In WIF umwandeln

```javascript
steem.auth.toWif(name, password, role);
```

### WIF ist gültig

```javascript
steem.auth.wifIsValid(privWif, pubWif);
```

### WIF in Public-Key umwandeln

```javascript
steem.auth.wifToPublic(privWif);
```

### Transaktion signieren

Signiert eine Transaktion mit den angegebenen privaten Schlüsseln. Die Signatur wird über den Digest `sha256(chain_id ‖ serializeTransaction(normalizedTrx))` berechnet, wobei `chain_id` aus der konfigurierten Chain stammt (Standard: nur Nullen für das Mainnet).

- **`trx`** — Transaktionsobjekt: `ref_block_num`, `ref_block_prefix`, `expiration`, `operations` (Array von `[opType, opData]`) und `extensions`.
- **`keys`** — Array privater WIF-Schlüssel zum Signieren.
- Gibt ein Transaktionsobjekt mit angehängtem `signatures`-Array zurück.

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

> **Hinweis:** Das Feld `signatures` ist **nicht** Teil des signierten Digests. Beim Signieren wird die Transaktion *vor* dem Anhängen der Signaturen serialisiert, daher deckt der Digest nur den unsignierten Transaktionskörper ab.

### Transaktion verifizieren

Prüft, ob die Signaturen einer signierten Transaktion vom angegebenen öffentlichen Schlüssel erzeugt wurden. Der Digest wird exakt so rekonstruiert, wie `signTransaction` ihn berechnet: `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`. Gibt `true` zurück, wenn eine beliebige Signatur für `publicKey` gültig ist, sonst `false`.

- **`transaction`** — ein signiertes Transaktionsobjekt (muss ein `signatures`-Array enthalten). Das Feld `signatures` wird vor der Digest-Berechnung entfernt; wie viele Signaturen vorhanden sind, spielt also keine Rolle.
- **`publicKey`** — der zu prüfende öffentliche `STM…`-Schlüssel.
- Gibt `boolean` zurück.

```javascript
const publicKey = steem.auth.wifToPublic(wif);

// Round-trip: a correctly-signed tx verifies against its signing key
const isValid = steem.auth.verifyTransaction(signedTx, publicKey);
console.log(isValid); // true

// A different public key is rejected
const wrongPub = steem.auth.wifToPublic('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');
console.log(steem.auth.verifyTransaction(signedTx, wrongPub)); // false
```

> **Sicherheitsanwendungsfall:** Ein Relay-/Wallet-Server kann `verifyTransaction` für eine vom Client eingereichte Transaktion aufrufen, um — *bevor* er sie an die Chain weiterleitet — nachzuweisen, dass sie mit einem Schlüssel des behaupteten Kontos signiert wurde. Das schließt eine Verteidigungs-lücke in der Tiefe: Bisher konnte der Server nur die Form der Transaktion prüfen, nicht deren kryptographische Echtheit.

### Transaktion serialisieren

Serialisiert eine Transaktion in ihre **binäre** Form (FC-Stil) und gibt einen `Buffer` zurück. Es ist derselbe Serialisierer, den `signTransaction` intern verwendet; die Ausgabe entspricht daher Byte für Byte dem Wire-Format für Transaktionen des Steem-Knotens. Nachgelagerte Anwendungen können damit den Signatur-Digest selbst rekonstruieren.

- **`trx`** — Transaktionsobjekt (gleiche Form wie das `trx` von `signTransaction`).
- Gibt einen `Buffer` zurück.

```javascript
import { sha256 } from '@noble/hashes/sha2';

// Build the exact digest signTransaction signs over:
const buf = steem.auth.serializeTransaction(tx); // Buffer
const chainId = Buffer.alloc(32, 0); // mainnet chain_id (all-zero)
const digest = Buffer.from(sha256(Buffer.concat([chainId, buf])));
console.log(digest.toString('hex')); // 32-byte digest
```

## Formatierer

## Formatierer

### Betrag

Formatiert Zahl und Währung in die gültige Sendeform (z. B. — der Gleitkommarest der Zahl wird auf 3 Stellen gekürzt).

```javascript
steem.formatter.amount(_amount, asset);
```

**Parameterbeschreibung:**

| Parameter | Datentyp | Beschreibung |
|---------|--------|-----------|
| _amount | number | Eine positive Zahl |
| asset | string | Der Name eines Steem-Assets (steem, sbd) |

**Aufrufbeispiel:**

```javascript
steem.formatter.amount(53.442346, "STEEM"); // "53.442 STEEM"
```

### Vesting STEEM

Rechnet die Vesting-Anteile (VESTS) von `account` in die entsprechende Steem-Menge um.

```javascript
steem.formatter.vestingSteem(account, gprops);
```

**Aufrufbeispiel:**

```javascript
steem.api.getAccountsAsync(["username"]).then(function(accounts) {
  steem.api.getStateAsync("/@username").then(function(state) {        
    const vestingSteem = steem.formatter.vestingSteem(accounts[0], state.props);
    console.log(vestingSteem); // 7.42431235
  });
});
```

### Zahl mit Tausendertrennzeichen

Formatiert eine große Zahl, indem alle 3 Ziffern ein Komma eingefügt wird. Achtung — funktioniert nur mit Strings; Zahlen dürfen nicht direkt übergeben werden.

```javascript
steem.formatter.numberWithCommas(x);
```

**Aufrufbeispiel:**

```javascript
steem.formatter.numberWithCommas("53304432342.432"); // "53,304,432,342.432"
```

### Kontowert schätzen

Schätzt den Dollarwert der Assets von `account`.

```javascript
steem.formatter.estimateAccountValue(account).then(function(data) {
  console.log(data); // 32.25
});
```

### Vorgeschlagenes Passwort erstellen

```javascript
const password = steem.formatter.createSuggestedPassword();
console.log(password); // 'GAz3GYFvvQvgm7t2fQmwMDuXEzDqTzn9'
```

### Kommentar-Permlink

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

### Vesting zu STEEM

```javascript
const steemPower = steem.formatter.vestToSteem(vestingShares, totalVestingShares, totalVestingFundSteem);
console.log(steemPower);
```


## Hilfsfunktionen

## Hilfsfunktionen

### Benutzernamen validieren

```javascript
const isValidUsername = steem.utils.validateAccountName('test1234');
console.log(isValidUsername); // null

const isValidUsername2 = steem.utils.validateAccountName('a1');
console.log(isValidUsername2); // 'Account name should be longer.'
```

### CamelCase

Formatiert einen String mit '_'-Zeichen in die CamelCase-Schreibweise um.

```javascript
steem.utils.camelCase(str);
```

**Aufrufbeispiel:**

```javascript
steem.utils.camelCase("example_string"); // "exampleString"
```

## Wie es weitergeht

- Um den Chain-Zustand zu ändern, siehe [Broadcast-Operationen senden](/de/tutorials/steem-js/broadcast.html).
- Zu authentifizierten Lesezugriffen und Signaturprüfung siehe [Signierte Aufrufe und Signaturprüfung](/tutorials/steem-js/signed-calls.html).
- Für Installation und Konfiguration zurück zum [Erste-Schritte-Tutorial](/de/tutorials/steem-js/index.html).
