---
title: steem-js - primeros pasos
description: Instalar y configurar la biblioteca @steemit/steem-js — uso en el navegador, config.set, api.setUrl, setOptions, varias instancias de API, enrutamiento JSON-RPC y ejemplos de uso de extremo a extremo.
---

# steem-js: Primeros pasos

[steem-js](https://github.com/steemit/steem-js) es la biblioteca oficial de JavaScript/TypeScript para la blockchain de Steem (paquete npm `@steemit/steem-js`, actualmente en la versión 1.2.4). Este tutorial recorre la instalación, la configuración y los patrones de uso cotidianos; el contenido procede de la documentación de la propia biblioteca.

> **v1.0.16+:** la mayoría de los helpers de lectura de `steem.api` llaman a **`condenser_api`** en el nodo; sobre los espacios de nombres, los métodos eliminados y el uso moderno de `list_*` / `find_*` en `database_api`, véase [El enrutamiento de las API](#api-routing).

En esta guía:

- [Instalación](#installation) y [uso en el navegador](#browser-usage)
- [Configuración](#configuration) — `steem.config.set()`, `steem.api.setUrl()`, `steem.api.setOptions()` y varias instancias de API
- panorama de [JSON-RPC](#json-rpc) y [enrutamiento de las API](#api-routing)
- [Ejemplos de uso](#usage-examples), [soporte de TypeScript](#typescript-support), [gestión de errores](#error-handling) y [notas de seguridad](#security-notes)

Los helpers de API de solo lectura se tratan en [Lectura de datos de la cadena](/es/tutorials/steem-js/read-api.html); el broadcast se cubre en [Operaciones de broadcast](/es/tutorials/steem-js/broadcast.html); las llamadas autenticadas se describen en [Llamadas firmadas y verificación de firmas](/tutorials/steem-js/signed-calls.html).

## Instalación {#installation}

## Instalación

### Requisitos

- **Node.js**: >= 20.19.0 (necesario para el uso en Node.js)
- Navegadores modernos con soporte de ES6+ (para el uso en el navegador)

### npm / pnpm / yarn

```bash
npm install @steemit/steem-js
# or
pnpm install @steemit/steem-js
# or
yarn add @steemit/steem-js
```

### Navegador (CDN)

```html
<!-- Production: use minified version (692KB) -->
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.min.js"></script>

<!-- Development: use regular version (1.7MB) for better debugging -->
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.js"></script>
```

---

## Uso en el navegador {#browser-usage}

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


## Configuración {#configuration}

## Configuración

La configuración predeterminada funciona con la red Steem. También puedes configurarla para otras redes compatibles.

### Configuración global con `steem.config.set()`

El método `steem.config.set()` es la forma recomendada de configurar la biblioteca. Gestiona la configuración global y sincroniza automáticamente la instancia singleton de la API.

#### Uso básico

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

#### Opciones de configuración

| Opción | Tipo | Descripción | Valor por defecto |
|--------|------|-------------|---------|
| `nodes` | `string[]` | Array de URLs de nodos de API. El primer nodo se usa como endpoint principal. | `['https://api.steemit.com']` |
| `address_prefix` | `string` | Prefijo de direcciones de la blockchain (p. ej., 'STM' para Steem, 'TST' para la testnet). | `'STM'` |
| `chain_id` | `string` | Identificador de cadena (chain ID) de la red blockchain. | `'0000000000000000000000000000000000000000000000000000000000000000'` |
| `debug` | `boolean` | Activar el registro de depuración. | `false` |
| `debug_warnings` | `boolean` | Activar las advertencias de depuración. | `false` |

#### Cómo funciona `steem.config.set()`

Cuando llamas a `steem.config.set({ nodes: [...] })`:

1. **Guarda la configuración globalmente**: los valores de configuración se almacenan en la instancia config global, accesible vía `steem.config.get()`.

2. **Actualiza automáticamente el singleton de la API**: el primer nodo del array `nodes` se extrae y se usa para actualizar la URL de la instancia singleton `steem.api`. Así, todas las llamadas de API que usen `steem.api` emplearán el endpoint configurado.

3. **Sincroniza el estado**: la configuración global y la instancia de la API se mantienen sincronizadas.

**Ejemplo:**

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

#### Obtener la configuración

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

### Configuración directa de la API

Si necesitas cambiar el endpoint de la API sin actualizar la configuración global, puedes usar directamente los métodos de la instancia de la API.

#### `steem.api.setUrl(url: string)`

Cambia directamente la URL del endpoint de la API sin actualizar la configuración global. Útil cuando quieres cambiar de endpoint temporalmente o probar distintos nodos.

```javascript
// Change API endpoint directly
steem.api.setUrl('https://api.steemit.com');

// This only affects the steem.api singleton instance
// The global config.nodes remains unchanged
```

**Cuándo usarlo:**
- probar temporalmente distintos endpoints de API
- cambiar de endpoint sin actualizar la configuración global
- cambios rápidos de endpoint para depurar

#### `steem.api.setOptions(options: ApiOptions)`

Ofrece más control sobre la configuración de la instancia de la API. Este método permite establecer varias opciones a la vez, incluido el tipo de transporte, el logger y otros ajustes avanzados.

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

**Opciones disponibles:**

| Opción | Tipo | Descripción |
|--------|------|-------------|
| `url` | `string` | URL del endpoint de la API (debe ser HTTP/HTTPS) |
| `transport` | `string` | Tipo de transporte ('http' es el único valor admitido) |
| `logger` | `object` | Objeto logger con un método `log` |
| `useTestNet` | `boolean` | Activar el modo testnet (fija address_prefix en 'TST') |
| `fetchMethod` | `function` | Implementación de fetch personalizada para peticiones HTTP |

**Ejemplo con logger:**

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

#### Diferencias: `steem.config.set()` frente a `steem.api.setUrl()`

| Método | Actualiza la config global | Actualiza el singleton de la API | Caso de uso |
|--------|----------------------|---------------------|----------|
| `steem.config.set({ nodes: [...] })` | ✅ Sí | ✅ Sí (automáticamente) | Recomendado para el uso normal: fija tanto la configuración como el endpoint de la API. |
| `steem.api.setUrl(url)` | ❌ No | ✅ Sí | Cambio rápido de endpoint sin tocar la configuración. |
| `steem.api.setOptions(options)` | ❌ No | ✅ Sí | Configuración avanzada con transport, logger, etc. |

**Buena práctica:**

- **usa `steem.config.set()`** para la configuración inicial y cuando quieras mantener configuración y API sincronizadas.
- **usa `steem.api.setUrl()`** para cambios de endpoint temporales o pruebas.
- **usa `steem.api.setOptions()`** cuando necesites una configuración avanzada, como loggers personalizados.

### Múltiples instancias de API

Por defecto, `steem.api` es una instancia singleton compartida por toda tu aplicación. Sin embargo, puedes crear varias instancias de API independientes con el constructor de la clase `Api`. Es útil cuando necesitas:

- conectarte a varios endpoints de API distintos a la vez
- aislar las llamadas de API según su finalidad
- probar configuraciones distintas sin afectar a la instancia global

#### Creación de múltiples instancias

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

#### Ejemplo completo: múltiples instancias con diferentes configuraciones

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

#### Ejemplo: uso de múltiples instancias

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

#### Notas importantes sobre múltiples instancias

1. **Configuración independiente**: cada instancia `Api` tiene su propia configuración y no afecta al `steem.config` global ni al singleton `steem.api`.

2. **Sin sincronización automática**: los cambios en `steem.config.set()` **no** afectan a las instancias creadas con `new Api()`. Debes llamar a `setOptions()` o `setUrl()` en cada instancia por separado.

3. **Memoria**: cada instancia mantiene su propia conexión de transporte y su propio estado. Crear muchas instancias puede aumentar el consumo de memoria.

4. **Módulo de broadcast**: el módulo `steem.broadcast` usa el singleton `steem.api` por defecto. Si quieres usar una instancia de API personalizada con el broadcast, tendrás que pasarla explícitamente o modificar la referencia de la API del módulo de broadcast.

**Ejemplo: usar una instancia de API personalizada con el broadcast**

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

Activar el transporte JSON-RPC:

```javascript
steem.config.set({ nodes: ['https://api.steemit.com'] });
```

El RPC autenticado merece su propio capítulo: `steem.api.signedCall` (y su variante con Promise, `signedCallAsync`) firma las peticiones con tu clave privada, y la biblioteca incluye un kit completo de verificación de firmas. Ambos temas —con sus guías de ejemplos completas— están en la página [Llamadas firmadas y verificación de firmas](/tutorials/steem-js/signed-calls.html).

## Enrutamiento de API {#api-routing}

## Enrutamiento de API

Los nodos Steem exponen varios espacios de nombres de plugins JSON-RPC. steem-js asocia cada helper `steem.api.*` a un espacio de nombres en `src/api/methods.ts`.

### Cómo se envían las solicitudes

| Estilo | Ejemplo | Formato en la red (HTTP) |
|-------|---------|-------------------|
| Helper generado | `steem.api.getAccountsAsync(['ned'])` | `call` JSON-RPC con `['condenser_api', 'get_accounts', [['ned']]]` |
| Espacio de nombres explícito | `steem.api.call('condenser_api.get_accounts', [['ned']])` | Método JSON-RPC `condenser_api.get_accounts` |

Desde la **v1.0.16**, los helpers de lectura clásicos (`get_accounts`, `get_content`, discussions, witnesses, …) usan **`condenser_api`**, en línea con los nodos completos [steem](https://github.com/steemit/steem) actuales. En el plugin moderno **`database_api`** permanecen métodos como `get_config`, `get_dynamic_global_properties`, `get_transaction_hex`, `get_required_signatures`, `get_potential_signatures`, `verify_authority`, `verify_account_authority`, `get_order_book`, `get_witness_schedule`, `get_active_witnesses`, `get_feed_history` y `find_change_recovery_account_requests`.

### `database_api` moderno (`list_*` / `find_*`)

El plugin nativo `database_api` del nodo usa otros nombres de métodos y parámetros con forma de objeto (p. ej. `database_api.find_accounts` con `{ accounts: ['user'] }`). Estos **no** se exponen como helpers camelCase; llámalos así:

```javascript
await steem.api.callAsync('database_api.find_accounts', [{ accounts: ['initminer'] }]);
```

### Métodos auxiliares eliminados (v1.0.16)

Estos métodos `steem.api.*` se eliminaron de la biblioteca porque no están implementados en los nodos Steem actuales:

- suscripciones WebSocket: `setSubscribeCallback`, `setPendingTransactionCallback`, `setBlockAppliedCallback`, `cancelAllSubscriptions`
- categorías: `getTrendingCategories`, `getBestCategories`, `getActiveCategories`, `getRecentCategories`
- discusiones: `getDiscussionsByTrending30`, `getDiscussionsByPayout`
- cuenta: `getAccountNotifications`, `getAccountReputation`, `getAccountBandwidth`, `getAccountBandwidthByType`, `getAccountBandwidthByTypeAndTime`
- mercado / minería: `getLiquidityQueue`, `getMinerQueue`
- escrow: `getEscrowByFrom`, `getEscrowByTo`, `getEscrowByAgent`
- transacciones propuestas: `getProposedTransactions`, `getProposedTransaction` y las variantes relacionadas `getProposedTransactionApprovals*`

Cuando corresponda, usa `getEscrow` / `condenser_api` o `database_api.list_escrows` / `find_escrows`.

## Ejemplos de uso {#usage-examples}

## Ejemplos de uso

### Uso básico

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

### Ejemplo de voto

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

### Ejemplo de transferencia

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

### Ejemplo de publicación de un post

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

## Manejo de errores {#error-handling}

Todos los métodos asíncronos lanzan errores y deben gestionarse adecuadamente:

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

## Notas de seguridad {#security-notes}

- las claves privadas nunca se registran ni se exponen
- usa una generación de números aleatorios criptográficamente segura
- todas las operaciones criptográficas usan implementaciones adecuadas
- en producción, verifica siempre los parámetros de las transacciones
- nunca incluyas claves privadas a mano en el código del lado cliente


## Compatibilidad con TypeScript {#typescript-support}

## Compatibilidad con TypeScript

Steem.js admite TypeScript por completo, con definiciones de tipos completas:

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


## Próximos pasos

- [Lectura de datos de la cadena](/es/tutorials/steem-js/read-api.html) — el catálogo completo de la API de lectura con ejemplos ejecutables.
- [Operaciones de broadcast](/es/tutorials/steem-js/broadcast.html) — todas las operaciones de broadcast que admite la biblioteca.
- [Llamadas firmadas y verificación de firmas](/tutorials/steem-js/signed-calls.html) — peticiones autenticadas y comprobaciones de firmas.
