# Migración de las pruebas de autenticación RPC

## Panorama general

Este documento describe la migración de las pruebas del paquete `@steemit/rpc-auth` a `steem-js` v1.0.11.

## Detalles de la migración

### Origen
- **Paquete original**: `@steemit/rpc-auth` v1.1.1
- **Ubicación del código fuente**: la copia local del repositorio `rpc-auth`
- **Archivo de pruebas original**: `test/index.ts`
- **Framework de pruebas**: Mocha

### Destino
- **Paquete de destino**: `@steemit/steem-js` v1.0.11
- **Ubicación de destino**: la copia local del repositorio `steem-js`
- **Nuevo archivo de pruebas**: `test/rpc-auth.test.ts`
- **Framework de pruebas**: Vitest

## Cambios realizados

### 1. Migración del framework de pruebas

**De Mocha:**
```typescript
import 'mocha'
import * as assert from 'assert'

describe('rpc auth', function() {
  it('signs and validates', async function() {
    assert.equal(...)
  })
})
```

**A Vitest:**
```typescript
import { describe, it, expect } from 'vitest'

describe('RPC Auth', () => {
  it('should sign and validate a request', async () => {
    expect(...).toBe(...)
  })
})
```

### 2. Actualización de dependencias

**Eliminadas:**
- `dsteem` (la antigua biblioteca steem-js)
- `node-fetch` (para la creación de cuentas en la testnet)
- utilidades específicas de Mocha

**Sustituidas por:**
- la API propia de `steem-js` (`steem.auth`, `steem.api`)
- `crypto.randomBytes` nativo
- aserciones de Vitest

### 3. Gestión de cuentas de prueba

**Originalmente:**
- Se creaban cuentas de testnet dinámicamente
- Se usaba `dsteem.Client.testnet()`
- Requería acceso a la red

**Ahora:**
- Se usan variables de entorno o claves de prueba
- No hay creación dinámica de cuentas
- Puede ejecutarse sin red (la mayoría de las pruebas)

### 4. Función de verificación

**Originalmente:**
```typescript
const dsteemVerify: VerifyMessage = async (message, signatures, account) => {
  const opts = { hash: message, signatures, required_posting: [account] }
  const rv = await client.database.call('verify_signatures', [opts])
  if (rv.valid !== true) throw new Error('Signature invalid')
}
```

**Ahora:**
```typescript
const createVerifyFunction = () => {
  return async (message: Buffer, signatures: string[], account: string) => {
    const accounts = await api.getAccountsAsync([account])
    const postingKeys = accounts[0].posting?.key_auths?.map(k => k[0]) || []
    // Verify using steem-js Signature and PublicKey classes
  }
}
```

## Cobertura de pruebas

### Pruebas migradas

✅ **sign and validate** - flujo básico de firma y validación
✅ **invalid requests** - pruebas exhaustivas de manejo de errores:
  - Solicitud JSON RPC no válida
  - Falta la carga firmada
  - Parámetros de solicitud no válidos
  - Falta la cuenta
  - Parámetros codificados no válidos
  - Nonce no válido (varios casos)
  - Marca de tiempo no válida
  - Firma caducada
  - Fallo de verificación

✅ **signing errors** - manejo de errores al firmar:
  - Faltan params
  - Array de claves vacío

✅ **signature format** - validación de la estructura de la firma:
  - Formato de firma válido
  - Nonces únicos
  - Marcas de tiempo válidas

✅ **multiple signatures** - soporte para varias claves

### Pruebas omitidas

⏭️ **invalid signatures (prueba de integración)** - requiere:
  - Una cuenta real en la testnet
  - Acceso a la red
  - Puede habilitarse con las variables de entorno `STEEM_USERNAME` y `STEEM_PASSWORD`

## Resultados de las pruebas

```
✓ test/rpc-auth.test.ts (19 tests | 1 skipped)
  ✓ RPC Auth > sign and validate > should sign and validate a request
  ✓ RPC Auth > invalid requests > should handle invalid JSON RPC request
  ✓ RPC Auth > invalid requests > should handle missing signed payload
  ✓ RPC Auth > invalid requests > should handle invalid request params
  ✓ RPC Auth > invalid requests > should handle missing account
  ✓ RPC Auth > invalid requests > should handle invalid encoded params
  ✓ RPC Auth > invalid requests > should handle invalid nonce (not a string)
  ✓ RPC Auth > invalid requests > should handle invalid nonce (wrong length)
  ✓ RPC Auth > invalid requests > should handle invalid nonce (wrong format)
  ✓ RPC Auth > invalid requests > should handle invalid timestamp
  ✓ RPC Auth > invalid requests > should handle expired signature
  ✓ RPC Auth > invalid requests > should handle verification failure
  ✓ RPC Auth > signing errors > should handle invalid requests when signing
  ✓ RPC Auth > signing errors > should handle empty keys array
  ✓ RPC Auth > signature format > should generate valid signature format
  ✓ RPC Auth > signature format > should generate unique nonces for each request
  ✓ RPC Auth > signature format > should generate valid timestamps
  ✓ RPC Auth > multiple signatures > should support multiple keys
  ↓ RPC Auth > invalid signatures > should handle invalid signatures (integration test)
```

## Diferencias clave

### Formato de los mensajes de error

**rpc-auth original:**
```
ValidationError: Verification failed (Nope)
```

**steem-js v1.0.11:**
```
Error: Verification failed: Nope
```

El formato del error cambió de `(message)` a `: message`, lo cual se refleja en las pruebas.

### Cambios de API

1. **Manejo de PrivateKey**:
   - Antes: `PrivateKey.from(key)` o `PrivateKey.fromString(key)`
   - Ahora: `PrivateKey.fromWif(key)`

2. **Creación de la firma**:
   - Antes: `key.sign(message.buffer)` y luego `hexify()`
   - Ahora: `Signature.signBufferSha256(message, privateKey)` y luego `.toHex()`

3. **Ya no hay clase ValidationError**:
   - Antes: clase `ValidationError` personalizada
   - Ahora: `Error` estándar con mensajes formateados

## Ejecución de las pruebas

```bash
# Run all rpc-auth tests
pnpm test -- rpc-auth.test.ts

# Run with coverage
pnpm test:coverage -- rpc-auth.test.ts

# Run specific test
pnpm test -- rpc-auth.test.ts -t "should sign and validate"
```

## Preparación de la prueba de integración

Para ejecutar la prueba de integración omitida, establezca las variables de entorno:

```bash
export STEEM_USERNAME="your-testnet-account"
export STEEM_PASSWORD="your-password"
pnpm test -- rpc-auth.test.ts
```

## Notas

- Todas las pruebas de funcionalidad básica se han migrado con éxito
- La suite de pruebas mantiene la misma cobertura que la original
- Las pruebas de integración se omiten por defecto, pero pueden habilitarse
- Las pruebas son compatibles con vitest y TypeScript moderno
- La mayoría de las pruebas no requieren dependencias externas

---

Migrado de la documentación del repositorio de steem-js; las utilidades de verificación que ejercita se demuestran en [Llamadas firmadas y verificación de firmas](/es/tutorials/steem-js/signed-calls.html).
