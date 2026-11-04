---
title: steem-js - operazioni di broadcast
description: Il catalogo completo del broadcast di steem-js — pattern Promise e callback, ogni operazione di broadcast, multisignature e serializzazione binaria delle transazioni.
---

# steem-js: Operazioni di broadcast

Il namespace `steem.broadcast` provoca cambiamenti permanenti sulla blockchain: voti, trasferimenti, post, operazioni dei witness e altro. Questa pagina riporta gli esempi di broadcast completi dalla documentazione di [steem-js](https://github.com/steemit/steem-js); la lettura dei dati della catena è trattata in [Leggere i dati della catena](/it/tutorials/steem-js/read-api.html).

> I dettagli sul filo di ogni operazione sono documentati nella [referenza delle operazioni di broadcast](/it/api/broadcast_ops/) generata.

## API di broadcast

## API di broadcast

### Trasmettere un blocco

Trasmette in broadcast un nuovo blocco sulla blockchain Steem.

```javascript
steem.api.broadcastBlockAsync(blockObject).then(function(data) {
  console.log(data);
});
```

### Trasmissione sincrona della transazione

```javascript
steem.api.broadcastTransactionSynchronousAsync(trx).then(function(result) {
  console.log(result);
});
```

## Operazioni di broadcast

## Operazioni di broadcast

I metodi `steem.broadcast` provocano cambiamenti permanenti sulla blockchain.

### Supporto delle Promise

Tutti i metodi di broadcast supportano sia il pattern callback sia quello Promise. Puoi usare l'uno o l'altro:

#### Pattern Promise (consigliato)

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

#### Pattern callback (tradizionale)

```javascript
steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
});
```

### Creare un account

```javascript
steem.broadcast.accountCreateAsync(wif, fee, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Creare un account con delega

```javascript
steem.broadcast.accountCreateWithDelegationAsync(wif, fee, delegation, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata, extensions).then(function(result) {
  console.log(result);
});
```

### Delegare quote di vesting

Delega STEEM Power (SP), espresso in quote di vesting (VESTS), da un `delegator` a un `delegatee`. Richiede la chiave privata WIF del delegante. Imposta la delega a 0 per revocarla.

```javascript
steem.broadcast.delegateVestingSharesAsync(wif, delegator, delegatee, vesting_shares).then(function(result) {
  console.log(result);
});
```

### Aggiornare un account

```javascript
steem.broadcast.accountUpdateAsync(wif, account, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Proxy di voto witness

```javascript
steem.broadcast.accountWitnessProxyAsync(wif, account, proxy).then(function(result) {
  console.log(result);
});
```

### Votare un witness

```javascript
steem.broadcast.accountWitnessVoteAsync(wif, account, witness, approve).then(function(result) {
  console.log(result);
});
```

### Cambiare l'account di recupero

```javascript
steem.broadcast.changeRecoveryAccountAsync(wif, accountToRecover, newRecoveryAccount, extensions).then(function(result) {
  console.log(result);
});
```

### Commento

```javascript
steem.broadcast.commentAsync(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Opzioni del commento

```javascript
steem.broadcast.commentOptionsAsync(wif, author, permlink, maxAcceptedPayout, percentSteemDollars, allowVotes, allowCurationRewards, extensions).then(function(result) {
  console.log(result);
});
```

Il parametro `extensions` supporta l'estensione dei beneficiari (tag 0). Passa un array di `[tag, value]`, per esempio `[[0, { beneficiaries: [{ account: 'foo', weight: 1000 }, { account: 'bar', weight: 5000 }] }]]`. I beneficiari vengono ordinati automaticamente per nome dell'account prima della serializzazione, in conformità con il protocollo Steem.

### Conversione

```javascript
steem.broadcast.convertAsync(wif, owner, requestid, amount).then(function(result) {
  console.log(result);
});
```

### Operazione personalizzata

```javascript
steem.broadcast.customAsync(wif, requiredAuths, id, data).then(function(result) {
  console.log(result);
});
```

### JSON personalizzato

```javascript
steem.broadcast.customJsonAsync(wif, requiredAuths, requiredPostingAuths, id, json).then(function(result) {
  console.log(result);
});
```

### Eliminare il commento

```javascript
steem.broadcast.deleteCommentAsync(wif, author, permlink).then(function(result) {
  console.log(result);
});
```

### Operazioni di escrow

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

### Ottenere l'escrow

```javascript
steem.api.getEscrowAsync(from, escrowId).then(function(data) {
  console.log(data);
});
```

### Pubblicare il prezzo di feed

```javascript
steem.broadcast.feedPublishAsync(wif, publisher, exchangeRate).then(function(result) {
  console.log(result);
});
```

### Operazioni con ordini limite

```javascript
// Limit Order Cancel
steem.broadcast.limitOrderCancelAsync(wif, owner, orderid);

// Limit Order Create
steem.broadcast.limitOrderCreateAsync(wif, owner, orderid, amountToSell, minToReceive, fillOrKill, expiration);

// Limit Order Create2
steem.broadcast.limitOrderCreate2Async(wif, owner, orderid, amountToSell, exchangeRate, fillOrKill, expiration);
```

**Descrizione dei parametri degli ordini limite:**

| Parametro | Descrizione | Tipo di dato | Note |
|---|---|---|---|
| wif | Chiave privata attiva | String | |
| owner | Nome dell'account | String | Senza simbolo @ iniziale |
| orderid | Numero d'ordine definito dall'utente | Integer | Serve per annullare gli ordini |
| amountToSell | Importo da vendere | String | "X.XXX ASSET" deve avere 3 decimali, es. "25.100 SBD" |
| minToReceive | Importo desiderato | String | "X.XXX ASSET" deve avere 3 decimali, es. "20.120 STEEM" |
| fillOrKill | Eseguire l'ordine dal book corrente o annullarlo | Boolean | `false` inserisce l'ordine nel book degli ordini finché non viene annullato, eseguito o raggiunta la scadenza |
| expiration | Momento di scadenza dell'ordine | Integer | Unità: millisecondi. Zero è l'epoca UNIX |

### Recupero dell'account

```javascript
// Recover Account
steem.broadcast.recoverAccountAsync(wif, accountToRecover, newOwnerAuthority, recentOwnerAuthority, extensions);

// Request Account Recovery
steem.broadcast.requestAccountRecoveryAsync(wif, recoveryAccount, accountToRecover, newOwnerAuthority, extensions);
```

### Operazioni di trasferimento

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

**Descrizione dei parametri dei trasferimenti:**

| Parametro | Descrizione | Tipo di dato | Note |
|---|---|---|---|
| wif | Chiave privata attiva dell'account `from` | String | |
| from | Nome dell'account da cui prelevare l'asset | String | Senza simbolo @ iniziale |
| to | Nome dell'account su cui accreditare l'asset | String | Senza simbolo @ iniziale |
| amount | Importo dell'asset da trasferire | String | "X.XXX ASSET" deve avere 3 decimali, es. "5.150 SBD" |

### Votare

```javascript
steem.broadcast.voteAsync(wif, voter, author, permlink, weight).then(function(result) {
  console.log(result);
});
```

### Prelievo di vesting

```javascript
steem.broadcast.withdrawVestingAsync(wif, account, vestingShares).then(function(result) {
  console.log(result);
});
```

### Aggiornare il witness

```javascript
steem.broadcast.witnessUpdateAsync(wif, owner, url, blockSigningKey, props, fee).then(function(result) {
  console.log(result);
});
```

### Impostare la route di prelievo del vesting

```javascript
steem.broadcast.setWithdrawVestingRouteAsync(wif, fromAccount, toAccount, percent, autoVest).then(function(result) {
  console.log(result);
});
```

### Ottenere le route di prelievo

Ottiene le rotte di prelievo (prelievi di STEEM Power).

```javascript
steem.api.getWithdrawRoutesAsync(account, withdrawRouteType).then(function(data) {
  console.log(data);
});
```

### Riscuotere il saldo delle ricompense

Riscatta le ricompense in sospeso, siano esse Steem, SBD o VESTS.

```javascript
steem.broadcast.claimRewardBalanceAsync(wif, account, reward_steem, reward_sbd, reward_vests).then(function(data) {
  console.log(data);
});
```

**Descrizione dei parametri:**

| Parametro | Tipo di dato | Descrizione |
|---------|--------|-----------|
| wif | string | Usa steem.auth.toWif(user, pass, type) |
| account | string | Un nome utente Steem |
| reward_steem | string | Saldo tipo "0.000 STEEM" |
| reward_sbd | string | Saldo tipo "0.000 SBD" |
| reward_vests | string | Saldo tipo "0.000006 VESTS" |

### Multisig

Puoi usare la multisignature per trasmettere in broadcast un'operazione.

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

### Serializzazione delle transazioni (binaria)

Broadcast e firma usano un **formato di transazione binario** compatibile con il protocollo Steem (stile FC). Il serializzatore si trova in `src/auth/serializer/transaction.ts` ed è usato internamente da `steem.auth.signTransaction` e `steem.broadcast.sendAsync`.

**Uso**

- **Per firma / digest**: `steem.auth.serializeTransaction(trx)` — restituisce il `Buffer` che viene hashato per la firma. È l'API pubblica del serializzatore binario; `steem.auth.transaction.toBuffer(trx)` è l'entry point interno equivalente.

```javascript
// The public serializer (preferred for app code):
const buf = steem.auth.serializeTransaction(trx); // Buffer
```
- **Forma della transazione**: `trx` deve includere `ref_block_num`, `ref_block_prefix`, `expiration`, `operations` (array di `[opType, opData]`) e facoltativamente `extensions` e `signatures`.

**Copertura del serializzatore**

Tutti i tipi di operazione Steem usati in `operations` sono supportati (indici dei tipi 0–54), tra cui:

- **Contenuti e social**: vote, comment, delete_comment, comment_options, custom_json
- **Account e autorità**: account_create, account_update, account_update2, account_create_with_delegation, create_claimed_account, request_account_recovery, recover_account, change_recovery_account, reset_account, set_reset_account, decline_voting_rights
- **Trasferimenti e vesting**: transfer, transfer_to_vesting, withdraw_vesting, set_withdraw_vesting_route, transfer_to_savings, transfer_from_savings, cancel_transfer_from_savings, delegate_vesting_shares
- **Mercato e conversione**: limit_order_create, limit_order_create2, limit_order_cancel, feed_publish, convert, fill_order
- **Escrow**: escrow_transfer, escrow_dispute, escrow_release, escrow_approve
- **Ricompense e sistema**: claim_reward_balance, claim_reward_balance2, comment_reward, liquidity_reward, interest, fill_vesting_withdraw, fill_convert_request, fill_transfer_from_savings
- **Witness e custom**: pow, pow2, witness_update, witness_set_properties, account_witness_vote, account_witness_proxy, custom, custom_binary

L'ordine dei campi e la codifica (asset, autorità, tempo, extensions) seguono lo stesso layout del protocollo C++ FC_REFLECT / [steemutil](https://github.com/steemit/steemutil). Fixture cross-linguaggio sotto `test/fixtures/serializer/` sono usate, dove applicabile, per mantenere l'output JS allineato con l'encoder di steemutil.

**Note di compatibilità**

- Per i campi importo usa stringhe di asset **STEEM / SBD / VESTS** (es. `"1.000 STEEM"`).
- Autorità: `owner` / `active` / `posting` usano `weight_threshold`, `account_auths` e `key_auths` (array di `[key, weight]`); le chiavi pubbliche come stringhe STM….
- I campi facoltativi (es. `owner` in account_update) sono codificati con un byte di presenza dove il protocollo lo richiede.
- Il supporto del serializzatore **non implica** un wrapper di alto livello `steem.broadcast.*`, una normalizzazione JSON o una gestione dei metadati solo come stringhe per ogni operazione elencata sopra.


## Prossimi passi

- Snippet end-to-end per voto / trasferimento / pubblicazione: [Primi passi — esempi d'uso](/it/tutorials/steem-js/index.html#usage-examples).
- Firmare e verificare transazioni a mano: [Chiamate firmate e verifica delle firme](/tutorials/steem-js/signed-calls.html).
