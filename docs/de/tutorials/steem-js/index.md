---
title: steem-js — Erste Schritte
description: Die Bibliothek @steemit/steem-js installieren und konfigurieren — Browser-Nutzung, config.set, api.setUrl, setOptions, mehrere API-Instanzen, JSON-RPC-Routing und Ende-zu-Ende-Beispiele.
---

# steem-js: Erste Schritte

[steem-js](https://github.com/steemit/steem-js) ist die offizielle JavaScript/TypeScript-Bibliothek für die Steem-Blockchain (npm-Paket `@steemit/steem-js`, aktuell Version 1.2.4). Dieses Tutorial behandelt Installation, Konfiguration und alltägliche Nutzungsmuster; die Inhalte stammen aus der Dokumentation der Bibliothek selbst.

> **v1.0.16+:** Die meisten Lese-Helper von `steem.api` rufen auf dem Knoten **`condenser_api`** auf; zu Namespaces, entfernten Methoden und der modernen Nutzung von `list_*` / `find_*` in `database_api` siehe [API-Routing](#api-routing).

In diesem Leitfaden:

- [Installation](#installation) und [Browser-Nutzung](#browser-usage)
- [Konfiguration](#configuration) — `steem.config.set()`, `steem.api.setUrl()`, `steem.api.setOptions()` und mehrere API-Instanzen
- Überblick über [JSON-RPC](#json-rpc) und [API-Routing](#api-routing)
- [Verwendungsbeispiele](#usage-examples), [TypeScript-Unterstützung](#typescript-support), [Fehlerbehandlung](#error-handling) und [Sicherheitshinweise](#security-notes)

Lese-Helper des API sind unter [Chain-Daten lesen](/de/tutorials/steem-js/read-api.html) beschrieben; Broadcasting findet sich unter [Broadcast-Operationen senden](/de/tutorials/steem-js/broadcast.html); authentifizierte Aufrufe werden unter [Signierte Aufrufe und Signaturprüfung](/tutorials/steem-js/signed-calls.html) beschrieben.

## Installation {#installation}

## Installation

### Voraussetzungen

- **Node.js**: >= 20.19.0 (für die Nutzung in Node.js erforderlich)
- Moderne Browser mit ES6+-Unterstützung (für die Nutzung im Browser)

### npm / pnpm / yarn

```bash
npm install @steemit/steem-js
# or
pnpm install @steemit/steem-js
# or
yarn add @steemit/steem-js
```

### Browser (CDN)

```html
<!-- Production: use minified version (692KB) -->
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.min.js"></script>

<!-- Development: use regular version (1.7MB) for better debugging -->
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.js"></script>
```

---

## Nutzung im Browser {#browser-usage}

```html
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.min.js"></script>
<script>
steem.api.getAccountsAsync(['ned', 'dan']).then(function(accounts) {
    console.log(accounts);
}).catch(function(error) {
    console.error(error);
});
</script>
```


## Konfiguration {#configuration}

## Konfiguration

Die Standardkonfiguration funktioniert mit dem Steem-Netzwerk. Sie lässt sich auch für andere kompatible Netzwerke konfigurieren.

### Globale Konfiguration mit `steem.config.set()`

Die Methode `steem.config.set()` ist der empfohlene Weg, die Bibliothek zu konfigurieren. Sie verwaltet die globale Konfiguration und synchronisiert automatisch die API-Singleton-Instanz.

#### Grundlegende Verwendung

```javascript
// Set multiple configuration options at once
steem.config.set({
  nodes: ['https://api.steemit.com'],
  address_prefix: 'STM',
  chain_id: '0000000000000000000000000000000000000000000000000000000000000000'
});

// Or set individually (key-value pair)
steem.config.set('address_prefix', 'STM');
steem.config.set('chain_id', '0000000000000000000000000000000000000000000000000000000000000000');
```

#### Konfigurationsoptionen

| Option | Typ | Beschreibung | Standardwert |
|--------|------|-------------|---------|
| `nodes` | `string[]` | Array von API-Knoten-URLs. Der erste Knoten dient als primärer Endpunkt. | `['https://api.steemit.com']` |
| `address_prefix` | `string` | Adresspräfix der Blockchain (z. B. 'STM' für Steem, 'TST' für das Testnet). | `'STM'` |
| `chain_id` | `string` | Chain-ID des Blockchain-Netzwerks. | `'0000000000000000000000000000000000000000000000000000000000000000'` |
| `debug` | `boolean` | Debug-Protokollierung aktivieren. | `false` |
| `debug_warnings` | `boolean` | Debug-Warnungen aktivieren. | `false` |

#### Wie `steem.config.set()` funktioniert

Wenn Sie `steem.config.set({ nodes: [...] })` aufrufen:

1. **Speichert die Konfiguration global**: Die Konfigurationswerte werden in der globalen Config-Instanz abgelegt und sind über `steem.config.get()` abrufbar.

2. **Aktualisiert das API-Singleton automatisch**: Der erste Knoten aus dem Array `nodes` wird extrahiert und aktualisiert die URL der Singleton-Instanz `steem.api`. So nutzen alle API-Aufrufe über `steem.api` den konfigurierten Endpunkt.

3. **Synchronisiert den Zustand**: Globale Konfiguration und API-Instanz bleiben im Gleichschritt.

**Beispiel:**

```javascript
// Configure the library
steem.config.set({
  nodes: ['https://api.steemit.com'],
  address_prefix: 'STM'
});

// The steem.api singleton now uses 'https://api.steemit.com' as its endpoint
// All subsequent API calls will use this endpoint
steem.api.getAccountsAsync(['ety001']).then(accounts => {
  console.log(accounts);
});
```

#### Konfiguration abrufen

```javascript
// Get a single configuration value
const chainId = steem.config.get('chain_id');
const nodes = steem.config.get('nodes');
const addressPrefix = steem.config.getString('address_prefix');

// Get all configuration
const allConfig = steem.config.all();
console.log(allConfig);
// Output: { nodes: [...], address_prefix: 'STM', chain_id: '...', ... }

// Type-safe getters
const isDebug = steem.config.getBoolean('debug');
const maxRetries = steem.config.getNumber('max_retries');
```

### Direkte API-Konfiguration

Wenn Sie den API-Endpunkt ändern müssen, ohne die globale Konfiguration anzupassen, können Sie die Methoden der API-Instanz direkt verwenden.

#### `steem.api.setUrl(url: string)`

Ändert die URL des API-Endpunkts direkt, ohne die globale Konfiguration anzupassen. Nützlich, um vorübergehend Endpunkte zu wechseln oder verschiedene Knoten zu testen.

```javascript
// Change API endpoint directly
steem.api.setUrl('https://api.steemit.com');

// This only affects the steem.api singleton instance
// The global config.nodes remains unchanged
```

**Wann einsetzen:**
- vorübergehendes Testen verschiedener API-Endpunkte
- Endpunktwechsel ohne Aktualisierung der globalen Konfiguration
- schnelle Endpunktwechsel zum Debuggen

#### `steem.api.setOptions(options: ApiOptions)`

Bietet mehr Kontrolle über die Konfiguration der API-Instanz. Die Methode erlaubt es, mehrere Optionen auf einmal zu setzen — Transporttyp, Logger und andere erweiterte Einstellungen.

```javascript
// Set multiple API options
steem.api.setOptions({ 
  url: 'https://api.steemit.com',
  transport: 'http',
  logger: {
    log: (...args) => console.log('[API]', ...args)
  }
});
```

**Verfügbare Optionen:**

| Option | Typ | Beschreibung |
|--------|------|-------------|
| `url` | `string` | URL des API-Endpunkts (muss HTTP/HTTPS sein) |
| `transport` | `string` | Transporttyp ('http' ist der einzige unterstützte Wert) |
| `logger` | `object` | Logger-Objekt mit einer `log`-Methode |
| `useTestNet` | `boolean` | Testnet-Modus aktivieren (setzt address_prefix auf 'TST') |
| `fetchMethod` | `function` | Eigene fetch-Implementierung für HTTP-Anfragen |

**Beispiel mit Logger:**

```javascript
steem.api.setOptions({
  url: 'https://api.steemit.com',
  logger: {
    log: (level, ...args) => {
      if (level === 'error') {
        console.error('[Steem API]', ...args);
      } else {
        console.log('[Steem API]', level, ...args);
      }
    }
  }
});
```

#### Unterschiede: `steem.config.set()` vs. `steem.api.setUrl()`

| Methode | Aktualisiert globale Konfiguration | Aktualisiert API-Singleton | Anwendungsfall |
|--------|----------------------|---------------------|----------|
| `steem.config.set({ nodes: [...] })` | ✅ Ja | ✅ Ja (automatisch) | Für den Normalgebrauch empfohlen. Setzt Konfiguration und API-Endpunkt. |
| `steem.api.setUrl(url)` | ❌ Nein | ✅ Ja | Schneller Endpunktwechsel ohne Auswirkung auf die Konfiguration. |
| `steem.api.setOptions(options)` | ❌ Nein | ✅ Ja | Erweiterte Konfiguration mit Transport, Logger usw. |

**Best Practice:**

- **Verwenden Sie `steem.config.set()`** für die Ersteinrichtung und wenn Konfiguration und API synchron bleiben sollen.
- **Verwenden Sie `steem.api.setUrl()`** für vorübergehende Endpunktwechsel oder Tests.
- **Verwenden Sie `steem.api.setOptions()`**, wenn Sie erweiterte Konfiguration wie eigene Logger benötigen.

### Mehrere API-Instanzen

Standardmäßig ist `steem.api` eine Singleton-Instanz, die von der gesamten Anwendung geteilt wird. Sie können jedoch über den Konstruktor der Klasse `Api` mehrere unabhängige API-Instanzen erzeugen. Das ist nützlich, wenn Sie:

- gleichzeitig mit mehreren verschiedenen API-Endpunkten verbinden möchten
- API-Aufrufe nach Zweck isolieren möchten
- verschiedene Konfigurationen testen möchten, ohne die globale Instanz zu beeinflussen

#### Erstellen mehrerer Instanzen

```javascript
// ESM import (Node.js or modern browsers)
import { Api } from '@steemit/steem-js';

// CommonJS (Node.js)
const { Api } = require('@steemit/steem-js');

// UMD (Browser)
// After loading the UMD script, Api is available on the steem object
const Api = steem.Api;

// Create independent API instances
const api1 = new Api({ url: 'https://api.steemit.com' });
const api2 = new Api({ url: 'https://api.steemit.com' });

// Each instance operates independently
api1.getAccountsAsync(['ety001']).then(accounts => {
  console.log('From instance 1:', accounts);
});

api2.getAccountsAsync(['ety001']).then(accounts => {
  console.log('From instance 2:', accounts);
```
});

#### Vollständiges Beispiel: Mehrere Instanzen mit unterschiedlichen Konfigurationen

```javascript
import { Api } from '@steemit/steem-js';

// Create API instances for different purposes
const api1 = new Api({ 
  url: 'https://api.steemit.com',
  logger: {
    log: (...args) => console.log('[API Instance 1]', ...args)
  }
});

const api2 = new Api({ 
  url: 'https://api.steemit.com',
  logger: {
    log: (...args) => console.log('[API Instance 2]', ...args)
  }
});

// Use them independently
async function getAccounts() {
  try {
    // Query with first instance
    const accounts1 = await api1.getAccountsAsync(['ety001']);
    console.log('From instance 1:', accounts1[0]);
    
    // Query with second instance
    const accounts2 = await api2.getAccountsAsync(['ety001']);
    console.log('From instance 2:', accounts2[0]);
  } catch (error) {
    console.error('Error:', error);
  }
}

getAccounts();
```

#### Beispiel: Verwendung mehrerer Instanzen

```javascript
import { Api } from '@steemit/steem-js';

// Create multiple instances (all using the same endpoint)
const api1 = new Api({ url: 'https://api.steemit.com' });
const api2 = new Api({ url: 'https://api.steemit.com' });

// Use different instances for different requests
async function getAccount(username) {
  try {
    const accounts = await api1.getAccountsAsync([username]);
    return accounts[0];
  } catch (error) {
    console.warn('First instance failed, trying second...', error);
    // Fallback to second instance
    const accounts = await api2.getAccountsAsync([username]);
    return accounts[0];
  }
}

// Usage
getAccount('ety001').then(account => {
  console.log('Account:', account);
});
```

#### Wichtige Hinweise zu mehreren Instanzen

1. **Unabhängige Konfiguration**: Jede `Api`-Instanz hat ihre eigene Konfiguration und beeinflusst weder das globale `steem.config` noch das Singleton `steem.api`.

2. **Keine automatische Synchronisation**: Änderungen an `steem.config.set()` betreffen Instanzen, die mit `new Api()` erstellt wurden, **nicht**. Rufen Sie `setOptions()` oder `setUrl()` einzeln auf jeder Instanz auf.

3. **Speicher**: Jede Instanz hält ihre eigene Transportverbindung und ihren eigenen Zustand. Viele Instanzen können den Speicherverbrauch erhöhen.

4. **Broadcast-Modul**: Das Modul `steem.broadcast` nutzt standardmäßig das Singleton `steem.api`. Wenn Sie mit dem Broadcasting eine eigene API-Instanz verwenden wollen, müssen Sie sie explizit übergeben oder die API-Referenz des Broadcast-Moduls ändern.

**Beispiel: Eigene API-Instanz mit Broadcasting verwenden**

```javascript
import { Api } from '@steemit/steem-js';
import { broadcast } from '@steemit/steem-js';

// Create a custom API instance
const customApi = new Api({ url: 'https://api.steemit.com' });

// Note: The broadcast module uses steem.api singleton by default
// To use a custom instance, you would need to modify the broadcast module
// or create a wrapper that uses your custom API instance
```


## JSON-RPC {#json-rpc}

## JSON-RPC

JSON-RPC-Transport aktivieren:

```javascript
steem.config.set({ nodes: ['https://api.steemit.com'] });
```

Authentifizierter RPC verdient ein eigenes Kapitel: `steem.api.signedCall` (und seine Promise-Variante `signedCallAsync`) signiert Anfragen mit Ihrem privaten Schlüssel, und die Bibliothek bringt ein vollständiges Toolkit zur Signaturprüfung mit. Beide Themen — samt vollständiger Beispiel-Leitfäden — finden Sie auf der Seite [Signierte Aufrufe und Signaturprüfung](/tutorials/steem-js/signed-calls.html).

## API-Routing {#api-routing}

## API-Routing

Steem-Knoten stellen mehrere JSON-RPC-Plugin-Namespaces bereit. steem-js ordnet in `src/api/methods.ts` jedem Helper `steem.api.*` einen Namespace zu.

### Wie Anfragen gesendet werden

| Stil | Beispiel | Wire-Format (HTTP) |
|-------|---------|-------------------|
| Generierter Helper | `steem.api.getAccountsAsync(['ned'])` | JSON-RPC `call` mit `['condenser_api', 'get_accounts', [['ned']]]` |
| Expliziter Namespace | `steem.api.call('condenser_api.get_accounts', [['ned']])` | JSON-RPC-Methode `condenser_api.get_accounts` |

Ab **v1.0.16** verwenden die älteren Lese-Helper (`get_accounts`, `get_content`, discussions, witnesses, …) **`condenser_api`** — passend zu den aktuellen [steem](https://github.com/steemit/steem)-Full-Nodes. Auf dem modernen Plugin **`database_api`** verbleiben u. a. `get_config`, `get_dynamic_global_properties`, `get_transaction_hex`, `get_required_signatures`, `get_potential_signatures`, `verify_authority`, `verify_account_authority`, `get_order_book`, `get_witness_schedule`, `get_active_witnesses`, `get_feed_history` und `find_change_recovery_account_requests`.

### Modernes `database_api` (`list_*` / `find_*`)

Das native Plugin `database_api` des Knotens verwendet andere Methodennamen und objekt förmige Parameter (z. B. `database_api.find_accounts` mit `{ accounts: ['user'] }`). Diese sind **nicht** als CamelCase-Helper verfügbar; rufen Sie sie so auf:

```javascript
await steem.api.callAsync('database_api.find_accounts', [{ accounts: ['initminer'] }]);
```

### Entfernte Hilfsmethoden (v1.0.16)

Diese Methoden `steem.api.*` wurden aus der Bibliothek entfernt, weil sie auf aktuellen Steem-Knoten nicht implementiert sind:

- WebSocket-Abos: `setSubscribeCallback`, `setPendingTransactionCallback`, `setBlockAppliedCallback`, `cancelAllSubscriptions`
- Kategorien: `getTrendingCategories`, `getBestCategories`, `getActiveCategories`, `getRecentCategories`
- Diskussionen: `getDiscussionsByTrending30`, `getDiscussionsByPayout`
- Konto: `getAccountNotifications`, `getAccountReputation`, `getAccountBandwidth`, `getAccountBandwidthByType`, `getAccountBandwidthByTypeAndTime`
- Markt / Mining: `getLiquidityQueue`, `getMinerQueue`
- Escrow: `getEscrowByFrom`, `getEscrowByTo`, `getEscrowByAgent`
- Vorgeschlagene Transaktionen: `getProposedTransactions`, `getProposedTransaction` und die verwandten Varianten `getProposedTransactionApprovals*`

Verwenden Sie, wo anwendbar, `getEscrow` / `condenser_api` oder `database_api.list_escrows` / `find_escrows`.

## Anwendungsbeispiele {#usage-examples}

## Anwendungsbeispiele

### Grundlegende Verwendung

```javascript
import { steem } from '@steemit/steem-js';

// Configure API endpoint
steem.config.set({
  nodes: ['https://api.steemit.com'],
  address_prefix: 'STM',
  chain_id: '0000000000000000000000000000000000000000000000000000000000000000'
});

// Get account information
const account = await steem.api.getAccountsAsync(['ned']);
console.log(account);

// Generate keys
const keys = steem.auth.generateKeys('username', 'password', ['owner', 'active', 'posting', 'memo']);
console.log(keys);
```

### Abstimmungsbeispiel

```javascript
// Vote on a post
const postingWif = steem.auth.toWif('username', 'password', 'posting');
await steem.broadcast.voteAsync(
  postingWif,
  'voter',
  'author',
  'permlink',
  10000 // weight
);
```

### Überweisungsbeispiel

```javascript
// Transfer STEEM
const activeWif = steem.auth.toWif('username', 'password', 'active');
await steem.broadcast.transferAsync(
  activeWif,
  'from',
  'to',
  '1.000 STEEM',
  'memo'
);
```

### Beispiel: Einen Beitrag veröffentlichen

```javascript
// Publish new post
const postingWif = steem.auth.toWif('username', 'password', 'posting');
await steem.broadcast.commentAsync(
  postingWif,
  '', // parentAuthor (empty string means main post)
  'general', // parentPermlink (category)
  'author',
  'my-post-permlink',
  'My Post Title',
  'This is the body of my post.',
  JSON.stringify({
    tags: ['general', 'blog'],
    app: 'my-app/1.0'
  })
);
```

---

## Fehlerbehandlung {#error-handling}

Alle asynchronen Methoden werfen Fehler, die angemessen behandelt werden sollten:

```javascript
try {
  const account = await steem.api.getAccountsAsync(['nonexistent']);
  console.log(account);
} catch (error) {
  console.error('Error fetching account:', error.message);
}

// Or using Promise catch
steem.api.getAccountsAsync(['nonexistent'])
  .then(account => console.log(account))
  .catch(error => console.error('Error:', error.message));
```

---

## Sicherheitshinweise {#security-notes}

- Private Schlüssel werden nie protokolliert oder offengelegt
- Nutzt kryptographisch sichere Zufallszahlengenerierung
- Alle kryptographischen Operationen verwenden korrekte Implementierungen
- Prüfen Sie Transaktionsparameter im Betrieb immer
- Verankern Sie private Schlüssel niemals hart im Client-Code


## TypeScript-Unterstützung {#typescript-support}

## TypeScript-Unterstützung

Steem.js unterstützt TypeScript vollständig, mit kompletten Typdefinitionen:

```typescript
import { steem, Account, DynamicGlobalProperties } from '@steemit/steem-js';

// Type-safe API calls
const accounts: Account[] = await steem.api.getAccountsAsync(['ned']);
const props: DynamicGlobalProperties = await steem.api.getDynamicGlobalPropertiesAsync();

// Typed configuration
steem.config.set({
  nodes: ['https://api.steemit.com'],
  address_prefix: 'STM' as const,
  chain_id: '0000000000000000000000000000000000000000000000000000000000000000'
});
```


## Wie es weitergeht

- [Chain-Daten lesen](/de/tutorials/steem-js/read-api.html) — der vollständige Katalog des Lese-API mit lauffähigen Beispielen.
- [Broadcast-Operationen senden](/de/tutorials/steem-js/broadcast.html) — jede Broadcast-Operation, die die Bibliothek unterstützt.
- [Signierte Aufrufe und Signaturprüfung](/tutorials/steem-js/signed-calls.html) — authentifizierte Anfragen und Signaturprüfungen.
