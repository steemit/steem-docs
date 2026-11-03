---
title: steem-js — Broadcast-Operationen senden
description: Der vollständige Broadcast-Katalog von steem-js — Promise- und Callback-Muster, jede Broadcast-Operation, Multisig und binäre Transaktionsserialisierung.
---

# steem-js: Broadcast-Operationen senden

Der Namespace `steem.broadcast` verursacht dauerhafte Änderungen an der Blockchain: Votes, Überweisungen, Beiträge, Witness-Operationen und mehr. Diese Seite enthält die vollständigen Broadcast-Beispiele aus der Dokumentation von [steem-js](https://github.com/steemit/steem-js); das Lesen von Chain-Daten ist unter [Chain-Daten lesen](/de/tutorials/steem-js/read-api.html) beschrieben.

> Die Wire-Details jeder Operation sind in der generierten [Broadcast-Operations-Referenz](/de/api/broadcast_ops/) dokumentiert.

## Broadcast-API

## Broadcast-API

### Block übertragen

Broadcastet einen neuen Block auf der Steem-Blockchain.

```javascript
steem.api.broadcastBlockAsync(blockObject).then(function(data) {
  console.log(data);
});
```

### Transaktion synchron übertragen

```javascript
steem.api.broadcastTransactionSynchronousAsync(trx).then(function(result) {
  console.log(result);
});
```

## Broadcast-Operationen

## Broadcast-Operationen

Die Methoden `steem.broadcast` verursachen dauerhafte Änderungen an der Blockchain.

### Promise-Unterstützung

Alle Broadcast-Methoden unterstützen Callback- und Promise-Muster. Beide Ansätze sind möglich:

#### Promise-Muster (empfohlen)

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

#### Callback-Muster (veraltet)

```javascript
steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
});
```

### Konto erstellen

```javascript
steem.broadcast.accountCreateAsync(wif, fee, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Konto mit Delegierung erstellen

```javascript
steem.broadcast.accountCreateWithDelegationAsync(wif, fee, delegation, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata, extensions).then(function(result) {
  console.log(result);
});
```

### Vesting-Anteile delegieren

Delegiert STEEM Power (SP), angegeben in Vesting-Anteilen (VESTS), von einem `delegator` an einen `delegatee`. Erfordert den privaten WIF-Schlüssel des Delegators. Setzen Sie die Delegierung auf 0, um sie zurückzunehmen.

```javascript
steem.broadcast.delegateVestingSharesAsync(wif, delegator, delegatee, vesting_shares).then(function(result) {
  console.log(result);
});
```

### Konto aktualisieren

```javascript
steem.broadcast.accountUpdateAsync(wif, account, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Witness-Voting-Proxy

```javascript
steem.broadcast.accountWitnessProxyAsync(wif, account, proxy).then(function(result) {
  console.log(result);
});
```

### Für Witness voten

```javascript
steem.broadcast.accountWitnessVoteAsync(wif, account, witness, approve).then(function(result) {
  console.log(result);
});
```

### Wiederherstellungskonto ändern

```javascript
steem.broadcast.changeRecoveryAccountAsync(wif, accountToRecover, newRecoveryAccount, extensions).then(function(result) {
  console.log(result);
});
```

### Kommentar

```javascript
steem.broadcast.commentAsync(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Kommentaroptionen

```javascript
steem.broadcast.commentOptionsAsync(wif, author, permlink, maxAcceptedPayout, percentSteemDollars, allowVotes, allowCurationRewards, extensions).then(function(result) {
  console.log(result);
});
```

Der Parameter `extensions` unterstützt die Beneficiaries-Erweiterung (Tag 0). Übergeben Sie ein Array aus `[tag, value]`, z. B. `[[0, { beneficiaries: [{ account: 'foo', weight: 1000 }, { account: 'bar', weight: 5000 }] }]]`. Zur Einhaltung des Steem-Protokolls werden Beneficiaries vor der Serialisierung automatisch nach Kontonamen sortiert.

### Konvertierung

```javascript
steem.broadcast.convertAsync(wif, owner, requestid, amount).then(function(result) {
  console.log(result);
});
```

### Benutzerdefinierte Operation

```javascript
steem.broadcast.customAsync(wif, requiredAuths, id, data).then(function(result) {
  console.log(result);
});
```

### Benutzerdefiniertes JSON

```javascript
steem.broadcast.customJsonAsync(wif, requiredAuths, requiredPostingAuths, id, json).then(function(result) {
  console.log(result);
});
```

### Kommentar löschen

```javascript
steem.broadcast.deleteCommentAsync(wif, author, permlink).then(function(result) {
  console.log(result);
});
```

### Escrow-Operationen

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

### Escrow abrufen

```javascript
steem.api.getEscrowAsync(from, escrowId).then(function(data) {
  console.log(data);
});
```

### Feed-Preis veröffentlichen

```javascript
steem.broadcast.feedPublishAsync(wif, publisher, exchangeRate).then(function(result) {
  console.log(result);
});
```

### Limit-Order-Operationen

```javascript
// Limit Order Cancel
steem.broadcast.limitOrderCancelAsync(wif, owner, orderid);

// Limit Order Create
steem.broadcast.limitOrderCreateAsync(wif, owner, orderid, amountToSell, minToReceive, fillOrKill, expiration);

// Limit Order Create2
steem.broadcast.limitOrderCreate2Async(wif, owner, orderid, amountToSell, exchangeRate, fillOrKill, expiration);
```

**Parameterbeschreibung für Limit-Orders:**

| Parameter | Beschreibung | Datentyp | Hinweise |
|---|---|---|---|
| wif | Privater Active-Key | String | |
| owner | Kontoname | String | Ohne führendes @-Zeichen |
| orderid | Vom Benutzer festgelegte Auftragsnummer | Integer | Dient dem Stornieren von Orders |
| amountToSell | Zu verkaufender Betrag | String | "X.XXX ASSET" muss 3 Dezimalstellen haben, z. B. "25.100 SBD" |
| minToReceive | Gewünschter Betrag | String | "X.XXX ASSET" muss 3 Dezimalstellen haben, z. B. "20.120 STEEM" |
| fillOrKill | Order aus dem aktuellen Orderbuch ausführen oder verfallen lassen | Boolean | `false` stellt die Order ins Orderbuch, bis sie storniert, ausgeführt wird oder die Ablaufzeit erreicht ist |
| expiration | Ablaufzeit der Order | Integer | Einheit Millisekunden. Null ist die UNIX-Epoche |

### Kontowiederherstellung

```javascript
// Recover Account
steem.broadcast.recoverAccountAsync(wif, accountToRecover, newOwnerAuthority, recentOwnerAuthority, extensions);

// Request Account Recovery
steem.broadcast.requestAccountRecoveryAsync(wif, recoveryAccount, accountToRecover, newOwnerAuthority, extensions);
```

### Transfer-Operationen

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

**Parameterbeschreibung für Überweisungen:**

| Parameter | Beschreibung | Datentyp | Hinweise |
|---|---|---|---|
| wif | Privater Active-Key des `from`-Kontos | String | |
| from | Kontoname, vom dem das Asset abgebucht wird | String | Ohne führendes @-Zeichen |
| to | Kontoname, auf den das Asset gebucht wird | String | Ohne führendes @-Zeichen |
| amount | Zu überweisender Asset-Betrag | String | "X.XXX ASSET" muss 3 Dezimalstellen haben, z. B. "5.150 SBD" |

### Voten

```javascript
steem.broadcast.voteAsync(wif, voter, author, permlink, weight).then(function(result) {
  console.log(result);
});
```

### Vesting abheben

```javascript
steem.broadcast.withdrawVestingAsync(wif, account, vestingShares).then(function(result) {
  console.log(result);
});
```

### Witness aktualisieren

```javascript
steem.broadcast.witnessUpdateAsync(wif, owner, url, blockSigningKey, props, fee).then(function(result) {
  console.log(result);
});
```

### Vesting-Abhebe-Route festlegen

```javascript
steem.broadcast.setWithdrawVestingRouteAsync(wif, fromAccount, toAccount, percent, autoVest).then(function(result) {
  console.log(result);
});
```

### Abhebe-Routen abrufen

Holt Auszahlungsrouten (STEEM-Power-Abhebungen).

```javascript
steem.api.getWithdrawRoutesAsync(account, withdrawRouteType).then(function(data) {
  console.log(data);
});
```

### Reward-Balance einfordern

Fordert offene Belohnungen an — ob Steem, SBD oder VESTS.

```javascript
steem.broadcast.claimRewardBalanceAsync(wif, account, reward_steem, reward_sbd, reward_vests).then(function(data) {
  console.log(data);
});
```

**Parameterbeschreibung:**

| Parameter | Datentyp | Beschreibung |
|---------|--------|-----------|
| wif | string | Verwenden Sie steem.auth.toWif(user, pass, type) |
| account | string | Ein Steem-Benutzername |
| reward_steem | string | Guthaben wie "0.000 STEEM" |
| reward_sbd | string | Guthaben wie "0.000 SBD" |
| reward_vests | string | Guthaben wie "0.000006 VESTS" |

### Multisig

Sie können Multisignatur verwenden, um eine Operation zu broadcasten.

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

### Transaktionsserialisierung (binär)

Broadcast und Signierung verwenden ein **binäres Transaktionsformat**, das mit dem Steem-Protokoll kompatibel ist (FC-Stil). Der Serialisierer liegt in `src/auth/serializer/transaction.ts` und wird intern von `steem.auth.signTransaction` und `steem.broadcast.sendAsync` verwendet.

**Verwendung**

- **Für Signierung / Digest**: `steem.auth.serializeTransaction(trx)` — gibt den `Buffer` zurück, der für die Signatur gehasht wird. Das ist die öffentliche API des binären Serialisierers; `steem.auth.transaction.toBuffer(trx)` ist der gleichwertige interne Einstiegspunkt.

```javascript
// The public serializer (preferred for app code):
const buf = steem.auth.serializeTransaction(trx); // Buffer
```
- **Transaktionsform**: `trx` muss `ref_block_num`, `ref_block_prefix`, `expiration`, `operations` (Array von `[opType, opData]`) enthalten, optional `extensions` und `signatures`.

**Abdeckung des Serialisierers**

Alle in `operations` verwendeten Steem-Operationstypen werden unterstützt (Typindizes 0–54), darunter:

- **Inhalte & Soziales**: vote, comment, delete_comment, comment_options, custom_json
- **Konten & Autorität**: account_create, account_update, account_update2, account_create_with_delegation, create_claimed_account, request_account_recovery, recover_account, change_recovery_account, reset_account, set_reset_account, decline_voting_rights
- **Überweisungen & Vesting**: transfer, transfer_to_vesting, withdraw_vesting, set_withdraw_vesting_route, transfer_to_savings, transfer_from_savings, cancel_transfer_from_savings, delegate_vesting_shares
- **Markt & Konvertierung**: limit_order_create, limit_order_create2, limit_order_cancel, feed_publish, convert, fill_order
- **Escrow**: escrow_transfer, escrow_dispute, escrow_release, escrow_approve
- **Belohnungen & System**: claim_reward_balance, claim_reward_balance2, comment_reward, liquidity_reward, interest, fill_vesting_withdraw, fill_convert_request, fill_transfer_from_savings
- **Witness & Custom**: pow, pow2, witness_update, witness_set_properties, account_witness_vote, account_witness_proxy, custom, custom_binary

Feldreihenfolge und Kodierung (Assets, Autoritäten, Zeit, Extensions) folgen demselben Layout wie das C++-Protokoll FC_REFLECT / [steemutil](https://github.com/steemit/steemutil). Sprachübergreifende Fixtures unter `test/fixtures/serializer/` sorgen dort, wo anwendbar, dafür, dass die JS-Ausgabe mit dem Encoder von steemutil übereinstimmt.

**Kompatibilitätshinweise**

- Verwenden Sie für Betragsfelder Asset-Strings **STEEM / SBD / VESTS** (z. B. `"1.000 STEEM"`).
- Autoritäten: `owner` / `active` / `posting` verwenden `weight_threshold`, `account_auths` und `key_auths` (Array aus `[key, weight]`); öffentliche Schlüssel als STM…-Strings.
- Optionale Felder (z. B. `owner` in account_update) werden, wo das Protokoll es verlangt, mit einem Presence-Byte kodiert.
- Serialisierer-Unterstützung **bedeutet nicht**, dass es für jede oben gelistete Operation einen hochsprachigen `steem.broadcast.*`-Wrapper, JSON-Normalisierung oder eine Metadaten-Verarbeitung nur als Strings gibt.


## Wie es weitergeht

- Ende-zu-Ende-Schnipsel für Vote / Überweisung / Veröffentlichung: [Erste Schritte — Verwendungsbeispiele](/de/tutorials/steem-js/index.html#usage-examples).
- Transaktionen von Hand signieren und prüfen: [Signierte Aufrufe und Signaturprüfung](/tutorials/steem-js/signed-calls.html).
