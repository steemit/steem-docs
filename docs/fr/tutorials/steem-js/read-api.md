---
title: steem-js — lecture des données de la chaîne
description: Tour complet de l'API de lecture steem-js — tags, blog, discussions, blocs, propriétés globales, comptes, marché, votes, contenu, witness, connexion, follows, authentification, formatter et utils.
---

# steem-js: Lecture des données de la chaîne

Cette page regroupe les exemples de lecture de `steem.api`, issus de la documentation [steem-js](https://github.com/steemit/steem-js). Installation, configuration et exemples d'utilisation : le [tutoriel de démarrage](/fr/tutorials/steem-js/index.html) ; la diffusion : [Diffusion des opérations](/fr/tutorials/steem-js/broadcast.html).

> Chaque helper ci-dessous encapsule une méthode JSON-RPC documentée dans la [Référence API](/fr/api/) générée — par exemple `getAccountsAsync` correspond à [condenser_api.get_accounts](/fr/api/condenser_api/get_accounts.html) et `getContentAsync` à [condenser_api.get_content](/fr/api/condenser_api/get_content.html). Les démonstrations montrent les patterns côté client de steem-js.

## Méthodes de lecture de l'API

## Méthodes de lecture de l'API

Les sections ci-dessous documentent les helpers `steem.api` pour lire l'état de la chaîne. Sauf mention contraire, les appels sont routés vers **`condenser_api`** sur le nœud.

### Tags

#### Obtenir les tags tendance

Renvoie la liste des tags actuellement en tendance, par valeur décroissante.

```javascript
steem.api.getTrendingTagsAsync(afterTag, limit).then(function(result) {
  console.log(result);
});
```

**Description des paramètres :**

| Paramètre | Description | Type de données | Remarques |
|---|---|---|---|
| afterTag | Le nom du dernier tag à partir duquel commencer | String | Utilisez la chaîne vide `''` pour commencer la liste. Les appels suivants peuvent utiliser le nom du dernier tag |
| limit | Le nombre maximal de tags à renvoyer | Integer | |

**Exemple d'appel :**

```javascript
steem.api.getTrendingTagsAsync('', 2).then(function(result) {
  console.log(result);
});
```

**Exemple de résultat :**

```javascript
[
  { name: '', total_payouts: '37610793.383 SBD', net_votes: 4211122, top_posts: 411832, comments: 1344461, trending: '5549490701' },
  { name: 'life', total_payouts: '8722947.658 SBD', net_votes: 1498401, top_posts: 127103, comments: 54049, trending: '570954588' }
]
```

**Exploiter le résultat :**

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

#### Obtenir le blog

Récupère les `limit` derniers posts de `account` avant le post d'indice `entryId`.

```javascript
steem.api.getBlogAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Description des paramètres :**

| Paramètre | Type de données | Description |
|---------|--------|-----------|
| account | string | Un nom d'utilisateur Steem |
| entryId | number | Un nombre positif — l'indice à partir duquel commencer le décompte (indice à partir de zéro) |
| limit | number | Un nombre positif — le nombre maximal de posts renvoyés |

**Exemple d'appel :**

```javascript
steem.api.getBlogAsync("username", 10, 3).then(function(data) {
  console.log(data);
});

// In this case we get [3] posts, the newest of which is the one with index [10]
// (that's the 11th post, because post indexes are zero-based)
// This means the results will be posts [10, 9 and 8]
```

#### Obtenir les auteurs du blog

Récupère la liste de tous les auteurs qui ont publié dans le blog de quelqu'un, avec le nombre de publications dans ce blog.

```javascript
steem.api.getBlogAuthorsAsync(blogAccount).then(function(data) {
  console.log(data);
});
```

**Exemple de résultat :**

```javascript
[
  ['username1', 1],
  ['username2', 1],
  ['username3', 3],
  ['username4', 2],
  ['username5', 1]
]
```

#### Obtenir les entrées du blog

Récupère les `limit` derniers posts de `account` avant le post d'indice `entryId`. Très semblable à getBlog, mais avec des objets résultat bien plus simples.

```javascript
steem.api.getBlogEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Exemple de résultat :**

```javascript
[
  { author: 'username', permlink: 'post-permlink-10', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 10 },
  { author: 'username', permlink: 'post-permlink-9', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 9 },
  { author: 'username', permlink: 'post-permlink-8', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 8 }
]
```

#### Obtenir les discussions tendance

Récupère les posts Steem tels qu'ils seraient affichés dans l'onglet trending de steemit.com.

```javascript
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});
```

**Exemple d'appel :**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});

// NOTE! The default limit is 0. Not setting a limit will get you an empty result.
```

#### Autres méthodes de requête de discussions

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

#### Obtenir les discussions par promotion

Récupère les posts récents, classés selon la somme dépensée pour leur promotion.

```javascript
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

**Exemple d'appel :**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

### Blocs et transactions

#### Obtenir l'en-tête d'un bloc

```javascript
steem.api.getBlockHeaderAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### Obtenir un bloc

```javascript
steem.api.getBlockAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### Obtenir les opérations d'un bloc

Récupère toutes les opérations d'un bloc donné.

```javascript
steem.api.getOpsInBlockAsync(blockNum, onlyVirtual).then(function(data) {
  console.log(data);
});
```

**Description des paramètres :**

| Paramètre | Type de données | Description |
|---------|--------|-----------|
| blockNum | number | Un nombre positif |
| onlyVirtual | boolean | 'false' pour obtenir toutes les opérations ; 'true' pour obtenir uniquement les opérations virtuelles |

**Exemple d'appel :**

```javascript
steem.api.getOpsInBlockAsync(10000001, false).then(function(data) {
  console.log(data);
});
```

#### Obtenir l'état

Récupère de nombreuses informations sur l'état de `path`.

```javascript
steem.api.getStateAsync(path).then(function(data) {
  console.log(data);
});
```

**Exemple d'appel :**

```javascript
// Valid call examples:
steem.api.getStateAsync("/@username");
steem.api.getStateAsync("/@username/permlink-of-post");
steem.api.getStateAsync("/@username/comments");
steem.api.getStateAsync("/@username/recent-replies");
steem.api.getStateAsync("/trending");
steem.api.getStateAsync("/trending/collorchallenge");
```

### Propriétés globales

`getConfig`, `getDynamicGlobalProperties`, `getFeedHistory` et `getWitnessSchedule` utilisent **`database_api`** sur le nœud ; `getChainProperties`, `getHardforkVersion` et `getNextScheduledHardfork` utilisent **`condenser_api`**.

#### Obtenir la configuration

```javascript
steem.api.getConfigAsync().then(function(result) {
  console.log(result);
});
```

#### Obtenir les propriétés globales dynamiques

```javascript
steem.api.getDynamicGlobalPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### Obtenir les propriétés de la chaîne

```javascript
steem.api.getChainPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### Obtenir les entrées de flux

Récupère les posts du flux (feed) d'un utilisateur. Le flux affiche les posts des utilisateurs suivis, ainsi que ce qu'ils ont repartagé (resteem).

```javascript
steem.api.getFeedEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Description des paramètres :**

| Paramètre | Type de données | Description |
|---------|--------|-----------|
| account | string | Un nom d'utilisateur Steem |
| entryId | number | L'ID du post à partir duquel commencer le décompte. Écrivez '0' pour partir du post le plus récent |
| limit | number | Un nombre positif |

**Exemple de résultat :**

```javascript
[
  { author: 'otherusername', permlink: 'permlink', reblog_by: ['resteembot'], reblog_on: '2018-02-11T18:42:54', entry_id: 10260 },
  { author: 'otherusername', permlink: 'permlink', reblog_by: [], reblog_on: '2018-02-11T18:39:24', entry_id: 10259 }
]
```

#### Obtenir l'historique du flux

```javascript
steem.api.getFeedHistoryAsync().then(function(result) {
  console.log(result);
});
```

#### Obtenir le prix médian historique actuel

```javascript
steem.api.getCurrentMedianHistoryPriceAsync().then(function(result) {
  console.log(result);
});
```

#### Obtenir le ticker

Récupère les dernières données résumées du marché Steem.

```javascript
steem.api.getTickerAsync().then(function(data) {
  console.log(data);
});
```

**Exemple de résultat :**

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

#### Obtenir l'historique des échanges

Récupère l'historique des échanges sur une période donnée, entre une date `start` et une date `end`.

```javascript
steem.api.getTradeHistoryAsync(start, end, limit).then(function(data) {
  console.log(data);
});
```

**Description des paramètres :**

| Paramètre | Type de données | Description |
|---------|--------|-----------|
| start | string | Chaîne date-heure au format "2018-01-01T00:00:00" |
| end | string | Chaîne date-heure au format "2018-01-01T00:00:00" |
| limit | number | Un nombre positif |

**Exemple d'appel :**

```javascript
const start = "2018-01-01T00:00:00";
const end = "2018-01-02T00:00:00";

steem.api.getTradeHistoryAsync(start, end, 5).then(function(data) {
  console.log(data);
});
```

#### Obtenir la version

Récupère la version de la blockchain Steem à laquelle vous êtes connecté.

```javascript
steem.api.getVersionAsync().then(function(data) {
  console.log(data);
});
```

**Exemple de résultat :**

```javascript
{
  blockchain_version: '0.19.2',
  steem_revision: '07be64314ce9d277eb7da921b459c993c2e2412c',
  fc_revision: '8dd1fd1ec0906509eb722fa7c8d280d59bcca23d'
}
```

#### Obtenir le volume

Récupère les volumes de STEEM et de dollars STEEM (SBD).

```javascript
steem.api.getVolumeAsync().then(function(data) {
  console.log(data);
});
```

**Exemple de résultat :**

```javascript
{
  steem_volume: '8101.888 STEEM',
  sbd_volume: '7287.268 SBD'
}
```

#### Obtenir la version de hard fork

Récupère la version de hard fork actuelle de la blockchain STEEM.

```javascript
steem.api.getHardforkVersionAsync().then(function(result) {
  console.log(result); // '0.19.0'
});
```

#### Obtenir le prochain hard fork planifié

```javascript
steem.api.getNextScheduledHardforkAsync().then(function(result) {
  console.log(result);
});
```

#### Obtenir le fonds de récompenses

```javascript
steem.api.getRewardFundAsync(name).then(function(result) {
  console.log(result);
});
```

#### Obtenir les délégations de vesting

Renvoie la liste des délégations effectuées depuis un `account`. Exprimées en parts de vesting (VESTS).

```javascript
steem.api.getVestingDelegationsAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**Description des paramètres :**

| Paramètre | Description | Type de données | Remarques |
|---|---|---|---|
| account | Le compte qui effectue les délégations | String | |
| from | Le nom du dernier compte à partir duquel commencer | String | Utilisez la chaîne vide `''` pour commencer la liste. Les appels suivants peuvent utiliser le nom de compte du dernier délégataire |
| limit | Le nombre maximal d'enregistrements de délégation à renvoyer | Integer | |

**Exemple d'appel :**

```javascript
steem.api.getVestingDelegationsAsync('ned', '', 2).then(function(result) {
  console.log(result);
});
```

**Exemple de résultat :**

```javascript
[
  { id: 498422, delegator: 'ned', delegatee: 'spaminator', vesting_shares: '409517519.233783 VESTS', min_delegation_time: '2018-01-16T19:30:36' },
  { id: 181809, delegator: 'ned', delegatee: 'surpassinggoogle', vesting_shares: '1029059275.000000 VESTS', min_delegation_time: '2017-08-08T15:25:15' }
]
```

### Clés

#### Obtenir les références de clés

```javascript
steem.api.getKeyReferencesAsync(key).then(function(result) {
  console.log(result);
});
```

### Comptes

#### Obtenir les comptes

Récupère plusieurs comptes à partir de leurs noms.

```javascript
steem.api.getAccountsAsync(names).then(function(result) {
  console.log(result);
});
```

**Description des paramètres :**

| Paramètre | Type de données | Description |
|---------|--------|-----------|
| names | array | Tableau de noms de comptes (chaînes) |

**Exemple d'appel :**

```javascript
steem.api.getAccountsAsync(['ned', 'dan']).then(function(accounts) {
  console.log(accounts);
});
```

**Remarque :** pour obtenir un seul compte, passez un tableau d'un seul nom : `getAccountsAsync(['username'])`, puis accédez au premier élément du résultat.

#### Obtenir les références de compte

```javascript
steem.api.getAccountReferencesAsync(accountId).then(function(result) {
  console.log(result);
});
```

#### Rechercher des noms de comptes

```javascript
steem.api.lookupAccountNamesAsync(accountNames).then(function(result) {
  console.log(result);
});
```

#### Rechercher des comptes

```javascript
steem.api.lookupAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### Obtenir le nombre de comptes

```javascript
steem.api.getAccountCountAsync().then(function(result) {
  console.log(result);
});
```

#### Obtenir les demandes de conversion

```javascript
steem.api.getConversionRequestsAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### Obtenir l'historique de compte

```javascript
steem.api.getAccountHistoryAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**Version signée (pour les données privées du compte) :**

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

#### Obtenir l'historique du propriétaire

```javascript
steem.api.getOwnerHistoryAsync(account).then(function(result) {
  console.log(result);
});
```

#### Obtenir la demande de récupération

```javascript
steem.api.getRecoveryRequestAsync(account).then(function(result) {
  console.log(result);
});
```

#### Obtenir les réputations de comptes

Récupère les points de réputation des `limit` comptes dont les noms ressemblent le plus à `lowerBoundName`.

```javascript
steem.api.getAccountReputationsAsync(lowerBoundName, limit).then(function(data) {
  console.log(data);
});
```

**Exemple de résultat :**

```javascript
[
  { account: 'username', reputation: '26727073581' },
  { account: 'username-taken', reputation: 0 }
]
```

### Marché

#### Obtenir le carnet d'ordres

```javascript
steem.api.getOrderBookAsync(limit).then(function(result) {
  console.log(result);
});
```

#### Obtenir le carnet d'ordres du marché

Prend les `limit` premières entrées du carnet d'ordres du marché, tant côté achats que côté ventes.

```javascript
steem.api.getMarketOrderBookAsync(limit).then(function(data) {
  console.log(data);
});
```

**Exemple de résultat :**

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

#### Obtenir les ordres ouverts

```javascript
steem.api.getOpenOrdersAsync(owner).then(function(result) {
  console.log(result);
});
```

`getOrderBook` utilise **`database_api`** sur le nœud ; `getMarketOrderBook` utilise **`market_history_api`**.

#### Obtenir les buckets d'historique du marché

```javascript
steem.api.getMarketHistoryBucketsAsync().then(function(data) {
  console.log(data); // [15, 60, 300, 3600, 86400]
});
```

### Autorité / Validation

#### Obtenir l'hex de la transaction

```javascript
steem.api.getTransactionHexAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Obtenir la transaction

```javascript
steem.api.getTransactionAsync(trxId).then(function(result) {
  console.log(result);
});
```

#### Obtenir les signatures requises

```javascript
steem.api.getRequiredSignaturesAsync(trx, availableKeys).then(function(result) {
  console.log(result);
});
```

#### Obtenir les signatures potentielles

```javascript
steem.api.getPotentialSignaturesAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Vérifier l'autorité

Utilise **`database_api`** sur le nœud.

```javascript
steem.api.verifyAuthorityAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Vérifier l'autorité du compte

Utilise **`database_api`** sur le nœud.

```javascript
steem.api.verifyAccountAuthorityAsync(nameOrId, signers).then(function(result) {
  console.log(result);
});
```

#### Obtenir les tags utilisés par un auteur

Récupère les tags utilisés par un utilisateur Steem. La plupart des utilisateurs n'ont pas encore de tags, mais certains en ont.

```javascript
steem.api.getTagsUsedByAuthorAsync(author).then(function(data) {
  console.log(data);
});
```

**Exemple d'appel :**

```javascript
steem.api.getTagsUsedByAuthorAsync("good-karma").then(function(data) {
  console.log(data); // [['challenge', 0]]
});
```

### Votes

#### Obtenir les votes actifs

```javascript
steem.api.getActiveVotesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Obtenir les votes du compte

```javascript
steem.api.getAccountVotesAsync(voter).then(function(result) {
  console.log(result);
});
```

### Contenu

#### Obtenir le contenu

```javascript
steem.api.getContentAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Obtenir les réponses au contenu

```javascript
steem.api.getContentRepliesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Obtenir les discussions d'un auteur avant une date

```javascript
steem.api.getDiscussionsByAuthorBeforeDateAsync(author, startPermlink, beforeDate, limit).then(function(result) {
  console.log(result);
});
```

#### Obtenir les reblogs

Donne la liste des utilisateurs qui ont repartagé (resteem) un post donné.

```javascript
steem.api.getRebloggedByAsync(author, permlink).then(function(data) {
  console.log(data);
});
```

**Exemple de résultat :**

```javascript
['author', 'user1', 'user2', 'user3', 'user4']
```

#### Obtenir les réponses par dernière mise à jour

```javascript
steem.api.getRepliesByLastUpdateAsync(startAuthor, startPermlink, limit).then(function(result) {
  console.log(result);
});
```

### Witness

#### Obtenir les witness

```javascript
steem.api.getWitnessesAsync(witnessIds).then(function(result) {
  console.log(result);
});
```

#### Obtenir un witness par compte

Renvoie les informations sur le witness ayant le `accountName` donné.

```javascript
steem.api.getWitnessByAccountAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### Obtenir les witness par votes

```javascript
steem.api.getWitnessesByVoteAsync(from, limit).then(function(result) {
  console.log(result);
});
```

#### Rechercher les comptes witness

```javascript
steem.api.lookupWitnessAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### Obtenir le nombre de witness

```javascript
steem.api.getWitnessCountAsync().then(function(result) {
  console.log(result);
});
```

#### Obtenir les witness actifs

```javascript
steem.api.getActiveWitnessesAsync().then(function(result) {
  console.log(result);
});
```

#### Obtenir le planning des witness

Récupère quelques informations générales sur les witness.

```javascript
steem.api.getWitnessScheduleAsync().then(function(data) {
  console.log(data);
});
```

**Exemple de résultat :**

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

## API de connexion

## API de connexion

### Connexion

⚠️ Il n'est **pas sûr** d'utiliser cette méthode avec votre nom d'utilisateur et votre mot de passe. Cette méthode renvoie toujours `true` et n'est utilisée qu'en interne avec des valeurs vides pour activer la diffusion.

```javascript
steem.api.loginAsync('', '').then(function(result) {
  console.log(result);
});
```

### Obtenir l'API par nom

```javascript
steem.api.getApiByNameAsync(apiName).then(function(result) {
  console.log(result);
});
```

---

## API de suivi

L'API des follows interroge les relations de suivi entre comptes. Cette API est en lecture seule et ne crée aucun changement sur la blockchain.

### Obtenir les abonnés

Renvoie un tableau trié par ordre alphabétique des comptes qui suivent un compte donné.

```javascript
steem.api.getFollowersAsync(following, startFollower, followType, limit).then(function(result) {
  console.log(result);
});
```

**Description des paramètres :**

| Paramètre | Description | Type de données | Remarques |
|---|---|---|---|
| following | Les followers de quel compte | String | Sans symbole @ initial |
| startFollower | À partir de quel follower commencer la liste ? | String | Sans symbole @ initial. Utilisez la chaîne vide `''` pour commencer la liste. Les appels suivants peuvent utiliser le nom du dernier follower |
| followType | ?? | ?? | Définissez 0 ou 'blog' — les deux fonctionnent |
| limit | Le nombre maximal de followers à renvoyer | Integer | |

**Exemple d'appel :**

```javascript
steem.api.getFollowersAsync('ned', '', 'blog', 2).then(function(result) {
  console.log(result);
});
```

**Exemple de résultat :**

```javascript
[
  { follower: 'a-0-0', following: 'ned', what: ['blog'] },
  { follower: 'a-0-0-0-1abokina', following: 'ned', what: ['blog'] }
]
```

### Obtenir les abonnements

Renvoie un tableau trié par ordre alphabétique des comptes suivis par un compte donné.

```javascript
steem.api.getFollowingAsync(follower, startFollowing, followType, limit).then(function(result) {
  console.log(result);
});
```

**Exemple de résultat :**

```javascript
[
  { follower: 'dan', following: 'dantheman', what: ['blog'] },
  { follower: 'dan', following: 'krnel', what: ['blog'] }
]
```

### Obtenir le nombre d'abonnements

```javascript
steem.api.getFollowCountAsync(account).then(function(result) {
  console.log(result);
});
```

**Exemple de résultat :**

```javascript
{ account: 'ned', follower_count: 16790, following_count: 913 }
```

## Authentification

## Authentification

### Vérifier

```javascript
steem.auth.verify(name, password, auths);
```

### Générer des clés

```javascript
steem.auth.generateKeys(name, password, roles);
```

### Obtenir les clés privées

```javascript
steem.auth.getPrivateKeys(name, password, roles);
```

### Est-ce un WIF

```javascript
steem.auth.isWif(privWif);
```

### Conversion en WIF

```javascript
steem.auth.toWif(name, password, role);
```

### Validité du WIF

```javascript
steem.auth.wifIsValid(privWif, pubWif);
```

### WIF vers clé publique

```javascript
steem.auth.wifToPublic(privWif);
```

### Signer une transaction

Signe une transaction avec les clés privées fournies. La signature est calculée sur le condensat `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`, où `chain_id` provient de la chaîne configurée (par défaut, que des zéros pour le réseau principal).

- **`trx`** — objet transaction : `ref_block_num`, `ref_block_prefix`, `expiration`, `operations` (tableau de `[opType, opData]`) et `extensions`.
- **`keys`** — tableau de clés privées WIF utilisées pour signer.
- Renvoie un objet transaction auquel un tableau `signatures` a été ajouté.

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

> **Remarque :** le champ `signatures` ne fait **pas** partie du condensat signé. La signature sérialise la transaction *avant* d'attacher les signatures, si bien que le condensat ne couvre que le corps non signé de la transaction.

### Vérifier une transaction

Vérifie que les signatures d'une transaction signée ont bien été produites par la clé publique donnée. Le condensat est reconstruit exactement comme le calcule `signTransaction` : `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`. Renvoie `true` si au moins une signature est valide pour `publicKey`, sinon `false`.

- **`transaction`** — objet transaction signée (doit contenir un tableau `signatures`). Le champ `signatures` est retiré avant le calcul du condensat : le nombre de signatures présentes n'a donc pas d'importance.
- **`publicKey`** — la clé publique `STM…` à vérifier.
- Renvoie un `boolean`.

```javascript
const publicKey = steem.auth.wifToPublic(wif);

// Round-trip: a correctly-signed tx verifies against its signing key
const isValid = steem.auth.verifyTransaction(signedTx, publicKey);
console.log(isValid); // true

// A different public key is rejected
const wrongPub = steem.auth.wifToPublic('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');
console.log(steem.auth.verifyTransaction(signedTx, wrongPub)); // false
```

> **Cas d'usage sécurité :** un serveur relais/portefeuille peut appeler `verifyTransaction` sur une transaction soumise par un client afin de prouver — *avant* de la transmettre à la chaîne — qu'elle a été signée par une clé appartenant au compte revendiqué. Cela comble une faille de défense en profondeur : auparavant, le serveur ne pouvait vérifier que la forme de la transaction, pas son authenticité cryptographique.

### Sérialiser une transaction

Sérialise une transaction sous sa forme **binaire** (style FC) et renvoie un `Buffer`. C'est le même sérialiseur que celui utilisé en interne par `signTransaction`, si bien que la sortie correspond octet pour octet au format réseau des transactions du nœud Steem. Les applications en aval peuvent l'utiliser pour reconstituer elles-mêmes le condensat de signature.

- **`trx`** — objet transaction (même forme que le `trx` de `signTransaction`).
- Renvoie un `Buffer`.

```javascript
import { sha256 } from '@noble/hashes/sha2';

// Build the exact digest signTransaction signs over:
const buf = steem.auth.serializeTransaction(tx); // Buffer
const chainId = Buffer.alloc(32, 0); // mainnet chain_id (all-zero)
const digest = Buffer.from(sha256(Buffer.concat([chainId, buf])));
console.log(digest.toString('hex')); // 32-byte digest
```

## Formateur

## Formateur

### Montant

Formate un nombre et une devise de façon valide pour l'envoi (par exemple — il rogne la partie décimale du nombre à 3 chiffres seulement).

```javascript
steem.formatter.amount(_amount, asset);
```

**Description des paramètres :**

| Paramètre | Type de données | Description |
|---------|--------|-----------|
| _amount | number | Un nombre positif |
| asset | string | Le nom d'un actif Steem (steem, sbd) |

**Exemple d'appel :**

```javascript
steem.formatter.amount(53.442346, "STEEM"); // "53.442 STEEM"
```

### Vesting STEEM

Convertit les parts de vesting (VESTS) de `account` en quantité de Steem correspondante.

```javascript
steem.formatter.vestingSteem(account, gprops);
```

**Exemple d'appel :**

```javascript
steem.api.getAccountsAsync(["username"]).then(function(accounts) {
  steem.api.getStateAsync("/@username").then(function(state) {        
    const vestingSteem = steem.formatter.vestingSteem(accounts[0], state.props);
    console.log(vestingSteem); // 7.42431235
  });
});
```

### Nombre avec séparateurs de milliers

Formate un grand nombre en ajoutant une virgule tous les 3 chiffres. Attention — ne fonctionne que sur des chaînes ; aucun nombre ne peut être passé directement.

```javascript
steem.formatter.numberWithCommas(x);
```

**Exemple d'appel :**

```javascript
steem.formatter.numberWithCommas("53304432342.432"); // "53,304,432,342.432"
```

### Estimer la valeur d'un compte

Récupère la valeur estimée en dollars des actifs de `account`.

```javascript
steem.formatter.estimateAccountValue(account).then(function(data) {
  console.log(data); // 32.25
});
```

### Créer un mot de passe suggéré

```javascript
const password = steem.formatter.createSuggestedPassword();
console.log(password); // 'GAz3GYFvvQvgm7t2fQmwMDuXEzDqTzn9'
```

### Permlink de commentaire

```javascript
const parentAuthor = 'ned';
const parentPermlink = 'a-selfie';
const commentPermlink = steem.formatter.commentPermlink(parentAuthor, parentPermlink);
console.log(commentPermlink); // 're-ned-a-selfie-20170621t080403765z'
```

### Réputation

```javascript
const reputation = steem.formatter.reputation(3512485230915);
console.log(reputation); // 56
```

### Vesting en STEEM

```javascript
const steemPower = steem.formatter.vestToSteem(vestingShares, totalVestingShares, totalVestingFundSteem);
console.log(steemPower);
```


## Utilitaires

## Utilitaires

### Valider un nom d'utilisateur

```javascript
const isValidUsername = steem.utils.validateAccountName('test1234');
console.log(isValidUsername); // null

const isValidUsername2 = steem.utils.validateAccountName('a1');
console.log(isValidUsername2); // 'Account name should be longer.'
```

### camelCase

Formate une chaîne contenant des '_' pour la mettre en notation CamelCase.

```javascript
steem.utils.camelCase(str);
```

**Exemple d'appel :**

```javascript
steem.utils.camelCase("example_string"); // "exampleString"
```

## Pour aller plus loin

- Pour modifier l'état de la chaîne, voir [Diffusion des opérations](/fr/tutorials/steem-js/broadcast.html).
- Pour les lectures authentifiées et la vérification de signature, voir [Appels signés et vérification de signature](/tutorials/steem-js/signed-calls.html).
- Pour l'installation et la configuration, retournez au [tutoriel de démarrage](/fr/tutorials/steem-js/index.html).
