---
title: steem-js - llamadas firmadas y verificación de firmas
description: RPC autenticado con steem-js mediante signedCall/signedCallAsync y el kit de herramientas de verificación de firmas - guías completas de ejemplos para solicitudes RPC firmadas, firmas de mensajes y verificación de transacciones.
---

# steem-js: llamadas firmadas y verificación de firmas

Algunos datos y operaciones requieren demostrar la propiedad de la cuenta (account ownership). steem-js incorpora dos kits de herramientas que trabajan en conjunto: `steem.api.signedCall` para solicitudes JSON-RPC autenticadas y `signatureVerification` para comprobar firmas en el lado receptor. Esta página fusiona las guías de ejemplos de la biblioteca sobre llamadas firmadas y verificación de firmas; los auxiliares de lectura que utilizan están documentados en [Leer datos de la cadena](/es/tutorials/steem-js/read-api.html).

## Llamadas RPC firmadas

## Llamadas RPC firmadas

Para llamadas RPC seguras que requieren autenticación, use `signedCall`. Este método firma la solicitud con su clave privada para demostrar la propiedad de la cuenta.

#### signedCall

Realiza una llamada JSON-RPC firmada a la blockchain de Steem. La solicitud se firma criptográficamente para autenticar al que llama. Esta es la versión basada en devolución de llamada (callback). Para el uso basado en Promise, véase `signedCallAsync` más abajo.

```javascript
steem.api.signedCall(method, params, account, privateKey, callback);
```

**Descripción de parámetros:**

| Parámetro | Tipo de dato | Descripción |
|---------|--------|-----------|
| method | string | Nombre completo del método RPC (p. ej. `condenser_api.get_account_history`) |
| params | array | Parámetros para el método RPC |
| account | string | El nombre de la cuenta que realiza la solicitud |
| privateKey | string | Clave privada (formato WIF) para firmar |
| callback | function | Función de devolución de llamada callback(err, result) |

**Requisitos:**
- Usa transporte HTTP para todas las llamadas API
- Requiere una clave privada válida en formato WIF
- La cuenta debe coincidir con la clave privada

**Ejemplo de llamada:**

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

Versión de `signedCall` basada en Promise, para usar con la sintaxis async/await.

```javascript
steem.api.signedCallAsync(method, params, account, privateKey);
```

**Devuelve:** una Promise que se resuelve con el resultado o se rechaza con un error.

**Ejemplo con Promise:**

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

**Notas de seguridad:**
- La solicitud incluye una marca de tiempo y un nonce para prevenir ataques de repetición (replay attack)
- Las firmas caducan a los 60 segundos
- Las claves privadas nunca se transmiten; solo se transmite la firma
- Cada solicitud se firma de forma única con prueba criptográfica

**Casos de uso:**
- Acceder a datos privados de la cuenta
- Realizar llamadas API autenticadas
- Demostrar la propiedad de la cuenta
- Comunicación segura con nodos de Steem

## Verificación de firmas

Para verificar solicitudes firmadas y mensajes, Steem.js proporciona utilidades completas:

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

**Funciones de verificación:**
- **Validación de solicitudes firmadas (Signed Request Validation)**: verificar solicitudes RPC firmadas completas
- **Verificación de firma de mensajes (Message Signature Verification)**: verificar firmas de mensajes individuales
- **Verificación por lotes (Batch Verification)**: verificar varias solicitudes simultáneamente
- **Comprobación de caducidad (Expiration Checking)**: validación automática de la caducidad de las firmas
- **Validación de formato (Format Validation)**: validar los formatos de firma y clave
- **Extracción de claves de la cuenta (Account Key Extraction)**: extraer claves públicas de los datos de la cuenta

**El resto de esta página recopila ejemplos completos de signedCall y verificación de firmas.**

---

## Ejemplos de signedCall

Las subsecciones siguientes son los ejemplos completos de signedCall de la documentación de la biblioteca.

Este documento proporciona ejemplos completos para usar `signedCall` en Steem.js con solicitudes API autenticadas.

## Panorama general

`signedCall` se usa para realizar llamadas JSON-RPC autenticadas a la blockchain de Steem. Firma criptográficamente las solicitudes para demostrar la propiedad de la cuenta y acceder a datos privados o restringidos.

Pase el nombre completo del método RPC (p. ej. `condenser_api.get_account_history`). Los métodos de lectura heredados usan el espacio de nombres **`condenser_api`** en los nodos actuales; véase [el enrutamiento de API](/es/tutorials/steem-js/index.html#api-routing) en el tutorial de introducción.

## Configuración básica

```javascript
import { steem } from '@steemit/steem-js';

// Configure for HTTP transport (required for signedCall)
steem.config.set({
  nodes: ['https://api.steemit.com'],
  transport: 'http'
});
```

## Métodos de autenticación

### Usar nombre de usuario y contraseña

```javascript
// Generate private key from username/password
const username = 'your-username';
const password = 'your-password';
const activeKey = steem.auth.toWif(username, password, 'active');
const postingKey = steem.auth.toWif(username, password, 'posting');
```

### Usar una clave privada existente

```javascript
// Use existing WIF private key
const privateKey = '5JLw5dgQAx6rhZEgNN5C2ds1V47RweGshynFSWFbaMohsYsBvE8';
const account = 'username';
```

## Ejemplos básicos de signedCall

### 1. Obtener el historial de la cuenta (con autenticación)

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

### 2. Obtener información privada de la cuenta

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

### 3. Acceder a la información del witness (testigo), con autenticación

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

## Ejemplos avanzados

### 4. Solicitudes firmadas por lotes

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

### 5. Manejo de errores y lógica de reintentos

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

### 6. Validación y seguridad

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

## Casos de uso comunes

### Gestión de la cuenta

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

### Análisis de contenido

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

## Manejo de errores

### Errores comunes y soluciones

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

### Usar signedCallAsync (basado en Promise)

En código moderno con async/await, use `signedCallAsync`:

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

Es equivalente a la versión con devolución de llamada, pero usa Promises, lo que facilita su uso con la sintaxis async/await.

## Buenas prácticas

1. **Use siempre puntos de conexión HTTPS** para las llamadas firmadas
2. **Valide las claves privadas** antes de realizar llamadas
3. **Implemente lógica de reintentos** para errores de red
4. **Use limitación de tasa** para no saturar la API
5. **Maneje adecuadamente la caducidad de las firmas**
6. **Nunca registre claves privadas** en producción
7. **Use variables de entorno** para los datos sensibles
8. **Implemente un manejo de errores adecuado** para todos los escenarios

## Consideraciones de seguridad de signedCall

- Las claves privadas nunca se transmiten por la red
- Cada solicitud incluye un nonce y una marca de tiempo únicos
- Las firmas caducan a los 60 segundos para prevenir ataques de repetición
- Compruebe siempre que el punto de conexión use HTTPS
- Almacene las claves privadas de forma segura (nunca en texto plano)
- Considere carteras hardware para aplicaciones de producción

## Pruebas

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

Esta guía completa debería ayudarle a implementar `signedCall` de manera efectiva en sus aplicaciones Steem.js.

---

## Ejemplos de verificación de firmas

Este documento proporciona ejemplos completos para verificar firmas en Steem.js, incluidas las solicitudes RPC firmadas y las firmas de mensajes en general.

## Panorama de la verificación

La verificación de firmas es crucial para:
- Validar la autenticidad de las solicitudes RPC firmadas
- Garantizar que los mensajes no hayan sido alterados
- Comprobar la propiedad de la cuenta
- Implementar sistemas de autenticación seguros

## Configuración básica

```javascript
import { steem } from '@steemit/steem-js';
import { signatureVerification } from '@steemit/steem-js/api';

// Configure API
steem.config.set({
  nodes: ['https://api.steemit.com'],
  transport: 'http'
});
```

## 1. Verificar solicitudes RPC firmadas

### Verificación básica

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

### Flujo completo de firma y verificación

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

## 2. Verificación de firma de mensajes

### Verificación simple de un mensaje

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

### Verificación de múltiples firmas

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

## 3. Verificación por lotes

### Verificar varias solicitudes firmadas

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

## 4. Escenarios de verificación avanzados

### Proveedor personalizado de claves de cuenta

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

### Comprobación de caducidad de la firma

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

### Validación de formato

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

## 5. Casos de uso reales

### Pasarela API segura

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

### Sistema de autenticación de mensajes

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

## 6. Verificación de firma de transacciones

`steem.auth.verifyTransaction(signedTx, publicKey)` verifica que las firmas de una transacción fueron producidas por la clave pública indicada. A diferencia de la verificación de mensajes/solicitudes RPC descrita arriba, esta opera a nivel de **transacción**: reconstruye el digest exacto `sha256(chain_id ‖ serializeTransaction(trx))` sobre el que firma `signTransaction`, y comprueba cada firma contra él.

> **Por qué es importante:** un relay o un servidor de cartera puede demostrar que una transacción enviada por un cliente fue firmada con la clave de la cuenta declarada *antes* de reenviarla a la cadena — cerrando una brecha de defensa en profundidad que la sola validación de la forma de la transacción no puede cubrir.

### Ciclo básico de firma y verificación

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

### Verificación en el servidor (servicio de relay)

Este es el principal caso de uso de seguridad: un servidor de cartera/relay recibe de un cliente una transacción firmada y debe confirmar de forma independiente al firmante antes de difundirla (broadcast).

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

### Casos de rechazo

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

### Construir el digest manualmente con serializeTransaction

Para casos de uso avanzados (p. ej. verificar con una pila criptográfica propia), el serializador binario se exporta como `steem.auth.serializeTransaction(trx)` para que pueda reconstruir usted mismo el digest de la firma:

```javascript
import { steem } from '@steemit/steem-js';
import { sha256 } from '@noble/hashes/sha2';

// The digest signTransaction signs over:
const buf = steem.auth.serializeTransaction(tx); // Buffer (binary transaction)
const chainId = Buffer.alloc(32, 0);             // mainnet chain_id (all-zero)
const digest = Buffer.from(sha256(Buffer.concat([chainId, buf])));
console.log('Signing digest:', digest.toString('hex')); // 32-byte hex
```

> **Nota:** `serializeTransaction` **no** incluye el campo `signatures` en su salida cuando la entrada carece de él, al igual que `signTransaction`, que serializa el cuerpo de la transacción *antes* de adjuntar las firmas.

### Errores de verificación comunes

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

## Buenas prácticas de verificación

1. **Valide siempre los formatos de entrada** antes de la verificación
2. **Compruebe la caducidad de las firmas** para prevenir ataques de repetición
3. **Use fuentes de claves confiables** para la verificación
4. **Implemente un manejo de errores adecuado** para todos los escenarios
5. **Almacene en caché las claves de las cuentas** para mejorar el rendimiento
6. **Registre los intentos de verificación** para la auditoría de seguridad
7. **Use la verificación por lotes** para varias solicitudes
8. **Implemente limitación de tasa** para prevenir abusos

## Consideraciones de seguridad de la verificación

- Por defecto, las firmas caducan a los 60 segundos
- Verifique siempre contra las claves públicas de la cuenta correcta
- Use puntos de conexión HTTPS para prevenir ataques de intermediario (man-in-the-middle)
- Valide todos los parámetros de entrada antes de procesarlos
- Implemente un registro adecuado para la auditoría de seguridad
- Considere capas adicionales de autenticación para operaciones sensibles

Esta guía completa cubre todos los aspectos de la verificación de firmas en Steem.js, desde la verificación básica de mensajes hasta sistemas de autenticación complejos.

## ¿Qué sigue?

- [Leer datos de la cadena](/es/tutorials/steem-js/read-api.html) para los auxiliares de lectura usados dentro de las solicitudes firmadas.
- [Migración de las pruebas de autenticación RPC](/es/tutorials/steem-js/rpc-auth-migration.html) para cómo se ejercita esta maquinaria en la suite de pruebas.
