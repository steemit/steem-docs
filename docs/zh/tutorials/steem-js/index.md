---
title: steem-js - 快速上手
description: 安装并配置 @steemit/steem-js 库——浏览器使用、config.set、api.setUrl、setOptions、多个 API 实例、JSON-RPC 路由与端到端使用示例。
---

# steem-js: 快速上手

[steem-js](https://github.com/steemit/steem-js) 是 Steem 区块链官方的 JavaScript/TypeScript 库（npm 包 `@steemit/steem-js`，当前版本为 1.2.4）。本教程介绍安装、配置与日常使用方式，内容迁移自该库自身的文档。

> **v1.0.16+：** 大多数 `steem.api` 读辅助方法在节点上调用的是 **`condenser_api`**；命名空间、已移除的方法以及现代 `database_api` 的 `list_*` / `find_*` 用法请参阅 [API 路由](#api-routing)。

本指南包含：

- [安装](#installation)与[浏览器使用](#browser-usage)
- [配置](#configuration)——`steem.config.set()`、`steem.api.setUrl()`、`steem.api.setOptions()` 以及多个 API 实例
- [JSON-RPC](#json-rpc) 概览与 [API 路由](#api-routing)
- [使用示例](#usage-examples)、[TypeScript 支持](#typescript-support)、[错误处理](#error-handling)与[安全须知](#security-notes)

只读 API 辅助方法见[读取链上数据](/zh/tutorials/steem-js/read-api.html)；广播操作见[广播操作](/zh/tutorials/steem-js/broadcast.html)；签名调用在[签名调用与签名验证](/tutorials/steem-js/signed-calls.html)中介绍。

## 安装 {#installation}

## 安装

### 环境要求

- **Node.js**：>= 20.19.0（在 Node.js 中使用时必需）
- 支持 ES6+ 的现代浏览器（在浏览器中使用）

### npm / pnpm / yarn

```bash
npm install @steemit/steem-js
# or
pnpm install @steemit/steem-js
# or
yarn add @steemit/steem-js
```

### 浏览器（CDN）

```html
<!-- Production: use minified version (692KB) -->
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.min.js"></script>

<!-- Development: use regular version (1.7MB) for better debugging -->
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.js"></script>
```

---

## 浏览器使用 {#browser-usage}

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


## 配置 {#configuration}

## 配置

默认配置即可用于 Steem 网络。也可以针对其他兼容网络进行配置。

### 使用 `steem.config.set()` 进行全局配置

`steem.config.set()` 方法是配置该库的推荐方式。它既管理全局配置，也会自动同步 API 单例实例。

#### 基本用法

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

#### 配置选项

| 选项 | 类型 | 说明 | 默认值 |
|--------|------|-------------|---------|
| `nodes` | `string[]` | API 节点 URL 数组。第一个节点作为主端点。 | `['https://api.steemit.com']` |
| `address_prefix` | `string` | 区块链的地址前缀（例如 Steem 用 'STM'，测试网用 'TST'）。 | `'STM'` |
| `chain_id` | `string` | 区块链网络的链 ID。 | `'0000000000000000000000000000000000000000000000000000000000000000'` |
| `debug` | `boolean` | 启用调试日志。 | `false` |
| `debug_warnings` | `boolean` | 启用调试警告。 | `false` |

#### `steem.config.set()` 的工作原理

调用 `steem.config.set({ nodes: [...] })` 时：

1. **全局保存配置**：配置值存入全局 config 实例，可通过 `steem.config.get()` 访问。

2. **自动更新 API 单例**：从 `nodes` 数组中取出第一个节点，用于更新 `steem.api` 单例实例的 URL。这保证所有通过 `steem.api` 发起的 API 调用都使用配置的端点。

3. **状态同步**：全局配置与 API 实例始终保持同步。

**示例：**

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

#### 获取配置

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

### 直接 API 配置

如果需要在不更新全局配置的情况下更改 API 端点，可以直接使用 API 实例方法。

#### `steem.api.setUrl(url: string)`

直接更改 API 端点 URL，而不更新全局配置。适用于临时切换端点或测试不同节点的场景。

```javascript
// Change API endpoint directly
steem.api.setUrl('https://api.steemit.com');

// This only affects the steem.api singleton instance
// The global config.nodes remains unchanged
```

**适用场景：**
- 临时测试不同的 API 端点
- 不更新全局配置而切换端点
- 调试时快速切换端点

#### `steem.api.setOptions(options: ApiOptions)`

提供对 API 实例配置的更多控制。该方法允许一次设置多个选项，包括传输类型、logger 以及其他高级设置。

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

**可用选项：**

| 选项 | 类型 | 说明 |
|--------|------|-------------|
| `url` | `string` | API 端点 URL（必须为 HTTP/HTTPS） |
| `transport` | `string` | 传输类型（仅支持 'http' 这一个值） |
| `logger` | `object` | 带 `log` 方法的 logger 对象 |
| `useTestNet` | `boolean` | 启用测试网模式（将 address_prefix 设为 'TST'） |
| `fetchMethod` | `function` | HTTP 请求的自定义 fetch 实现 |

**logger 示例：**

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

#### 区别：`steem.config.set()` 与 `steem.api.setUrl()`

| 方法 | 是否更新全局配置 | 是否更新 API 单例 | 使用场景 |
|--------|----------------------|---------------------|----------|
| `steem.config.set({ nodes: [...] })` | ✅ 是 | ✅ 是（自动） | 日常使用推荐。同时设置配置与 API 端点。 |
| `steem.api.setUrl(url)` | ❌ 否 | ✅ 是 | 快速切换端点，不影响配置。 |
| `steem.api.setOptions(options)` | ❌ 否 | ✅ 是 | 需要 transport、logger 等高级配置时使用。 |

**最佳实践：**

- **使用 `steem.config.set()`** 进行初始设置，或在希望配置与 API 保持同步时使用。
- **使用 `steem.api.setUrl()`** 做临时端点切换或测试。
- 需要自定义 logger 等高级配置时，**使用 `steem.api.setOptions()`**。

### 多个 API 实例

默认情况下，`steem.api` 是整个应用共享的单例实例。不过，你可以通过 `Api` 类构造函数创建多个相互独立的 API 实例。适用于：

- 同时连接多个不同的 API 端点
- 按用途隔离 API 调用
- 测试不同配置而不影响全局实例

#### 创建多个实例

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

#### 完整示例：不同配置的多个实例

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

#### 示例：使用多个实例

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

#### 关于多个实例的重要说明

1. **配置独立**：每个 `Api` 实例有自己的配置，不影响全局 `steem.config` 或 `steem.api` 单例。

2. **不自动同步**：对 `steem.config.set()` 的修改**不会**影响通过 `new Api()` 创建的实例。需要在每个实例上分别调用 `setOptions()` 或 `setUrl()`。

3. **内存开销**：每个实例维护自己的传输连接与状态。创建过多实例可能增加内存占用。

4. **广播模块**：`steem.broadcast` 模块默认使用 `steem.api` 单例。若想在广播时使用自定义 API 实例，需要显式传入或修改广播模块的 API 引用。

**示例：广播配合自定义 API 实例**

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

启用 JSON-RPC 传输：

```javascript
steem.config.set({ nodes: ['https://api.steemit.com'] });
```

需要鉴权的 RPC 值得单独成章：`steem.api.signedCall`（及其 Promise 形式 `signedCallAsync`）使用你的私钥对请求签名，库本身也提供了完整的签名验证工具。这两部分内容——包括完整的示例指南——都在[签名调用与签名验证](/tutorials/steem-js/signed-calls.html)页面。

## API 路由 {#api-routing}

## API 路由

Steem 节点暴露多个 JSON-RPC 插件命名空间。steem-js 在 `src/api/methods.ts` 中把每个 `steem.api.*` 辅助方法映射到一个命名空间。

### 请求的发送方式

| 方式 | 示例 | 线上格式（HTTP） |
|-------|---------|-------------------|
| 生成的辅助方法 | `steem.api.getAccountsAsync(['ned'])` | JSON-RPC `call`，参数为 `['condenser_api', 'get_accounts', [['ned']]]` |
| 显式命名空间 | `steem.api.call('condenser_api.get_accounts', [['ned']])` | JSON-RPC 方法 `condenser_api.get_accounts` |

自 **v1.0.16** 起，旧版读辅助方法（`get_accounts`、`get_content`、discussions、witnesses 等）使用 **`condenser_api`**，与当前 [steem](https://github.com/steemit/steem) 全节点保持一致。仍保留在现代 **`database_api`** 插件上的方法包括 `get_config`、`get_dynamic_global_properties`、`get_transaction_hex`、`get_required_signatures`、`get_potential_signatures`、`verify_authority`、`verify_account_authority`、`get_order_book`、`get_witness_schedule`、`get_active_witnesses`、`get_feed_history` 和 `find_change_recovery_account_requests`。

### 现代 `database_api`（`list_*` / `find_*`）

节点原生的 `database_api` 插件使用不同的方法名和对象形参数（例如 `database_api.find_accounts` 搭配 `{ accounts: ['user'] }`）。它们**不会**以 camelCase 辅助方法的形式暴露，请这样调用：

```javascript
await steem.api.callAsync('database_api.find_accounts', [{ accounts: ['initminer'] }]);
```

### 已移除的辅助方法（v1.0.16）

以下 `steem.api.*` 方法已从库中移除，因为当前的 Steem 节点并未实现它们：

- WebSocket 订阅：`setSubscribeCallback`、`setPendingTransactionCallback`、`setBlockAppliedCallback`、`cancelAllSubscriptions`
- 分类：`getTrendingCategories`、`getBestCategories`、`getActiveCategories`、`getRecentCategories`
- 讨论：`getDiscussionsByTrending30`、`getDiscussionsByPayout`
- 账户：`getAccountNotifications`、`getAccountReputation`、`getAccountBandwidth`、`getAccountBandwidthByType`、`getAccountBandwidthByTypeAndTime`
- 市场 / 矿工：`getLiquidityQueue`、`getMinerQueue`
- 托管（escrow）：`getEscrowByFrom`、`getEscrowByTo`、`getEscrowByAgent`
- 提案交易：`getProposedTransactions`、`getProposedTransaction` 及相关的 `getProposedTransactionApprovals*` 变体

适用时请改用 `getEscrow` / `condenser_api` 或 `database_api.list_escrows` / `find_escrows`。

## 使用示例 {#usage-examples}

## 使用示例

### 基本用法

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

### 投票示例

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

### 转账示例

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

### 发布帖子示例

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

## 错误处理 {#error-handling}

所有异步方法都会抛出错误，应当妥善处理：

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

## 安全须知 {#security-notes}

- 私钥不会被记录或暴露
- 使用密码学安全的随机数生成
- 所有密码学操作都使用正规实现
- 在生产环境中务必校验交易参数
- 绝不要在客户端代码中硬编码私钥


## TypeScript 支持 {#typescript-support}

## TypeScript 支持

Steem.js 完整支持 TypeScript，并提供完整的类型定义：

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


## 下一步

- [读取链上数据](/zh/tutorials/steem-js/read-api.html)——完整的读 API 目录，附可运行示例。
- [广播操作](/zh/tutorials/steem-js/broadcast.html)——库支持的全部广播操作。
- [签名调用与签名验证](/tutorials/steem-js/signed-calls.html)——需要鉴权的请求与签名校验。
