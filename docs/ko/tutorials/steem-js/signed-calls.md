---
title: steem-js - 서명된 호출과 서명 검증
description: signedCall/signedCallAsync를 통한 인증된 steem-js RPC와 서명 검증 도구 모음 - 서명된 RPC 요청, 메시지 서명, 트랜잭션 검증의 전체 예제 가이드.
---

# steem-js: 서명된 호출과 서명 검증

일부 데이터와 오퍼레이션은 계정 소유권(account ownership) 증명을 필요로 합니다. steem-js는 서로 협동하는 두 가지 도구 모음을 제공합니다. 인증된 JSON-RPC 요청을 위한 `steem.api.signedCall`과 수신 측에서 서명을 검사하는 `signatureVerification`입니다. 이 페이지는 라이브러리의 서명 호출 및 서명 검증 예제 가이드를 하나로 묶은 것입니다. 여기서 사용하는 읽기 헬퍼는 [체인 데이터 읽기](/ko/tutorials/steem-js/read-api.html) 문서에 정리되어 있습니다.

## 서명된 RPC 호출

## 서명된 RPC 호출

인증이 필요한 보안 RPC 호출에는 `signedCall`을 사용하십시오. 이 메서드는 요청을 개인 키로 서명하여 계정 소유권을 증명합니다.

#### signedCall

Steem 블록체인으로 서명된 JSON-RPC 호출을 보냅니다. 요청은 암호학적으로 서명되어 호출자를 인증합니다. 이것은 콜백 기반 버전입니다. Promise 기반 사용법은 아래의 `signedCallAsync`를 참고하십시오.

```javascript
steem.api.signedCall(method, params, account, privateKey, callback);
```

**파라미터 설명:**

| 파라미터 | 데이터 타입 | 설명 |
|---------|--------|-----------|
| method | string | 전체 RPC 메서드 이름(예: `condenser_api.get_account_history`) |
| params | array | RPC 메서드의 파라미터 |
| account | string | 요청을 보내는 계정 이름 |
| privateKey | string | 서명에 사용할 개인 키(WIF 형식) |
| callback | function | 콜백 함수 callback(err, result) |

**요구 사항:**
- 모든 API 호출에 HTTP 전송을 사용합니다
- 유효한 WIF 형식의 개인 키가 필요합니다
- 계정은 개인 키와 일치해야 합니다

**호출 예제:**

```javascript
// Configure for HTTP transport
steem.config.set({ 
  nodes: ['https://api.steemit.com'],
  transport: 'http' 
});

// Make a signed call
const privateKey = '5JLw5dgQAx6rhZEgNN5C2ds1V47RweGshynFSWFbaMohsYsBvE8';
const account = 'username';

// Using callback style
steem.api.signedCall(
  'condenser_api.get_account_history',
  [account, -1, 10],
  account,
  privateKey,
  function(err, result) {
    if (err) {
      console.error('Signed call failed:', err);
    } else {
      console.log('Account history:', result);
    }
  }
);
```

#### signedCallAsync

async/await 문법과 함께 사용할 수 있는 `signedCall`의 Promise 기반 버전입니다.

```javascript
steem.api.signedCallAsync(method, params, account, privateKey);
```

**반환값:** 결과와 함께 이행하거나 오류와 함께 거부되는 Promise.

**Promise 예제:**

```javascript
// Using signedCallAsync with async/await
try {
  const result = await steem.api.signedCallAsync(
    'condenser_api.get_account_history',
    ['username', -1, 10],
    'username',
    privateKey
  );
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}
```

**보안 참고 사항:**
- 요청에는 리플레이 공격(replay attack)을 막기 위한 타임스탬프와 nonce가 포함됩니다
- 서명은 60초 후 만료됩니다
- 개인 키는 절대 전송되지 않으며 서명만 전송됩니다
- 모든 요청은 암호학적 증명과 함께 고유하게 서명됩니다

**사용 사례:**
- 비공개 계정 데이터 접근
- 인증된 API 호출 수행
- 계정 소유권 증명
- Steem 노드와의 안전한 통신

## 서명 검증

서명된 요청과 메시지를 검증하기 위해 Steem.js는 포괄적인 검증 유틸리티를 제공합니다:

```javascript
import { signatureVerification } from '@steemit/steem-js/api';

// Verify a signed RPC request
const getAccountKeys = signatureVerification.createApiVerificationFunction(steem.api);
const result = await signatureVerification.verifySignedRequest(signedRequest, getAccountKeys);

if (result.valid) {
  console.log('✅ Signature verified for account:', result.account);
  console.log('Decoded parameters:', result.params);
} else {
  console.log('❌ Verification failed:', result.error);
}

// Verify a simple message signature
const message = 'Hello, Steem!';
const signature = steem.auth.sign(message, privateKey);
const publicKey = steem.auth.wifToPublic(privateKey);
const isValid = signatureVerification.verifyMessageSignature(message, signature, publicKey);
```

**검증 기능:**
- **서명된 요청 검사(Signed Request Validation)**: 완전한 서명된 RPC 요청 검증
- **메시지 서명 검증(Message Signature Verification)**: 개별 메시지 서명 검증
- **일괄 검증(Batch Verification)**: 여러 요청을 동시에 검증
- **만료 확인(Expiration Checking)**: 서명 만료 자동 검사
- **형식 검사(Format Validation)**: 서명과 키 형식 검사
- **계정 키 추출(Account Key Extraction)**: 계정 데이터에서 공개 키 추출

**이 페이지의 나머지 부분은 signedCall과 서명 검증의 전체 예제를 모아 담고 있습니다.**

---

## signedCall 예제

아래 하위 섹션은 라이브러리 문서의 전체 signedCall 예제입니다.

이 문서는 인증된 API 요청을 위해 Steem.js에서 `signedCall`을 사용하는 포괄적인 예제를 제공합니다.

## 개요

`signedCall`은 Steem 블록체인으로 인증된 JSON-RPC 호출을 보내는 데 사용됩니다. 요청에 암호학적으로 서명하여 계정 소유권을 증명하고 비공개 또는 제한된 데이터에 접근합니다.

전체 RPC 메서드 이름을 전달하십시오(예: `condenser_api.get_account_history`). 레거시 읽기 메서드는 현재 노드에서 **`condenser_api`** 네임스페이스를 사용합니다. 입문 튜토리얼의 [API 라우팅](/ko/tutorials/steem-js/index.html#api-routing)을 참고하십시오.

## 기본 설정

```javascript
import { steem } from '@steemit/steem-js';

// Configure for HTTP transport (required for signedCall)
steem.config.set({
  nodes: ['https://api.steemit.com'],
  transport: 'http'
});
```

## 인증 방법

### 사용자 이름과 비밀번호 사용

```javascript
// Generate private key from username/password
const username = 'your-username';
const password = 'your-password';
const activeKey = steem.auth.toWif(username, password, 'active');
const postingKey = steem.auth.toWif(username, password, 'posting');
```

### 기존 개인 키 사용

```javascript
// Use existing WIF private key
const privateKey = '5JLw5dgQAx6rhZEgNN5C2ds1V47RweGshynFSWFbaMohsYsBvE8';
const account = 'username';
```

## signedCall 기본 예제

### 1. 계정 기록 조회(인증 필요)

```javascript
function getAccountHistorySigned(account, privateKey) {
  return new Promise((resolve, reject) => {
    steem.api.signedCall(
      'condenser_api.get_account_history',
      [account, -1, 100],
      account,
      privateKey,
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}

// Usage
const account = 'username';
const privateKey = steem.auth.toWif(account, 'password', 'active');

getAccountHistorySigned(account, privateKey)
  .then(history => {
    console.log('Account history:', history);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### 2. 비공개 계정 정보 조회

```javascript
async function getPrivateAccountInfo(account, privateKey) {
  try {
    // Get detailed account information with private data
    const result = await new Promise((resolve, reject) => {
      steem.api.signedCall(
        'condenser_api.get_accounts',
        [[account]],
        account,
        privateKey,
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    
    return result[0]; // Return first account
  } catch (error) {
    throw new Error(`Failed to get account info: ${error.message}`);
  }
}

// Usage
getPrivateAccountInfo('username', privateKey)
  .then(accountInfo => {
    console.log('Private account data:', {
      name: accountInfo.name,
      balance: accountInfo.balance,
      sbd_balance: accountInfo.sbd_balance,
      vesting_shares: accountInfo.vesting_shares
    });
  });
```

### 3. 위트니스(witness) 정보 조회(인증 필요)

```javascript
function getWitnessInfoSigned(witnessAccount, privateKey) {
  return new Promise((resolve, reject) => {
    steem.api.signedCall(
      'condenser_api.get_witness_by_account',
      [witnessAccount],
      witnessAccount,
      privateKey,
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}

// Usage
getWitnessInfoSigned('witness-account', privateKey)
  .then(witnessInfo => {
    console.log('Witness information:', witnessInfo);
  });
```

## 심화 예제

### 4. 일괄 서명 요청

```javascript
class SignedApiClient {
  constructor(account, privateKey) {
    this.account = account;
    this.privateKey = privateKey;
  }

  async call(method, params) {
    return new Promise((resolve, reject) => {
      steem.api.signedCall(
        method,
        params,
        this.account,
        this.privateKey,
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async getAccountHistory(limit = 100) {
    return this.call('condenser_api.get_account_history', [this.account, -1, limit]);
  }

  async getFollowers(limit = 100) {
    return this.call('condenser_api.get_followers', [this.account, '', 'blog', limit]);
  }

  async getFollowing(limit = 100) {
    return this.call('condenser_api.get_following', [this.account, '', 'blog', limit]);
  }
}

// Usage
const client = new SignedApiClient('username', privateKey);

async function getUserData() {
  try {
    const [history, followers, following] = await Promise.all([
      client.getAccountHistory(50),
      client.getFollowers(100),
      client.getFollowing(100)
    ]);

    console.log('User data loaded:', {
      historyCount: history.length,
      followersCount: followers.length,
      followingCount: following.length
    });
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
}

getUserData();
```

### 5. 오류 처리와 재시도 로직

```javascript
class RobustSignedClient {
  constructor(account, privateKey, maxRetries = 3) {
    this.account = account;
    this.privateKey = privateKey;
    this.maxRetries = maxRetries;
  }

  async callWithRetry(method, params, retryCount = 0) {
    try {
      return await this.makeSignedCall(method, params);
    } catch (error) {
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        console.log(`Retrying ${method}, attempt ${retryCount + 1}/${this.maxRetries}`);
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.callWithRetry(method, params, retryCount + 1);
      }
      throw error;
    }
  }

  makeSignedCall(method, params) {
    return new Promise((resolve, reject) => {
      steem.api.signedCall(method, params, this.account, this.privateKey, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  isRetryableError(error) {
    const retryableErrors = [
      'network error',
      'timeout',
      'connection refused',
      'signature expired'
    ];
    
    return retryableErrors.some(errorType => 
      error.message.toLowerCase().includes(errorType)
    );
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const robustClient = new RobustSignedClient('username', privateKey);

robustClient.callWithRetry('condenser_api.get_account_history', ['username', -1, 100])
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Final error:', error));
```

### 6. 검사와 보안

```javascript
class SecureSignedClient {
  constructor(account, privateKey) {
    this.account = account;
    this.privateKey = privateKey;
    this.validateCredentials();
  }

  validateCredentials() {
    // Validate account name
    if (!this.account || typeof this.account !== 'string') {
      throw new Error('Invalid account name');
    }

    // Validate private key format
    if (!steem.auth.isWif(this.privateKey)) {
      throw new Error('Invalid private key format');
    }

    // Verify key matches account (optional, requires additional API call)
    const publicKey = steem.auth.wifToPublic(this.privateKey);
    console.log(`Using public key: ${publicKey} for account: ${this.account}`);
  }

  async secureCall(method, params) {
    // Additional security checks
    // Prefer condenser_api.* for legacy reads; database_api.* for config/validation and list/find APIs.
    if (!method.startsWith('condenser_api.') && !method.startsWith('database_api.')) {
      throw new Error('Only condenser_api and database_api methods are allowed');
    }

    // Rate limiting (simple implementation)
    if (this.lastCallTime && Date.now() - this.lastCallTime < 1000) {
      throw new Error('Rate limit: Wait at least 1 second between calls');
    }

    this.lastCallTime = Date.now();

    return new Promise((resolve, reject) => {
      steem.api.signedCall(method, params, this.account, this.privateKey, (err, result) => {
        if (err) {
          console.error(`Signed call failed for ${method}:`, err.message);
          reject(err);
        } else {
          console.log(`Signed call successful for ${method}`);
          resolve(result);
        }
      });
    });
  }
}

// Usage
const secureClient = new SecureSignedClient('username', privateKey);

secureClient.secureCall('condenser_api.get_accounts', [['username']])
  .then(result => console.log('Secure result:', result))
  .catch(error => console.error('Secure error:', error));
```

## 자주 있는 사용 사례

### 계정 관리

```javascript
// Get comprehensive account data
async function getFullAccountData(account, privateKey) {
  const client = new SignedApiClient(account, privateKey);
  
  const [
    accountInfo,
    history,
    followers,
    following
  ] = await Promise.all([
    client.call('condenser_api.get_accounts', [[account]]),
    client.call('condenser_api.get_account_history', [account, -1, 100]),
    client.call('condenser_api.get_followers', [account, '', 'blog', 1000]),
    client.call('condenser_api.get_following', [account, '', 'blog', 1000])
  ]);

  return {
    account: accountInfo[0],
    recentActivity: history,
    followers: followers,
    following: following
  };
}
```

### 콘텐츠 분석

```javascript
// Analyze user's content and voting patterns
async function analyzeUserActivity(account, privateKey) {
  const client = new SignedApiClient(account, privateKey);
  
  const history = await client.call('condenser_api.get_account_history', [account, -1, 1000]);
  
  const analysis = {
    posts: 0,
    comments: 0,
    votes: 0,
    transfers: 0,
    other: 0
  };

  history.forEach(([, operation]) => {
    const opType = operation.op[0];
    switch (opType) {
      case 'comment':
        if (operation.op[1].parent_author === '') {
          analysis.posts++;
        } else {
          analysis.comments++;
        }
        break;
      case 'vote':
        analysis.votes++;
        break;
      case 'transfer':
        analysis.transfers++;
        break;
      default:
        analysis.other++;
    }
  });

  return analysis;
}
```

## 오류 처리

### 자주 발생하는 오류와 해결 방법

```javascript
function handleSignedCallError(error) {
  switch (true) {
    case error.message.includes('RPC methods can only be called when using http transport'):
      console.error('Solution: Configure HTTP transport instead of WebSocket');
      console.log('steem.config.set({ transport: "http" });');
      break;
      
    case error.message.includes('Signature expired'):
      console.error('Solution: Request expired, retry with fresh signature');
      break;
      
    case error.message.includes('Invalid private key'):
      console.error('Solution: Check private key format (should be WIF)');
      break;
      
    case error.message.includes('Account not found'):
      console.error('Solution: Verify account name is correct');
      break;
      
    default:
      console.error('Unknown error:', error.message);
  }
}

// Usage in error handling
steem.api.signedCall(method, params, account, privateKey, (err, result) => {
  if (err) {
    handleSignedCallError(err);
    return;
  }
  
  console.log('Success:', result);
});
```

### signedCallAsync 사용(Promise 기반)

현대적인 async/await 코드에서는 `signedCallAsync`를 사용하십시오:

```javascript
try {
  const result = await steem.api.signedCallAsync(
    'conveyor.is_email_registered',
    [{ email: 'user@example.com' }],
    'your-account',
    'your-private-key-wif'
  );
  
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error);
}
```

콜백 버전과 동일하지만 Promise를 사용하므로 async/await 문법과 함께 더 쉽게 사용할 수 있습니다.

## 모범 사례

1. 서명된 호출에는 **항상 HTTPS 엔드포인트를 사용**하십시오
2. 호출 전에 **개인 키를 검사**하십시오
3. 네트워크 오류에는 **재시도 로직을 구현**하십시오
4. API에 과부하가 걸리지 않도록 **속도 제한을 사용**하십시오
5. **서명 만료를 적절히 처리**하십시오
6. 프로덕션에서는 개인 키를 **절대 로그에 남기지 마십시오**
7. 민감한 데이터에는 **환경 변수를 사용**하십시오
8. 모든 시나리오에 **적절한 오류 처리를 구현**하십시오

## signedCall 보안 고려 사항

- 개인 키는 네트워크를 통해 절대 전송되지 않습니다
- 모든 요청에는 고유한 nonce와 타임스탬프가 포함됩니다
- 리플레이 공격을 막기 위해 서명은 60초 후 만료됩니다
- 엔드포인트가 HTTPS를 사용하는지 항상 확인하십시오
- 개인 키는 안전하게 보관하십시오(절대 평문으로 저장하지 마십시오)
- 프로덕션 애플리케이션에서는 하드웨어 월렛을 고려하십시오

## 테스트

```javascript
// Test signedCall functionality
describe('SignedCall Tests', () => {
  const testAccount = 'test-account';
  const testPrivateKey = '5JLw5dgQAx6rhZEgNN5C2ds1V47RweGshynFSWFbaMohsYsBvE8';

  it('should make successful signed call', (done) => {
    steem.api.signedCall(
      'condenser_api.get_accounts',
      [[testAccount]],
      testAccount,
      testPrivateKey,
      (err, result) => {
        expect(err).toBeNull();
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        done();
      }
    );
  });

  it('should handle invalid private key', (done) => {
    steem.api.signedCall(
      'condenser_api.get_accounts',
      [[testAccount]],
      testAccount,
      'invalid-key',
      (err, result) => {
        expect(err).toBeDefined();
        expect(err.message).toContain('Invalid private key');
        done();
      }
    );
  });
});
```

이 포괄적인 가이드는 Steem.js 애플리케이션에서 `signedCall`을 효과적으로 구현하는 데 도움이 될 것입니다.

---

## 서명 검증 예제

이 문서는 서명된 RPC 요청과 일반 메시지 서명을 포함하여 Steem.js에서 서명을 검증하는 포괄적인 예제를 제공합니다.

## 검증 개요

서명 검증은 다음 면에서 매우 중요합니다:
- 서명된 RPC 요청의 진위성 검증
- 메시지가 변조되지 않았음을 보장
- 계정 소유권 확인
- 안전한 인증 시스템 구현

## 기본 설정

```javascript
import { steem } from '@steemit/steem-js';
import { signatureVerification } from '@steemit/steem-js/api';

// Configure API
steem.config.set({
  nodes: ['https://api.steemit.com'],
  transport: 'http'
});
```

## 1. 서명된 RPC 요청 검증

### 기본 검증

```javascript
async function verifySignedRpcRequest(signedRequest) {
  try {
    // Create account key fetcher
    const getAccountKeys = signatureVerification.createApiVerificationFunction(steem.api);
    
    // Verify the signed request
    const result = await signatureVerification.verifySignedRequest(signedRequest, getAccountKeys);
    
    if (result.valid) {
      console.log('✅ Signature verified successfully');
      console.log('Account:', result.account);
      console.log('Timestamp:', result.timestamp);
      console.log('Decoded params:', result.params);
      return true;
    } else {
      console.log('❌ Signature verification failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}

// Example usage
const signedRequest = {
  jsonrpc: '2.0',
  method: 'condenser_api.get_accounts',
  id: 1,
  params: {
    __signed: {
      account: 'username',
      nonce: '1234567890abcdef',
      params: 'WyJ1c2VybmFtZSJd', // base64 encoded ["username"]
      signatures: ['304502210...'], // hex signature
      timestamp: '2025-01-01T12:00:00.000Z'
    }
  }
};

verifySignedRpcRequest(signedRequest);
```

### 서명-검증 전체 흐름

```javascript
async function completeSignAndVerifyWorkflow() {
  const account = 'username';
  const password = 'password';
  const privateKey = steem.auth.toWif(account, password, 'active');
  
  try {
    // Step 1: Create and sign a request
    const request = {
      method: 'condenser_api.get_accounts',
      params: [[account]],
      id: 1
    };
    
    const signedRequest = steem.api.signRequest(request, account, [privateKey]);
    console.log('✅ Request signed successfully');
    
    // Step 2: Verify the signed request
    const getAccountKeys = signatureVerification.createApiVerificationFunction(steem.api);
    const verificationResult = await signatureVerification.verifySignedRequest(
      signedRequest, 
      getAccountKeys
    );
    
    if (verificationResult.valid) {
      console.log('✅ Signature verification successful');
      console.log('Verified account:', verificationResult.account);
      console.log('Original params:', verificationResult.params);
    } else {
      console.log('❌ Verification failed:', verificationResult.error);
    }
    
    return verificationResult;
  } catch (error) {
    console.error('Workflow error:', error);
    return { valid: false, error: error.message };
  }
}

completeSignAndVerifyWorkflow();
```

## 2. 메시지 서명 검증

### 간단한 메시지 검증

```javascript
function verifySimpleMessage() {
  const message = 'Hello, Steem blockchain!';
  const privateKey = '5JLw5dgQAx6rhZEgNN5C2ds1V47RweGshynFSWFbaMohsYsBvE8';
  const publicKey = steem.auth.wifToPublic(privateKey);
  
  // Sign the message
  const signature = steem.auth.sign(message, privateKey);
  console.log('Message signed:', signature);
  
  // Verify the signature
  const isValid = signatureVerification.verifyMessageSignature(message, signature, publicKey);
  console.log('Signature valid:', isValid);
  
  return isValid;
}

verifySimpleMessage();
```

### 다중 서명 검증

```javascript
function verifyMultipleSignatures() {
  const message = 'Multi-signature test message';
  
  // Create multiple key pairs
  const keys = [
    { private: '5JLw5dgQAx6rhZEgNN5C2ds1V47RweGshynFSWFbaMohsYsBvE8' },
    { private: '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3' }
  ].map(k => ({
    ...k,
    public: steem.auth.wifToPublic(k.private)
  }));
  
  // Sign with multiple keys
  const signatures = keys.map(key => steem.auth.sign(message, key.private));
  const publicKeys = keys.map(key => key.public);
  
  console.log('Signatures created:', signatures.length);
  
  // Verify multiple signatures
  const result = signatureVerification.verifyMultipleSignatures(
    message, 
    signatures, 
    publicKeys
  );
  
  console.log('Verification result:', {
    verified: result.verified,
    validSignatures: result.validSignatures,
    totalChecked: result.details.length
  });
  
  // Show detailed results
  result.details.forEach((detail, index) => {
    console.log(`Signature ${index + 1}:`, detail.valid ? '✅' : '❌');
  });
  
  return result;
}

verifyMultipleSignatures();
```

## 3. 일괄 검증

### 여러 서명된 요청 검증

```javascript
async function batchVerifyRequests() {
  const account = 'username';
  const privateKey = steem.auth.toWif(account, 'password', 'active');
  
  // Create multiple signed requests
  const requests = [
    { method: 'condenser_api.get_accounts', params: [[account]], id: 1 },
    { method: 'condenser_api.get_account_history', params: [account, -1, 10], id: 2 },
    { method: 'condenser_api.get_followers', params: [account, '', 'blog', 10], id: 3 }
  ];
  
  const signedRequests = requests.map(req => 
    steem.api.signRequest(req, account, [privateKey])
  );
  
  console.log(`Created ${signedRequests.length} signed requests`);
  
  // Batch verify all requests
  const getAccountKeys = signatureVerification.createApiVerificationFunction(steem.api);
  const results = await signatureVerification.batchVerifySignedRequests(
    signedRequests, 
    getAccountKeys
  );
  
  console.log('Batch verification results:');
  results.forEach((result, index) => {
    console.log(`Request ${index + 1}:`, result.valid ? '✅' : '❌', result.error || 'Valid');
  });
  
  const validCount = results.filter(r => r.valid).length;
  console.log(`${validCount}/${results.length} requests verified successfully`);
  
  return results;
}

batchVerifyRequests();
```

## 4. 심화 검증 시나리오

### 사용자 지정 계정 키 제공자

```javascript
class CustomAccountKeyProvider {
  constructor() {
    this.keyCache = new Map();
  }
  
  async getAccountKeys(account) {
    // Check cache first
    if (this.keyCache.has(account)) {
      console.log(`Using cached keys for ${account}`);
      return this.keyCache.get(account);
    }
    
    try {
      // Fetch from API
      const accountData = await new Promise((resolve, reject) => {
        steem.api.call('condenser_api.get_accounts', [[account]], (err, result) => {
          if (err) reject(err);
          else resolve(result[0]);
        });
      });
      
      const keys = signatureVerification.extractAccountKeys(accountData);
      
      // Cache the keys
      this.keyCache.set(account, keys);
      console.log(`Fetched and cached keys for ${account}`);
      
      return keys;
    } catch (error) {
      throw new Error(`Failed to get keys for ${account}: ${error.message}`);
    }
  }
}

async function useCustomKeyProvider() {
  const keyProvider = new CustomAccountKeyProvider();
  const account = 'username';
  
  // Create a signed request
  const request = steem.api.signRequest(
    { method: 'condenser_api.get_accounts', params: [[account]], id: 1 },
    account,
    [steem.auth.toWif(account, 'password', 'active')]
  );
  
  // Verify using custom provider
  const result = await signatureVerification.verifySignedRequest(
    request,
    (acc) => keyProvider.getAccountKeys(acc)
  );
  
  console.log('Custom verification result:', result.valid ? '✅' : '❌');
  return result;
}

useCustomKeyProvider();
```

### 서명 만료 확인

```javascript
function checkSignatureExpiration() {
  const timestamps = [
    new Date().toISOString(), // Current time
    new Date(Date.now() - 30000).toISOString(), // 30 seconds ago
    new Date(Date.now() - 120000).toISOString(), // 2 minutes ago (expired)
    'invalid-timestamp'
  ];
  
  console.log('Checking signature expiration:');
  timestamps.forEach((timestamp, index) => {
    const isExpired = signatureVerification.isSignatureExpired(timestamp);
    console.log(`Timestamp ${index + 1}: ${isExpired ? '❌ Expired' : '✅ Valid'}`);
    console.log(`  Value: ${timestamp}`);
  });
  
  // Custom expiration time (5 minutes)
  const customExpiry = signatureVerification.isSignatureExpired(
    new Date(Date.now() - 360000).toISOString(), // 6 minutes ago
    300000 // 5 minutes in ms
  );
  
  console.log(`Custom expiry check: ${customExpiry ? '❌ Expired' : '✅ Valid'}`);
}

checkSignatureExpiration();
```

### 형식 검사

```javascript
function validateFormats() {
  const testSignatures = [
    '304502210...', // Valid hex signature
    'invalid-signature', // Invalid format
    '', // Empty
    '123' // Too short
  ];
  
  const testPublicKeys = [
    'STM6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV', // Valid Steem public key
    'invalid-public-key', // Invalid format
    '', // Empty
    'STM123' // Invalid checksum
  ];
  
  console.log('Signature format validation:');
  testSignatures.forEach((sig, index) => {
    const isValid = signatureVerification.isValidSignatureFormat(sig);
    console.log(`Signature ${index + 1}: ${isValid ? '✅' : '❌'} - ${sig.substring(0, 20)}...`);
  });
  
  console.log('\nPublic key format validation:');
  testPublicKeys.forEach((key, index) => {
    const isValid = signatureVerification.isValidPublicKeyFormat(key);
    console.log(`Key ${index + 1}: ${isValid ? '✅' : '❌'} - ${key.substring(0, 20)}...`);
  });
}

validateFormats();
```

## 5. 실제 사용 사례

### 보안 API 게이트웨이

```javascript
class SecureApiGateway {
  constructor(api) {
    this.api = api;
    this.getAccountKeys = signatureVerification.createApiVerificationFunction(api);
  }
  
  async processSignedRequest(signedRequest) {
    try {
      // Step 1: Verify the signature
      const verification = await signatureVerification.verifySignedRequest(
        signedRequest,
        this.getAccountKeys
      );
      
      if (!verification.valid) {
        return {
          success: false,
          error: 'Invalid signature',
          details: verification.error
        };
      }
      
      // Step 2: Check if signature is not expired
      if (signatureVerification.isSignatureExpired(verification.timestamp)) {
        return {
          success: false,
          error: 'Signature expired'
        };
      }
      
      // Step 3: Execute the original request
      const result = await new Promise((resolve, reject) => {
        this.api.call(signedRequest.method, verification.params, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      return {
        success: true,
        account: verification.account,
        result: result
      };
      
    } catch (error) {
      return {
        success: false,
        error: 'Processing failed',
        details: error.message
      };
    }
  }
}

// Usage
async function useSecureGateway() {
  const gateway = new SecureApiGateway(steem.api);
  
  // Create a signed request
  const signedRequest = steem.api.signRequest(
    { method: 'condenser_api.get_accounts', params: [['username']], id: 1 },
    'username',
    [steem.auth.toWif('username', 'password', 'active')]
  );
  
  // Process through secure gateway
  const result = await gateway.processSignedRequest(signedRequest);
  
  if (result.success) {
    console.log('✅ Secure request processed successfully');
    console.log('Account:', result.account);
    console.log('Result:', result.result);
  } else {
    console.log('❌ Secure request failed:', result.error);
  }
  
  return result;
}

useSecureGateway();
```

### 메시지 인증 시스템

```javascript
class MessageAuthSystem {
  constructor() {
    this.trustedKeys = new Set();
  }
  
  addTrustedKey(publicKey) {
    if (signatureVerification.isValidPublicKeyFormat(publicKey)) {
      this.trustedKeys.add(publicKey);
      console.log(`✅ Added trusted key: ${publicKey.substring(0, 20)}...`);
    } else {
      console.log(`❌ Invalid key format: ${publicKey}`);
    }
  }
  
  verifyMessage(message, signature, publicKey) {
    // Check if key is trusted
    if (!this.trustedKeys.has(publicKey)) {
      return {
        valid: false,
        error: 'Untrusted public key'
      };
    }
    
    // Verify signature
    const isValid = signatureVerification.verifyMessageSignature(message, signature, publicKey);
    
    return {
      valid: isValid,
      publicKey: publicKey,
      message: message,
      error: isValid ? null : 'Invalid signature'
    };
  }
  
  batchVerifyMessages(messages) {
    return messages.map(msg => this.verifyMessage(msg.message, msg.signature, msg.publicKey));
  }
}

// Usage
function useMessageAuthSystem() {
  const authSystem = new MessageAuthSystem();
  
  // Add trusted keys
  const trustedKey = steem.auth.wifToPublic('5JLw5dgQAx6rhZEgNN5C2ds1V47RweGshynFSWFbaMohsYsBvE8');
  authSystem.addTrustedKey(trustedKey);
  
  // Create and verify messages
  const message = 'Authenticated message';
  const signature = steem.auth.sign(message, '5JLw5dgQAx6rhZEgNN5C2ds1V47RweGshynFSWFbaMohsYsBvE8');
  
  const result = authSystem.verifyMessage(message, signature, trustedKey);
  
  console.log('Message authentication result:', result.valid ? '✅' : '❌');
  if (!result.valid) {
    console.log('Error:', result.error);
  }
  
  return result;
}

useMessageAuthSystem();
```

## 6. 트랜잭션 서명 검증

`steem.auth.verifyTransaction(signedTx, publicKey)`은 트랜잭션의 서명이 주어진 공개 키로 생성된 것인지 검증합니다. 위의 메시지/RPC 요청 검증과 달리 이 기능은 **트랜잭션** 수준에서 동작합니다. `signTransaction`이 서명하는 정확한 다이제스트 `sha256(chain_id ‖ serializeTransaction(trx))`를 재구성한 뒤 각 서명을 그 값과 대조합니다.

> **중요한 이유:** 릴레이나 월렛 서버는 클라이언트가 제출한 트랜잭션을 체인에 전달하기 *전에*, 그 트랜잭션이 주장된 계정의 키로 서명되었음을 증명할 수 있습니다. 이는 트랜잭션 구조 검증만으로는 막을 수 없는 다계층 방어의 공백을 메우는 것입니다.

### 기본 서명-검증 왕복 테스트

```javascript
import { steem } from '@steemit/steem-js';

const wif = '5JLw5dgQAx6rhZEgNN5C2ds1V47RweGshynFSWFbaMohsYsBvE8';
const publicKey = steem.auth.wifToPublic(wif);

const tx = {
  ref_block_num: 123,
  ref_block_prefix: 456789,
  expiration: '2026-07-10T00:00:00',
  operations: [['transfer', {
    from: 'alice', to: 'bob', amount: '1.000 STEEM', memo: ''
  }]],
  extensions: [],
};

// Client signs the transaction locally
const signedTx = steem.auth.signTransaction(tx, [wif]);

// Server (or same process) verifies it against the public key
const isValid = steem.auth.verifyTransaction(signedTx, publicKey);
console.log(isValid ? '✅ Valid signature' : '❌ Invalid signature');
// => ✅ Valid signature
```

### 서버 측 검증(릴레이 서비스)

이것이 대표적인 보안 사용 사례입니다. 월렛/릴레이 서버는 클라이언트로부터 서명된 트랜잭션을 받으며, 브로드캐스트하기 전에 서명자를 독립적으로 확인해야 합니다.

```javascript
import { steem } from '@steemit/steem-js';

/**
 * Verify a client-submitted transaction before relaying it to the chain.
 *
 * @param {object} signedTx  - Transaction signed by the client (has .signatures)
 * @param {string} publicKey - The STM... public key the server expects the
 *                             account to sign with (e.g. fetched from get_accounts).
 * @returns {boolean} true if the signature is cryptographically valid.
 */
function verifyClientTransaction(signedTx, publicKey) {
  if (!signedTx || !Array.isArray(signedTx.signatures) || signedTx.signatures.length === 0) {
    console.error('❌ Transaction has no signatures');
    return false;
  }

  const isValid = steem.auth.verifyTransaction(signedTx, publicKey);
  if (!isValid) {
    console.error('❌ Signature does not match the claimed public key');
    return false;
  }

  console.log('✅ Transaction signed by the claimed key — safe to relay');
  return true;
}

// Usage in a relay route:
//   const account = await steem.api.getAccountsAsync([username]);
//   const expectedPubKey = account[0].active.key_auths[0][0];
//   if (!verifyClientTransaction(clientSignedTx, expectedPubKey)) {
//     return res.status(403).json({ error: 'Invalid signature' });
//   }
//   await steem.broadcast.sendAsync(clientSignedTx);
```

### 거부되는 사례

```javascript
// 1. Wrong public key
const wrongPub = steem.auth.wifToPublic('5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3');
console.log(steem.auth.verifyTransaction(signedTx, wrongPub)); // false

// 2. Tampered transaction (operation changed after signing)
const tampered = JSON.parse(JSON.stringify(signedTx));
tampered.operations[0][1].amount = '999.000 STEEM';
console.log(steem.auth.verifyTransaction(tampered, publicKey)); // false

// 3. Missing signatures entirely
const unsigned = { ...tx };
console.log(steem.auth.verifyTransaction(unsigned, publicKey)); // false
```

### serializeTransaction으로 다이제스트 직접 만들기

심화 사용 사례(예: 자체 암호화 스택으로 검증)를 위해 바이너리 직렬화기가 `steem.auth.serializeTransaction(trx)` 형태로 export되어 있으므로, 서명 다이제스트를 직접 재구성할 수 있습니다:

```javascript
import { steem } from '@steemit/steem-js';
import { sha256 } from '@noble/hashes/sha2';

// The digest signTransaction signs over:
const buf = steem.auth.serializeTransaction(tx); // Buffer (binary transaction)
const chainId = Buffer.alloc(32, 0);             // mainnet chain_id (all-zero)
const digest = Buffer.from(sha256(Buffer.concat([chainId, buf])));
console.log('Signing digest:', digest.toString('hex')); // 32-byte hex
```

> **참고:** 입력에 `signatures` 필드가 없으면 `serializeTransaction`의 출력에도 이 필드가 포함되지 **않습니다**. 이는 `signTransaction`이 서명을 붙이기 *전에* 트랜잭션 본문을 직렬화하는 것과 일치합니다.

### 자주 발생하는 검증 오류

```javascript
function handleVerificationErrors() {
  const commonErrors = [
    {
      name: 'Invalid signature format',
      test: () => signatureVerification.isValidSignatureFormat('invalid')
    },
    {
      name: 'Invalid public key format',
      test: () => signatureVerification.isValidPublicKeyFormat('invalid')
    },
    {
      name: 'Expired signature',
      test: () => !signatureVerification.isSignatureExpired(
        new Date(Date.now() - 120000).toISOString()
      )
    }
  ];
  
  console.log('Common verification error checks:');
  commonErrors.forEach(error => {
    try {
      const result = error.test();
      console.log(`${error.name}: ${result ? '✅ Pass' : '❌ Fail'}`);
    } catch (e) {
      console.log(`${error.name}: ❌ Exception - ${e.message}`);
    }
  });
}

handleVerificationErrors();
```

## 검증 모범 사례

1. 검증 전에 **입력 형식을 항상 검사**하십시오
2. 리플레이 공격을 막기 위해 **서명 만료를 확인**하십시오
3. 검증에는 **신뢰할 수 있는 키 공급원을 사용**하십시오
4. 모든 시나리오에 **적절한 오류 처리를 구현**하십시오
5. 성능 향상을 위해 **계정 키를 캐시**하십시오
6. 보안 감사를 위해 **검증 시도를 기록**하십시오
7. 여러 요청에는 **일괄 검증을 사용**하십시오
8. 남용을 막기 위해 **속도 제한을 구현**하십시오

## 검증 보안 고려 사항

- 기본적으로 서명은 60초 후 만료됩니다
- 항상 올바른 계정의 공개 키를 기준으로 검증하십시오
- 중간자(man-in-the-middle) 공격을 막기 위해 HTTPS 엔드포인트를 사용하십시오
- 처리 전에 모든 입력 파라미터를 검사하십시오
- 보안 감사를 위해 적절한 로깅을 구현하십시오
- 민감한 작업에는 추가 인증 계층을 고려하십시오

이 포괄적인 가이드는 기본적인 메시지 검증부터 복잡한 인증 시스템까지 Steem.js에서의 서명 검증 전반을 다룹니다.

## 다음 단계

- [체인 데이터 읽기](/ko/tutorials/steem-js/read-api.html): 서명된 요청 안에서 사용되는 읽기 헬퍼.
- [RPC 인증 테스트 마이그레이션](/ko/tutorials/steem-js/rpc-auth-migration.html): 이 메커니즘이 테스트 스위트에서 어떻게 활용되는지.
