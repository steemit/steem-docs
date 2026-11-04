---
title: steem-js - lectura de datos de la cadena
description: Recorrido completo por la API de lectura de steem-js — etiquetas, blog, discusiones, bloques, propiedades globales, cuentas, mercado, votos, contenido, witnesses, login, follows, autenticación, formatter y utils.
---

# steem-js: Lectura de datos de la cadena

Esta página recoge los ejemplos de lectura de `steem.api`, trasladados de la documentación de [steem-js](https://github.com/steemit/steem-js). La puesta en marcha, la configuración y los ejemplos de uso están en el [tutorial de primeros pasos](/es/tutorials/steem-js/index.html); el broadcast se cubre en [Operaciones de broadcast](/es/tutorials/steem-js/broadcast.html).

> Cada helper de abajo envuelve un método JSON-RPC documentado en la [Referencia de la API](/es/api/) generada — por ejemplo, `getAccountsAsync` corresponde a [condenser_api.get_accounts](/es/api/condenser_api/get_accounts.html) y `getContentAsync` a [condenser_api.get_content](/es/api/condenser_api/get_content.html). Las demos muestran los patrones del lado cliente de steem-js.

## Métodos de lectura de la API

## Métodos de lectura de la API

Las secciones siguientes documentan los helpers `steem.api` para leer el estado de la cadena. Salvo indicación contraria, las llamadas se enrutan a **`condenser_api`** en el nodo.

### Etiquetas

#### Obtener etiquetas en tendencia

Devuelve una lista de las etiquetas actualmente en tendencia, en orden descendente por valor.

```javascript
steem.api.getTrendingTagsAsync(afterTag, limit).then(function(result) {
  console.log(result);
});
```

**Descripción de parámetros:**

| Parámetro | Descripción | Tipo de dato | Notas |
|---|---|---|---|
| afterTag | El nombre de la última etiqueta desde la que empezar | String | Usa la cadena vacía `''` para empezar la lista. Las llamadas siguientes pueden usar el nombre de la última etiqueta |
| limit | El número máximo de etiquetas a devolver | Integer | |

**Ejemplo de llamada:**

```javascript
steem.api.getTrendingTagsAsync('', 2).then(function(result) {
  console.log(result);
});
```

**Ejemplo de resultado:**

```javascript
[
  { name: '', total_payouts: '37610793.383 SBD', net_votes: 4211122, top_posts: 411832, comments: 1344461, trending: '5549490701' },
  { name: 'life', total_payouts: '8722947.658 SBD', net_votes: 1498401, top_posts: 127103, comments: 54049, trending: '570954588' }
]
```

**Uso del resultado:**

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

#### Obtener el blog

Obtiene los últimos `limit` posts de `account` anteriores al post con índice `entryId`.

```javascript
steem.api.getBlogAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Descripción de parámetros:**

| Parámetro | Tipo de dato | Descripción |
|---------|--------|-----------|
| account | string | Un nombre de usuario de Steem |
| entryId | number | Un número positivo — el índice desde el que empezar a contar (índice base cero) |
| limit | number | Un número positivo — la cantidad máxima de posts a devolver |

**Ejemplo de llamada:**

```javascript
steem.api.getBlogAsync("username", 10, 3).then(function(data) {
  console.log(data);
});

// In this case we get [3] posts, the newest of which is the one with index [10]
// (that's the 11th post, because post indexes are zero-based)
// This means the results will be posts [10, 9 and 8]
```

#### Obtener los autores del blog

Obtiene una lista de todas las personas que escribieron en el blog de alguien, junto con cuántas veces escribieron en ese blog.

```javascript
steem.api.getBlogAuthorsAsync(blogAccount).then(function(data) {
  console.log(data);
});
```

**Ejemplo de resultado:**

```javascript
[
  ['username1', 1],
  ['username2', 1],
  ['username3', 3],
  ['username4', 2],
  ['username5', 1]
]
```

#### Obtener las entradas del blog

Obtiene los últimos `limit` posts de `account` anteriores al post con índice `entryId`. Muy similar a getBlog, pero con objetos de resultado mucho más simples.

```javascript
steem.api.getBlogEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Ejemplo de resultado:**

```javascript
[
  { author: 'username', permlink: 'post-permlink-10', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 10 },
  { author: 'username', permlink: 'post-permlink-9', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 9 },
  { author: 'username', permlink: 'post-permlink-8', blog: 'username', reblog_on: '1970-01-01T00:00:00', entry_id: 8 }
]
```

#### Obtener discusiones por tendencia

Obtiene los posts de Steem tal y como se mostrarían en la pestaña de tendencias de steemit.com.

```javascript
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});
```

**Ejemplo de llamada:**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByTrendingAsync(query).then(function(data) {
  console.log(data);
});

// NOTE! The default limit is 0. Not setting a limit will get you an empty result.
```

#### Otros métodos de consulta de discusiones

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

#### Obtener discusiones por promoción

Obtiene los posts recientes ordenados por cuánto se gastó en promocionarlos.

```javascript
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

**Ejemplo de llamada:**

```javascript
const query = { limit: 3, tag: "steem" };
steem.api.getDiscussionsByPromotedAsync(query).then(function(data) {
  console.log(data);
});
```

### Bloques y transacciones

#### Obtener la cabecera del bloque

```javascript
steem.api.getBlockHeaderAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### Obtener un bloque

```javascript
steem.api.getBlockAsync(blockNum).then(function(result) {
  console.log(result);
});
```

#### Obtener las operaciones del bloque

Obtiene todas las operaciones de un bloque dado.

```javascript
steem.api.getOpsInBlockAsync(blockNum, onlyVirtual).then(function(data) {
  console.log(data);
});
```

**Descripción de parámetros:**

| Parámetro | Tipo de dato | Descripción |
|---------|--------|-----------|
| blockNum | number | Un número positivo |
| onlyVirtual | boolean | 'false' para obtener todas las operaciones; 'true' para obtener solo las operaciones virtuales |

**Ejemplo de llamada:**

```javascript
steem.api.getOpsInBlockAsync(10000001, false).then(function(data) {
  console.log(data);
});
```

#### Obtener el estado

Obtiene mucha información sobre el estado de `path`.

```javascript
steem.api.getStateAsync(path).then(function(data) {
  console.log(data);
});
```

**Ejemplo de llamada:**

```javascript
// Valid call examples:
steem.api.getStateAsync("/@username");
steem.api.getStateAsync("/@username/permlink-of-post");
steem.api.getStateAsync("/@username/comments");
steem.api.getStateAsync("/@username/recent-replies");
steem.api.getStateAsync("/trending");
steem.api.getStateAsync("/trending/collorchallenge");
```

### Propiedades globales

`getConfig`, `getDynamicGlobalProperties`, `getFeedHistory` y `getWitnessSchedule` usan **`database_api`** en el nodo; `getChainProperties`, `getHardforkVersion` y `getNextScheduledHardfork` usan **`condenser_api`**.

#### Obtener la configuración

```javascript
steem.api.getConfigAsync().then(function(result) {
  console.log(result);
});
```

#### Obtener las propiedades globales dinámicas

```javascript
steem.api.getDynamicGlobalPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### Obtener las propiedades de la cadena

```javascript
steem.api.getChainPropertiesAsync().then(function(result) {
  console.log(result);
});
```

#### Obtener las entradas del feed

Obtiene los posts del feed de un usuario. El feed muestra los posts de los usuarios seguidos, así como lo que estos rebloguearon (resteem).

```javascript
steem.api.getFeedEntriesAsync(account, entryId, limit).then(function(data) {
  console.log(data);
});
```

**Descripción de parámetros:**

| Parámetro | Tipo de dato | Descripción |
|---------|--------|-----------|
| account | string | Un nombre de usuario de Steem |
| entryId | number | El ID del post desde el que empezar a contar. Escribe '0' para empezar desde el post más reciente |
| limit | number | Un número positivo |

**Ejemplo de resultado:**

```javascript
[
  { author: 'otherusername', permlink: 'permlink', reblog_by: ['resteembot'], reblog_on: '2018-02-11T18:42:54', entry_id: 10260 },
  { author: 'otherusername', permlink: 'permlink', reblog_by: [], reblog_on: '2018-02-11T18:39:24', entry_id: 10259 }
]
```

#### Obtener el historial del feed

```javascript
steem.api.getFeedHistoryAsync().then(function(result) {
  console.log(result);
});
```

#### Obtener el precio histórico mediano actual

```javascript
steem.api.getCurrentMedianHistoryPriceAsync().then(function(result) {
  console.log(result);
});
```

#### Obtener el ticker

Obtiene los últimos datos resumidos del mercado de Steem.

```javascript
steem.api.getTickerAsync().then(function(data) {
  console.log(data);
});
```

**Ejemplo de resultado:**

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

#### Obtener el historial de intercambios

Obtiene el historial de operaciones de un periodo dado entre una fecha `start` y una fecha `end`.

```javascript
steem.api.getTradeHistoryAsync(start, end, limit).then(function(data) {
  console.log(data);
});
```

**Descripción de parámetros:**

| Parámetro | Tipo de dato | Descripción |
|---------|--------|-----------|
| start | string | Cadena de fecha y hora con el formato "2018-01-01T00:00:00" |
| end | string | Cadena de fecha y hora con el formato "2018-01-01T00:00:00" |
| limit | number | Un número positivo |

**Ejemplo de llamada:**

```javascript
const start = "2018-01-01T00:00:00";
const end = "2018-01-02T00:00:00";

steem.api.getTradeHistoryAsync(start, end, 5).then(function(data) {
  console.log(data);
});
```

#### Obtener la versión

Obtiene la versión de la blockchain de Steem a la que estás conectado.

```javascript
steem.api.getVersionAsync().then(function(data) {
  console.log(data);
});
```

**Ejemplo de resultado:**

```javascript
{
  blockchain_version: '0.19.2',
  steem_revision: '07be64314ce9d277eb7da921b459c993c2e2412c',
  fc_revision: '8dd1fd1ec0906509eb722fa7c8d280d59bcca23d'
}
```

#### Obtener el volumen

Obtiene los volúmenes de STEEM y de dólares STEEM (SBD).

```javascript
steem.api.getVolumeAsync().then(function(data) {
  console.log(data);
});
```

**Ejemplo de resultado:**

```javascript
{
  steem_volume: '8101.888 STEEM',
  sbd_volume: '7287.268 SBD'
}
```

#### Obtener la versión del hard fork

Obtiene la versión de hard fork actual de la blockchain STEEM.

```javascript
steem.api.getHardforkVersionAsync().then(function(result) {
  console.log(result); // '0.19.0'
});
```

#### Obtener el próximo hard fork programado

```javascript
steem.api.getNextScheduledHardforkAsync().then(function(result) {
  console.log(result);
});
```

#### Obtener el fondo de recompensas

```javascript
steem.api.getRewardFundAsync(name).then(function(result) {
  console.log(result);
});
```

#### Obtener las delegaciones de vesting

Devuelve una lista de las delegaciones hechas desde una `account`. Expresadas en acciones de vesting (VESTS).

```javascript
steem.api.getVestingDelegationsAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**Descripción de parámetros:**

| Parámetro | Descripción | Tipo de dato | Notas |
|---|---|---|---|
| account | La cuenta que hace las delegaciones | String | |
| from | El nombre de la última cuenta desde la que empezar | String | Usa la cadena vacía `''` para empezar la lista. Las llamadas siguientes pueden usar el nombre de cuenta del último delegatario |
| limit | El número máximo de registros de delegación a devolver | Integer | |

**Ejemplo de llamada:**

```javascript
steem.api.getVestingDelegationsAsync('ned', '', 2).then(function(result) {
  console.log(result);
});
```

**Ejemplo de resultado:**

```javascript
[
  { id: 498422, delegator: 'ned', delegatee: 'spaminator', vesting_shares: '409517519.233783 VESTS', min_delegation_time: '2018-01-16T19:30:36' },
  { id: 181809, delegator: 'ned', delegatee: 'surpassinggoogle', vesting_shares: '1029059275.000000 VESTS', min_delegation_time: '2017-08-08T15:25:15' }
]
```

### Claves

#### Obtener las referencias de claves

```javascript
steem.api.getKeyReferencesAsync(key).then(function(result) {
  console.log(result);
});
```

### Cuentas

#### Obtener las cuentas

Obtiene varias cuentas por sus nombres.

```javascript
steem.api.getAccountsAsync(names).then(function(result) {
  console.log(result);
});
```

**Descripción de parámetros:**

| Parámetro | Tipo de dato | Descripción |
|---------|--------|-----------|
| names | array | Array de nombres de cuenta (cadenas) |

**Ejemplo de llamada:**

```javascript
steem.api.getAccountsAsync(['ned', 'dan']).then(function(accounts) {
  console.log(accounts);
});
```

**Nota:** para obtener una sola cuenta, pasa un array con un solo nombre: `getAccountsAsync(['username'])`, y accede al primer elemento del resultado.

#### Obtener las referencias de cuenta

```javascript
steem.api.getAccountReferencesAsync(accountId).then(function(result) {
  console.log(result);
});
```

#### Buscar nombres de cuentas

```javascript
steem.api.lookupAccountNamesAsync(accountNames).then(function(result) {
  console.log(result);
});
```

#### Buscar cuentas

```javascript
steem.api.lookupAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### Obtener el número de cuentas

```javascript
steem.api.getAccountCountAsync().then(function(result) {
  console.log(result);
});
```

#### Obtener las solicitudes de conversión

```javascript
steem.api.getConversionRequestsAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### Obtener el historial de la cuenta

```javascript
steem.api.getAccountHistoryAsync(account, from, limit).then(function(result) {
  console.log(result);
});
```

**Versión firmada (para datos privados de la cuenta):**

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

#### Obtener el historial del propietario

```javascript
steem.api.getOwnerHistoryAsync(account).then(function(result) {
  console.log(result);
});
```

#### Obtener la solicitud de recuperación

```javascript
steem.api.getRecoveryRequestAsync(account).then(function(result) {
  console.log(result);
});
```

#### Obtener las reputaciones de las cuentas

Obtiene los puntos de reputación de las `limit` cuentas cuyos nombres se parecen más a `lowerBoundName`.

```javascript
steem.api.getAccountReputationsAsync(lowerBoundName, limit).then(function(data) {
  console.log(data);
});
```

**Ejemplo de resultado:**

```javascript
[
  { account: 'username', reputation: '26727073581' },
  { account: 'username-taken', reputation: 0 }
]
```

### Mercado

#### Obtener el libro de órdenes

```javascript
steem.api.getOrderBookAsync(limit).then(function(result) {
  console.log(result);
});
```

#### Obtener el libro de órdenes del mercado

Toma las `limit` entradas superiores del libro de órdenes del mercado, tanto de compra como de venta.

```javascript
steem.api.getMarketOrderBookAsync(limit).then(function(data) {
  console.log(data);
});
```

**Ejemplo de resultado:**

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

#### Obtener las órdenes abiertas

```javascript
steem.api.getOpenOrdersAsync(owner).then(function(result) {
  console.log(result);
});
```

`getOrderBook` usa **`database_api`** en el nodo; `getMarketOrderBook` usa **`market_history_api`**.

#### Obtener los buckets del historial de mercado

```javascript
steem.api.getMarketHistoryBucketsAsync().then(function(data) {
  console.log(data); // [15, 60, 300, 3600, 86400]
});
```

### Autoridad / Validación

#### Obtener el hexadecimal de la transacción

```javascript
steem.api.getTransactionHexAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Obtener la transacción

```javascript
steem.api.getTransactionAsync(trxId).then(function(result) {
  console.log(result);
});
```

#### Obtener las firmas requeridas

```javascript
steem.api.getRequiredSignaturesAsync(trx, availableKeys).then(function(result) {
  console.log(result);
});
```

#### Obtener las firmas potenciales

```javascript
steem.api.getPotentialSignaturesAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Verificar la autoridad

Usa **`database_api`** en el nodo.

```javascript
steem.api.verifyAuthorityAsync(trx).then(function(result) {
  console.log(result);
});
```

#### Verificar la autoridad de la cuenta

Usa **`database_api`** en el nodo.

```javascript
steem.api.verifyAccountAuthorityAsync(nameOrId, signers).then(function(result) {
  console.log(result);
});
```

#### Obtener las etiquetas usadas por un autor

Obtiene las etiquetas que usa un usuario de Steem. La mayoría de los usuarios aún no tienen etiquetas, pero algunos sí.

```javascript
steem.api.getTagsUsedByAuthorAsync(author).then(function(data) {
  console.log(data);
});
```

**Ejemplo de llamada:**

```javascript
steem.api.getTagsUsedByAuthorAsync("good-karma").then(function(data) {
  console.log(data); // [['challenge', 0]]
});
```

### Votos

#### Obtener los votos activos

```javascript
steem.api.getActiveVotesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Obtener los votos de la cuenta

```javascript
steem.api.getAccountVotesAsync(voter).then(function(result) {
  console.log(result);
});
```

### Contenido

#### Obtener el contenido

```javascript
steem.api.getContentAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Obtener las respuestas del contenido

```javascript
steem.api.getContentRepliesAsync(author, permlink).then(function(result) {
  console.log(result);
});
```

#### Obtener discusiones de un autor antes de una fecha

```javascript
steem.api.getDiscussionsByAuthorBeforeDateAsync(author, startPermlink, beforeDate, limit).then(function(result) {
  console.log(result);
});
```

#### Obtener los reblog

Da una lista de los usuarios que rebloguearon (resteem) un post dado.

```javascript
steem.api.getRebloggedByAsync(author, permlink).then(function(data) {
  console.log(data);
});
```

**Ejemplo de resultado:**

```javascript
['author', 'user1', 'user2', 'user3', 'user4']
```

#### Obtener las respuestas por última actualización

```javascript
steem.api.getRepliesByLastUpdateAsync(startAuthor, startPermlink, limit).then(function(result) {
  console.log(result);
});
```

### Witness

#### Obtener los witness

```javascript
steem.api.getWitnessesAsync(witnessIds).then(function(result) {
  console.log(result);
});
```

#### Obtener un witness por cuenta

Devuelve información sobre el witness con el `accountName` dado.

```javascript
steem.api.getWitnessByAccountAsync(accountName).then(function(result) {
  console.log(result);
});
```

#### Obtener los witness por votos

```javascript
steem.api.getWitnessesByVoteAsync(from, limit).then(function(result) {
  console.log(result);
});
```

#### Buscar cuentas witness

```javascript
steem.api.lookupWitnessAccountsAsync(lowerBoundName, limit).then(function(result) {
  console.log(result);
});
```

#### Obtener el número de witness

```javascript
steem.api.getWitnessCountAsync().then(function(result) {
  console.log(result);
});
```

#### Obtener los witness activos

```javascript
steem.api.getActiveWitnessesAsync().then(function(result) {
  console.log(result);
});
```

#### Obtener el calendario de los witness

Obtiene información general sobre los witnesses.

```javascript
steem.api.getWitnessScheduleAsync().then(function(data) {
  console.log(data);
});
```

**Ejemplo de resultado:**

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

## API de inicio de sesión

## API de inicio de sesión

### Iniciar sesión

⚠️ **No es seguro** usar este método con tu nombre de usuario y contraseña. Este método siempre devuelve `true` y solo se usa internamente con valores vacíos para habilitar el broadcast.

```javascript
steem.api.loginAsync('', '').then(function(result) {
  console.log(result);
});
```

### Obtener la API por nombre

```javascript
steem.api.getApiByNameAsync(apiName).then(function(result) {
  console.log(result);
});
```

---

## API de seguimiento

La API de seguidores consulta información sobre las relaciones de seguimiento entre cuentas. Es una API de solo lectura y no crea cambios en la blockchain.

### Obtener los seguidores

Devuelve un array ordenado alfabéticamente con las cuentas que siguen a una cuenta concreta.

```javascript
steem.api.getFollowersAsync(following, startFollower, followType, limit).then(function(result) {
  console.log(result);
});
```

**Descripción de parámetros:**

| Parámetro | Descripción | Tipo de dato | Notas |
|---|---|---|---|
| following | ¿Los seguidores de qué cuenta? | String | Sin símbolo @ inicial |
| startFollower | ¿Desde qué seguidor empezar la lista? | String | Sin símbolo @ inicial. Usa la cadena vacía `''` para empezar la lista. Las llamadas siguientes pueden usar el nombre del último seguidor |
| followType | ?? | ?? | Fija 0 o 'blog' — cualquiera de los dos funciona |
| limit | El número máximo de seguidores a devolver | Integer | |

**Ejemplo de llamada:**

```javascript
steem.api.getFollowersAsync('ned', '', 'blog', 2).then(function(result) {
  console.log(result);
});
```

**Ejemplo de resultado:**

```javascript
[
  { follower: 'a-0-0', following: 'ned', what: ['blog'] },
  { follower: 'a-0-0-0-1abokina', following: 'ned', what: ['blog'] }
]
```

### Obtener los seguidos

Devuelve un array ordenado alfabéticamente con las cuentas que una cuenta concreta sigue.

```javascript
steem.api.getFollowingAsync(follower, startFollowing, followType, limit).then(function(result) {
  console.log(result);
});
```

**Ejemplo de resultado:**

```javascript
[
  { follower: 'dan', following: 'dantheman', what: ['blog'] },
  { follower: 'dan', following: 'krnel', what: ['blog'] }
]
```

### Obtener el conteo de seguimiento

```javascript
steem.api.getFollowCountAsync(account).then(function(result) {
  console.log(result);
});
```

**Ejemplo de resultado:**

```javascript
{ account: 'ned', follower_count: 16790, following_count: 913 }
```

## Autenticación

## Autenticación

### Verificar

```javascript
steem.auth.verify(name, password, auths);
```

### Generar claves

```javascript
steem.auth.generateKeys(name, password, roles);
```

### Obtener las claves privadas

```javascript
steem.auth.getPrivateKeys(name, password, roles);
```

### ¿Es un WIF?

```javascript
steem.auth.isWif(privWif);
```

### Convertir a WIF

```javascript
steem.auth.toWif(name, password, role);
```

### WIF válido

```javascript
steem.auth.wifIsValid(privWif, pubWif);
```

### De WIF a clave pública

```javascript
steem.auth.wifToPublic(privWif);
```

### Firmar la transacción

Firma una transacción con las claves privadas proporcionadas. La firma se calcula sobre el digest `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`, donde `chain_id` procede de la cadena configurada (por defecto, todo ceros para la mainnet).

- **`trx`** — objeto de transacción: `ref_block_num`, `ref_block_prefix`, `expiration`, `operations` (array de `[opType, opData]`) y `extensions`.
- **`keys`** — array de claves privadas WIF usadas para firmar.
- Devuelve un objeto de transacción con un array `signatures` añadido.

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

> **Nota:** el campo `signatures` **no** forma parte del digest firmado. Al firmar, la transacción se serializa *antes* de adjuntar las firmas, de modo que el digest cubre solo el cuerpo de la transacción sin firmar.

### Verificar la transacción

Verifica que las firmas de una transacción firmada fueron producidas por la clave pública dada. El digest se reconstruye exactamente como lo calcula `signTransaction`: `sha256(chain_id ‖ serializeTransaction(normalizedTrx))`. Devuelve `true` si alguna firma es válida para `publicKey`; de lo contrario, `false`.

- **`transaction`** — un objeto de transacción firmada (debe contener un array `signatures`). El campo `signatures` se elimina antes de calcular el digest, así que no importa cuántas firmas haya.
- **`publicKey`** — la clave pública `STM…` contra la que verificar.
- Devuelve `boolean`.

```javascript
const publicKey = steem.auth.wifToPublic(wif);

// Round-trip: a correctly-signed tx verifies against its signing key
const isValid = steem.auth.verifyTransaction(signedTx, publicKey);
console.log(isValid); // true

// A different public key is rejected
const wrongPub = steem.auth.wifToPublic('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');
console.log(steem.auth.verifyTransaction(signedTx, wrongPub)); // false
```

> **Caso de uso de seguridad:** un servidor de relay/cartera puede llamar a `verifyTransaction` sobre una transacción enviada por un cliente para demostrar — *antes* de reenviarla a la cadena — que fue firmada por una clave perteneciente a la cuenta reclamada. Esto cierra una brecha de defensa en profundidad: antes el servidor solo podía comprobar la forma de la transacción, no su autenticidad criptográfica.

### Serializar la transacción

Serializa una transacción a su forma **binaria** (estilo FC) y devuelve un `Buffer`. Es el mismo serializador que `signTransaction` usa internamente, por lo que la salida coincide byte a byte con el formato de red de las transacciones del nodo Steem. Las aplicaciones posteriores pueden usarlo para reconstruir por sí mismas el digest de firma.

- **`trx`** — objeto de transacción (misma forma que el `trx` de `signTransaction`).
- Devuelve un `Buffer`.

```javascript
import { sha256 } from '@noble/hashes/sha2';

// Build the exact digest signTransaction signs over:
const buf = steem.auth.serializeTransaction(tx); // Buffer
const chainId = Buffer.alloc(32, 0); // mainnet chain_id (all-zero)
const digest = Buffer.from(sha256(Buffer.concat([chainId, buf])));
console.log(digest.toString('hex')); // 32-byte digest
```

## Formateador

## Formateador

### Importe

Formatea número y moneda a la forma válida para enviar (por ejemplo — recorta el resto decimal del número a solo 3 cifras).

```javascript
steem.formatter.amount(_amount, asset);
```

**Descripción de parámetros:**

| Parámetro | Tipo de dato | Descripción |
|---------|--------|-----------|
| _amount | number | Un número positivo |
| asset | string | El nombre de un activo de Steem (steem, sbd) |

**Ejemplo de llamada:**

```javascript
steem.formatter.amount(53.442346, "STEEM"); // "53.442 STEEM"
```

### Vesting STEEM

Convierte las acciones de vesting (VESTS) de `account` en la cantidad de Steem que representan.

```javascript
steem.formatter.vestingSteem(account, gprops);
```

**Ejemplo de llamada:**

```javascript
steem.api.getAccountsAsync(["username"]).then(function(accounts) {
  steem.api.getStateAsync("/@username").then(function(state) {        
    const vestingSteem = steem.formatter.vestingSteem(accounts[0], state.props);
    console.log(vestingSteem); // 7.42431235
  });
});
```

### Número con separadores de miles

Formatea un número grande añadiendo una coma cada 3 dígitos. Atención — solo funciona con cadenas; no se puede pasar ningún número directamente.

```javascript
steem.formatter.numberWithCommas(x);
```

**Ejemplo de llamada:**

```javascript
steem.formatter.numberWithCommas("53304432342.432"); // "53,304,432,342.432"
```

### Estimar el valor de la cuenta

Obtiene el valor estimado en dólares de los activos de `account`.

```javascript
steem.formatter.estimateAccountValue(account).then(function(data) {
  console.log(data); // 32.25
});
```

### Crear la contraseña sugerida

```javascript
const password = steem.formatter.createSuggestedPassword();
console.log(password); // 'GAz3GYFvvQvgm7t2fQmwMDuXEzDqTzn9'
```

### Permlink del comentario

```javascript
const parentAuthor = 'ned';
const parentPermlink = 'a-selfie';
const commentPermlink = steem.formatter.commentPermlink(parentAuthor, parentPermlink);
console.log(commentPermlink); // 're-ned-a-selfie-20170621t080403765z'
```

### Reputación

```javascript
const reputation = steem.formatter.reputation(3512485230915);
console.log(reputation); // 56
```

### De vesting a STEEM

```javascript
const steemPower = steem.formatter.vestToSteem(vestingShares, totalVestingShares, totalVestingFundSteem);
console.log(steemPower);
```


## Utilidades

## Utilidades

### Validar el nombre de usuario

```javascript
const isValidUsername = steem.utils.validateAccountName('test1234');
console.log(isValidUsername); // null

const isValidUsername2 = steem.utils.validateAccountName('a1');
console.log(isValidUsername2); // 'Account name should be longer.'
```

### camelCase

Formatea una cadena con caracteres '_' para que siga la notación CamelCase.

```javascript
steem.utils.camelCase(str);
```

**Ejemplo de llamada:**

```javascript
steem.utils.camelCase("example_string"); // "exampleString"
```

## Próximos pasos

- Para modificar el estado de la cadena, véase [Operaciones de broadcast](/es/tutorials/steem-js/broadcast.html).
- Para lecturas autenticadas y verificación de firmas, véase [Llamadas firmadas y verificación de firmas](/tutorials/steem-js/signed-calls.html).
- Para la instalación y la configuración, vuelve al [tutorial de primeros pasos](/es/tutorials/steem-js/index.html).
