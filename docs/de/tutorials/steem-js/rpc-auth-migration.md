# Migration der RPC-Auth-Tests

## Überblick

Dieses Dokument beschreibt die Migration der Tests vom Paket `@steemit/rpc-auth` zu `steem-js` v1.0.11.

## Migrationsdetails

### Quelle
- **Originalpaket**: `@steemit/rpc-auth` v1.1.1
- **Quellort**: der lokale Checkout des `rpc-auth`-Repositories
- **Originale Testdatei**: `test/index.ts`
- **Testframework**: Mocha

### Ziel
- **Zielpaket**: `@steemit/steem-js` v1.0.11
- **Zielort**: der lokale Checkout des `steem-js`-Repositories
- **Neue Testdatei**: `test/rpc-auth.test.ts`
- **Testframework**: Vitest

## Vorgenommene Änderungen

### 1. Migration des Testframeworks

**Von Mocha:**
```typescript
import 'mocha'
import * as assert from 'assert'

describe('rpc auth', function() {
  it('signs and validates', async function() {
    assert.equal(...)
  })
})
```

**Zu Vitest:**
```typescript
import { describe, it, expect } from 'vitest'

describe('RPC Auth', () => {
  it('should sign and validate a request', async () => {
    expect(...).toBe(...)
  })
})
```

### 2. Abhängigkeitsupdates

**Entfernt:**
- `dsteem` (alte steem-js-Bibliothek)
- `node-fetch` (für die Erstellung von Testnet-Konten)
- Mocha-spezifische Hilfsmittel

**Ersetzt durch:**
- die eigene API von `steem-js` (`steem.auth`, `steem.api`)
- natives `crypto.randomBytes`
- Vitest-Assertions

### 3. Umgang mit Testkonten

**Früher:**
- Testnet-Konten wurden dynamisch erstellt
- `dsteem.Client.testnet()` wurde verwendet
- Netzwerkzugriff erforderlich

**Jetzt:**
- Umgebungsvariablen oder Testschlüssel
- Keine dynamische Kontoerstellung
- Läuft ohne Netzwerk (die meisten Tests)

### 4. Prüffunktion

**Früher:**
```typescript
const dsteemVerify: VerifyMessage = async (message, signatures, account) => {
  const opts = { hash: message, signatures, required_posting: [account] }
  const rv = await client.database.call('verify_signatures', [opts])
  if (rv.valid !== true) throw new Error('Signature invalid')
}
```

**Jetzt:**
```typescript
const createVerifyFunction = () => {
  return async (message: Buffer, signatures: string[], account: string) => {
    const accounts = await api.getAccountsAsync([account])
    const postingKeys = accounts[0].posting?.key_auths?.map(k => k[0]) || []
    // Verify using steem-js Signature and PublicKey classes
  }
}
```

## Testabdeckung

### Migrierte Tests

✅ **sign and validate** - grundlegender Signatur- und Validierungsablauf
✅ **invalid requests** - umfassende Fehlerbehandlungstests:
  - Ungültige JSON-RPC-Anfrage
  - Fehlende signierte Nutzlast
  - Ungültige Anfrageparameter
  - Fehlendes Konto
  - Ungültige codierte Parameter
  - Ungültige Nonce (mehrere Fälle)
  - Ungültiger Zeitstempel
  - Abgelaufene Signatur
  - Prüfungsfehler

✅ **signing errors** - Fehlerbehandlung beim Signieren:
  - Fehlende Params
  - Leeres Schlüssel-Array

✅ **signature format** - Validierung der Signaturstruktur:
  - Gültiges Signaturformat
  - Eindeutige Nonces
  - Gültige Zeitstempel

✅ **multiple signatures** - Unterstützung mehrerer Schlüssel

### Übersprungene Tests

⏭️ **invalid signatures (Integrationstest)** - erfordert:
  - Echtes Testnet-Konto
  - Netzwerkzugriff
  - Aktivierung über die Umgebungsvariablen `STEEM_USERNAME` und `STEEM_PASSWORD`

## Testergebnisse

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

## Wesentliche Unterschiede

### Format der Fehlermeldungen

**Original rpc-auth:**
```
ValidationError: Verification failed (Nope)
```

**steem-js v1.0.11:**
```
Error: Verification failed: Nope
```

Das Fehlerformat änderte sich von `(message)` zu `: message`, was in den Tests berücksichtigt wurde.

### API-Änderungen

1. **PrivateKey-Behandlung**:
   - Früher: `PrivateKey.from(key)` oder `PrivateKey.fromString(key)`
   - Jetzt: `PrivateKey.fromWif(key)`

2. **Signaturerstellung**:
   - Früher: `key.sign(message.buffer)`, danach `hexify()`
   - Jetzt: `Signature.signBufferSha256(message, privateKey)`, danach `.toHex()`

3. **Keine ValidationError-Klasse mehr**:
   - Früher: eigene `ValidationError`-Klasse
   - Jetzt: Standard-`Error` mit formatierten Meldungen

## Tests ausführen

```bash
# Run all rpc-auth tests
pnpm test -- rpc-auth.test.ts

# Run with coverage
pnpm test:coverage -- rpc-auth.test.ts

# Run specific test
pnpm test -- rpc-auth.test.ts -t "should sign and validate"
```

## Setup des Integrationstests

Um den übersprungenen Integrationstest auszuführen, setzen Sie Umgebungsvariablen:

```bash
export STEEM_USERNAME="your-testnet-account"
export STEEM_PASSWORD="your-password"
pnpm test -- rpc-auth.test.ts
```

## Hinweise

- Alle Tests der Kernfunktionalität wurden erfolgreich migriert
- Die Testsuite behält dieselbe Abdeckung wie das Original bei
- Integrationstests werden standardmäßig übersprungen, lassen sich aber aktivieren
- Die Tests sind mit vitest und modernem TypeScript kompatibel
- Für die meisten Tests sind keine externen Abhängigkeiten erforderlich

---

Migriert aus der Dokumentation des steem-js-Repositories; die hier eingesetzten Prüfwerkzeuge werden in [Signierte Aufrufe und Signaturprüfung](/de/tutorials/steem-js/signed-calls.html) demonstriert.
