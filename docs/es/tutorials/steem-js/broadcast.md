---
title: steem-js — operaciones de broadcast
description: El catálogo completo de broadcast de steem-js — patrones de promesas y callbacks, todas las operaciones de broadcast, multisignatura y serialización binaria de transacciones.
---

# steem-js: Operaciones de broadcast

El espacio de nombres `steem.broadcast` provoca cambios permanentes en la blockchain: votos, transferencias, posts, operaciones de witness y más. Esta página recoge los ejemplos de broadcast completos de la documentación de [steem-js](https://github.com/steemit/steem-js); la lectura de datos de la cadena se cubre en [Lectura de datos de la cadena](/es/tutorials/steem-js/read-api.html).

> Los detalles en la red de cada operación están documentados en la [referencia de operaciones de broadcast](/es/api/broadcast_ops/) generada.

## API de broadcast

## API de broadcast

### Difundir un bloque

Difunde un nuevo bloque en la blockchain de Steem.

```javascript
steem.api.broadcastBlockAsync(blockObject).then(function(data) {
  console.log(data);
});
```

### Difusión síncrona de una transacción

```javascript
steem.api.broadcastTransactionSynchronousAsync(trx).then(function(result) {
  console.log(result);
});
```

## Operaciones de broadcast

## Operaciones de broadcast

Los métodos `steem.broadcast` provocan cambios permanentes en la blockchain.

### Soporte de Promise

Todos los métodos de broadcast admiten los patrones de callback y de Promise. Puedes usar cualquiera de los dos:

#### Patrón Promise (recomendado)

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

#### Patrón de callback (obsoleto)

```javascript
steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
  if (err) {
    console.error(err);
  } else {
    console.log(result);
  }
});
```

### Crear cuenta

```javascript
steem.broadcast.accountCreateAsync(wif, fee, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Crear cuenta con delegación

```javascript
steem.broadcast.accountCreateWithDelegationAsync(wif, fee, delegation, creator, newAccountName, owner, active, posting, memoKey, jsonMetadata, extensions).then(function(result) {
  console.log(result);
});
```

### Delegar acciones de vesting

Delega STEEM Power (SP), denominado en acciones de vesting (VESTS), de un `delegator` a un `delegatee`. Requiere la clave privada WIF del delegante. Fija la delegación en 0 para anularla.

```javascript
steem.broadcast.delegateVestingSharesAsync(wif, delegator, delegatee, vesting_shares).then(function(result) {
  console.log(result);
});
```

### Actualizar cuenta

```javascript
steem.broadcast.accountUpdateAsync(wif, account, owner, active, posting, memoKey, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Proxy de voto para witness

```javascript
steem.broadcast.accountWitnessProxyAsync(wif, account, proxy).then(function(result) {
  console.log(result);
});
```

### Votar por un witness

```javascript
steem.broadcast.accountWitnessVoteAsync(wif, account, witness, approve).then(function(result) {
  console.log(result);
});
```

### Cambiar la cuenta de recuperación

```javascript
steem.broadcast.changeRecoveryAccountAsync(wif, accountToRecover, newRecoveryAccount, extensions).then(function(result) {
  console.log(result);
});
```

### Comentario

```javascript
steem.broadcast.commentAsync(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata).then(function(result) {
  console.log(result);
});
```

### Opciones del comentario

```javascript
steem.broadcast.commentOptionsAsync(wif, author, permlink, maxAcceptedPayout, percentSteemDollars, allowVotes, allowCurationRewards, extensions).then(function(result) {
  console.log(result);
});
```

El parámetro `extensions` admite la extensión de beneficiarios (tag 0). Pasa un array de `[tag, value]`, p. ej. `[[0, { beneficiaries: [{ account: 'foo', weight: 1000 }, { account: 'bar', weight: 5000 }] }]]`. Los beneficiarios se ordenan automáticamente por nombre de cuenta antes de la serialización, para cumplir el protocolo de Steem.

### Conversión

```javascript
steem.broadcast.convertAsync(wif, owner, requestid, amount).then(function(result) {
  console.log(result);
});
```

### Operación personalizada

```javascript
steem.broadcast.customAsync(wif, requiredAuths, id, data).then(function(result) {
  console.log(result);
});
```

### JSON personalizado

```javascript
steem.broadcast.customJsonAsync(wif, requiredAuths, requiredPostingAuths, id, json).then(function(result) {
  console.log(result);
});
```

### Eliminar el comentario

```javascript
steem.broadcast.deleteCommentAsync(wif, author, permlink).then(function(result) {
  console.log(result);
});
```

### Operaciones de escrow

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

### Obtener el escrow

```javascript
steem.api.getEscrowAsync(from, escrowId).then(function(data) {
  console.log(data);
});
```

### Publicar el precio de feed

```javascript
steem.broadcast.feedPublishAsync(wif, publisher, exchangeRate).then(function(result) {
  console.log(result);
});
```

### Operaciones de órdenes limitadas

```javascript
// Limit Order Cancel
steem.broadcast.limitOrderCancelAsync(wif, owner, orderid);

// Limit Order Create
steem.broadcast.limitOrderCreateAsync(wif, owner, orderid, amountToSell, minToReceive, fillOrKill, expiration);

// Limit Order Create2
steem.broadcast.limitOrderCreate2Async(wif, owner, orderid, amountToSell, exchangeRate, fillOrKill, expiration);
```

**Descripción de parámetros de órdenes limitadas:**

| Parámetro | Descripción | Tipo de dato | Notas |
|---|---|---|---|
| wif | Clave privada activa | String | |
| owner | Nombre de la cuenta | String | Sin símbolo @ inicial |
| orderid | Número de orden definido por el usuario | Integer | Se usa para cancelar órdenes |
| amountToSell | Cantidad a vender | String | "X.XXX ASSET" debe tener 3 decimales, p. ej. "25.100 SBD" |
| minToReceive | Cantidad deseada | String | "X.XXX ASSET" debe tener 3 decimales, p. ej. "20.120 STEEM" |
| fillOrKill | Ejecutar la orden con el libro de órdenes actual o anularla | Boolean | `false` coloca la orden en el libro de órdenes hasta que se cancele, se ejecute o se alcance la hora de expiración |
| expiration | Momento en que expira la orden | Integer | Unidad: milisegundos. Cero es la época UNIX |

### Recuperación de cuenta

```javascript
// Recover Account
steem.broadcast.recoverAccountAsync(wif, accountToRecover, newOwnerAuthority, recentOwnerAuthority, extensions);

// Request Account Recovery
steem.broadcast.requestAccountRecoveryAsync(wif, recoveryAccount, accountToRecover, newOwnerAuthority, extensions);
```

### Operaciones de transferencia

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

**Descripción de parámetros de transferencias:**

| Parámetro | Descripción | Tipo de dato | Notas |
|---|---|---|---|
| wif | Clave privada activa de la cuenta `from` | String | |
| from | Nombre de la cuenta de la que se extrae el activo | String | Sin símbolo @ inicial |
| to | Nombre de la cuenta en la que se deposita el activo | String | Sin símbolo @ inicial |
| amount | Cantidad de activo a transferir | String | "X.XXX ASSET" debe tener 3 decimales, p. ej. "5.150 SBD" |

### Votar

```javascript
steem.broadcast.voteAsync(wif, voter, author, permlink, weight).then(function(result) {
  console.log(result);
});
```

### Retiro de vesting

```javascript
steem.broadcast.withdrawVestingAsync(wif, account, vestingShares).then(function(result) {
  console.log(result);
});
```

### Actualizar el witness

```javascript
steem.broadcast.witnessUpdateAsync(wif, owner, url, blockSigningKey, props, fee).then(function(result) {
  console.log(result);
});
```

### Establecer la ruta de retiro de vesting

```javascript
steem.broadcast.setWithdrawVestingRouteAsync(wif, fromAccount, toAccount, percent, autoVest).then(function(result) {
  console.log(result);
});
```

### Obtener las rutas de retiro

Obtiene las rutas de retiro (retiros de STEEM Power).

```javascript
steem.api.getWithdrawRoutesAsync(account, withdrawRouteType).then(function(data) {
  console.log(data);
});
```

### Reclamar el saldo de recompensas

Reclama las recompensas pendientes, ya sea en Steem, SBD o VESTS.

```javascript
steem.broadcast.claimRewardBalanceAsync(wif, account, reward_steem, reward_sbd, reward_vests).then(function(data) {
  console.log(data);
});
```

**Descripción de parámetros:**

| Parámetro | Tipo de dato | Descripción |
|---------|--------|-----------|
| wif | string | Usa steem.auth.toWif(user, pass, type) |
| account | string | Un nombre de usuario de Steem |
| reward_steem | string | Saldo tipo "0.000 STEEM" |
| reward_sbd | string | Saldo tipo "0.000 SBD" |
| reward_vests | string | Saldo tipo "0.000006 VESTS" |

### Multifirma

Puedes usar la multisignatura para difundir una operación.

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

### Serialización de transacciones (binaria)

El broadcast y la firma usan un **formato de transacción binario** compatible con el protocolo de Steem (estilo FC). El serializador vive en `src/auth/serializer/transaction.ts` y lo usan internamente `steem.auth.signTransaction` y `steem.broadcast.sendAsync`.

**Uso**

- **Para firma / digest**: `steem.auth.serializeTransaction(trx)` — devuelve el `Buffer` que se hashea para la firma. Es la API pública del serializador binario; `steem.auth.transaction.toBuffer(trx)` es el punto de entrada interno equivalente.

```javascript
// The public serializer (preferred for app code):
const buf = steem.auth.serializeTransaction(trx); // Buffer
```
- **Forma de la transacción**: `trx` debe incluir `ref_block_num`, `ref_block_prefix`, `expiration`, `operations` (array de `[opType, opData]`) y, opcionalmente, `extensions` y `signatures`.

**Cobertura del serializador**

Todos los tipos de operación de Steem usados en `operations` están admitidos (índices de tipos 0–54), entre ellos:

- **Contenido y social**: vote, comment, delete_comment, comment_options, custom_json
- **Cuentas y autoridad**: account_create, account_update, account_update2, account_create_with_delegation, create_claimed_account, request_account_recovery, recover_account, change_recovery_account, reset_account, set_reset_account, decline_voting_rights
- **Transferencias y vesting**: transfer, transfer_to_vesting, withdraw_vesting, set_withdraw_vesting_route, transfer_to_savings, transfer_from_savings, cancel_transfer_from_savings, delegate_vesting_shares
- **Mercado y conversión**: limit_order_create, limit_order_create2, limit_order_cancel, feed_publish, convert, fill_order
- **Escrow**: escrow_transfer, escrow_dispute, escrow_release, escrow_approve
- **Recompensas y sistema**: claim_reward_balance, claim_reward_balance2, comment_reward, liquidity_reward, interest, fill_vesting_withdraw, fill_convert_request, fill_transfer_from_savings
- **Witness y custom**: pow, pow2, witness_update, witness_set_properties, account_witness_vote, account_witness_proxy, custom, custom_binary

El orden de los campos y la codificación (activos, autoridades, tiempo, extensions) siguen la misma disposición que el protocolo C++ FC_REFLECT / [steemutil](https://github.com/steemit/steemutil). Los fixtures entre lenguajes bajo `test/fixtures/serializer/` se usan, cuando procede, para mantener la salida de JS alineada con el codificador de steemutil.

**Notas de compatibilidad**

- Para los campos de cantidad usa cadenas de activos **STEEM / SBD / VESTS** (p. ej. `"1.000 STEEM"`).
- Autoridades: `owner` / `active` / `posting` usan `weight_threshold`, `account_auths` y `key_auths` (array de `[key, weight]`); las claves públicas como cadenas STM….
- Los campos opcionales (p. ej. `owner` en account_update) se codifican con un byte de presencia cuando el protocolo lo exige.
- El soporte del serializador **no implica** un envoltorio de alto nivel `steem.broadcast.*`, una normalización JSON ni una gestión de metadatos solo como cadenas para cada una de las operaciones listadas arriba.


## Próximos pasos

- Fragmentos de extremo a extremo de voto / transferencia / publicación: [Primeros pasos — ejemplos de uso](/es/tutorials/steem-js/index.html#usage-examples).
- Firmar y verificar transacciones a mano: [Llamadas firmadas y verificación de firmas](/tutorials/steem-js/signed-calls.html).
