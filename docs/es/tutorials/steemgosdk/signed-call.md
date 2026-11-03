# Documentación de la API SignedCall

## Resumen

La funcionalidad `SignedCall` proporciona llamadas JSON-RPC autenticadas a la blockchain de Steem. Usa firmas criptográficas para demostrar la propiedad de una cuenta y acceder a datos privados o restringidos.

Esta implementación es totalmente compatible con el método `signedCall` de la biblioteca `steem-js`, lo que garantiza la interoperabilidad entre aplicaciones de JavaScript y Go.

## Características

- **Autenticación criptográfica**: demuestra la propiedad de la cuenta sin transmitir claves privadas
- **Protección contra repetición**: usa nonces y marcas de tiempo únicas para evitar ataques de repetición (replay)
- **Caducidad basada en el tiempo**: por seguridad, las firmas caducan a los 60 segundos
- **Soporte de varias claves**: puede firmar simultáneamente con varias claves privadas
- **Solo HTTP**: por razones de seguridad, requiere transporte HTTP/HTTPS

## Inicio rápido

### Uso básico

```go
package main

import (
    "fmt"
    "log"
    
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemgosdk/consts"
)

func main() {
    // Create client
    client := steemgosdk.GetClient("https://api.steemit.com")
    client.AccountName = "your-account"
    
    // Import your private key
    err := client.ImportWif(consts.ACTIVE_KEY, "your-private-key-wif")
    if err != nil {
        log.Fatal(err)
    }
    
    // Make a signed call
    var accounts []map[string]interface{}
    err = client.SignedCallWithResult(
        "condenser_api.get_accounts",
        []interface{}{[]string{"your-account"}},
        consts.ACTIVE_KEY,
        &accounts,
    )
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Account: %v\n", accounts[0]["name"])
}
```

## Referencia de API

### Métodos del cliente

#### `SignedCall(method, params, keyType) -> (*RpcResultData, error)`

Realiza una llamada RPC firmada usando las credenciales almacenadas.

**Parámetros:**
- `method` (string): el método RPC al que llamar (por ejemplo, "condenser_api.get_accounts")
- `params` ([]interface{}): parámetros para el método RPC
- `keyType` (string): qué clave privada usar ("active", "posting", "owner", "memo")

**Devuelve:**
- `*RpcResultData`: datos brutos de la respuesta RPC
- `error`: error si la llamada falla

#### `SignedCallWithResult(method, params, keyType, result) -> error`

Realiza una llamada RPC firmada y deserializa (unmarshal) el resultado en el objeto proporcionado.

**Parámetros:**
- `method` (string): el método RPC al que llamar
- `params` ([]interface{}): parámetros para el método RPC
- `keyType` (string): qué clave privada usar
- `result` (interface{}): puntero al objeto en el que deserializar el resultado

**Devuelve:**
- `error`: error si la llamada o la deserialización falla

### Métodos de la API

#### `SignedCall(method, params, account, privateKey) -> (*RpcResultData, error)`

Método de llamada firmada de bajo nivel.

**Parámetros:**
- `method` (string): el método RPC al que llamar
- `params` ([]interface{}): parámetros para el método RPC
- `account` (string): nombre de la cuenta con la que firmar
- `privateKey` (string): clave privada en formato WIF

**Devuelve:**
- `*RpcResultData`: datos brutos de la respuesta RPC
- `error`: error si la llamada falla

#### `SignedCallWithResult(method, params, account, privateKey, result) -> error`

Llamada firmada de bajo nivel con deserialización del resultado.

## Casos de uso comunes

### 1. Obtener información de una cuenta

```go
var accounts []map[string]interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_accounts",
    []interface{}{[]string{"username"}},
    consts.ACTIVE_KEY,
    &accounts,
)
```

### 2. Obtener el historial de la cuenta

```go
var history []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_account_history",
    []interface{}{"username", -1, 100},
    consts.ACTIVE_KEY,
    &history,
)
```

### 3. Obtener followers/following

```go
var followers []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_followers",
    []interface{}{"username", "", "blog", 100},
    consts.POSTING_KEY,
    &followers,
)
```

### 4. Operaciones por lotes

```go
// Multiple signed calls
operations := []struct {
    method string
    params []interface{}
}{
    {"condenser_api.get_accounts", []interface{}{[]string{"username"}}},
    {"condenser_api.get_account_history", []interface{}{"username", -1, 10}},
    {"condenser_api.get_followers", []interface{}{"username", "", "blog", 10}},
}

for _, op := range operations {
    var result interface{}
    err := client.SignedCallWithResult(op.method, op.params, consts.ACTIVE_KEY, &result)
    if err != nil {
        log.Printf("Operation %s failed: %v", op.method, err)
        continue
    }
    // Process result...
}
```

## Manejo de errores

### Errores comunes

#### Error de transporte
```go
// Error: "signed calls can only be made when using HTTP transport"
client := steemgosdk.GetClient("wss://api.steemit.com") // WebSocket not supported
```

#### Error de autenticación
```go
// Error: "invalid key type: invalid_key"
err := client.SignedCall(method, params, "invalid_key")
```

#### Credenciales ausentes
```go
// Error: "account name not set"
client := steemgosdk.GetClient(url)
// client.AccountName not set
err := client.SignedCall(method, params, consts.ACTIVE_KEY)
```

#### Firma caducada
```go
// Error: "signature expired"
// Occurs when request takes longer than 60 seconds to reach server
```

### Patrón de manejo de errores

```go
func makeSignedCall(client *steemgosdk.Client, method string, params []interface{}) {
    var result interface{}
    err := client.SignedCallWithResult(method, params, consts.ACTIVE_KEY, &result)
    
    switch {
    case err == nil:
        // Success
        fmt.Printf("Call succeeded: %v\n", result)
        
    case strings.Contains(err.Error(), "transport"):
        // Transport error - check URL scheme
        log.Printf("Transport error: %v", err)
        
    case strings.Contains(err.Error(), "expired"):
        // Signature expired - retry
        log.Printf("Signature expired, retrying: %v", err)
        // Implement retry logic
        
    case strings.Contains(err.Error(), "key"):
        // Key-related error - check credentials
        log.Printf("Authentication error: %v", err)
        
    default:
        // Other error
        log.Printf("Unexpected error: %v", err)
    }
}
```

## Consideraciones de seguridad

### Buenas prácticas

1. **Solo HTTPS**: usa siempre endpoints HTTPS para las llamadas firmadas
2. **Valida las claves privadas**: verifica el formato de la clave antes de llamar
3. **Gestiona la caducidad**: implementa lógica de reintentos para firmas caducadas
4. **Almacenamiento seguro de claves**: nunca registres ni expongas claves privadas
5. **Variables de entorno**: usa variables de entorno para los datos sensibles

### Funciones de seguridad

- **Sin transmisión de claves**: las claves privadas nunca salen de tu aplicación
- **Nonces únicos**: cada petición usa un nonce aleatorio único de 8 bytes
- **Validación de marca de tiempo**: las firmas caducan a los 60 segundos
- **Protección cruzada de protocolos**: usa una constante de firma específica del protocolo

### Ejemplo de implementación segura

```go
package main

import (
    "os"
    "log"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemgosdk/consts"
)

func main() {
    // Get credentials from environment
    account := os.Getenv("STEEM_ACCOUNT")
    password := os.Getenv("STEEM_PASSWORD")
    
    if account == "" || password == "" {
        log.Fatal("STEEM_ACCOUNT and STEEM_PASSWORD must be set")
    }
    
    // Create client with HTTPS endpoint
    client := steemgosdk.GetClient("https://api.steemit.com")
    client.AccountName = account
    
    // Generate keys from password (more secure than storing WIF)
    auth := client.GetAuth()
    keys, err := auth.GetPrivateKeys(account, password)
    if err != nil {
        log.Fatalf("Failed to generate keys: %v", err)
    }
    
    // Import only the keys you need
    if err := client.ImportWif(consts.ACTIVE_KEY, keys.Active); err != nil {
        log.Fatalf("Failed to import active key: %v", err)
    }
    
    // Make signed calls...
}
```

## Uso avanzado

### Verificación personalizada

```go
import "github.com/steemit/steemutil/rpc"

// Custom verification function
func customVerifyFunc(message []byte, signatures []string, account string) error {
    // Implement custom signature verification logic
    // This could involve checking against blockchain account keys
    return nil
}

// Use with low-level RPC signing
request := &rpc.RpcRequest{
    Method: "condenser_api.get_accounts",
    Params: []interface{}{[]string{"username"}},
    ID:     1,
}

signedRequest, err := rpc.Sign(request, "username", []string{"private-key"})
if err != nil {
    return err
}

params, err := rpc.Validate(signedRequest, customVerifyFunc)
if err != nil {
    return err
}
```

### Firma con varias claves

```go
// Sign with multiple keys
privateKeys := []string{
    "active-key-wif",
    "posting-key-wif",
}

signedRequest, err := rpc.Sign(request, account, privateKeys)
// signedRequest will contain multiple signatures
```

## Pruebas

### Pruebas unitarias

```go
func TestSignedCall(t *testing.T) {
    client := steemgosdk.GetClient("https://api.steemit.com")
    client.AccountName = "testaccount"
    
    // Import test key
    err := client.ImportWif(consts.ACTIVE_KEY, "test-private-key")
    if err != nil {
        t.Fatal(err)
    }
    
    // Test signed call
    var result interface{}
    err = client.SignedCallWithResult(
        "condenser_api.get_dynamic_global_properties",
        []interface{}{},
        consts.ACTIVE_KEY,
        &result,
    )
    
    // In test environment, expect network error, not validation error
    if err != nil && !strings.Contains(err.Error(), "network") {
        t.Errorf("Unexpected error: %v", err)
    }
}
```

### Pruebas de integración

Consulta `test-gosdk/examples/signed_call/main.go` para un ejemplo completo de prueba de integración.

## Compatibilidad

Esta implementación es totalmente compatible con las llamadas firmadas de `steem-js`:

- usa el mismo algoritmo de firma y el mismo formato de mensaje
- genera estructuras de firma idénticas
- admite las mismas funciones de seguridad (nonces, marcas de tiempo, caducidad)
- puede validar firmas creadas por `steem-js` y viceversa

## Rendimiento

- **Sobrecoste de firma**: ~1-5 ms por firma
- **Latencia de red**: depende del tiempo de respuesta del nodo
- **Uso de memoria**: sobrecoste adicional mínimo frente a las llamadas RPC habituales
- **Llamadas concurrentes**: totalmente thread-safe, admite llamadas firmadas concurrentes

## Solución de problemas

### Problemas comunes

1. **«Error de transporte»**: asegúrate de usar HTTP/HTTPS, no WebSocket
2. **«Clave no válida»**: verifica el formato y los permisos de la clave privada
3. **«Cuenta no establecida»**: establece `client.AccountName` antes de llamar
4. **«Firma caducada»**: implementa lógica de reintentos para redes lentas
5. **«Error de red»**: comprueba la disponibilidad del nodo y la conectividad de red

### Modo de depuración

Establece la variable de entorno `DEBUG` para habilitar el registro detallado:

```bash
DEBUG=1 go run your-program.go
```

Esto mostrará los detalles de las peticiones/respuestas y la información de firma.

---

## Más ejemplos de SignedCall

## Ejemplos de SignedCall

### Llamada de API firmada básica

```go
package main

import (
    "fmt"
    "log"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemgosdk/consts"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    client.AccountName = "your-account"
    
    // Import your active key
    err := client.ImportWif(consts.ACTIVE_KEY, "your-active-key-wif")
    if err != nil {
        log.Fatal(err)
    }
    
    // Get account information with authentication
    var accounts []map[string]interface{}
    err = client.SignedCallWithResult(
        "condenser_api.get_accounts",
        []interface{}{[]string{"your-account"}},
        consts.ACTIVE_KEY,
        &accounts,
    )
    if err != nil {
        log.Fatal(err)
    }
    
    if len(accounts) > 0 {
        account := accounts[0]
        fmt.Printf("Account: %s\n", account["name"])
        fmt.Printf("Balance: %s\n", account["balance"])
        fmt.Printf("SBD Balance: %s\n", account["sbd_balance"])
    }
}
```

### Obtener el historial de la cuenta (autenticado)

```go
func getAccountHistory(client *steemgosdk.Client, account string) {
    var history []interface{}
    err := client.SignedCallWithResult(
        "condenser_api.get_account_history",
        []interface{}{account, -1, 100},
        consts.ACTIVE_KEY,
        &history,
    )
    if err != nil {
        log.Printf("Failed to get account history: %v", err)
        return
    }
    
    fmt.Printf("Retrieved %d history entries\n", len(history))
    
    // Process history entries
    for _, entry := range history {
        if entryArray, ok := entry.([]interface{}); ok && len(entryArray) >= 2 {
            if op, ok := entryArray[1].(map[string]interface{}); ok {
                opType := op["op"].([]interface{})[0]
                fmt.Printf("Operation: %s\n", opType)
            }
        }
    }
}
```

### Llamadas firmadas por lotes

```go
func performBatchSignedCalls(client *steemgosdk.Client, account string) {
    operations := []struct {
        name   string
        method string
        params []interface{}
    }{
        {
            name:   "Get Account Info",
            method: "condenser_api.get_accounts",
            params: []interface{}{[]string{account}},
        },
        {
            name:   "Get Followers",
            method: "condenser_api.get_followers",
            params: []interface{}{account, "", "blog", 100},
        },
        {
            name:   "Get Following",
            method: "condenser_api.get_following",
            params: []interface{}{account, "", "blog", 100},
        },
    }
    
    for _, op := range operations {
        fmt.Printf("Executing: %s...", op.name)
        
        var result interface{}
        err := client.SignedCallWithResult(op.method, op.params, consts.ACTIVE_KEY, &result)
        if err != nil {
            fmt.Printf(" Failed: %v\n", err)
            continue
        }
        
        if resultArray, ok := result.([]interface{}); ok {
            fmt.Printf(" Success (%d items)\n", len(resultArray))
        } else {
            fmt.Printf(" Success\n")
        }
    }
}
```

### Manejo de errores de las llamadas firmadas

```go
func robustSignedCall(client *steemgosdk.Client, method string, params []interface{}) {
    var result interface{}
    err := client.SignedCallWithResult(method, params, consts.ACTIVE_KEY, &result)
    
    switch {
    case err == nil:
        fmt.Printf("Call succeeded: %v\n", result)
        
    case strings.Contains(err.Error(), "transport"):
        log.Printf("Transport error - check URL scheme: %v", err)
        
    case strings.Contains(err.Error(), "expired"):
        log.Printf("Signature expired - implement retry logic: %v", err)
        
    case strings.Contains(err.Error(), "key"):
        log.Printf("Authentication error - check credentials: %v", err)
        
    default:
        log.Printf("Unexpected error: %v", err)
    }
}
```

### Usar directamente los métodos de la API

```go
func directAPISignedCall() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    api := client.GetAPI()
    
    // Direct API call with explicit credentials
    response, err := api.SignedCall(
        "condenser_api.get_dynamic_global_properties",
        []interface{}{},
        "your-account",
        "your-private-key-wif",
    )
    if err != nil {
        log.Fatal(err)
    }
    
    var dgp map[string]interface{}
    if err := json.Unmarshal(response.Result, &dgp); err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Head block: %.0f\n", dgp["head_block_number"])
}
```

## Qué hacer a continuación

El lado de steem-js del mismo protocolo se cubre en [steem-js: llamadas firmadas y verificación de firmas](/es/tutorials/steem-js/signed-calls.html); las dos implementaciones son compatibles a nivel de cable.
