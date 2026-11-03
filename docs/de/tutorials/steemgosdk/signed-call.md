# SignedCall-API-Dokumentation

## Überblick

Die `SignedCall`-Funktionalität stellt authentifizierte JSON-RPC-Aufrufe an die Steem-Blockchain. Sie nutzt kryptografische Signaturen, um den Kontobesitz nachzuweisen und auf private oder eingeschränkte Daten zuzugreifen.

Diese Implementierung ist vollständig kompatibel mit der `signedCall`-Methode der `steem-js`-Bibliothek und stellt die Interoperabilität zwischen JavaScript- und Go-Anwendungen sicher.

## Funktionen

- **Kryptografische Authentifizierung**: weist Kontobesitz nach, ohne private Schlüssel zu übertragen
- **Replay-Schutz**: verwendet eindeutige Nonces und Zeitstempel, um Replay-Angriffe zu verhindern
- **Zeitbasiertes Ablaufen**: Signaturen laufen aus Sicherheitsgründen nach 60 Sekunden ab
- **Unterstützung mehrerer Schlüssel**: kann gleichzeitig mit mehreren privaten Schlüsseln signieren
- **Nur HTTP**: aus Sicherheitsgründen ist HTTP/HTTPS-Transport erforderlich

## Schnellstart

### Grundlegende Verwendung

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

## API-Referenz

### Client-Methoden

#### `SignedCall(method, params, keyType) -> (*RpcResultData, error)`

Führt einen signierten RPC-Aufruf mit den gespeicherten Anmeldeinformationen aus.

**Parameter:**
- `method` (string): die aufzurufende RPC-Methode (z. B. "condenser_api.get_accounts")
- `params` ([]interface{}): Parameter für die RPC-Methode
- `keyType` (string): welcher private Schlüssel verwendet wird ("active", "posting", "owner", "memo")

**Rückgabe:**
- `*RpcResultData`: rohe RPC-Antwortdaten
- `error`: Fehler, wenn der Aufruf fehlschlägt

#### `SignedCallWithResult(method, params, keyType, result) -> error`

Führt einen signierten RPC-Aufruf aus und deserialisiert (unmarshal) das Ergebnis in das übergebene Objekt.

**Parameter:**
- `method` (string): die aufzurufende RPC-Methode
- `params` ([]interface{}): Parameter für die RPC-Methode
- `keyType` (string): welcher private Schlüssel verwendet wird
- `result` (interface{}): Zeiger auf das Objekt, in das das Ergebnis deserialisiert wird

**Rückgabe:**
- `error`: Fehler, wenn der Aufruf oder die Deserialisierung fehlschlägt

### API-Methoden

#### `SignedCall(method, params, account, privateKey) -> (*RpcResultData, error)`

Signierter Aufruf auf niedriger Ebene.

**Parameter:**
- `method` (string): die aufzurufende RPC-Methode
- `params` ([]interface{}): Parameter für die RPC-Methode
- `account` (string): Kontoname, in dessen Namen signiert wird
- `privateKey` (string): privater Schlüssel im WIF-Format

**Rückgabe:**
- `*RpcResultData`: rohe RPC-Antwortdaten
- `error`: Fehler, wenn der Aufruf fehlschlägt

#### `SignedCallWithResult(method, params, account, privateKey, result) -> error`

Signierter Aufruf auf niedriger Ebene mit Ergebnisdeserialisierung.

## Häufige Anwendungsfälle

### 1. Kontoinformationen abrufen

```go
var accounts []map[string]interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_accounts",
    []interface{}{[]string{"username"}},
    consts.ACTIVE_KEY,
    &accounts,
)
```

### 2. Kontoverlauf abrufen

```go
var history []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_account_history",
    []interface{}{"username", -1, 100},
    consts.ACTIVE_KEY,
    &history,
)
```

### 3. Follower/Following abrufen

```go
var followers []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_followers",
    []interface{}{"username", "", "blog", 100},
    consts.POSTING_KEY,
    &followers,
)
```

### 4. Batch-Operationen

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

## Fehlerbehandlung

### Häufige Fehler

#### Transportfehler
```go
// Error: "signed calls can only be made when using HTTP transport"
client := steemgosdk.GetClient("wss://api.steemit.com") // WebSocket not supported
```

#### Authentifizierungsfehler
```go
// Error: "invalid key type: invalid_key"
err := client.SignedCall(method, params, "invalid_key")
```

#### Fehlende Anmeldeinformationen
```go
// Error: "account name not set"
client := steemgosdk.GetClient(url)
// client.AccountName not set
err := client.SignedCall(method, params, consts.ACTIVE_KEY)
```

#### Signatur abgelaufen
```go
// Error: "signature expired"
// Occurs when request takes longer than 60 seconds to reach server
```

### Fehlerbehandlungsmuster

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

## Sicherheitsaspekte

### Best Practices

1. **Nur HTTPS verwenden**: verwenden Sie für signierte Aufrufe stets HTTPS-Endpoints
2. **Private Schlüssel validieren**: prüfen Sie das Schlüsselformat vor dem Aufruf
3. **Ablaufen behandeln**: implementieren Sie Retry-Logik für abgelaufene Signaturen
4. **Sichere Schlüsselspeicherung**: loggen oder offenlegen Sie private Schlüssel nie
5. **Umgebungsvariablen**: verwenden Sie Umgebungsvariablen für sensible Daten

### Sicherheitsfunktionen

- **Keine Schlüsselübertragung**: private Schlüssel verlassen Ihre Anwendung nie
- **Eindeutige Nonces**: jede Anfrage verwendet eine eindeutige 8-Byte-Zufalls-Nonce
- **Zeitstempel-Validierung**: Signaturen laufen nach 60 Sekunden ab
- **Cross-Protocol-Schutz**: verwendet eine protokollspezifische Signaturkonstante

### Beispiel einer sicheren Implementierung

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

## Fortgeschrittene Verwendung

### Eigene Verifikation

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

### Signieren mit mehreren Schlüsseln

```go
// Sign with multiple keys
privateKeys := []string{
    "active-key-wif",
    "posting-key-wif",
}

signedRequest, err := rpc.Sign(request, account, privateKeys)
// signedRequest will contain multiple signatures
```

## Testen

### Unit-Tests

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

### Integrationstests

Ein vollständiges Beispiel für einen Integrationstest finden Sie in `test-gosdk/examples/signed_call/main.go`.

## Kompatibilität

Diese Implementierung ist vollständig kompatibel mit den signierten Aufrufen von `steem-js`:

- verwendet denselben Signaturalgorithmus und dasselbe Nachrichtenformat
- erzeugt identische Signaturstrukturen
- unterstützt dieselben Sicherheitsfunktionen (Nonces, Zeitstempel, Ablaufen)
- kann Signaturen validieren, die von `steem-js` erstellt wurden, und umgekehrt

## Performance

- **Signaturaufwand**: ~1-5 ms pro Signatur
- **Netzwerklatenz**: abhängig von der Antwortzeit des Knotens
- **Speicherverbrauch**: minimaler zusätzlicher Aufwand gegenüber normalen RPC-Aufrufen
- **Gleichzeitige Aufrufe**: vollständig thread-safe, unterstützt gleichzeitige signierte Aufrufe

## Fehlerbehebung

### Häufige Probleme

1. **„Transportfehler“**: stellen Sie sicher, dass Sie HTTP/HTTPS verwenden, nicht WebSocket
2. **„Ungültiger Schlüssel“**: prüfen Sie Format und Berechtigungen des privaten Schlüssels
3. **„Konto nicht gesetzt“**: setzen Sie `client.AccountName`, bevor Sie Aufrufe tätigen
4. **„Signatur abgelaufen“**: implementieren Sie Retry-Logik für langsame Netzwerke
5. **„Netzwerkfehler“**: prüfen Sie Knotenverfügbarkeit und Netzwerkverbindung

### Debug-Modus

Setzen Sie die Umgebungsvariable `DEBUG`, um detailliertes Logging zu aktivieren:

```bash
DEBUG=1 go run your-program.go
```

Damit werden Anfrage-/Antwortdetails und Signaturinformationen angezeigt.

---

## Weitere SignedCall-Beispiele

## SignedCall-Beispiele

### Grundlegender signierter API-Aufruf

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

### Kontoverlauf abrufen (authentifiziert)

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

### Batch-signierte Aufrufe

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

### Fehlerbehandlung für signierte Aufrufe

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

### Direkte API-Methoden verwenden

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

## Wie es weitergeht

Die steem-js-Seite desselben Protokolls ist in [steem-js: Signierte Aufrufe und Signaturprüfung](/de/tutorials/steem-js/signed-calls.html) beschrieben; die beiden Implementierungen sind auf Wire-Ebene kompatibel.
