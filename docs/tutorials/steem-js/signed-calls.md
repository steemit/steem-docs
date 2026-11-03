---
title: steem-js - Signed Calls and Signature Verification
description: Authenticated steem-js RPC with signedCall/signedCallAsync and the signature verification toolkit - full example guides for signed RPC requests, message signatures and transaction verification.
---

# steem-js: Signed Calls and Signature Verification

Some data and operations require proving account ownership. steem-js ships two cooperating toolkits: `steem.api.signedCall` for authenticated JSON-RPC requests, and `signatureVerification` for checking signatures on the receiving side. This page merges the library's signed-call and signature-verification example guides; the read helpers they use are documented in [Reading chain data](/tutorials/steem-js/read-api.html).

## Signed RPC Calls

## Signed RPC Calls

For secure RPC calls that require authentication, use `signedCall`. This method signs the request with your private key to prove ownership of the account.

#### signedCall

Makes a signed JSON-RPC call to the Steem blockchain. The request is cryptographically signed to authenticate the caller. This is the callback-based version. For Promise-based usage, see `signedCallAsync` below.

```javascript
steem.api.signedCall(method, params, account, privateKey, callback);
```

**Parameter Description:**

| Parameter | Data Type | Description |
|---------|--------|-----------|
| method | string | Full RPC method name (e.g. `condenser_api.get_account_history`) |
| params | array | Parameters for the RPC method |
| account | string | The account name making the request |
| privateKey | string | Private key (WIF format) for signing |
| callback | function | Callback function(err, result) |

**Requirements:**
- Uses HTTP transport for all API calls
- Requires a valid private key in WIF format
- The account must match the private key

**Call Example:**

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

Promise-based version of `signedCall` for use with async/await syntax.

```javascript
steem.api.signedCallAsync(method, params, account, privateKey);
```

**Returns:** Promise that resolves with the result or rejects with an error.

**Promise Example:**

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

**Security Notes:**
- The request includes a timestamp and nonce to prevent replay attacks
- Signatures expire after 60 seconds
- Private keys are never transmitted, only the signature
- Each request is uniquely signed with cryptographic proof

**Use Cases:**
- Accessing private account data
- Making authenticated API calls
- Proving account ownership
- Secure communication with Steem nodes

## Signature Verification

For verifying signed requests and messages, Steem.js provides comprehensive verification utilities:

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

**Verification Features:**
- **Signed Request Validation**: Verify complete signed RPC requests
- **Message Signature Verification**: Verify individual message signatures
- **Batch Verification**: Verify multiple requests simultaneously
- **Expiration Checking**: Automatic signature expiration validation
- **Format Validation**: Validate signature and key formats
- **Account Key Extraction**: Extract public keys from account data

**The remainder of this page collects comprehensive signedCall and signature verification examples.**

---

## signedCall Examples

The subsections below are the complete signedCall examples from the library documentation.

This document provides comprehensive examples for using `signedCall` in Steem.js for authenticated API requests.

## Overview

`signedCall` is used for making authenticated JSON-RPC calls to the Steem blockchain. It cryptographically signs requests to prove account ownership and access private or restricted data.

Pass the full RPC method name (e.g. `condenser_api.get_account_history`). Legacy read methods use the **`condenser_api`** namespace on current nodes; see [API routing](/tutorials/steem-js/index.html#api-routing) in the getting-started tutorial.

## Basic Setup

```javascript
import { steem } from '@steemit/steem-js';

// Configure for HTTP transport (required for signedCall)
steem.config.set({
  nodes: ['https://api.steemit.com'],
  transport: 'http'
});
```

## Authentication Methods

### Using Username and Password

```javascript
// Generate private key from username/password
const username = 'your-username';
const password = 'your-password';
const activeKey = steem.auth.toWif(username, password, 'active');
const postingKey = steem.auth.toWif(username, password, 'posting');
```

### Using Existing Private Key

```javascript
// Use existing WIF private key
const privateKey = '5JLw5dgQAx6rhZEgNN5C2ds1V47RweGshynFSWFbaMohsYsBvE8';
const account = 'username';
```

## Basic SignedCall Examples

### 1. Get Account History (Authenticated)

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

### 2. Get Private Account Information

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

### 3. Access Witness Information (Authenticated)

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

## Advanced Examples

### 4. Batch Signed Requests

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

### 5. Error Handling and Retry Logic

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

### 6. Validation and Security

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

## Common Use Cases

### Account Management

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

### Content Analysis

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

## Error Handling

### Common Errors and Solutions

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

### Using signedCallAsync (Promise-based)

For modern async/await code, use `signedCallAsync`:

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

This is equivalent to the callback version but uses Promises, making it easier to use with async/await syntax.

## Best Practices

1. **Always use HTTPS endpoints** for signed calls
2. **Validate private keys** before making calls
3. **Implement retry logic** for network errors
4. **Use rate limiting** to avoid overwhelming the API
5. **Handle signature expiration** gracefully
6. **Never log private keys** in production
7. **Use environment variables** for sensitive data
8. **Implement proper error handling** for all scenarios

## SignedCall Security Considerations

- Private keys are never transmitted over the network
- Each request includes a unique nonce and timestamp
- Signatures expire after 60 seconds to prevent replay attacks
- Always verify the endpoint is using HTTPS
- Store private keys securely (never in plain text)
- Consider using hardware wallets for production applications

## Testing

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

This comprehensive guide should help you implement `signedCall` effectively in your Steem.js applications.

---

## Signature Verification Examples

This document provides comprehensive examples for verifying signatures in Steem.js, including signed RPC requests and general message signatures.

## Verification Overview

Signature verification is crucial for:
- Validating the authenticity of signed RPC requests
- Ensuring messages haven't been tampered with
- Verifying account ownership
- Implementing secure authentication systems

## Basic Setup

```javascript
import { steem } from '@steemit/steem-js';
import { signatureVerification } from '@steemit/steem-js/api';

// Configure API
steem.config.set({
  nodes: ['https://api.steemit.com'],
  transport: 'http'
});
```

## 1. Verifying Signed RPC Requests

### Basic Verification

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

### Complete Sign and Verify Workflow

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

## 2. Message Signature Verification

### Simple Message Verification

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

### Multiple Signatures Verification

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

## 3. Batch Verification

### Verify Multiple Signed Requests

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

## 4. Advanced Verification Scenarios

### Custom Account Key Provider

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

### Signature Expiration Checking

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

### Format Validation

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

## 5. Real-World Use Cases

### Secure API Gateway

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

### Message Authentication System

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

## 6. Transaction Signature Verification

`steem.auth.verifyTransaction(signedTx, publicKey)` verifies that a transaction's
signatures were produced by the given public key. Unlike the message/RPC-request
verification above, this operates at the **transaction** level: it reconstructs
the exact digest `sha256(chain_id ‖ serializeTransaction(trx))` that
`signTransaction` signs over, then checks each signature against it.

> **Why this matters:** a relay or wallet server can prove a client-submitted
> transaction was signed by the claimed account's key *before* forwarding it to
> the chain — closing a defense-in-depth gap that transaction-shape validation
> alone cannot cover.

### Basic Sign-and-Verify Round-Trip

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

### Server-Side Verification (Relay Service)

This is the primary security use case: a wallet/relay server receives a
signed transaction from a client and must independently confirm the signer
before broadcasting.

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

### Rejected Cases

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

### Building the Digest Manually with serializeTransaction

For advanced use cases (e.g. verifying with a custom crypto stack), the binary
serializer is exported as `steem.auth.serializeTransaction(trx)` so you can
reconstruct the signing digest yourself:

```javascript
import { steem } from '@steemit/steem-js';
import { sha256 } from '@noble/hashes/sha2';

// The digest signTransaction signs over:
const buf = steem.auth.serializeTransaction(tx); // Buffer (binary transaction)
const chainId = Buffer.alloc(32, 0);             // mainnet chain_id (all-zero)
const digest = Buffer.from(sha256(Buffer.concat([chainId, buf])));
console.log('Signing digest:', digest.toString('hex')); // 32-byte hex
```

> **Note:** `serializeTransaction` does **not** include the `signatures` field in
> its output when the input lacks one — matching `signTransaction`, which
> serializes the transaction body *before* attaching signatures.

### Common Verification Errors

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

## Verification Best Practices

1. **Always validate input formats** before verification
2. **Check signature expiration** to prevent replay attacks
3. **Use trusted key sources** for verification
4. **Implement proper error handling** for all scenarios
5. **Cache account keys** to improve performance
6. **Log verification attempts** for security auditing
7. **Use batch verification** for multiple requests
8. **Implement rate limiting** to prevent abuse

## Verification Security Considerations

- Signatures expire after 60 seconds by default
- Always verify against the correct account's public keys
- Use HTTPS endpoints to prevent man-in-the-middle attacks
- Validate all input parameters before processing
- Implement proper logging for security auditing
- Consider implementing additional authentication layers for sensitive operations

This comprehensive guide covers all aspects of signature verification in Steem.js, from basic message verification to complex authentication systems.

## Where to go next

- [Reading chain data](/tutorials/steem-js/read-api.html) for the read helpers used inside signed requests.
- [RPC auth test migration](/tutorials/steem-js/rpc-auth-migration.html) for how this machinery is exercised in the test suite.
