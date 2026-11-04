---
title: steem-js - premiers pas
description: Installer et configurer la bibliothèque @steemit/steem-js — usage navigateur, config.set, api.setUrl, setOptions, plusieurs instances d'API, routage JSON-RPC et exemples d'utilisation de bout en bout.
---

# steem-js: Premiers pas

[steem-js](https://github.com/steemit/steem-js) est la bibliothèque JavaScript/TypeScript officielle de la blockchain Steem (paquet npm `@steemit/steem-js`, actuellement en version 1.2.4). Ce tutoriel parcourt l'installation, la configuration et les usages quotidiens, à partir de la documentation de la bibliothèque elle-même.

> **v1.0.16+ :** la plupart des helpers de lecture de `steem.api` appellent **`condenser_api`** sur le nœud ; voir [Le routage des API](#api-routing) pour les espaces de noms, les méthodes supprimées et l'usage moderne de `list_*` / `find_*` dans `database_api`.

Dans ce guide :

- [Installation](#installation) et [usage navigateur](#browser-usage)
- [Configuration](#configuration) — `steem.config.set()`, `steem.api.setUrl()`, `steem.api.setOptions()` et plusieurs instances d'API
- aperçu de [JSON-RPC](#json-rpc) et [routage des API](#api-routing)
- [Exemples d'utilisation](#usage-examples), [support TypeScript](#typescript-support), [gestion des erreurs](#error-handling) et [notes de sécurité](#security-notes)

Les helpers d'API en lecture seule sont traités dans [Lecture des données de la chaîne](/fr/tutorials/steem-js/read-api.html) ; la diffusion est couverte par [Diffusion des opérations](/fr/tutorials/steem-js/broadcast.html) ; les appels authentifiés sont décrits dans [Appels signés et vérification de signature](/tutorials/steem-js/signed-calls.html).

## Installation {#installation}

## Installation

### Prérequis

- **Node.js** : >= 20.19.0 (requis pour un usage Node.js)
- Navigateurs modernes avec support ES6+ (pour un usage navigateur)

### npm / pnpm / yarn

```bash
npm install @steemit/steem-js
# or
pnpm install @steemit/steem-js
# or
yarn add @steemit/steem-js
```

### Navigateur (CDN)

```html
<!-- Production: use minified version (692KB) -->
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.min.js"></script>

<!-- Development: use regular version (1.7MB) for better debugging -->
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.js"></script>
```

---

## Utilisation dans le navigateur {#browser-usage}

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


## Configuration {#configuration}

## Configuration

La configuration par défaut fonctionne avec le réseau Steem. Vous pouvez aussi la configurer pour d'autres réseaux compatibles.

### Configuration globale avec `steem.config.set()`

La méthode `steem.config.set()` est la façon recommandée de configurer la bibliothèque. Elle gère la configuration globale et synchronise automatiquement l'instance singleton de l'API.

#### Utilisation de base

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

#### Options de configuration

| Option | Type | Description | Valeur par défaut |
|--------|------|-------------|---------|
| `nodes` | `string[]` | Tableau des URL des nœuds d'API. Le premier nœud sert de point de terminaison principal. | `['https://api.steemit.com']` |
| `address_prefix` | `string` | Préfixe d'adresse de la blockchain (par exemple 'STM' pour Steem, 'TST' pour le testnet). | `'STM'` |
| `chain_id` | `string` | Identifiant de chaîne (chain ID) du réseau blockchain. | `'0000000000000000000000000000000000000000000000000000000000000000'` |
| `debug` | `boolean` | Activer les journaux de débogage. | `false` |
| `debug_warnings` | `boolean` | Activer les avertissements de débogage. | `false` |

#### Fonctionnement de `steem.config.set()`

Lorsque vous appelez `steem.config.set({ nodes: [...] })` :

1. **Enregistre la configuration globalement** : les valeurs de configuration sont stockées dans l'instance de config globale, accessible via `steem.config.get()`.

2. **Met à jour automatiquement le singleton d'API** : le premier nœud du tableau `nodes` est extrait et sert à mettre à jour l'URL de l'instance singleton `steem.api`. Tous les appels d'API passant par `steem.api` utilisent ainsi le point de terminaison configuré.

3. **Synchronise l'état** : la configuration globale et l'instance d'API restent synchronisées.

**Exemple :**

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

#### Obtenir la configuration

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

### Configuration directe de l'API

Si vous devez changer le point de terminaison de l'API sans mettre à jour la configuration globale, vous pouvez utiliser directement les méthodes de l'instance d'API.

#### `steem.api.setUrl(url: string)`

Change l'URL du point de terminaison de l'API directement, sans mettre à jour la configuration globale. Utile pour basculer temporairement entre points de terminaison ou tester différents nœuds.

```javascript
// Change API endpoint directly
steem.api.setUrl('https://api.steemit.com');

// This only affects the steem.api singleton instance
// The global config.nodes remains unchanged
```

**Quand l'utiliser :**
- tester temporairement différents points de terminaison d'API ;
- changer de point de terminaison sans modifier la configuration globale ;
- changements rapides de point de terminaison pour le débogage.

#### `steem.api.setOptions(options: ApiOptions)`

Offre plus de contrôle sur la configuration de l'instance d'API. Cette méthode permet de définir plusieurs options à la fois, notamment le type de transport, le logger et d'autres réglages avancés.

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

**Options disponibles :**

| Option | Type | Description |
|--------|------|-------------|
| `url` | `string` | URL du point de terminaison d'API (HTTP/HTTPS obligatoire) |
| `transport` | `string` | Type de transport ('http' est la seule valeur prise en charge) |
| `logger` | `object` | Objet logger doté d'une méthode `log` |
| `useTestNet` | `boolean` | Activer le mode testnet (définit address_prefix à 'TST') |
| `fetchMethod` | `function` | Implémentation personnalisée de fetch pour les requêtes HTTP |

**Exemple avec logger :**

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

#### Différences entre `steem.config.set()` et `steem.api.setUrl()`

| Méthode | Met à jour la config globale | Met à jour le singleton d'API | Cas d'usage |
|--------|----------------------|---------------------|----------|
| `steem.config.set({ nodes: [...] })` | ✅ Oui | ✅ Oui (automatiquement) | Recommandé pour un usage normal : définit la configuration et le point de terminaison d'API. |
| `steem.api.setUrl(url)` | ❌ Non | ✅ Oui | Changement rapide de point de terminaison sans toucher à la configuration. |
| `steem.api.setOptions(options)` | ❌ Non | ✅ Oui | Configuration avancée : transport, logger, etc. |

**Bonne pratique :**

- **utilisez `steem.config.set()`** pour la configuration initiale et lorsque vous voulez garder la configuration et l'API synchronisées ;
- **utilisez `steem.api.setUrl()`** pour des changements de point de terminaison temporaires ou des tests ;
- **utilisez `steem.api.setOptions()`** lorsque vous avez besoin d'une configuration avancée comme des loggers personnalisés.

### Plusieurs instances d'API

Par défaut, `steem.api` est une instance singleton partagée par toute votre application. Toutefois, vous pouvez créer plusieurs instances d'API indépendantes via le constructeur de la classe `Api`. C'est utile pour :

- vous connecter simultanément à plusieurs points de terminaison d'API différents ;
- isoler les appels d'API selon leur finalité ;
- tester différentes configurations sans affecter l'instance globale.

#### Création de plusieurs instances

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
});
```

#### Exemple complet : plusieurs instances avec des configurations différentes

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

#### Exemple : utilisation de plusieurs instances

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

#### Remarques importantes sur les instances multiples

1. **Configuration indépendante** : chaque instance `Api` possède sa propre configuration et n'affecte ni le `steem.config` global ni le singleton `steem.api`.

2. **Pas de synchronisation automatique** : les modifications apportées via `steem.config.set()` n'affectent **pas** les instances créées avec `new Api()`. Il faut appeler `setOptions()` ou `setUrl()` individuellement sur chaque instance.

3. **Mémoire** : chaque instance maintient sa propre connexion de transport et son propre état. Créer beaucoup d'instances peut accroître la consommation mémoire.

4. **Module de diffusion** : le module `steem.broadcast` utilise par défaut le singleton `steem.api`. Pour utiliser une instance d'API personnalisée avec la diffusion, il faut la passer explicitement ou modifier la référence d'API du module de diffusion.

**Exemple : instance d'API personnalisée avec la diffusion**

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

Activer le transport JSON-RPC :

```javascript
steem.config.set({ nodes: ['https://api.steemit.com'] });
```

Le RPC authentifié mérite son propre chapitre : `steem.api.signedCall` (et sa variante Promise `signedCallAsync`) signe les requêtes avec votre clé privée, et la bibliothèque embarque une boîte à outils complète de vérification de signature. Ces deux sujets — guides d'exemples compris — sont traités sur la page [Appels signés et vérification de signature](/tutorials/steem-js/signed-calls.html).

## Routage des API {#api-routing}

## Routage des API

Les nœuds Steem exposent plusieurs espaces de noms de plugins JSON-RPC. steem-js associe chaque helper `steem.api.*` à un espace de noms dans `src/api/methods.ts`.

### Comment les requêtes sont envoyées

| Style | Exemple | Format sur le fil (HTTP) |
|-------|---------|-------------------|
| Helper généré | `steem.api.getAccountsAsync(['ned'])` | `call` JSON-RPC avec `['condenser_api', 'get_accounts', [['ned']]]` |
| Espace de noms explicite | `steem.api.call('condenser_api.get_accounts', [['ned']])` | Méthode JSON-RPC `condenser_api.get_accounts` |

À partir de **v1.0.16**, les helpers de lecture historiques (`get_accounts`, `get_content`, discussions, witnesses, etc.) utilisent **`condenser_api`**, à l'image des nœuds complets [steem](https://github.com/steemit/steem) actuels. Les méthodes qui restent sur le plugin moderne **`database_api`** sont notamment `get_config`, `get_dynamic_global_properties`, `get_transaction_hex`, `get_required_signatures`, `get_potential_signatures`, `verify_authority`, `verify_account_authority`, `get_order_book`, `get_witness_schedule`, `get_active_witnesses`, `get_feed_history` et `find_change_recovery_account_requests`.

### `database_api` moderne (`list_*` / `find_*`)

Le plugin natif `database_api` du nœud utilise d'autres noms de méthodes et des paramètres en forme d'objets (par exemple `database_api.find_accounts` avec `{ accounts: ['user'] }`). Ils ne sont **pas** exposés comme des helpers camelCase ; appelez-les ainsi :

```javascript
await steem.api.callAsync('database_api.find_accounts', [{ accounts: ['initminer'] }]);
```

### Méthodes utilitaires supprimées (v1.0.16)

Ces méthodes `steem.api.*` ont été retirées de la bibliothèque car elles ne sont pas implémentées sur les nœuds Steem actuels :

- abonnements WebSocket : `setSubscribeCallback`, `setPendingTransactionCallback`, `setBlockAppliedCallback`, `cancelAllSubscriptions` ;
- catégories : `getTrendingCategories`, `getBestCategories`, `getActiveCategories`, `getRecentCategories` ;
- discussions : `getDiscussionsByTrending30`, `getDiscussionsByPayout` ;
- compte : `getAccountNotifications`, `getAccountReputation`, `getAccountBandwidth`, `getAccountBandwidthByType`, `getAccountBandwidthByTypeAndTime` ;
- marché / minage : `getLiquidityQueue`, `getMinerQueue` ;
- séquestre (escrow) : `getEscrowByFrom`, `getEscrowByTo`, `getEscrowByAgent` ;
- transactions proposées : `getProposedTransactions`, `getProposedTransaction` et les variantes apparentées `getProposedTransactionApprovals*`.

Le cas échéant, utilisez `getEscrow` / `condenser_api` ou `database_api.list_escrows` / `find_escrows`.

## Exemples d'utilisation {#usage-examples}

## Exemples d'utilisation

### Utilisation de base

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

### Exemple de vote

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

### Exemple de transfert

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

### Exemple de publication d'un post

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

## Gestion des erreurs {#error-handling}

Toutes les méthodes asynchrones peuvent lever des erreurs, à gérer convenablement :

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

## Consignes de sécurité {#security-notes}

- les clés privées ne sont jamais journalisées ni exposées ;
- utilise une génération de nombres aléatoires cryptographiquement sûre ;
- toutes les opérations cryptographiques reposent sur des implémentations appropriées ;
- en production, vérifiez toujours les paramètres des transactions ;
- n'inscrivez jamais de clés privées en dur dans le code côté client.


## Prise en charge de TypeScript {#typescript-support}

## Prise en charge de TypeScript

Steem.js prend pleinement en charge TypeScript avec des définitions de types complètes :

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


## Pour aller plus loin

- [Lecture des données de la chaîne](/fr/tutorials/steem-js/read-api.html) — le catalogue complet de l'API de lecture avec des exemples exécutables.
- [Diffusion des opérations](/fr/tutorials/steem-js/broadcast.html) — toutes les opérations de diffusion prises en charge par la bibliothèque.
- [Appels signés et vérification de signature](/tutorials/steem-js/signed-calls.html) — requêtes authentifiées et contrôles de signature.
