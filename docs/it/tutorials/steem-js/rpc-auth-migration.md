# Migrazione dei test di autenticazione RPC

## Panoramica

Questo documento descrive la migrazione dei test dal pacchetto `@steemit/rpc-auth` a `steem-js` v1.0.11.

## Dettagli della migrazione

### Origine
- **Pacchetto originale**: `@steemit/rpc-auth` v1.1.1
- **Posizione dei sorgenti**: la copia locale del repository `rpc-auth`
- **File di test originale**: `test/index.ts`
- **Framework di test**: Mocha

### Destinazione
- **Pacchetto di destinazione**: `@steemit/steem-js` v1.0.11
- **Posizione di destinazione**: la copia locale del repository `steem-js`
- **Nuovo file di test**: `test/rpc-auth.test.ts`
- **Framework di test**: Vitest

## Modifiche apportate

### 1. Migrazione del framework di test

**Da Mocha:**
```typescript
import 'mocha'
import * as assert from 'assert'

describe('rpc auth', function() {
  it('signs and validates', async function() {
    assert.equal(...)
  })
})
```

**A Vitest:**
```typescript
import { describe, it, expect } from 'vitest'

describe('RPC Auth', () => {
  it('should sign and validate a request', async () => {
    expect(...).toBe(...)
  })
})
```

### 2. Aggiornamento delle dipendenze

**Rimosse:**
- `dsteem` (vecchia libreria steem-js)
- `node-fetch` (per la creazione di account sul testnet)
- utilità specifiche di Mocha

**Sostituite con:**
- le API di `steem-js` (`steem.auth`, `steem.api`)
- `crypto.randomBytes` nativo
- asserzioni Vitest

### 3. Gestione degli account di test

**Prima:**
- Account del testnet creati dinamicamente
- Uso di `dsteem.Client.testnet()`
- Accesso alla rete necessario

**Ora:**
- Uso di variabili d'ambiente o chiavi di test
- Nessuna creazione dinamica di account
- È possibile eseguire senza rete (la maggior parte dei test)

### 4. Funzione di verifica

**Prima:**
```typescript
const dsteemVerify: VerifyMessage = async (message, signatures, account) => {
  const opts = { hash: message, signatures, required_posting: [account] }
  const rv = await client.database.call('verify_signatures', [opts])
  if (rv.valid !== true) throw new Error('Signature invalid')
}
```

**Ora:**
```typescript
const createVerifyFunction = () => {
  return async (message: Buffer, signatures: string[], account: string) => {
    const accounts = await api.getAccountsAsync([account])
    const postingKeys = accounts[0].posting?.key_auths?.map(k => k[0]) || []
    // Verify using steem-js Signature and PublicKey classes
  }
}
```

## Copertura dei test

### Test migrati

✅ **sign and validate** - flusso base di firma e validazione
✅ **invalid requests** - test completi di gestione degli errori:
  - Richiesta JSON RPC non valida
  - Payload firmato mancante
  - Parametri della richiesta non validi
  - Account mancante
  - Parametri codificati non validi
  - Nonce non valido (più casi)
  - Timestamp non valido
  - Firma scaduta
  - Verifica fallita

✅ **signing errors** - gestione degli errori durante la firma:
  - Params mancanti
  - Array di chiavi vuoto

✅ **signature format** - validazione della struttura della firma:
  - Formato della firma valido
  - Nonce univoci
  - Timestamp validi

✅ **multiple signatures** - supporto per più chiavi

### Test ignorati

⏭️ **invalid signatures (test di integrazione)** - richiede:
  - Un account reale sul testnet
  - Accesso alla rete
  - Abilitazione tramite le variabili d'ambiente `STEEM_USERNAME` e `STEEM_PASSWORD`

## Risultati dei test

```
✓ test/rpc-auth.test.ts (19 tests | 1 skipped)
  ✓ RPC Auth > sign and validate > should sign and validate a request
  ✓ RPC Auth > invalid requests > should handle invalid JSON RPC request
  ✓ RPC Auth > invalid requests > should handle missing signed payload
  ✓ RPC Auth > invalid requests > should handle invalid request params
  ✓ RPC Auth > invalid requests > should handle missing account
  ✓ RPC Auth > invalid requests > should handle invalid encoded params
  ✓ RPC Auth > invalid requests > should handle invalid nonce (not a string)
  ✓ RPC Auth > invalid requests > should handle invalid nonce (wrong length)
  ✓ RPC Auth > invalid requests > should handle invalid nonce (wrong format)
  ✓ RPC Auth > invalid requests > should handle invalid timestamp
  ✓ RPC Auth > invalid requests > should handle expired signature
  ✓ RPC Auth > invalid requests > should handle verification failure
  ✓ RPC Auth > signing errors > should handle invalid requests when signing
  ✓ RPC Auth > signing errors > should handle empty keys array
  ✓ RPC Auth > signature format > should generate valid signature format
  ✓ RPC Auth > signature format > should generate unique nonces for each request
  ✓ RPC Auth > signature format > should generate valid timestamps
  ✓ RPC Auth > multiple signatures > should support multiple keys
  ↓ RPC Auth > invalid signatures > should handle invalid signatures (integration test)
```

## Differenze principali

### Formato dei messaggi di errore

**rpc-auth originale:**
```
ValidationError: Verification failed (Nope)
```

**steem-js v1.0.11:**
```
Error: Verification failed: Nope
```

Il formato dell'errore è cambiato da `(message)` a `: message`, come riflesso nei test.

### Modifiche alle API

1. **Gestione di PrivateKey**:
   - Prima: `PrivateKey.from(key)` o `PrivateKey.fromString(key)`
   - Ora: `PrivateKey.fromWif(key)`

2. **Creazione della firma**:
   - Prima: `key.sign(message.buffer)` poi `hexify()`
   - Ora: `Signature.signBufferSha256(message, privateKey)` poi `.toHex()`

3. **Niente più classe ValidationError**:
   - Prima: classe `ValidationError` personalizzata
   - Ora: `Error` standard con messaggi formattati

## Esecuzione dei test

```bash
# Run all rpc-auth tests
pnpm test -- rpc-auth.test.ts

# Run with coverage
pnpm test:coverage -- rpc-auth.test.ts

# Run specific test
pnpm test -- rpc-auth.test.ts -t "should sign and validate"
```

## Preparazione del test di integrazione

Per eseguire il test di integrazione ignorato, impostare le variabili d'ambiente:

```bash
export STEEM_USERNAME="your-testnet-account"
export STEEM_PASSWORD="your-password"
pnpm test -- rpc-auth.test.ts
```

## Note

- Tutti i test delle funzionalità principali sono stati migrati con successo
- La suite di test mantiene la stessa copertura dell'originale
- I test di integrazione sono ignorati per impostazione predefinita ma possono essere abilitati
- I test sono compatibili con vitest e TypeScript moderno
- Per la maggior parte dei test non servono dipendenze esterne

---

Migrato dalla documentazione del repository steem-js; le utilità di verifica che esercita sono dimostrate in [Chiamate firmate e verifica delle firme](/it/tutorials/steem-js/signed-calls.html).
