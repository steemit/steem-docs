---
title: steemgosdk - Inicio rápido
description: Configuración del SDK de Go para Steem — inicialización del cliente, ejemplos de API de lectura de la cadena, ejemplos de generación de claves para la autenticación y ejemplos de firma de URI de Steem.
---

# steemgosdk: Inicio rápido

[steemgosdk](https://github.com/steemit/steemgosdk) es la biblioteca oficial de Go para la blockchain de Steem (módulo de Go `github.com/steemit/steemgosdk`, orientado a Go 1.18+). Instálala con `go get github.com/steemit/steemgosdk` y luego sigue los ejemplos de abajo, tomados de la documentación del propio SDK.

> Cada helper de abajo habla con los mismos métodos JSON-RPC documentados en la [Referencia de API](/es/api/) generada — por ejemplo, `GetAccounts` corresponde a [condenser_api.get_accounts](/es/api/condenser_api/get_accounts.html).

## Configuración básica

## Configuración básica

### Inicializar el cliente

```go
package main

import (
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    // Create a client pointing to a Steem node
    url := "https://api.steemit.com"
    client := steemgosdk.GetClient(url)
    
    // Set account name and WIFs if needed
    client.AccountName = "your-account-name"
    
    fmt.Println("Client initialized:", client.Url)
}
```

### Obtener las instancias de API, Broadcast y Auth

```go
// Get API instance for making RPC calls
api := client.GetAPI()

// Get Broadcast instance for signing and broadcasting transactions
broadcast := client.GetBroadcast()

// Get Auth instance for authentication and key management
auth := client.GetAuth()
```

## Ejemplos de API

## Ejemplos de API

### Obtener información de un bloque

```go
package main

import (
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    api := client.GetAPI()
    
    // Get block by number
    block, err := api.GetBlock(1)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("Block ID: %s\n", block.BlockID)
    fmt.Printf("Previous: %s\n", block.Previous)
    fmt.Printf("Timestamp: %s\n", block.Timestamp)
}
```

### Obtener varios bloques

```go
package main

import (
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    api := client.GetAPI()
    
    // Get blocks in range [from, to)
    blocks, err := api.GetBlocks(10000000, 10000010)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("Retrieved %d blocks\n", len(blocks))
    for _, wrapBlock := range blocks {
        fmt.Printf("Block %d: %s\n", wrapBlock.BlockNum, wrapBlock.Block.BlockID)
    }
}
```

### Obtener información de una cuenta

```go
package main

import (
    "encoding/json"
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    api := client.GetAPI()
    
    // Get account information
    result, err := api.Call("condenser_api", "get_accounts", []interface{}{
        []interface{}{"steemit"},
    })
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    // Print raw result
    resultJSON, _ := json.MarshalIndent(result.Result, "", "  ")
    fmt.Println(string(resultJSON))
}
```

### Obtener información de una cuenta con cálculo de reputación

```go
package main

import (
    "fmt"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemutil/protocol"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    api := client.GetAPI()
    
    // Get account information
    accounts, err := api.GetAccounts([]string{"steemit"})
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    if len(accounts) > 0 {
        account := accounts[0]
        rawRep := account.Reputation
        
        // Convert raw reputation to log10 format
        repLog10 := protocol.RepLog10(rawRep)
        
        fmt.Printf("Account: %s\n", account.Name)
        fmt.Printf("Raw Reputation: %d\n", rawRep)
        fmt.Printf("Reputation Score (log10): %d\n", repLog10)
    }
}
```

### Obtener las propiedades globales dinámicas

```go
package main

import (
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    api := client.GetAPI()
    
    dgp, err := api.GetDynamicGlobalProperties()
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("Head Block Number: %d\n", dgp.HeadBlockNumber)
    fmt.Printf("Head Block ID: %s\n", dgp.HeadBlockId)
    fmt.Printf("Time: %s\n", dgp.Time)
}
```

### Obtener el contenido (post/comentario)

```go
package main

import (
    "encoding/json"
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    api := client.GetAPI()
    
    // Get a specific post/comment
    result, err := api.Call("condenser_api", "get_content", []interface{}{
        "steemit",
        "firstpost",
    })
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    resultJSON, _ := json.MarshalIndent(result.Result, "", "  ")
    fmt.Println(string(resultJSON))
}
```

### Obtener el hex de la transacción

```go
package main

import (
    "encoding/hex"
    "fmt"
    "time"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemutil/protocol"
    "github.com/steemit/steemutil/transaction"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    api := client.GetAPI()
    
    // Get dynamic global properties
    dgp, err := api.GetDynamicGlobalProperties()
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    // Create a transaction
    refBlockPrefix, _ := transaction.RefBlockPrefix(dgp.HeadBlockId)
    expiration := time.Now().Add(600 * time.Second)
    tx := transaction.NewSignedTransaction(&transaction.Transaction{
        RefBlockNum:    transaction.RefBlockNum(dgp.HeadBlockNumber),
        RefBlockPrefix: refBlockPrefix,
        Expiration:     &protocol.Time{Time: &expiration},
    })
    
    // Add an operation
    voteOp := &protocol.VoteOperation{
        Voter:    "your-account-name",
        Author:   "steemit",
        Permlink: "firstpost",
        Weight:   10000,
    }
    tx.PushOperation(voteOp)
    
    // Get transaction hex
    txHex, err := api.GetTransactionHex(tx)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    // Serialize transaction locally for comparison
    txBytes, _ := tx.Serialize()
    localHex := hex.EncodeToString(txBytes)
    
    fmt.Printf("Transaction hex from API: %v\n", txHex)
    fmt.Printf("Local transaction hex: %s00\n", localHex)
}
```

## Ejemplos de autenticación

## Ejemplos de autenticación

### Generar claves a partir del nombre de cuenta y la contraseña

```go
package main

import (
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    auth := client.GetAuth()
    
    accountName := "your-account-name"
    password := "your-password"
    roles := []string{"owner", "active", "posting", "memo"}
    
    // Generate public keys
    pubKeys, err := auth.GenerateKeys(accountName, password, roles)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("Owner key: %s\n", pubKeys["owner"])
    fmt.Printf("Active key: %s\n", pubKeys["active"])
    fmt.Printf("Posting key: %s\n", pubKeys["posting"])
    fmt.Printf("Memo key: %s\n", pubKeys["memo"])
}
```

### Obtener las claves privadas (WIF)

```go
package main

import (
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    auth := client.GetAuth()
    
    accountName := "your-account-name"
    password := "your-password"
    roles := []string{"posting", "active"}
    
    // Get private keys and public keys
    keys, err := auth.GetPrivateKeys(accountName, password, roles)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("Posting WIF: %s\n", keys["posting"])
    fmt.Printf("Posting Public Key: %s\n", keys["postingPubkey"])
    fmt.Printf("Active WIF: %s\n", keys["active"])
    fmt.Printf("Active Public Key: %s\n", keys["activePubkey"])
}
```

### Convertir nombre de cuenta y contraseña a WIF

```go
package main

import (
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    auth := client.GetAuth()
    
    accountName := "your-account-name"
    password := "your-password"
    role := "posting"
    
    // Convert to WIF
    wif, err := auth.ToWif(accountName, password, role)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("WIF for %s role: %s\n", role, wif)
}
```

### Validar un WIF y una clave pública

```go
package main

import (
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    auth := client.GetAuth()
    
    // WARNING: This is a test/example key. NEVER use it in production!
    wif := "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg"
    pubKey := "STM8m5UgaFAAYQRuaNejYdS8FVLVp9Ss3K1qAVk5de6F8s3HnVbvA"
    
    // Check if WIF is valid
    isWif := auth.IsWif(wif)
    fmt.Printf("Is valid WIF: %v\n", isWif)
    
    // Check if public key is valid
    isPubkey := auth.IsPubkey(pubKey)
    fmt.Printf("Is valid public key: %v\n", isPubkey)
    
    // Verify WIF matches public key
    isValid := auth.WifIsValid(wif, pubKey)
    fmt.Printf("WIF matches public key: %v\n", isValid)
    
    // Convert WIF to public key
    derivedPubKey, err := auth.WifToPublic(wif)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    fmt.Printf("Derived public key: %s\n", derivedPubKey)
}
```

### Cifrar y descifrar un memo

```go
package main

import (
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    auth := client.GetAuth()
    
    // Sender's memo private key
    // WARNING: This is a test/example key. NEVER use it in production!
    senderMemoWif := "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg"
    
    // Recipient's memo public key
    recipientMemoKey := "STM8m5UgaFAAYQRuaNejYdS8FVLVp9Ss3K1qAVk5de6F8s3HnVbvA"
    
    // Original message (must start with '#' to be encrypted)
    originalMemo := "#This is a secret message"
    
    // Encrypt memo
    encryptedMemo, err := auth.EncodeMemo(senderMemoWif, recipientMemoKey, originalMemo)
    if err != nil {
        fmt.Printf("Error encrypting: %v\n", err)
        return
    }
    fmt.Printf("Encrypted memo: %s\n", encryptedMemo)
    
    // Decrypt memo (recipient uses their memo private key)
    // WARNING: This is a test/example key. NEVER use it in production!
    recipientMemoWif := "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg"
    decryptedMemo, err := auth.DecodeMemo(recipientMemoWif, encryptedMemo)
    if err != nil {
        fmt.Printf("Error decrypting: %v\n", err)
        return
    }
    fmt.Printf("Decrypted memo: %s\n", decryptedMemo)
}
```

## Ejemplos de URI de Steem

## Ejemplos de URI de Steem

El paquete `steemuri` implementa el [protocolo de firma de URI de Steem](https://github.com/steemit/steem-uri-spec), que permite codificar transacciones de Steem en enlaces `steem://` compartibles y decodificarlas de vuelta.

### Codificar una sola operación en un URI

```go
package main

import (
    "fmt"
    "github.com/steemit/steemgosdk/steemuri"
)

func main() {
    // Create a vote operation (as a JSON-compatible slice)
    voteOp := []interface{}{"vote", map[string]interface{}{
        "voter":    "alice",
        "author":   "bob",
        "permlink": "my-post",
        "weight":   10000,
    }}

    // Encode to a steem URI (default protocol: web+steem)
    uri, err := steemuri.EncodeOp(voteOp, steemuri.Parameters{}, "")
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }

    fmt.Println(uri)
    // Output: web+steem://sign/op/WyJ2b3RlIix7...
}
```

### Codificar con parámetros

```go
// Encode with signer and callback URL
params := steemuri.Parameters{
    Signer:   "alice",
    Callback: "https://myapp.com/callback?tx={{id}}",
}

uri, err := steemuri.EncodeOp(voteOp, params, steemuri.ProtocolSteem)
// Output: steem://sign/op/...?s=alice&cb=...
```

### Codificar varias operaciones

```go
transferOp := []interface{}{"transfer", map[string]interface{}{
    "from":   "alice",
    "to":     "bob",
    "amount": "1.000 STEEM",
    "memo":   "Hello!",
}}

ops := []interface{}{voteOp, transferOp}
uri, err := steemuri.EncodeOps(ops, steemuri.Parameters{}, "")
```

### Decodificar un URI de Steem

```go
result, err := steemuri.Decode(uri)
if err != nil {
    fmt.Printf("Error: %v\n", err)
    return
}

fmt.Printf("Transaction: %v\n", result.Tx)
fmt.Printf("Signer: %s\n", result.Params.Signer)
fmt.Printf("Callback: %s\n", result.Params.Callback)
```

### Resolver los placeholders de la transacción

Tras decodificar, las transacciones pueden contener placeholders (`__signer`, `__ref_block_num`, etc.) que hay que resolver antes de firmar:

```go
result, _ := steemuri.Decode(uri)

resolved, err := steemuri.ResolveTransaction(result.Tx, result.Params, steemuri.ResolveOptions{
    RefBlockNum:     1234,
    RefBlockPrefix:  5678900,
    Expiration:      "2025-01-01T00:00:00",
    Signers:         []string{"alice", "bob"},
    PreferredSigner: "alice",
})
if err != nil {
    fmt.Printf("Error: %v\n", err)
    return
}

fmt.Printf("Signer: %s\n", resolved.Signer)
fmt.Printf("Resolved TX: %v\n", resolved.Tx)
```

### Resolver la URL de callback

Una vez confirmada la transacción, resuelve las variables de plantilla en la URL de callback:

```go
callbackURL := "https://myapp.com/cb?sig={{sig}}&id={{id}}&block={{block}}&txn={{txn}}"
ctx := steemuri.TransactionConfirmation{
    Sig:   "2050a...",
    ID:    "abc123",
    Block: 12345678,
    Txn:   0,
}

resolved := steemuri.ResolveCallback(callbackURL, ctx)
fmt.Println(resolved)
// Output: https://myapp.com/cb?sig=2050a...&id=abc123&block=12345678&txn=0
```

## Qué hacer a continuación

- [Operaciones de broadcast](/es/tutorials/steemgosdk/broadcast.html) - votos, transferencias, comentarios, beneficiarios, custom_json y ejemplos completos de extremo a extremo.
- [SignedCall API](/es/tutorials/steemgosdk/signed-call.html) - llamadas JSON-RPC autenticadas desde Go.
