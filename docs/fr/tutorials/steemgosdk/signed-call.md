# Documentation de l'API SignedCall

## Aperçu

La fonctionnalité `SignedCall` fournit des appels JSON-RPC authentifiés vers la blockchain Steem. Elle utilise des signatures cryptographiques pour prouver la propriété d'un compte et accéder aux données privées ou restreintes.

Cette implémentation est entièrement compatible avec la méthode `signedCall` de la bibliothèque `steem-js`, garantissant l'interopérabilité entre les applications JavaScript et Go.

## Fonctionnalités

- **Authentification cryptographique** : prouve la propriété du compte sans transmettre de clés privées
- **Protection contre la relecture** : utilise des nonces et horodatages uniques pour prévenir les attaques par rejeu
- **Expiration basée sur le temps** : pour la sécurité, les signatures expirent après 60 secondes
- **Prise en charge de plusieurs clés** : peut signer simultanément avec plusieurs clés privées
- **HTTP uniquement** : nécessite un transport HTTP/HTTPS pour des raisons de sécurité

## Démarrage rapide

### Utilisation de base

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

## Référence API

### Méthodes du client

#### `SignedCall(method, params, keyType) -> (*RpcResultData, error)`

Effectue un appel RPC signé en utilisant les identifiants stockés.

**Paramètres :**
- `method` (string) : la méthode RPC à appeler (par ex. "condenser_api.get_accounts")
- `params` ([]interface{}) : paramètres de la méthode RPC
- `keyType` (string) : quelle clé privée utiliser ("active", "posting", "owner", "memo")

**Renvoie :**
- `*RpcResultData` : données brutes de la réponse RPC
- `error` : erreur si l'appel échoue

#### `SignedCallWithResult(method, params, keyType, result) -> error`

Effectue un appel RPC signé et désérialise (unmarshal) le résultat dans l'objet fourni.

**Paramètres :**
- `method` (string) : la méthode RPC à appeler
- `params` ([]interface{}) : paramètres de la méthode RPC
- `keyType` (string) : quelle clé privée utiliser
- `result` (interface{}) : pointeur vers l'objet dans lequel désérialiser le résultat

**Renvoie :**
- `error` : erreur si l'appel ou la désérialisation échoue

### Méthodes de l'API

#### `SignedCall(method, params, account, privateKey) -> (*RpcResultData, error)`

Méthode d'appel signé de bas niveau.

**Paramètres :**
- `method` (string) : la méthode RPC à appeler
- `params` ([]interface{}) : paramètres de la méthode RPC
- `account` (string) : nom du compte au nom duquel signer
- `privateKey` (string) : clé privée au format WIF

**Renvoie :**
- `*RpcResultData` : données brutes de la réponse RPC
- `error` : erreur si l'appel échoue

#### `SignedCallWithResult(method, params, account, privateKey, result) -> error`

Appel signé de bas niveau avec désérialisation du résultat.

## Cas d'usage courants

### 1. Obtenir les informations d'un compte

```go
var accounts []map[string]interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_accounts",
    []interface{}{[]string{"username"}},
    consts.ACTIVE_KEY,
    &accounts,
)
```

### 2. Obtenir l'historique du compte

```go
var history []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_account_history",
    []interface{}{"username", -1, 100},
    consts.ACTIVE_KEY,
    &history,
)
```

### 3. Obtenir les followers/following

```go
var followers []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_followers",
    []interface{}{"username", "", "blog", 100},
    consts.POSTING_KEY,
    &followers,
)
```

### 4. Opérations par lot

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

## Gestion des erreurs

### Erreurs courantes

#### Erreur de transport
```go
// Error: "signed calls can only be made when using HTTP transport"
client := steemgosdk.GetClient("wss://api.steemit.com") // WebSocket not supported
```

#### Erreur d'authentification
```go
// Error: "invalid key type: invalid_key"
err := client.SignedCall(method, params, "invalid_key")
```

#### Identifiants manquants
```go
// Error: "account name not set"
client := steemgosdk.GetClient(url)
// client.AccountName not set
err := client.SignedCall(method, params, consts.ACTIVE_KEY)
```

#### Expiration de la signature
```go
// Error: "signature expired"
// Occurs when request takes longer than 60 seconds to reach server
```

### Pattern de gestion des erreurs

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

## Considérations de sécurité

### Bonnes pratiques

1. **HTTPS uniquement** : utilisez toujours des endpoints HTTPS pour les appels signés
2. **Validez les clés privées** : vérifiez le format de la clé avant d'appeler
3. **Gérez l'expiration** : implémentez une logique de nouvelle tentative pour les signatures expirées
4. **Stockage sécurisé des clés** : ne journalisez et n'exposez jamais les clés privées
5. **Variables d'environnement** : utilisez des variables d'environnement pour les données sensibles

### Fonctionnalités de sécurité

- **Aucune transmission de clé** : les clés privées ne quittent jamais votre application
- **Nonces uniques** : chaque requête utilise un nonce aléatoire unique de 8 octets
- **Validation d'horodatage** : les signatures expirent après 60 secondes
- **Protection inter-protocoles** : utilise une constante de signature propre au protocole

### Exemple d'implémentation sécurisée

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

## Utilisation avancée

### Vérification personnalisée

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

### Signature avec plusieurs clés

```go
// Sign with multiple keys
privateKeys := []string{
    "active-key-wif",
    "posting-key-wif",
}

signedRequest, err := rpc.Sign(request, account, privateKeys)
// signedRequest will contain multiple signatures
```

## Tests

### Tests unitaires

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

### Tests d'intégration

Voir `test-gosdk/examples/signed_call/main.go` pour un exemple complet de test d'intégration.

## Compatibilité

Cette implémentation est entièrement compatible avec les appels signés de `steem-js` :

- utilise le même algorithme de signature et le même format de message
- génère des structures de signature identiques
- prend en charge les mêmes fonctionnalités de sécurité (nonces, horodatages, expiration)
- peut valider les signatures créées par `steem-js` et inversement

## Performances

- **Coût de signature** : ~1-5 ms par signature
- **Latence réseau** : dépend du temps de réponse du nœud
- **Utilisation mémoire** : surcoût minimal par rapport aux appels RPC habituels
- **Appels concurrents** : entièrement thread-safe, prend en charge les appels signés concurrents

## Dépannage

### Problèmes courants

1. **« Erreur de transport »** : assurez-vous d'utiliser HTTP/HTTPS, pas WebSocket
2. **« Clé invalide »** : vérifiez le format et les autorisations de la clé privée
3. **« Compte non défini »** : définissez `client.AccountName` avant d'appeler
4. **« Signature expirée »** : implémentez une logique de nouvelle tentative pour les réseaux lents
5. **« Erreur réseau »** : vérifiez la disponibilité du nœud et la connectivité réseau

### Mode débogage

Définissez la variable d'environnement `DEBUG` pour activer la journalisation détaillée :

```bash
DEBUG=1 go run your-program.go
```

Cela affichera les détails des requêtes/réponses et les informations de signature.

---

## Plus d'exemples SignedCall

## Exemples SignedCall

### Appel d'API signé de base

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

### Obtenir l'historique du compte (authentifié)

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

### Appels signés par lot

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

### Gestion des erreurs des appels signés

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

### Utiliser directement les méthodes de l'API

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

## Pour aller plus loin

Le côté steem-js du même protocole est couvert par [steem-js : appels signés et vérification de signature](/fr/tutorials/steem-js/signed-calls.html) ; les deux implémentations sont compatibles au niveau du wire format.
