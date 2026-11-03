---
title: steem-js — primi passi
description: Installare e configurare la libreria @steemit/steem-js — uso nel browser, config.set, api.setUrl, setOptions, più istanze API, routing JSON-RPC ed esempi d'uso end-to-end.
---

# steem-js: Primi passi

[steem-js](https://github.com/steemit/steem-js) è la libreria JavaScript/TypeScript ufficiale della blockchain Steem (pacchetto npm `@steemit/steem-js`, attualmente alla versione 1.2.4). Questo tutorial ripercorre installazione, configurazione e schemi d'uso quotidiani; i contenuti provengono dalla documentazione della libreria stessa.

> **v1.0.16+:** la maggior parte degli helper di lettura di `steem.api` chiama **`condenser_api`** sul nodo; per i namespace, i metodi rimossi e l'uso moderno di `list_*` / `find_*` in `database_api` vedere [Il routing delle API](#api-routing).

In questa guida:

- [Installazione](#installation) e [uso nel browser](#browser-usage)
- [Configurazione](#configuration) — `steem.config.set()`, `steem.api.setUrl()`, `steem.api.setOptions()` e più istanze API
- panorama di [JSON-RPC](#json-rpc) e [routing delle API](#api-routing)
- [Esempi d'uso](#usage-examples), [supporto TypeScript](#typescript-support), [gestione degli errori](#error-handling) e [note sulla sicurezza](#security-notes)

Gli helper API di sola lettura sono trattati in [Leggere i dati della catena](/it/tutorials/steem-js/read-api.html); il broadcast è trattato in [Operazioni di broadcast](/it/tutorials/steem-js/broadcast.html); le chiamate autenticate sono descritte in [Chiamate firmate e verifica delle firme](/tutorials/steem-js/signed-calls.html).

## Installazione {#installation}

## Installazione

### Requisiti

- **Node.js**: >= 20.19.0 (richiesto per l'uso in Node.js)
- Browser moderni con supporto ES6+ (per l'uso nel browser)

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

## Utilizzo nel browser {#browser-usage}

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


## Configurazione {#configuration}

## Configurazione

La configurazione predefinita funziona con la rete Steem. Puoi anche configurarla per altre reti compatibili.

### Configurazione globale con `steem.config.set()`

Il metodo `steem.config.set()` è il modo consigliato per configurare la libreria. Gestisce la configurazione globale e sincronizza automaticamente l'istanza singleton dell'API.

#### Utilizzo di base

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

#### Opzioni di configurazione

| Opzione | Tipo | Descrizione | Predefinito |
|--------|------|-------------|---------|
| `nodes` | `string[]` | Array degli URL dei nodi API. Il primo nodo è usato come endpoint primario. | `['https://api.steemit.com']` |
| `address_prefix` | `string` | Prefisso degli indirizzi della blockchain (per esempio 'STM' per Steem, 'TST' per il testnet). | `'STM'` |
| `chain_id` | `string` | ID di catena (chain ID) della rete blockchain. | `'0000000000000000000000000000000000000000000000000000000000000000'` |
| `debug` | `boolean` | Abilitare il log di debug. | `false` |
| `debug_warnings` | `boolean` | Abilitare gli avvisi di debug. | `false` |

#### Come funziona `steem.config.set()`

Quando chiami `steem.config.set({ nodes: [...] })`:

1. **Salva la configurazione globalmente**: i valori di configurazione sono conservati nell'istanza config globale, accessibile via `steem.config.get()`.

2. **Aggiorna automaticamente il singleton dell'API**: il primo nodo dell'array `nodes` viene estratto e usato per aggiornare l'URL dell'istanza singleton `steem.api`. In questo modo tutte le chiamate API tramite `steem.api` usano l'endpoint configurato.

3. **Sincronizza lo stato**: la configurazione globale e l'istanza dell'API restano sincronizzate.

**Esempio:**

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

#### Ottenere la configurazione

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

### Configurazione diretta dell'API

Se devi cambiare l'endpoint dell'API senza aggiornare la configurazione globale, puoi usare direttamente i metodi dell'istanza API.

#### `steem.api.setUrl(url: string)`

Cambia direttamente l'URL dell'endpoint API senza aggiornare la configurazione globale. Utile quando vuoi cambiare endpoint temporaneamente o provare nodi diversi.

```javascript
// Change API endpoint directly
steem.api.setUrl('https://api.steemit.com');

// This only affects the steem.api singleton instance
// The global config.nodes remains unchanged
```

**Quando usarlo:**
- provare temporaneamente diversi endpoint API
- cambiare endpoint senza aggiornare la configurazione globale
- cambi rapidi di endpoint per il debug

#### `steem.api.setOptions(options: ApiOptions)`

Offre più controllo sulla configurazione dell'istanza API. Questo metodo permette di impostare più opzioni in una volta, tra cui il tipo di trasporto, il logger e altre impostazioni avanzate.

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

**Opzioni disponibili:**

| Opzione | Tipo | Descrizione |
|--------|------|-------------|
| `url` | `string` | URL dell'endpoint API (deve essere HTTP/HTTPS) |
| `transport` | `string` | Tipo di trasporto ('http' è l'unico valore supportato) |
| `logger` | `object` | Oggetto logger con un metodo `log` |
| `useTestNet` | `boolean` | Abilitare la modalità testnet (imposta address_prefix a 'TST') |
| `fetchMethod` | `function` | Implementazione fetch personalizzata per le richieste HTTP |

**Esempio con logger:**

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

#### Differenze tra `steem.config.set()` e `steem.api.setUrl()`

| Metodo | Aggiorna la config globale | Aggiorna il singleton API | Caso d'uso |
|--------|----------------------|---------------------|----------|
| `steem.config.set({ nodes: [...] })` | ✅ Sì | ✅ Sì (automaticamente) | Consigliato per l'uso normale: imposta sia la configurazione sia l'endpoint API. |
| `steem.api.setUrl(url)` | ❌ No | ✅ Sì | Cambio rapido di endpoint senza toccare la configurazione. |
| `steem.api.setOptions(options)` | ❌ No | ✅ Sì | Configurazione avanzata con transport, logger ecc. |

**Buona pratica:**

- **usa `steem.config.set()`** per la configurazione iniziale e quando vuoi mantenere sincronizzati configurazione e API.
- **usa `steem.api.setUrl()`** per cambi di endpoint temporanei o per i test.
- **usa `steem.api.setOptions()`** quando serve una configurazione avanzata come logger personalizzati.

### Più istanze API

Per impostazione predefinita `steem.api` è un'istanza singleton condivisa in tutta l'applicazione. Tuttavia puoi creare più istanze API indipendenti con il costruttore della classe `Api`. È utile quando serve:

- connettersi contemporaneamente a più endpoint API diversi
- isolare le chiamate API per scopi diversi
- provare configurazioni diverse senza toccare l'istanza globale

#### Creazione di più istanze

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

#### Esempio completo: più istanze con configurazioni diverse

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

#### Esempio: utilizzo di più istanze

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

#### Note importanti sulle istanze multiple

1. **Configurazione indipendente**: ogni istanza `Api` ha la sua configurazione e non influisce sul `steem.config` globale né sul singleton `steem.api`.

2. **Nessuna sincronizzazione automatica**: le modifiche a `steem.config.set()` **non** toccano le istanze create con `new Api()`. Devi chiamare `setOptions()` o `setUrl()` singolarmente su ciascuna istanza.

3. **Memoria**: ogni istanza mantiene la propria connessione di trasporto e il proprio stato. Creare molte istanze può aumentare l'uso di memoria.

4. **Modulo broadcast**: il modulo `steem.broadcast` usa per impostazione predefinita il singleton `steem.api`. Per usare con il broadcast un'istanza API personalizzata devi passarla esplicitamente o modificare il riferimento API del modulo broadcast.

**Esempio: usare un'istanza API personalizzata con il broadcast**

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

Attivare il trasporto JSON-RPC:

```javascript
steem.config.set({ nodes: ['https://api.steemit.com'] });
```

L'RPC autenticato merita un capitolo a sé: `steem.api.signedCall` (e la sua variante Promise `signedCallAsync`) firma le richieste con la tua chiave privata, e la libreria include un toolkit completo per la verifica delle firme. Entrambi gli argomenti — guide di esempio comprese — sono sulla pagina [Chiamate firmate e verifica delle firme](/tutorials/steem-js/signed-calls.html).

## Routing delle API {#api-routing}

## Routing delle API

I nodi Steem espongono più namespace di plugin JSON-RPC. steem-js mappa ogni helper `steem.api.*` su un namespace in `src/api/methods.ts`.

### Come vengono inviate le richieste

| Stile | Esempio | Formato sul filo (HTTP) |
|-------|---------|-------------------|
| Helper generato | `steem.api.getAccountsAsync(['ned'])` | `call` JSON-RPC con `['condenser_api', 'get_accounts', [['ned']]]` |
| Namespace esplicito | `steem.api.call('condenser_api.get_accounts', [['ned']])` | Metodo JSON-RPC `condenser_api.get_accounts` |

Dalla **v1.0.16**, gli helper di lettura storici (`get_accounts`, `get_content`, discussions, witnesses, …) usano **`condenser_api`**, in linea con gli attuali full node [steem](https://github.com/steemit/steem). Sul moderno plugin **`database_api`** restano metodi come `get_config`, `get_dynamic_global_properties`, `get_transaction_hex`, `get_required_signatures`, `get_potential_signatures`, `verify_authority`, `verify_account_authority`, `get_order_book`, `get_witness_schedule`, `get_active_witnesses`, `get_feed_history` e `find_change_recovery_account_requests`.

### `database_api` moderno (`list_*` / `find_*`)

Il plugin nativo `database_api` del nodo usa nomi di metodi diversi e parametri a forma di oggetto (per esempio `database_api.find_accounts` con `{ accounts: ['user'] }`). Questi **non** sono esposti come helper camelCase; chiamali così:

```javascript
await steem.api.callAsync('database_api.find_accounts', [{ accounts: ['initminer'] }]);
```

### Metodi helper rimossi (v1.0.16)

Questi metodi `steem.api.*` sono stati rimossi dalla libreria perché non sono implementati sui nodi Steem attuali:

- sottoscrizioni WebSocket: `setSubscribeCallback`, `setPendingTransactionCallback`, `setBlockAppliedCallback`, `cancelAllSubscriptions`
- categorie: `getTrendingCategories`, `getBestCategories`, `getActiveCategories`, `getRecentCategories`
- discussioni: `getDiscussionsByTrending30`, `getDiscussionsByPayout`
- account: `getAccountNotifications`, `getAccountReputation`, `getAccountBandwidth`, `getAccountBandwidthByType`, `getAccountBandwidthByTypeAndTime`
- mercato / mining: `getLiquidityQueue`, `getMinerQueue`
- escrow: `getEscrowByFrom`, `getEscrowByTo`, `getEscrowByAgent`
- transazioni proposte: `getProposedTransactions`, `getProposedTransaction` e le varianti correlate `getProposedTransactionApprovals*`

Dove applicabile, usa `getEscrow` / `condenser_api` oppure `database_api.list_escrows` / `find_escrows`.

## Esempi di utilizzo {#usage-examples}

## Esempi di utilizzo

### Utilizzo di base

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

### Esempio di voto

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

### Esempio di trasferimento

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

### Esempio di pubblicazione di un post

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

## Gestione degli errori {#error-handling}

Tutti i metodi asincroni possono lanciare errori, che vanno gestiti opportunamente:

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

## Note sulla sicurezza {#security-notes}

- le chiavi private non vengono mai registrate né esposte
- usa una generazione di numeri casuali crittograficamente sicura
- tutte le operazioni crittografiche usano implementazioni adeguate
- in produzione verifica sempre i parametri delle transazioni
- non inserire mai chiavi private nel codice lato client


## Supporto TypeScript {#typescript-support}

## Supporto TypeScript

Steem.js supporta pienamente TypeScript, con definizioni di tipi complete:

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


## Prossimi passi

- [Leggere i dati della catena](/it/tutorials/steem-js/read-api.html) — il catalogo completo dell'API di lettura con esempi eseguibili.
- [Operazioni di broadcast](/it/tutorials/steem-js/broadcast.html) — ogni operazione di broadcast supportata dalla libreria.
- [Chiamate firmate e verifica delle firme](/tutorials/steem-js/signed-calls.html) — richieste autenticate e controlli delle firme.
