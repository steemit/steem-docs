---
title: steem-js - Getting Started
description: Install and configure the @steemit/steem-js library - browser usage, config.set, api.setUrl, setOptions, multiple API instances, JSON-RPC routing and end-to-end usage examples.
---

# steem-js: Getting Started

[steem-js](https://github.com/steemit/steem-js) is the official JavaScript/TypeScript library for the Steem blockchain (npm package `@steemit/steem-js`, currently at version 1.2.4). This tutorial walks through installation, configuration and everyday usage patterns, migrated from the library's own documentation.

> **v1.0.16+:** Most `steem.api` read helpers call **`condenser_api`** on the node; see [API routing](#api-routing) for namespaces, removed methods, and modern `database_api` `list_*` / `find_*` usage.

In this guide:

- [Installation](#installation) and [Browser Usage](#browser-usage)
- [Configuration](#configuration) - `steem.config.set()`, `steem.api.setUrl()`, `steem.api.setOptions()` and multiple API instances
- [JSON-RPC](#json-rpc) overview and [API routing](#api-routing)
- [Usage Examples](#usage-examples), [TypeScript Support](#typescript-support), [Error Handling](#error-handling) and [Security Notes](#security-notes)

Read-only API helpers are covered in [Reading chain data](/tutorials/steem-js/read-api.html); broadcasting lives in [Broadcasting operations](/tutorials/steem-js/broadcast.html); authenticated calls are described in [Signed calls and signature verification](/tutorials/steem-js/signed-calls.html).

## Installation

## Installation

### Requirements

- **Node.js**: >= 20.19.0 (required for Node.js usage)
- Modern browsers with ES6+ support (for browser usage)

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

## Browser Usage

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


## Configuration

## Configuration

Default configuration works with Steem network. You can also configure it for other compatible networks.

### Global Configuration with `steem.config.set()`

The `steem.config.set()` method is the recommended way to configure the library. It manages both global configuration and automatically synchronizes the API singleton instance.

#### Basic Usage

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

#### Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `nodes` | `string[]` | Array of API node URLs. The first node is used as the primary endpoint. | `['https://api.steemit.com']` |
| `address_prefix` | `string` | Address prefix for the blockchain (e.g., 'STM' for Steem, 'TST' for testnet). | `'STM'` |
| `chain_id` | `string` | Chain ID for the blockchain network. | `'0000000000000000000000000000000000000000000000000000000000000000'` |
| `debug` | `boolean` | Enable debug logging. | `false` |
| `debug_warnings` | `boolean` | Enable debug warnings. | `false` |

#### How `steem.config.set()` Works

When you call `steem.config.set({ nodes: [...] })`:

1. **Saves configuration globally**: The configuration values are stored in the global config instance, accessible via `steem.config.get()`.

2. **Automatically updates API singleton**: The first node from the `nodes` array is extracted and used to update the `steem.api` singleton instance's URL. This ensures that all API calls using `steem.api` will use the configured endpoint.

3. **Synchronizes state**: Both the global config and the API instance are kept in sync.

**Example:**

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

#### Get Configuration

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

### Direct API Configuration

If you need to change the API endpoint without updating the global configuration, you can use the API instance methods directly.

#### `steem.api.setUrl(url: string)`

Changes the API endpoint URL directly without updating the global config. This is useful when you want to temporarily switch endpoints or test different nodes.

```javascript
// Change API endpoint directly
steem.api.setUrl('https://api.steemit.com');

// This only affects the steem.api singleton instance
// The global config.nodes remains unchanged
```

**When to use:**
- Testing different API endpoints temporarily
- Switching endpoints without updating global config
- Quick endpoint changes for debugging

#### `steem.api.setOptions(options: ApiOptions)`

Provides more control over API instance configuration. This method allows you to set multiple options at once, including transport type, logger, and other advanced settings.

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

**Available Options:**

| Option | Type | Description |
|--------|------|-------------|
| `url` | `string` | API endpoint URL (must be HTTP/HTTPS) |
| `transport` | `string` | Transport type ('http' is the only supported value) |
| `logger` | `object` | Logger object with a `log` method |
| `useTestNet` | `boolean` | Enable testnet mode (sets address_prefix to 'TST') |
| `fetchMethod` | `function` | Custom fetch implementation for HTTP requests |

**Example with logger:**

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

#### Differences: `steem.config.set()` vs `steem.api.setUrl()`

| Method | Updates Global Config | Updates API Singleton | Use Case |
|--------|----------------------|---------------------|----------|
| `steem.config.set({ nodes: [...] })` | ✅ Yes | ✅ Yes (automatically) | Recommended for normal use. Sets both config and API endpoint. |
| `steem.api.setUrl(url)` | ❌ No | ✅ Yes | Quick endpoint change without affecting config. |
| `steem.api.setOptions(options)` | ❌ No | ✅ Yes | Advanced configuration with transport, logger, etc. |

**Best Practice:**

- **Use `steem.config.set()`** for initial setup and when you want to keep config and API in sync.
- **Use `steem.api.setUrl()`** for temporary endpoint changes or testing.
- **Use `steem.api.setOptions()`** when you need advanced configuration like custom loggers.

### Multiple API Instances

By default, `steem.api` is a singleton instance that's shared across your application. However, you can create multiple independent API instances using the `Api` class constructor. This is useful when you need to:

- Connect to multiple different API endpoints simultaneously
- Isolate API calls for different purposes
- Test different configurations without affecting the global instance

#### Creating Multiple Instances

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

#### Complete Example: Multiple Instances with Different Configurations

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

#### Example: Using Multiple Instances

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

#### Important Notes about Multiple Instances

1. **Independent Configuration**: Each `Api` instance has its own configuration and doesn't affect the global `steem.config` or the `steem.api` singleton.

2. **No Automatic Sync**: Changes to `steem.config.set()` will NOT affect instances created with `new Api()`. You need to call `setOptions()` or `setUrl()` on each instance individually.

3. **Memory Considerations**: Each instance maintains its own transport connection and state. Creating many instances may increase memory usage.

4. **Broadcast Module**: The `steem.broadcast` module uses the `steem.api` singleton by default. If you want to use a custom API instance with broadcast, you'll need to pass it explicitly or modify the broadcast module's API reference.

**Example: Using Custom API Instance with Broadcast**

```javascript
import { Api } from '@steemit/steem-js';
import { broadcast } from '@steemit/steem-js';

// Create a custom API instance
const customApi = new Api({ url: 'https://api.steemit.com' });

// Note: The broadcast module uses steem.api singleton by default
// To use a custom instance, you would need to modify the broadcast module
// or create a wrapper that uses your custom API instance
```


## JSON-RPC

## JSON-RPC

Activate JSON-RPC transport:

```javascript
steem.config.set({ nodes: ['https://api.steemit.com'] });
```

Authenticated RPC deserves its own chapter: `steem.api.signedCall` (and its Promise flavour `signedCallAsync`) sign requests with your private key, and the library ships a full signature-verification toolkit. Both topics - including the complete example guides - live on the [Signed calls and signature verification](/tutorials/steem-js/signed-calls.html) page.

## API routing

## API routing

Steem nodes expose multiple JSON-RPC plugin namespaces. steem-js maps each `steem.api.*` helper to a namespace in `src/api/methods.ts`.

### How requests are sent

| Style | Example | Wire format (HTTP) |
|-------|---------|-------------------|
| Generated helper | `steem.api.getAccountsAsync(['ned'])` | JSON-RPC `call` with `['condenser_api', 'get_accounts', [['ned']]]` |
| Explicit namespace | `steem.api.call('condenser_api.get_accounts', [['ned']])` | JSON-RPC method `condenser_api.get_accounts` |

As of **v1.0.16**, legacy read helpers (`get_accounts`, `get_content`, discussions, witnesses, …) use **`condenser_api`**, matching current [steem](https://github.com/steemit/steem) full nodes. Methods that remain on the modern **`database_api`** plugin include `get_config`, `get_dynamic_global_properties`, `get_transaction_hex`, `get_required_signatures`, `get_potential_signatures`, `verify_authority`, `verify_account_authority`, `get_order_book`, `get_witness_schedule`, `get_active_witnesses`, `get_feed_history`, and `find_change_recovery_account_requests`.

### Modern `database_api` (`list_*` / `find_*`)

The node's native `database_api` plugin uses different method names and object-shaped parameters (e.g. `database_api.find_accounts` with `{ accounts: ['user'] }`). Those are **not** exposed as camelCase helpers; call them with:

```javascript
await steem.api.callAsync('database_api.find_accounts', [{ accounts: ['initminer'] }]);
```

### Removed helpers (v1.0.16)

These `steem.api.*` methods were removed from the library because they are not implemented on current Steem nodes:

- WebSocket subscriptions: `setSubscribeCallback`, `setPendingTransactionCallback`, `setBlockAppliedCallback`, `cancelAllSubscriptions`
- Categories: `getTrendingCategories`, `getBestCategories`, `getActiveCategories`, `getRecentCategories`
- Discussions: `getDiscussionsByTrending30`, `getDiscussionsByPayout`
- Account: `getAccountNotifications`, `getAccountReputation`, `getAccountBandwidth`, `getAccountBandwidthByType`, `getAccountBandwidthByTypeAndTime`
- Market / mining: `getLiquidityQueue`, `getMinerQueue`
- Escrow: `getEscrowByFrom`, `getEscrowByTo`, `getEscrowByAgent`
- Proposed transactions: `getProposedTransactions`, `getProposedTransaction`, and related `getProposedTransactionApprovals*` variants

Use `getEscrow` / `condenser_api` or `database_api.list_escrows` / `find_escrows` where applicable.

## Usage Examples

## Usage Examples

### Basic Usage

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

### Voting Example

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

### Transfer Example

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

### Publishing Post Example

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

## Error Handling

All async methods will throw errors and should be handled appropriately:

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

## Security Notes

- Private keys are never logged or exposed
- Uses cryptographically secure random number generation
- All cryptographic operations use proper implementations
- Always verify transaction parameters in production
- Never hardcode private keys in client-side code


## TypeScript Support

## TypeScript Support

Steem.js fully supports TypeScript with complete type definitions:

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


## Where to go next

- [Reading chain data](/tutorials/steem-js/read-api.html) - the full read API catalogue with runnable examples.
- [Broadcasting operations](/tutorials/steem-js/broadcast.html) - every broadcast operation the library supports.
- [Signed calls and signature verification](/tutorials/steem-js/signed-calls.html) - authenticated requests and signature checks.
