---
title: steem-js — 시작하기
description: "@steemit/steem-js 라이브러리 설치와 설정 — 브라우저 사용, config.set, api.setUrl, setOptions, 여러 API 인스턴스, JSON-RPC 라우팅 및 엔드투엔드 사용 예시."
---

# steem-js: 시작하기

[steem-js](https://github.com/steemit/steem-js)는 Steem 블록체인의 공식 JavaScript/TypeScript 라이브러리입니다(npm 패키지 `@steemit/steem-js`, 현재 버전 1.2.4). 이 튜토리얼은 설치, 설정, 일상적인 사용 패턴을 다루며, 내용은 라이브러리 자체 문서에서 옮겨 왔습니다.

> **v1.0.16+:** 대부분의 `steem.api` 읽기 헬퍼는 노드에서 **`condenser_api`**를 호출합니다. 네임스페이스, 제거된 메서드, 최신 `database_api`의 `list_*` / `find_*` 사용법은 [API 라우팅](#api-routing)을 참고하세요.

이 가이드의 내용:

- [설치](#installation)와 [브라우저에서 사용하기](#browser-usage)
- [설정](#configuration) — `steem.config.set()`, `steem.api.setUrl()`, `steem.api.setOptions()`와 여러 API 인스턴스
- [JSON-RPC](#json-rpc) 개요와 [API 라우팅](#api-routing)
- [사용 예시](#usage-examples), [TypeScript 지원](#typescript-support), [오류 처리](#error-handling), [보안 참고 사항](#security-notes)

읽기 전용 API 헬퍼는 [체인 데이터 읽기](/ko/tutorials/steem-js/read-api.html)에서 다룹니다. 브로드캐스트는 [브로드캐스트 오퍼레이션](/ko/tutorials/steem-js/broadcast.html)에서, 인증이 필요한 호출은 [서명된 호출과 서명 검증](/tutorials/steem-js/signed-calls.html)에서 설명합니다.

## 설치 {#installation}

## 설치

### 요구 사항

- **Node.js**: >= 20.19.0 (Node.js에서 사용할 때 필수)
- ES6+를 지원하는 최신 브라우저 (브라우저에서 사용할 때)

### npm / pnpm / yarn

```bash
npm install @steemit/steem-js
# or
pnpm install @steemit/steem-js
# or
yarn add @steemit/steem-js
```

### 브라우저 (CDN)

```html
<!-- Production: use minified version (692KB) -->
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.min.js"></script>

<!-- Development: use regular version (1.7MB) for better debugging -->
<script src="https://cdn.jsdelivr.net/npm/@steemit/steem-js/dist/index.umd.js"></script>
```

---

## 브라우저 사용 {#browser-usage}

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


## 설정 {#configuration}

## 설정

기본 설정은 Steem 네트워크에서 동작합니다. 다른 호환 네트워크에 맞게 설정할 수도 있습니다.

### `steem.config.set()`을 사용한 전역 설정

`steem.config.set()` 메서드는 라이브러리를 설정하는 권장 방식입니다. 전역 설정을 관리하는 동시에 API 싱글턴 인스턴스를 자동으로 동기화합니다.

#### 기본 사용법

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

#### 설정 옵션

| 옵션 | 타입 | 설명 | 기본값 |
|--------|------|-------------|---------|
| `nodes` | `string[]` | API 노드 URL 배열. 첫 번째 노드가 기본 엔드포인트로 사용됩니다. | `['https://api.steemit.com']` |
| `address_prefix` | `string` | 블록체인의 주소 접두사 (예: Steem은 'STM', 테스트넷은 'TST'). | `'STM'` |
| `chain_id` | `string` | 블록체인 네트워크의 체인 ID. | `'0000000000000000000000000000000000000000000000000000000000000000'` |
| `debug` | `boolean` | 디버그 로깅 활성화. | `false` |
| `debug_warnings` | `boolean` | 디버그 경고 활성화. | `false` |

#### `steem.config.set()`의 동작 방식

`steem.config.set({ nodes: [...] })`를 호출하면:

1. **설정을 전역으로 저장합니다**: 설정 값은 전역 config 인스턴스에 저장되며, `steem.config.get()`으로 접근할 수 있습니다.

2. **API 싱글턴을 자동으로 갱신합니다**: `nodes` 배열에서 첫 번째 노드를 추출해 `steem.api` 싱글턴 인스턴스의 URL을 갱신합니다. 덕분에 `steem.api`를 사용하는 모든 API 호출이 설정된 엔드포인트를 사용하게 됩니다.

3. **상태를 동기화합니다**: 전역 설정과 API 인스턴스가 항상 함께 유지됩니다.

**예시:**

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

#### 설정 조회

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

### API 직접 설정

전역 설정을 갱신하지 않고 API 엔드포인트를 바꿔야 한다면, API 인스턴스 메서드를 직접 사용할 수 있습니다.

#### `steem.api.setUrl(url: string)`

전역 설정을 갱신하지 않고 API 엔드포인트 URL을 직접 변경합니다. 엔드포인트를 임시로 전환하거나 여러 노드를 테스트할 때 유용합니다.

```javascript
// Change API endpoint directly
steem.api.setUrl('https://api.steemit.com');

// This only affects the steem.api singleton instance
// The global config.nodes remains unchanged
```

**사용 시점:**
- 여러 API 엔드포인트를 임시로 테스트할 때
- 전역 설정을 갱신하지 않고 엔드포인트를 전환할 때
- 디버깅을 위해 엔드포인트를 빠르게 바꿀 때

#### `steem.api.setOptions(options: ApiOptions)`

API 인스턴스 설정을 더 세밀하게 제어합니다. 이 메서드는 전송 방식(transport), logger 등 고급 설정을 포함해 여러 옵션을 한 번에 지정할 수 있게 해 줍니다.

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

**사용 가능한 옵션:**

| 옵션 | 타입 | 설명 |
|--------|------|-------------|
| `url` | `string` | API 엔드포인트 URL (HTTP/HTTPS여야 함) |
| `transport` | `string` | 전송 방식 ('http'만 지원됨) |
| `logger` | `object` | `log` 메서드를 가진 logger 객체 |
| `useTestNet` | `boolean` | 테스트넷 모드 활성화 (address_prefix를 'TST'로 설정) |
| `fetchMethod` | `function` | HTTP 요청용 커스텀 fetch 구현 |

**logger 사용 예시:**

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

#### 차이점: `steem.config.set()` vs `steem.api.setUrl()`

| 메서드 | 전역 설정 갱신 | API 싱글턴 갱신 | 사용 사례 |
|--------|----------------------|---------------------|----------|
| `steem.config.set({ nodes: [...] })` | ✅ 예 | ✅ 예 (자동) | 일반적인 용도에 권장. 설정과 API 엔드포인트를 함께 지정합니다. |
| `steem.api.setUrl(url)` | ❌ 아니요 | ✅ 예 | 설정에 영향을 주지 않는 빠른 엔드포인트 변경. |
| `steem.api.setOptions(options)` | ❌ 아니요 | ✅ 예 | transport, logger 등 고급 설정이 필요할 때. |

**모범 사례:**

- 초기 설정과 설정·API 동기화가 필요할 때는 **`steem.config.set()`을 사용하세요**.
- 임시 엔드포인트 변경이나 테스트에는 **`steem.api.setUrl()`을 사용하세요**.
- 커스텀 logger 같은 고급 설정이 필요할 때는 **`steem.api.setOptions()`를 사용하세요**.

### 다중 API 인스턴스

기본적으로 `steem.api`는 애플리케이션 전체가 공유하는 싱글턴 인스턴스입니다. 다만 `Api` 클래스 생성자로 여러 개의 독립적인 API 인스턴스를 만들 수도 있습니다. 다음과 같은 경우에 유용합니다:

- 서로 다른 여러 API 엔드포인트에 동시에 연결할 때
- 목적별로 API 호출을 격리할 때
- 전역 인스턴스에 영향을 주지 않고 여러 설정을 테스트할 때

#### 여러 인스턴스 생성

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

#### 전체 예제: 서로 다른 설정을 사용하는 다중 인스턴스

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

#### 예제: 다중 인스턴스 사용

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

#### 다중 인스턴스 관련 주의 사항

1. **독립적인 설정**: 각 `Api` 인스턴스는 자체 설정을 가지며, 전역 `steem.config`나 `steem.api` 싱글턴에 영향을 주지 않습니다.

2. **자동 동기화 없음**: `steem.config.set()`의 변경 사항은 `new Api()`로 만든 인스턴스에 적용되지 **않습니다**. 인스턴스마다 `setOptions()` 또는 `setUrl()`을 따로 호출해야 합니다.

3. **메모리**: 각 인스턴스는 자체 전송 연결과 상태를 유지합니다. 인스턴스를 많이 만들면 메모리 사용량이 늘어날 수 있습니다.

4. **브로드캐스트 모듈**: `steem.broadcast` 모듈은 기본적으로 `steem.api` 싱글턴을 사용합니다. 브로드캐스트에 커스텀 API 인스턴스를 사용하려면 인스턴스를 명시적으로 넘기거나 브로드캐스트 모듈의 API 참조를 수정해야 합니다.

**예시: 브로드캐스트에 커스텀 API 인스턴스 사용하기**

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

JSON-RPC 전송 방식 활성화:

```javascript
steem.config.set({ nodes: ['https://api.steemit.com'] });
```

인증이 필요한 RPC는 별도의 장으로 다룰 가치가 있습니다: `steem.api.signedCall`(및 Promise 버전인 `signedCallAsync`)은 개인 키로 요청에 서명하고, 라이브러리에는 완전한 서명 검증 도구 세트도 포함되어 있습니다. 두 주제 모두 — 전체 예제 가이드 포함 — [서명된 호출과 서명 검증](/tutorials/steem-js/signed-calls.html) 페이지에 있습니다.

## API 라우팅 {#api-routing}

## API 라우팅

Steem 노드는 여러 JSON-RPC 플러그인 네임스페이스를 노출합니다. steem-js는 `src/api/methods.ts`에서 각 `steem.api.*` 헬퍼를 네임스페이스에 매핑합니다.

### 요청이 전송되는 방식

| 방식 | 예시 | 와이어 포맷 (HTTP) |
|-------|---------|-------------------|
| 생성된 헬퍼 | `steem.api.getAccountsAsync(['ned'])` | `['condenser_api', 'get_accounts', [['ned']]]`를 담은 JSON-RPC `call` |
| 명시적 네임스페이스 | `steem.api.call('condenser_api.get_accounts', [['ned']])` | JSON-RPC 메서드 `condenser_api.get_accounts` |

**v1.0.16**부터 구버전 읽기 헬퍼(`get_accounts`, `get_content`, discussions, witnesses 등)는 현재 [steem](https://github.com/steemit/steem) 풀 노드와 맞물려 **`condenser_api`**를 사용합니다. 최신 **`database_api`** 플러그인에는 `get_config`, `get_dynamic_global_properties`, `get_transaction_hex`, `get_required_signatures`, `get_potential_signatures`, `verify_authority`, `verify_account_authority`, `get_order_book`, `get_witness_schedule`, `get_active_witnesses`, `get_feed_history`, `find_change_recovery_account_requests` 등의 메서드가 남아 있습니다.

### 최신 `database_api` (`list_*` / `find_*`)

노드의 네이티브 `database_api` 플러그인은 다른 메서드 이름과 객체 형태의 파라미터를 사용합니다(예: `{ accounts: ['user'] }`를 받는 `database_api.find_accounts`). 이들은 camelCase 헬퍼로 노출되지 **않으며**, 다음처럼 호출합니다:

```javascript
await steem.api.callAsync('database_api.find_accounts', [{ accounts: ['initminer'] }]);
```

### 제거된 헬퍼 (v1.0.16)

다음 `steem.api.*` 메서드들은 현재 Steem 노드에 구현되어 있지 않아 라이브러리에서 제거되었습니다:

- WebSocket 구독: `setSubscribeCallback`, `setPendingTransactionCallback`, `setBlockAppliedCallback`, `cancelAllSubscriptions`
- 카테고리: `getTrendingCategories`, `getBestCategories`, `getActiveCategories`, `getRecentCategories`
- 디스커션: `getDiscussionsByTrending30`, `getDiscussionsByPayout`
- 계정: `getAccountNotifications`, `getAccountReputation`, `getAccountBandwidth`, `getAccountBandwidthByType`, `getAccountBandwidthByTypeAndTime`
- 마켓 / 채굴: `getLiquidityQueue`, `getMinerQueue`
- 에스크로: `getEscrowByFrom`, `getEscrowByTo`, `getEscrowByAgent`
- 제안된 트랜잭션: `getProposedTransactions`, `getProposedTransaction` 및 관련 변형인 `getProposedTransactionApprovals*`

해당되는 곳에는 `getEscrow` / `condenser_api` 또는 `database_api.list_escrows` / `find_escrows`를 사용하세요.

## 사용 예제 {#usage-examples}

## 사용 예제

### 기본 사용법

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

### 투표 예제

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

### 전송 예제

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

### 포스트 발행 예제

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

## 오류 처리 {#error-handling}

모든 비동기 메서드는 오류를 던지므로 적절히 처리해야 합니다:

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

## 보안 참고 사항 {#security-notes}

- 개인 키는 로그에 남거나 노출되지 않습니다
- 암호학적으로 안전한 난수 생성을 사용합니다
- 모든 암호화 연산은 적절한 구현체를 사용합니다
- 프로덕션에서는 트랜잭션 파라미터를 항상 검증하세요
- 클라이언트 코드에 개인 키를 하드코딩하지 마세요


## TypeScript 지원 {#typescript-support}

## TypeScript 지원

Steem.js는 완전한 타입 정의와 함께 TypeScript를 완전히 지원합니다:

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


## 다음 단계

- [체인 데이터 읽기](/ko/tutorials/steem-js/read-api.html) — 실행 가능한 예시가 담긴 읽기 API 전체 카탈로그.
- [브로드캐스트 오퍼레이션](/ko/tutorials/steem-js/broadcast.html) — 라이브러리가 지원하는 모든 브로드캐스트 오퍼레이션.
- [서명된 호출과 서명 검증](/tutorials/steem-js/signed-calls.html) — 인증이 필요한 요청과 서명 검사.
