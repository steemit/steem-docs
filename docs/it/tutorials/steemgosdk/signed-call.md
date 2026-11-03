# Documentazione dell'API SignedCall

## Panoramica

La funzionalità `SignedCall` fornisce chiamate JSON-RPC autenticate verso la blockchain Steem. Usa firme crittografiche per dimostrare la proprietà di un account e accedere a dati privati o riservati.

Questa implementazione è pienamente compatibile con il metodo `signedCall` della libreria `steem-js`, garantendo l'interoperabilità tra applicazioni JavaScript e Go.

## Caratteristiche

- **Autenticazione crittografica**: dimostra la proprietà dell'account senza trasmettere chiavi private
- **Protezione dal replay**: usa nonce e timestamp univoci per prevenire attacchi di replay
- **Scadenza basata sul tempo**: per sicurezza, le firme scadono dopo 60 secondi
- **Supporto di più chiavi**: può firmare simultaneamente con più chiavi private
- **Solo HTTP**: per motivi di sicurezza richiede trasporto HTTP/HTTPS

## Avvio rapido

### Uso di base

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

## Riferimento API

### Metodi del client

#### `SignedCall(method, params, keyType) -> (*RpcResultData, error)`

Esegue una chiamata RPC firmata usando le credenziali memorizzate.

**Parametri:**
- `method` (string): il metodo RPC da chiamare (es. "condenser_api.get_accounts")
- `params` ([]interface{}): parametri per il metodo RPC
- `keyType` (string): quale chiave privata usare ("active", "posting", "owner", "memo")

**Restituisce:**
- `*RpcResultData`: dati grezzi della risposta RPC
- `error`: errore se la chiamata fallisce

#### `SignedCallWithResult(method, params, keyType, result) -> error`

Esegue una chiamata RPC firmata e deserializza (unmarshal) il risultato nell'oggetto fornito.

**Parametri:**
- `method` (string): il metodo RPC da chiamare
- `params` ([]interface{}): parametri per il metodo RPC
- `keyType` (string): quale chiave privata usare
- `result` (interface{}): puntatore all'oggetto in cui deserializzare il risultato

**Restituisce:**
- `error`: errore se la chiamata o la deserializzazione fallisce

### Metodi dell'API

#### `SignedCall(method, params, account, privateKey) -> (*RpcResultData, error)`

Metodo di chiamata firmata di basso livello.

**Parametri:**
- `method` (string): il metodo RPC da chiamare
- `params` ([]interface{}): parametri per il metodo RPC
- `account` (string): nome dell'account per cui firmare
- `privateKey` (string): chiave privata in formato WIF

**Restituisce:**
- `*RpcResultData`: dati grezzi della risposta RPC
- `error`: errore se la chiamata fallisce

#### `SignedCallWithResult(method, params, account, privateKey, result) -> error`

Chiamata firmata di basso livello con deserializzazione del risultato.

## Casi d'uso comuni

### 1. Ottenere le informazioni di un account

```go
var accounts []map[string]interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_accounts",
    []interface{}{[]string{"username"}},
    consts.ACTIVE_KEY,
    &accounts,
)
```

### 2. Ottenere la cronologia dell'account

```go
var history []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_account_history",
    []interface{}{"username", -1, 100},
    consts.ACTIVE_KEY,
    &history,
)
```

### 3. Ottenere followers/following

```go
var followers []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_followers",
    []interface{}{"username", "", "blog", 100},
    consts.POSTING_KEY,
    &followers,
)
```

### 4. Operazioni in batch

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

## Gestione degli errori

### Errori comuni

#### Errore di trasporto
```go
// Error: "signed calls can only be made when using HTTP transport"
client := steemgosdk.GetClient("wss://api.steemit.com") // WebSocket not supported
```

#### Errore di autenticazione
```go
// Error: "invalid key type: invalid_key"
err := client.SignedCall(method, params, "invalid_key")
```

#### Credenziali mancanti
```go
// Error: "account name not set"
client := steemgosdk.GetClient(url)
// client.AccountName not set
err := client.SignedCall(method, params, consts.ACTIVE_KEY)
```

#### Firma scaduta
```go
// Error: "signature expired"
// Occurs when request takes longer than 60 seconds to reach server
```

### Pattern di gestione degli errori

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

## Considerazioni sulla sicurezza

### Best practice

1. **Solo HTTPS**: usa sempre endpoint HTTPS per le chiamate firmate
2. **Valida le chiavi private**: verifica il formato della chiave prima di chiamare
3. **Gestisci la scadenza**: implementa logica di retry per le firme scadute
4. **Archiviazione sicura delle chiavi**: non registrare né esporre mai le chiavi private
5. **Variabili d'ambiente**: usa variabili d'ambiente per i dati sensibili

### Funzionalità di sicurezza

- **Nessuna trasmissione di chiavi**: le chiavi private non lasciano mai la tua applicazione
- **Nonce univoci**: ogni richiesta usa un nonce casuale univoco di 8 byte
- **Validazione del timestamp**: le firme scadono dopo 60 secondi
- **Protezione cross-protocol**: usa una costante di firma specifica del protocollo

### Esempio di implementazione sicura

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

## Uso avanzato

### Verifica personalizzata

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

### Firma con più chiavi

```go
// Sign with multiple keys
privateKeys := []string{
    "active-key-wif",
    "posting-key-wif",
}

signedRequest, err := rpc.Sign(request, account, privateKeys)
// signedRequest will contain multiple signatures
```

## Test

### Test unitari

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

### Test di integrazione

Vedi `test-gosdk/examples/signed_call/main.go` per un esempio completo di test di integrazione.

## Compatibilità

Questa implementazione è pienamente compatibile con le chiamate firmate di `steem-js`:

- usa lo stesso algoritmo di firma e lo stesso formato dei messaggi
- genera strutture di firma identiche
- supporta le stesse funzionalità di sicurezza (nonce, timestamp, scadenza)
- può validare le firme create da `steem-js` e viceversa

## Prestazioni

- **Costo di firma**: ~1-5 ms per firma
- **Latenza di rete**: dipende dal tempo di risposta del nodo
- **Uso di memoria**: overhead aggiuntivo minimo rispetto alle normali chiamate RPC
- **Chiamate concorrenti**: completamente thread-safe, supporta chiamate firmate concorrenti

## Risoluzione dei problemi

### Problemi comuni

1. **"Errore di trasporto"**: assicurati di usare HTTP/HTTPS, non WebSocket
2. **"Chiave non valida"**: verifica formato e permessi della chiave privata
3. **"Account non impostato"**: imposta `client.AccountName` prima di chiamare
4. **"Firma scaduta"**: implementa logica di retry per reti lente
5. **"Errore di rete"**: controlla la disponibilità del nodo e la connettività di rete

### Modalità debug

Imposta la variabile d'ambiente `DEBUG` per abilitare la registrazione dettagliata:

```bash
DEBUG=1 go run your-program.go
```

Mostrerà i dettagli di richiesta/risposta e le informazioni di firma.

---

## Altri esempi SignedCall

## Esempi SignedCall

### Chiamata API firmata di base

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

### Ottenere la cronologia dell'account (autenticato)

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

### Chiamate firmate in batch

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

### Gestione degli errori per le chiamate firmate

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

### Usare direttamente i metodi dell'API

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

## Prossimi passi

Il lato steem-js dello stesso protocollo è trattato in [steem-js: chiamate firmate e verifica delle firme](/it/tutorials/steem-js/signed-calls.html); le due implementazioni sono compatibili a livello di wire format.
