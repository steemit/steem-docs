---
title: steem-js - chiamate firmate e verifica delle firme
description: RPC autenticato con steem-js tramite signedCall/signedCallAsync e toolkit di verifica delle firme - guide complete con esempi per richieste RPC firmate, firme dei messaggi e verifica delle transazioni.
---

# steem-js: chiamate firmate e verifica delle firme

Alcuni dati e operazioni richiedono di dimostrare la proprietà dell'account (account ownership). steem-js include due toolkit che cooperano tra loro: `steem.api.signedCall` per le richieste JSON-RPC autenticate e `signatureVerification` per il controllo delle firme sul lato ricevente. Questa pagina riunisce le guide con esempi della libreria su chiamate firmate e verifica delle firme; le funzioni di lettura che impiegano sono documentate in [Leggere i dati della blockchain](/it/tutorials/steem-js/read-api.html).

## Chiamate RPC firmate

## Chiamate RPC firmate

Per chiamate RPC sicure che richiedono autenticazione, usare `signedCall`. Questo metodo firma la richiesta con la propria chiave privata per dimostrare la proprietà dell'account.

#### signedCall

Effettua una chiamata JSON-RPC firmata verso la blockchain Steem. La richiesta viene firmata crittograficamente per autenticare il chiamante. Questa è la versione basata su callback. Per l'uso basato su Promise, vedere `signedCallAsync` di seguito.

```javascript
steem.api.signedCall(method, params, account, privateKey, callback);
```

**Descrizione dei parametri:**

| Parametro | Tipo di dato | Descrizione |
|---------|--------|-----------|
| method | string | Nome completo del metodo RPC (es. `condenser_api.get_account_history`) |
| params | array | Parametri per il metodo RPC |
| account | string | Il nome dell'account che effettua la richiesta |
| privateKey | string | Chiave privata (formato WIF) per la firma |
| callback | function | Funzione di callback callback(err, result) |

**Requisiti:**
- Usa il trasporto HTTP per tutte le chiamate API
- Richiede una chiave privata valida in formato WIF
- L'account deve corrispondere alla chiave privata

**Esempio di chiamata:**

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

Versione di `signedCall` basata su Promise, da usare con la sintassi async/await.

```javascript
steem.api.signedCallAsync(method, params, account, privateKey);
```

**Restituisce:** una Promise che si risolve con il risultato o viene rifiutata con un errore.

**Esempio con Promise:**

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

**Note sulla sicurezza:**
- La richiesta include un timestamp e un nonce per prevenire attacchi di replay (replay attack)
- Le firme scadono dopo 60 secondi
- Le chiavi private non vengono mai trasmesse, viene trasmessa solo la firma
- Ogni richiesta è firmata in modo univoco con una prova crittografica

**Casi d'uso:**
- Accedere a dati privati dell'account
- Effettuare chiamate API autenticate
- Dimostrare la proprietà dell'account
- Comunicare in modo sicuro con i nodi Steem

## Verifica delle firme

Per verificare richieste firmate e messaggi, Steem.js fornisce utilità complete:

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

**Funzionalità di verifica:**
- **Validazione delle richieste firmate (Signed Request Validation)**: verifica di richieste RPC firmate complete
- **Verifica della firma dei messaggi (Message Signature Verification)**: verifica di singole firme dei messaggi
- **Verifica in batch (Batch Verification)**: verifica di più richieste contemporaneamente
- **Controllo della scadenza (Expiration Checking)**: validazione automatica della scadenza delle firme
- **Validazione del formato (Format Validation)**: validazione dei formati di firma e chiave
- **Estrazione delle chiavi dell'account (Account Key Extraction)**: estrazione delle chiavi pubbliche dai dati dell'account

**Il resto di questa pagina raccoglie esempi completi di signedCall e verifica delle firme.**

---

## Esempi di signedCall

Le sottosezioni seguenti sono gli esempi completi di signedCall tratti dalla documentazione della libreria.

Questo documento fornisce esempi completi per l'uso di `signedCall` in Steem.js per richieste API autenticate.

## Panoramica

`signedCall` serve a effettuare chiamate JSON-RPC autenticate verso la blockchain Steem. Firma crittograficamente le richieste per dimostrare la proprietà dell'account e accedere a dati privati o riservati.

Passare il nome completo del metodo RPC (es. `condenser_api.get_account_history`). I metodi di lettura legacy usano il namespace **`condenser_api`** sui nodi attuali; vedere [il routing delle API](/it/tutorials/steem-js/index.html#api-routing) nel tutorial introduttivo.

## Configurazione di base

```javascript
import { steem } from '@steemit/steem-js';

// Configure for HTTP transport (required for signedCall)
steem.config.set({
  nodes: ['https://api.steemit.com'],
  transport: 'http'
});
```

## Metodi di autenticazione

### Usare nome utente e password

```javascript
// Generate private key from username/password
const username = 'your-username';
const password = 'your-password';
const activeKey = steem.auth.toWif(username, password, 'active');
const postingKey = steem.auth.toWif(username, password, 'posting');
```

### Usare una chiave privata esistente

```javascript
// Use existing WIF private key
const privateKey = '5JLw5dgQAx6rhZEgNN5C2ds1V47RweGshynFSWFbaMohsYsBvE8';
const account = 'username';
```

## Esempi signedCall di base

### 1. Ottenere la cronologia dell'account (con autenticazione)

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

### 2. Ottenere informazioni private dell'account

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

### 3. Accedere alle informazioni del witness (con autenticazione)

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

## Esempi avanzati

### 4. Richieste firmate in batch

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

### 5. Gestione degli errori e logica di retry

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

### 6. Validazione e sicurezza

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

## Casi d'uso comuni

### Gestione dell'account

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

### Analisi dei contenuti

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

## Gestione degli errori

### Errori comuni e soluzioni

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

### Usare signedCallAsync (basato su Promise)

Nel codice async/await moderno, usare `signedCallAsync`:

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

Equivale alla versione con callback ma usa le Promise, il che la rende più semplice da usare con la sintassi async/await.

## Buone pratiche

1. **Usare sempre endpoint HTTPS** per le chiamate firmate
2. **Validare le chiavi private** prima di effettuare le chiamate
3. **Implementare la logica di retry** per gli errori di rete
4. **Usare il rate limiting** per non sovraccaricare l'API
5. **Gestire con cura la scadenza delle firme**
6. **Non registrare mai le chiavi private nei log** in produzione
7. **Usare le variabili d'ambiente** per i dati sensibili
8. **Implementare una gestione degli errori adeguata** per tutti gli scenari

## Considerazioni sulla sicurezza di signedCall

- Le chiavi private non vengono mai trasmesse in rete
- Ogni richiesta include un nonce e un timestamp univoci
- Le firme scadono dopo 60 secondi per prevenire attacchi di replay
- Verificare sempre che l'endpoint usi HTTPS
- Conservare le chiavi private in modo sicuro (mai in chiaro)
- Per le applicazioni di produzione valutare l'uso di wallet hardware

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

Questa guida completa dovrebbe consentire di implementare `signedCall` in modo efficace nelle proprie applicazioni Steem.js.

---

## Esempi di verifica delle firme

Questo documento fornisce esempi completi per la verifica delle firme in Steem.js, incluse le richieste RPC firmate e le firme dei messaggi in generale.

## Panoramica della verifica

La verifica delle firme è cruciale per:
- Validare l'autenticità delle richieste RPC firmate
- Garantire che i messaggi non siano stati alterati
- Verificare la proprietà dell'account
- Implementare sistemi di autenticazione sicuri

## Configurazione di base

```javascript
import { steem } from '@steemit/steem-js';
import { signatureVerification } from '@steemit/steem-js/api';

// Configure API
steem.config.set({
  nodes: ['https://api.steemit.com'],
  transport: 'http'
});
```

## 1. Verificare le richieste RPC firmate

### Verifica di base

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

### Flusso completo firma e verifica

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

## 2. Verifica della firma dei messaggi

### Verifica semplice di un messaggio

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

### Verifica di più firme

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

## 3. Verifica in batch

### Verificare più richieste firmate

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

## 4. Scenari di verifica avanzati

### Provider di chiavi dell'account personalizzato

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

### Controllo della scadenza delle firme

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

### Validazione del formato

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

## 5. Casi d'uso reali

### Gateway API sicuro

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

### Sistema di autenticazione dei messaggi

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

## 6. Verifica della firma delle transazioni

`steem.auth.verifyTransaction(signedTx, publicKey)` verifica che le firme di una transazione siano state prodotte dalla chiave pubblica indicata. A differenza della verifica di messaggi/richieste RPC descritta sopra, opera a livello di **transazione**: ricostruisce l'esatto digest `sha256(chain_id ‖ serializeTransaction(trx))` su cui `signTransaction` firma, quindi controlla ogni firma rispetto a esso.

> **Perché è importante:** un relay o un server di wallet può dimostrare che una transazione inviata da un client è stata firmata con la chiave dell'account dichiarato *prima* di inoltrarla alla blockchain — colmando una falla di difesa in profondità che la sola validazione della forma della transazione non può coprire.

### Ciclo di base firma e verifica

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

### Verifica lato server (servizio di relay)

Questo è il principale caso d'uso di sicurezza: un server wallet/relay riceve da un client una transazione firmata e deve confermare in modo indipendente il firmatario prima di trasmetterla in rete (broadcast).

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

### Casi di rifiuto

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

### Costruire il digest manualmente con serializeTransaction

Per casi d'uso avanzati (ad esempio la verifica con uno stack crittografico personalizzato), il serializzatore binario è esportato come `steem.auth.serializeTransaction(trx)`, così da poter ricostruire autonomamente il digest della firma:

```javascript
import { steem } from '@steemit/steem-js';
import { sha256 } from '@noble/hashes/sha2';

// The digest signTransaction signs over:
const buf = steem.auth.serializeTransaction(tx); // Buffer (binary transaction)
const chainId = Buffer.alloc(32, 0);             // mainnet chain_id (all-zero)
const digest = Buffer.from(sha256(Buffer.concat([chainId, buf])));
console.log('Signing digest:', digest.toString('hex')); // 32-byte hex
```

> **Nota:** `serializeTransaction` **non** include il campo `signatures` nel suo output quando l'input ne è privo — in linea con `signTransaction`, che serializza il corpo della transazione *prima* di allegare le firme.

### Errori di verifica comuni

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

## Buone pratiche di verifica

1. **Validare sempre i formati di input** prima della verifica
2. **Controllare la scadenza delle firme** per prevenire attacchi di replay
3. **Usare fonti di chiavi affidabili** per la verifica
4. **Implementare una gestione degli errori adeguata** per tutti gli scenari
5. **Memorizzare in cache le chiavi degli account** per migliorare le prestazioni
6. **Registrare nei log i tentativi di verifica** per l'audit di sicurezza
7. **Usare la verifica in batch** per più richieste
8. **Implementare il rate limiting** per prevenire abusi

## Considerazioni sulla sicurezza della verifica

- Per impostazione predefinita le firme scadono dopo 60 secondi
- Verificare sempre rispetto alle chiavi pubbliche dell'account corretto
- Usare endpoint HTTPS per prevenire attacchi man-in-the-middle
- Validare tutti i parametri di input prima dell'elaborazione
- Implementare una registrazione adeguata per l'audit di sicurezza
- Per le operazioni sensibili valutare livelli di autenticazione aggiuntivi

Questa guida completa copre tutti gli aspetti della verifica delle firme in Steem.js, dalla verifica di base dei messaggi ai sistemi di autenticazione complessi.

## Dove andare da qui

- [Leggere i dati della blockchain](/it/tutorials/steem-js/read-api.html) per le funzioni di lettura usate all'interno delle richieste firmate.
- [Migrazione dei test di autenticazione RPC](/it/tutorials/steem-js/rpc-auth-migration.html) per come questi meccanismi vengono esercitati nella suite di test.
