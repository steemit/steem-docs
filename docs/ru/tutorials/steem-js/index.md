---
title: steem-js - начало работы
description: Установка и настройка библиотеки @steemit/steem-js — использование в браузере, config.set, api.setUrl, setOptions, несколько экземпляров API, маршрутизация JSON-RPC и сквозные примеры использования.
---

# steem-js: Начало работы

[steem-js](https://github.com/steemit/steem-js) — официальная библиотека JavaScript/TypeScript для блокчейна Steem (npm-пакет `@steemit/steem-js`, текущая версия 1.2.4). Этот туториал описывает установку, настройку и повседневные приёмы работы; материал перенесён из документации самой библиотеки.

> **v1.0.16+:** большинство читающих вспомогательных методов `steem.api` обращаются на узле к **`condenser_api`**; о пространствах имён, удалённых методах и современном использовании `list_*` / `find_*` в `database_api` см. [Маршрутизацию API](#api-routing).

В этом руководстве:

- [Установка](#installation) и [использование в браузере](#browser-usage)
- [Конфигурация](#configuration) — `steem.config.set()`, `steem.api.setUrl()`, `steem.api.setOptions()` и несколько экземпляров API
- обзор [JSON-RPC](#json-rpc) и [маршрутизация API](#api-routing)
- [Примеры использования](#usage-examples), [поддержка TypeScript](#typescript-support), [обработка ошибок](#error-handling) и [замечания по безопасности](#security-notes)

Читать вспомогательные методы только для чтения — в разделе [Чтение данных цепочки](/ru/tutorials/steem-js/read-api.html); широковещательные операции — в [Широковещательных операциях](/ru/tutorials/steem-js/broadcast.html); авторизованные вызовы описаны на странице [Подписанные вызовы и проверка подписи](/tutorials/steem-js/signed-calls.html).

## Установка {#installation}

## Установка

### Требования

- **Node.js**: >= 20.19.0 (обязательно для использования в Node.js)
- Современные браузеры с поддержкой ES6+ (для использования в браузере)

### npm / pnpm / yarn

```bash
npm install @steemit/steem-js
# or
pnpm install @steemit/steem-js
# or
yarn add @steemit/steem-js
```

### Браузер (CDN)

```html
<!-- Production: use minified version (692KB) -->
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.min.js"></script>

<!-- Development: use regular version (1.7MB) for better debugging -->
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.js"></script>
```

---

## Использование в браузере {#browser-usage}

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


## Конфигурация {#configuration}

## Конфигурация

Конфигурация по умолчанию подходит для сети Steem. Её можно настроить и для других совместимых сетей.

### Глобальная конфигурация с помощью `steem.config.set()`

Метод `steem.config.set()` — рекомендуемый способ настройки библиотеки. Он управляет глобальной конфигурацией и автоматически синхронизирует экземпляр-одиночку (singleton) API.

#### Базовое использование

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

#### Параметры конфигурации

| Опция | Тип | Описание | По умолчанию |
|--------|------|-------------|---------|
| `nodes` | `string[]` | Массив URL узлов API. Первый узел используется как основной эндпоинт. | `['https://api.steemit.com']` |
| `address_prefix` | `string` | Префикс адресов блокчейна (например, 'STM' для Steem, 'TST' для тестовой сети). | `'STM'` |
| `chain_id` | `string` | Идентификатор цепочки (chain ID) блокчейн-сети. | `'0000000000000000000000000000000000000000000000000000000000000000'` |
| `debug` | `boolean` | Включить отладочный журнал. | `false` |
| `debug_warnings` | `boolean` | Включить отладочные предупреждения. | `false` |

#### Как работает `steem.config.set()`

При вызове `steem.config.set({ nodes: [...] })`:

1. **Сохраняет конфигурацию глобально**: значения конфигурации хранятся в глобальном экземпляре config, доступном через `steem.config.get()`.

2. **Автоматически обновляет API-синглтон**: первый узел из массива `nodes` извлекается и используется для обновления URL экземпляра-одиночки `steem.api`. Благодаря этому все вызовы API через `steem.api` используют настроенный эндпоинт.

3. **Синхронизирует состояние**: глобальная конфигурация и экземпляр API всегда согласованы.

**Пример:**

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

#### Получение конфигурации

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

### Прямая конфигурация API

Если нужно сменить эндпоинт API, не обновляя глобальную конфигурацию, можно использовать методы экземпляра API напрямую.

#### `steem.api.setUrl(url: string)`

Меняет URL эндпоинта API напрямую, не обновляя глобальную конфигурацию. Полезно, когда нужно временно переключить эндпоинт или протестировать разные узлы.

```javascript
// Change API endpoint directly
steem.api.setUrl('https://api.steemit.com');

// This only affects the steem.api singleton instance
// The global config.nodes remains unchanged
```

**Когда применять:**
- временное тестирование разных эндпоинтов API;
- переключение эндпоинтов без обновления глобальной конфигурации;
- быстрая смена эндпоинта для отладки.

#### `steem.api.setOptions(options: ApiOptions)`

Даёт больше контроля над конфигурацией экземпляра API. Метод позволяет задать сразу несколько опций, включая тип транспорта, logger и другие расширенные настройки.

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

**Доступные опции:**

| Опция | Тип | Описание |
|--------|------|-------------|
| `url` | `string` | URL эндпоинта API (только HTTP/HTTPS) |
| `transport` | `string` | Тип транспорта (поддерживается только значение 'http') |
| `logger` | `object` | Объект logger с методом `log` |
| `useTestNet` | `boolean` | Включить режим тестовой сети (устанавливает address_prefix в 'TST') |
| `fetchMethod` | `function` | Своя реализация fetch для HTTP-запросов |

**Пример с logger:**

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

#### Различия: `steem.config.set()` и `steem.api.setUrl()`

| Метод | Обновляет глобальную конфигурацию | Обновляет API-синглтон | Сценарий |
|--------|----------------------|---------------------|----------|
| `steem.config.set({ nodes: [...] })` | ✅ Да | ✅ Да (автоматически) | Рекомендуется для обычного использования: задаёт и конфигурацию, и эндпоинт API. |
| `steem.api.setUrl(url)` | ❌ Нет | ✅ Да | Быстрая смена эндпоинта без изменения конфигурации. |
| `steem.api.setOptions(options)` | ❌ Нет | ✅ Да | Расширенная настройка: transport, logger и т.д. |

**Лучшие практики:**

- **используйте `steem.config.set()`** для первоначальной настройки и когда конфигурация и API должны оставаться синхронными;
- **используйте `steem.api.setUrl()`** для временной смены эндпоинта или тестирования;
- **используйте `steem.api.setOptions()`**, когда нужны расширенные настройки вроде собственного logger.

### Несколько экземпляров API

По умолчанию `steem.api` — экземпляр-одиночка, общий для всего приложения. Однако можно создать несколько независимых экземпляров API через конструктор класса `Api`. Это полезно, когда нужно:

- одновременно подключаться к нескольким разным эндпоинтам API;
- изолировать вызовы API по назначению;
- тестировать разные конфигурации, не затрагивая глобальный экземпляр.

#### Создание нескольких экземпляров

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

#### Полный пример: несколько экземпляров с разными конфигурациями

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

#### Пример: использование нескольких экземпляров

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

#### Важные замечания о нескольких экземплярах

1. **Независимая конфигурация**: у каждого экземпляра `Api` своя конфигурация, и он не влияет на глобальный `steem.config` или синглтон `steem.api`.

2. **Нет автоматической синхронизации**: изменения через `steem.config.set()` **не** затрагивают экземпляры, созданные через `new Api()`. Для каждого экземпляра нужно отдельно вызвать `setOptions()` или `setUrl()`.

3. **Память**: каждый экземпляр держит собственное транспортное соединение и состояние. Большое число экземпляров может увеличить расход памяти.

4. **Модуль широковещания**: модуль `steem.broadcast` по умолчанию использует синглтон `steem.api`. Чтобы использовать с широковещанием свой экземпляр API, его нужно передать явно или изменить ссылку на API в модуле широковещания.

**Пример: собственный экземпляр API вместе с широковещанием**

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

Включить транспорт JSON-RPC:

```javascript
steem.config.set({ nodes: ['https://api.steemit.com'] });
```

Авторизованный RPC заслуживает отдельной главы: `steem.api.signedCall` (и его вариант на Promise — `signedCallAsync`) подписывает запросы вашим приватным ключом, а библиотека поставляется с полным набором инструментов проверки подписи. Обе темы — с полными примерами-руководствами — описаны на странице [Подписанные вызовы и проверка подписи](/tutorials/steem-js/signed-calls.html).

## Маршрутизация API {#api-routing}

## Маршрутизация API

Узлы Steem предоставляют несколько пространств имён JSON-RPC-плагинов. steem-js в `src/api/methods.ts` сопоставляет каждому вспомогательному методу `steem.api.*` своё пространство имён.

### Как отправляются запросы

| Стиль | Пример | Формат в сети (HTTP) |
|-------|---------|-------------------|
| Сгенерированный вспомогательный метод | `steem.api.getAccountsAsync(['ned'])` | JSON-RPC `call` с `['condenser_api', 'get_accounts', [['ned']]]` |
| Явное пространство имён | `steem.api.call('condenser_api.get_accounts', [['ned']])` | JSON-RPC-метод `condenser_api.get_accounts` |

Начиная с **v1.0.16**, устаревшие читающие вспомогательные методы (`get_accounts`, `get_content`, discussions, witnesses и т.д.) используют **`condenser_api`**, как и текущие полные узлы [steem](https://github.com/steemit/steem). На современном плагине **`database_api`** остаются методы `get_config`, `get_dynamic_global_properties`, `get_transaction_hex`, `get_required_signatures`, `get_potential_signatures`, `verify_authority`, `verify_account_authority`, `get_order_book`, `get_witness_schedule`, `get_active_witnesses`, `get_feed_history` и `find_change_recovery_account_requests`.

### Современный `database_api` (`list_*` / `find_*`)

Нативный плагин узла `database_api` использует другие имена методов и параметры в виде объектов (например, `database_api.find_accounts` с `{ accounts: ['user'] }`). Они **не** представлены вспомогательными методами в camelCase; вызывать их так:

```javascript
await steem.api.callAsync('database_api.find_accounts', [{ accounts: ['initminer'] }]);
```

### Удалённые вспомогательные методы (v1.0.16)

Эти методы `steem.api.*` удалены из библиотеки, поскольку на текущих узлах Steem они не реализованы:

- подписки WebSocket: `setSubscribeCallback`, `setPendingTransactionCallback`, `setBlockAppliedCallback`, `cancelAllSubscriptions`;
- категории: `getTrendingCategories`, `getBestCategories`, `getActiveCategories`, `getRecentCategories`;
- обсуждения: `getDiscussionsByTrending30`, `getDiscussionsByPayout`;
- аккаунт: `getAccountNotifications`, `getAccountReputation`, `getAccountBandwidth`, `getAccountBandwidthByType`, `getAccountBandwidthByTypeAndTime`;
- рынок / майнинг: `getLiquidityQueue`, `getMinerQueue`;
- эскроу: `getEscrowByFrom`, `getEscrowByTo`, `getEscrowByAgent`;
- предложенные транзакции: `getProposedTransactions`, `getProposedTransaction` и родственные варианты `getProposedTransactionApprovals*`.

Где применимо, используйте `getEscrow` / `condenser_api` или `database_api.list_escrows` / `find_escrows`.

## Примеры использования {#usage-examples}

## Примеры использования

### Базовое использование

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

### Пример голосования

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

### Пример перевода

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

### Пример публикации поста

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

## Обработка ошибок {#error-handling}

Все асинхронные методы выбрасывают ошибки, и их следует корректно обрабатывать:

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

## Замечания по безопасности {#security-notes}

- приватные ключи никогда не логируются и не раскрываются;
- используется криптографически стойкая генерация случайных чисел;
- все криптографические операции используют корректные реализации;
- в продакшене всегда проверяйте параметры транзакций;
- никогда не зашивайте приватные ключи в клиентский код.


## Поддержка TypeScript {#typescript-support}

## Поддержка TypeScript

Steem.js полностью поддерживает TypeScript и поставляется с полными определениями типов:

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


## Что дальше

- [Чтение данных цепочки](/ru/tutorials/steem-js/read-api.html) — полный каталог читающего API с исполняемыми примерами.
- [Широковещательные операции](/ru/tutorials/steem-js/broadcast.html) — все операции широковещания, поддерживаемые библиотекой.
- [Подписанные вызовы и проверка подписи](/tutorials/steem-js/signed-calls.html) — авторизованные запросы и проверка подписей.
