---
title: steem-js — diffusion des opérations
description: Le catalogue complet de diffusion steem-js — patterns Promise et callback, toutes les opérations de diffusion, multisignature et sérialisation binaire des transactions.
---

# steem-js: Diffusion des opérations

L'espace de noms `steem.broadcast` provoque des changements permanents sur la blockchain : votes, transferts, posts, opérations de witness et plus encore. Cette page reprend les exemples de diffusion complets de la documentation [steem-js](https://github.com/steemit/steem-js) ; la lecture des données de la chaîne est couverte par [Lecture des données de la chaîne](/fr/tutorials/steem-js/read-api.html).

> Les détails sur le fil de chaque opération sont documentés dans la [référence des opérations de diffusion](/fr/api/broadcast_ops/) générée.

## API de diffusion

## API de diffusion

### Diffuser un bloc

Diffuse un nouveau bloc sur la blockchain Steem.

```javascript
steem.api.broadcastBlockAsync(blockObject).then(function(data) {
  console.log(data);
});
```

### Diffusion synchrone d'une transaction

```javascript
steem.api.broadcastTransactionSynchronousAsync(trx).then(function(result) {
  console.log(result);
});
```

## Opérations de diffusion

## Opérations de diffusion

Les méthodes `steem.broadcast` provoquent des changements permanents sur la blockchain.

### Prise en charge des promises

Toutes les méthodes de diffusion prennent en charge les patterns callback et Promise. Vous pouvez utiliser l'un ou l'autre :

#### Modèle Promise (recommandé)

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

#### Modèle de callback (ancien)

```javascript
steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
});
```

### Créer un compte

```javascript
steem.broadcast.accountCreateAsync(wif, fee, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Créer un compte avec délégation

```javascript
steem.broadcast.accountCreateWithDelegationAsync(wif, fee, delegation, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata, extensions).then(function(result) {
  console.log(result);
});
```

### Déléguer des parts de vesting

Délègue du STEEM Power (SP), exprimé en parts de vesting (VESTS), d'un `delegator` vers un `delegatee`. Nécessite la clé privée WIF du `delegator`. Mettez la délégation à 0 pour la retirer.

```javascript
steem.broadcast.delegateVestingSharesAsync(wif, delegator, delegatee, vesting_shares).then(function(result) {
  console.log(result);
});
```

### Mettre à jour un compte

```javascript
steem.broadcast.accountUpdateAsync(wif, account, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Vote par proxy pour witness

```javascript
steem.broadcast.accountWitnessProxyAsync(wif, account, proxy).then(function(result) {
  console.log(result);
});
```

### Voter pour un witness

```javascript
steem.broadcast.accountWitnessVoteAsync(wif, account, witness, approve).then(function(result) {
  console.log(result);
});
```

### Changer de compte de récupération

```javascript
steem.broadcast.changeRecoveryAccountAsync(wif, accountToRecover, newRecoveryAccount, extensions).then(function(result) {
  console.log(result);
});
```

### Commentaire

```javascript
steem.broadcast.commentAsync(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Options de commentaire

```javascript
steem.broadcast.commentOptionsAsync(wif, author, permlink, maxAcceptedPayout, percentSteemDollars, allowVotes, allowCurationRewards, extensions).then(function(result) {
  console.log(result);
});
```

Le paramètre `extensions` prend en charge l'extension des bénéficiaires (tag 0). Passez un tableau de `[tag, value]`, par ex. `[[0, { beneficiaries: [{ account: 'foo', weight: 1000 }, { account: 'bar', weight: 5000 }] }]]`. Les bénéficiaires sont automatiquement triés par nom de compte avant la sérialisation, conformément au protocole Steem.

### Conversion

```javascript
steem.broadcast.convertAsync(wif, owner, requestid, amount).then(function(result) {
  console.log(result);
});
```

### Opération personnalisée

```javascript
steem.broadcast.customAsync(wif, requiredAuths, id, data).then(function(result) {
  console.log(result);
});
```

### JSON personnalisé

```javascript
steem.broadcast.customJsonAsync(wif, requiredAuths, requiredPostingAuths, id, json).then(function(result) {
  console.log(result);
});
```

### Supprimer un commentaire

```javascript
steem.broadcast.deleteCommentAsync(wif, author, permlink).then(function(result) {
  console.log(result);
});
```

### Opérations d'escrow

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

### Obtenir l'escrow

```javascript
steem.api.getEscrowAsync(from, escrowId).then(function(data) {
  console.log(data);
});
```

### Publier le prix de flux

```javascript
steem.broadcast.feedPublishAsync(wif, publisher, exchangeRate).then(function(result) {
  console.log(result);
});
```

### Opérations d'ordres à cours limité

```javascript
// Limit Order Cancel
steem.broadcast.limitOrderCancelAsync(wif, owner, orderid);

// Limit Order Create
steem.broadcast.limitOrderCreateAsync(wif, owner, orderid, amountToSell, minToReceive, fillOrKill, expiration);

// Limit Order Create2
steem.broadcast.limitOrderCreate2Async(wif, owner, orderid, amountToSell, exchangeRate, fillOrKill, expiration);
```

**Description des paramètres d'ordre limite :**

| Paramètre | Description | Type de données | Remarques |
|---|---|---|---|
| wif | Clé privée active | String | |
| owner | Nom du compte | String | Sans symbole @ initial |
| orderid | Numéro d'ordre défini par l'utilisateur | Integer | Sert à annuler des ordres |
| amountToSell | Montant à vendre | String | "X.XXX ASSET" doit comporter 3 décimales, p. ex. "25.100 SBD" |
| minToReceive | Montant souhaité | String | "X.XXX ASSET" doit comporter 3 décimales, p. ex. "20.120 STEEM" |
| fillOrKill | Exécuter l'ordre sur le carnet d'ordres actuel ou l'annuler | Boolean | `false` place l'ordre dans le carnet d'ordres jusqu'à son annulation, son exécution ou l'atteinte de son expiration |
| expiration | Moment d'expiration de l'ordre | Integer | Unité : millisecondes. Zéro = époque UNIX |

### Récupération de compte

```javascript
// Recover Account
steem.broadcast.recoverAccountAsync(wif, accountToRecover, newOwnerAuthority, recentOwnerAuthority, extensions);

// Request Account Recovery
steem.broadcast.requestAccountRecoveryAsync(wif, recoveryAccount, accountToRecover, newOwnerAuthority, extensions);
```

### Opérations de transfert

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

**Description des paramètres de transfert :**

| Paramètre | Description | Type de données | Remarques |
|---|---|---|---|
| wif | Clé privée active du compte `from` | String | |
| from | Nom du compte à débiter de l'actif | String | Sans symbole @ initial |
| to | Nom du compte à créditer de l'actif | String | Sans symbole @ initial |
| amount | Montant d'actif à transférer | String | "X.XXX ASSET" doit comporter 3 décimales, p. ex. "5.150 SBD" |

### Voter

```javascript
steem.broadcast.voteAsync(wif, voter, author, permlink, weight).then(function(result) {
  console.log(result);
});
```

### Retrait de vesting

```javascript
steem.broadcast.withdrawVestingAsync(wif, account, vestingShares).then(function(result) {
  console.log(result);
});
```

### Mettre à jour le witness

```javascript
steem.broadcast.witnessUpdateAsync(wif, owner, url, blockSigningKey, props, fee).then(function(result) {
  console.log(result);
});
```

### Définir la route de retrait de vesting

```javascript
steem.broadcast.setWithdrawVestingRouteAsync(wif, fromAccount, toAccount, percent, autoVest).then(function(result) {
  console.log(result);
});
```

### Obtenir les routes de retrait

Récupère les routes de retrait (retraits de STEEM Power).

```javascript
steem.api.getWithdrawRoutesAsync(account, withdrawRouteType).then(function(data) {
  console.log(data);
});
```

### Réclamer le solde de récompenses

Réclame les récompenses en attente, qu'il s'agisse de Steem, de SBD ou de VESTS.

```javascript
steem.broadcast.claimRewardBalanceAsync(wif, account, reward_steem, reward_sbd, reward_vests).then(function(data) {
  console.log(data);
});
```

**Description des paramètres :**

| Paramètre | Type de données | Description |
|---------|--------|-----------|
| wif | string | Utilisez steem.auth.toWif(user, pass, type) |
| account | string | Un nom d'utilisateur Steem |
| reward_steem | string | Solde du type "0.000 STEEM" |
| reward_sbd | string | Solde du type "0.000 SBD" |
| reward_vests | string | Solde du type "0.000006 VESTS" |

### Multisignature

Vous pouvez utiliser la multisignature pour diffuser une opération.

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

### Sérialisation des transactions (binaire)

La diffusion et la signature utilisent un **format de transaction binaire** compatible avec le protocole Steem (style FC). Le sérialiseur se trouve dans `src/auth/serializer/transaction.ts` et est utilisé en interne par `steem.auth.signTransaction` et `steem.broadcast.sendAsync`.

**Utilisation**

- **Pour la signature / le condensat** : `steem.auth.serializeTransaction(trx)` — renvoie le `Buffer` qui est haché pour la signature. C'est l'API publique du sérialiseur binaire ; `steem.auth.transaction.toBuffer(trx)` en est le point d'entrée interne équivalent.

```javascript
// The public serializer (preferred for app code):
const buf = steem.auth.serializeTransaction(trx); // Buffer
```
- **Forme de la transaction** : `trx` doit inclure `ref_block_num`, `ref_block_prefix`, `expiration`, `operations` (tableau de `[opType, opData]`), et facultativement `extensions` et `signatures`.

**Couverture du sérialiseur**

Tous les types d'opérations Steem utilisés dans `operations` sont pris en charge (indices de types 0–54), notamment :

- **Contenu et social** : vote, comment, delete_comment, comment_options, custom_json ;
- **Comptes et autorité** : account_create, account_update, account_update2, account_create_with_delegation, create_claimed_account, request_account_recovery, recover_account, change_recovery_account, reset_account, set_reset_account, decline_voting_rights ;
- **Transferts et vesting** : transfer, transfer_to_vesting, withdraw_vesting, set_withdraw_vesting_route, transfer_to_savings, transfer_from_savings, cancel_transfer_from_savings, delegate_vesting_shares ;
- **Marché et conversion** : limit_order_create, limit_order_create2, limit_order_cancel, feed_publish, convert, fill_order ;
- **Séquestre** : escrow_transfer, escrow_dispute, escrow_release, escrow_approve ;
- **Récompenses et système** : claim_reward_balance, claim_reward_balance2, comment_reward, liquidity_reward, interest, fill_vesting_withdraw, fill_convert_request, fill_transfer_from_savings ;
- **Witness et custom** : pow, pow2, witness_update, witness_set_properties, account_witness_vote, account_witness_proxy, custom, custom_binary.

L'ordre des champs et l'encodage (actifs, autorités, temps, extensions) suivent la même disposition que le protocole C++ FC_REFLECT / [steemutil](https://github.com/steemit/steemutil). Des fixtures inter-langages sous `test/fixtures/serializer/` servent, le cas échéant, à garder la sortie JS alignée avec l'encodeur de steemutil.

**Notes de compatibilité**

- Pour les champs de montant, utilisez des chaînes d'actifs **STEEM / SBD / VESTS** (p. ex. `"1.000 STEEM"`).
- Autorités : `owner` / `active` / `posting` utilisent `weight_threshold`, `account_auths` et `key_auths` (tableau de `[key, weight]`) ; les clés publiques sont des chaînes STM….
- Les champs facultatifs (p. ex. `owner` dans account_update) sont encodés avec un octet de présence lorsque le protocole l'exige.
- La prise en charge par le sérialiseur **n'implique pas** une enveloppe de haut niveau `steem.broadcast.*`, une normalisation JSON ou une gestion de métadonnées en chaînes seules pour chaque opération listée ci-dessus.


## Pour aller plus loin

- Extraits de bout en bout pour voter / transférer / publier : [Premiers pas — exemples d'utilisation](/fr/tutorials/steem-js/index.html#usage-examples).
- Signer et vérifier des transactions à la main : [Appels signés et vérification de signature](/tutorials/steem-js/signed-calls.html).
