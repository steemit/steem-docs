---
title: steemgosdk - Operaciones de broadcast
description: Transmite cada operación de Steem desde Go — votos, transferencias, memos cifrados, comentarios, beneficiarios, transacciones multioperación, custom_json y ejemplos completos.
---

# steemgosdk: Operaciones de broadcast

La instancia `Broadcast` del [SDK de Go para Steem](https://github.com/steemit/steemgosdk) maneja automáticamente la preparación de la transacción (ref_block_num, ref_block_prefix, expiration) y la firma — tú solo proporcionas las operaciones (operation) y las claves privadas (private key). Esta página recoge los ejemplos completos de broadcast de la documentación del SDK; la configuración del cliente y la generación de claves están en el [Inicio rápido](/es/tutorials/steemgosdk/index.html).

> **⚠️ Advertencia de seguridad**: las claves privadas usadas en los ejemplos de abajo (`5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg`) son **solo claves de prueba/de ejemplo**. Son públicamente conocidas y **NUNCA** deben usarse en producción. Genera siempre tus propias claves privadas a partir del nombre de tu cuenta y tu contraseña con los métodos `auth.ToWif()` o `auth.GetPrivateKeys()`.

> Los detalles «en el cable» de cada operación están documentados en la [referencia de operaciones de broadcast](/es/api/broadcast_ops/) generada.

## Ejemplos de broadcast

## Ejemplos de broadcast

### Votar un post

```go
package main

import (
    "fmt"
    "time"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemutil/protocol"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    broadcast := client.GetBroadcast()
    
    // Create a vote operation
    voteOp := &protocol.VoteOperation{
        Voter:    "your-account-name",
        Author:   "steemit",
        Permlink: "firstpost",
        Weight:   10000, // 100% vote weight (10000 = 100%)
    }
    
    // Your posting private key in WIF format
    // WARNING: This is a test/example key. NEVER use it in production!
    // Generate your own key using: auth.ToWif(accountName, password, "posting")
    postingWif := "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg"
    
    // Broadcast the vote
    result, err := broadcast.SendWith(voteOp, postingWif)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("Transaction broadcasted: %s\n", string(result))
}
```

### Transferir STEEM o dólares STEEM (SBD)

```go
package main

import (
    "fmt"
    "time"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemutil/protocol"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    broadcast := client.GetBroadcast()
    
    // Create a transfer operation
    transferOp := &protocol.TransferOperation{
        From:   "your-account-name",
        To:     "recipient-account",
        Amount: "1.000 STEEM",
        Memo:   "Hello from Steem Go SDK!",
    }
    
    // Your active private key in WIF format
    // WARNING: This is a test/example key. NEVER use it in production!
    activeWif := "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg"
    
    // Broadcast the transfer
    result, err := broadcast.SendWith(transferOp, activeWif)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("Transfer broadcasted: %s\n", string(result))
}
```

### Transferencia con memo cifrado

```go
package main

import (
    "fmt"
    "time"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemutil/protocol"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    broadcast := client.GetBroadcast()
    auth := client.GetAuth()
    
    // Recipient's memo public key
    recipientMemoKey := "STM8m5UgaFAAYQRuaNejYdS8FVLVp9Ss3K1qAVk5de6F8s3HnVbvA"
    
    // Your memo private key
    // WARNING: This is a test/example key. NEVER use it in production!
    yourMemoWif := "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg"
    
    // Encrypt the memo (memos starting with '#' are encrypted)
    encryptedMemo, err := auth.EncodeMemo(yourMemoWif, recipientMemoKey, "#Secret message")
    if err != nil {
        fmt.Printf("Error encrypting memo: %v\n", err)
        return
    }
    
    // Create transfer with encrypted memo
    transferOp := &protocol.TransferOperation{
        From:   "your-account-name",
        To:     "recipient-account",
        Amount: "1.000 STEEM",
        Memo:   encryptedMemo,
    }
    
    // Your active private key
    // WARNING: This is a test/example key. NEVER use it in production!
    activeWif := "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg"
    
    // Broadcast the transfer
    result, err := broadcast.SendWith(transferOp, activeWif)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("Transfer with encrypted memo broadcasted: %s\n", string(result))
}
```

### Crear un comentario

```go
package main

import (
    "fmt"
    "time"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemutil/protocol"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    broadcast := client.GetBroadcast()
    
    // Create a comment operation
    commentOp := &protocol.CommentOperation{
        ParentAuthor:   "steemit",
        ParentPermlink: "firstpost",
        Author:         "your-account-name",
        Permlink:       "my-comment-permlink",
        Title:          "My Comment Title",
        Body:           "This is the body of my comment.",
        JsonMetadata:   `{"tags":["steem"],"app":"steemgosdk/1.0"}`,
    }
    
    // Your posting private key
    // WARNING: This is a test/example key. NEVER use it in production!
    postingWif := "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg"
    
    // Broadcast the comment
    result, err := broadcast.SendWith(commentOp, postingWif)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("Comment broadcasted: %s\n", string(result))
}
```

### Post con opciones de comentario (beneficiarios)

Usa `CommentOptionsOperation` para establecer los beneficiarios que recibirán una parte de las recompensas del post:

```go
package main

import (
    "encoding/json"
    "fmt"
    "time"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemutil/protocol"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    broadcast := client.GetBroadcast()

    author := "your-account-name"
    permlink := "my-post-with-beneficiaries"
    tags := []string{"test", "steem"}

    jsonMeta, _ := json.Marshal(map[string]interface{}{
        "tags": tags,
        "app":  "steemgosdk/1.0",
    })

    // Create comment operation
    commentOp := &protocol.CommentOperation{
        ParentAuthor:   "",
        ParentPermlink: tags[0],
        Author:         author,
        Permlink:       permlink,
        Title:          "Post with Beneficiaries",
        Body:           "This post has beneficiaries set.",
        JsonMetadata:   string(jsonMeta),
    }

    // Define beneficiaries (weight is in basis points: 3000 = 30%)
    // Note: steemutil v0.0.19+ automatically sorts beneficiaries alphabetically
    beneficiaries := []protocol.Beneficiary{
        {Account: "alice", Weight: 2000},  // 20%
        {Account: "bob", Weight: 1000},    // 10%
    }

    // Create comment options with beneficiaries extension
    optionsOp := &protocol.CommentOptionsOperation{
        Author:               author,
        Permlink:             permlink,
        MaxAcceptedPayout:    "1000000.000 SBD",
        PercentSteemDollars:  10000,
        AllowVotes:           true,
        AllowCurationRewards: true,
        Extensions: protocol.CommentOptionsExtensions{
            protocol.NewBeneficiariesExtension(beneficiaries),
        },
    }

    // Broadcast both operations in one transaction
    // WARNING: This is a test/example key. NEVER use it in production!
    postingWif := "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg"

    result, err := broadcast.Send([]protocol.Operation{commentOp, optionsOp}, map[string]string{
        "posting": postingWif,
    })
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }

    fmt.Printf("Post with beneficiaries broadcasted: %s\n", string(result))
}
```

### Post con opciones de comentario (sin beneficiarios)

También puedes usar `CommentOptionsOperation` sin establecer beneficiarios:

```go
package main

import (
    "encoding/json"
    "fmt"
    "time"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemutil/protocol"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    broadcast := client.GetBroadcast()

    author := "your-account-name"
    permlink := "my-post-with-options"
    tags := []string{"test", "steem"}

    jsonMeta, _ := json.Marshal(map[string]interface{}{
        "tags": tags,
        "app":  "steemgosdk/1.0",
    })

    commentOp := &protocol.CommentOperation{
        ParentAuthor:   "",
        ParentPermlink: tags[0],
        Author:         author,
        Permlink:       permlink,
        Title:          "Post with Options",
        Body:           "This post has comment options but no beneficiaries.",
        JsonMetadata:   string(jsonMeta),
    }

    // Comment options with empty extensions (no beneficiaries)
    optionsOp := &protocol.CommentOptionsOperation{
        Author:               author,
        Permlink:             permlink,
        MaxAcceptedPayout:    "1000000.000 SBD",
        PercentSteemDollars:  10000,
        AllowVotes:           true,
        AllowCurationRewards: true,
        Extensions:           protocol.CommentOptionsExtensions{}, // Empty extensions
    }

    // WARNING: This is a test/example key. NEVER use it in production!
    postingWif := "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg"

    result, err := broadcast.Send([]protocol.Operation{commentOp, optionsOp}, map[string]string{
        "posting": postingWif,
    })
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }

    fmt.Printf("Post with options broadcasted: %s\n", string(result))
}
```

### Varias operaciones en una sola transacción

```go
package main

import (
    "fmt"
    "time"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemutil/protocol"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    broadcast := client.GetBroadcast()

    // Create multiple operations
    voteOp := &protocol.VoteOperation{
        Voter:    "your-account-name",
        Author:   "steemit",
        Permlink: "firstpost",
        Weight:   10000,
    }

    commentOp := &protocol.CommentOperation{
        ParentAuthor:   "steemit",
        ParentPermlink: "firstpost",
        Author:         "your-account-name",
        Permlink:       "my-comment-permlink",
        Title:          "My Comment",
        Body:           "Great post!",
        JsonMetadata:   "{}",
    }

    // Prepare private keys (posting key for both operations)
    // WARNING: This is a test/example key. NEVER use it in production!
    privKeys := map[string]string{
        "posting": "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg",
    }

    // Broadcast multiple operations in one transaction
    result, err := broadcast.Send([]protocol.Operation{voteOp, commentOp}, privKeys)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }

    fmt.Printf("Transaction with multiple operations broadcasted: %s\n", string(result))
}
```

## Ejemplos completos

## Ejemplos completos

### Ejemplo completo de transferencia

```go
package main

import (
    "fmt"
    "time"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemutil/protocol"
)

func main() {
    // Initialize client
    url := "https://api.steemit.com"
    client := steemgosdk.GetClient(url)
    
    // Get instances
    api := client.GetAPI()
    broadcast := client.GetBroadcast()
    auth := client.GetAuth()
    
    // 1. Check account balance (optional)
    result, err := api.Call("condenser_api", "get_accounts", []interface{}{
        []interface{}{"your-account-name"},
    })
    if err != nil {
        fmt.Printf("Error getting account: %v\n", err)
        return
    }
    fmt.Println("Account retrieved successfully")
    fmt.Printf("Account data: %v\n", result.Result)
    
    // 2. Prepare transfer operation
    transferOp := &protocol.TransferOperation{
        From:   "your-account-name",
        To:     "recipient-account",
        Amount: "1.000 STEEM",
        Memo:   "Transfer from Steem Go SDK",
    }
    
    // 3. Get private key (in production, store securely)
    // WARNING: This is a test/example key. NEVER use it in production!
    activeWif := "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg"
    
    // Or generate from account name and password
    // keys, _ := auth.GetPrivateKeys("your-account-name", "your-password", []string{"active"})
    // activeWif := keys["active"]
    
    // 4. Broadcast transaction
    result, err := broadcast.SendWith(transferOp, activeWif)
    if err != nil {
        fmt.Printf("Error broadcasting: %v\n", err)
        return
    }
    
    fmt.Printf("Transfer successful! Result: %s\n", string(result))
}
```

### Ejemplo completo de voto y comentario

```go
package main

import (
    "fmt"
    "time"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemutil/protocol"
)

func main() {
    // Initialize
    client := steemgosdk.GetClient("https://api.steemit.com")
    broadcast := client.GetBroadcast()
    auth := client.GetAuth()
    
    // Get posting key
    accountName := "your-account-name"
    password := "your-password"
    keys, err := auth.GetPrivateKeys(accountName, password, []string{"posting"})
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    postingWif := keys["posting"]
    
    // 1. Vote on a post
    voteOp := &protocol.VoteOperation{
        Voter:    accountName,
        Author:   "steemit",
        Permlink: "firstpost",
        Weight:   10000, // 100%
    }
    
    result, err := broadcast.SendWith(voteOp, postingWif)
    if err != nil {
        fmt.Printf("Error voting: %v\n", err)
        return
    }
    fmt.Printf("Vote broadcasted: %s\n", string(result))
    
    // 2. Comment on the same post
    commentOp := &protocol.CommentOperation{
        ParentAuthor:   "steemit",
        ParentPermlink: "firstpost",
        Author:         accountName,
        Permlink:       "my-comment-" + fmt.Sprintf("%d", time.Now().Unix()),
        Title:          "",
        Body:           "Great post! Thanks for sharing.",
        JsonMetadata:   `{"tags":["steem"],"app":"steemgosdk/1.0"}`,
    }
    
    result, err = broadcast.SendWith(commentOp, postingWif)
    if err != nil {
        fmt.Printf("Error commenting: %v\n", err)
        return
    }
    fmt.Printf("Comment broadcasted: %s\n", string(result))
}
```

## Ejemplos de CustomJson

## Ejemplos de CustomJson

### Operación CustomJson básica

```go
package main

import (
    "encoding/json"
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    broadcast := client.GetBroadcast()
    
    // Create a follow operation using custom_json
    followData := []interface{}{
        "follow",
        map[string]interface{}{
            "follower": "your-account-name",
            "following": "steemit",
            "what": []string{"blog"},
        },
    }
    
    jsonStr, _ := json.Marshal(followData)
    
    // Broadcast custom_json operation
    // Parameters: requiredAuths, requiredPostingAuths, id, json, privKeyWif
    result, err := broadcast.CustomJson(
        []string{},                    // required_auths (empty for posting auth)
        []string{"your-account-name"}, // required_posting_auths
        "follow",                      // id
        string(jsonStr),               // json
        "your-posting-private-key",    // posting WIF
    )
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("CustomJson operation broadcasted: %s\n", string(result))
}
```

### Operación de notificación (setLastRead)

```go
package main

import (
    "encoding/json"
    "fmt"
    "time"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    broadcast := client.GetBroadcast()
    
    // Create a notify operation to set last read date
    notifyData := []interface{}{
        "setLastRead",
        map[string]interface{}{
            "date": time.Now().UTC().Format(time.RFC3339),
        },
    }
    
    jsonStr, _ := json.Marshal(notifyData)
    
    // Broadcast custom_json operation
    result, err := broadcast.CustomJson(
        []string{},                    // required_auths (empty)
        []string{"your-account-name"}, // required_posting_auths
        "notify",                      // id
        string(jsonStr),               // json
        "your-posting-private-key",    // posting WIF
    )
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("Notify operation broadcasted: %s\n", string(result))
}
```

### CustomJson con autoridad activa (active authority)

```go
package main

import (
    "encoding/json"
    "fmt"
    "github.com/steemit/steemgosdk"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    broadcast := client.GetBroadcast()
    
    // Create custom operation data
    customData := map[string]interface{}{
        "action": "custom_action",
        "data":   "some custom data",
    }
    
    jsonStr, _ := json.Marshal(customData)
    
    // Broadcast custom_json operation with active authority
    // When requiredAuths is not empty, active key is required
    result, err := broadcast.CustomJson(
        []string{"your-account-name"}, // required_auths (requires active key)
        []string{},                    // required_posting_auths (empty)
        "custom_id",                   // id
        string(jsonStr),               // json
        "your-active-private-key",     // active WIF
    )
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("CustomJson with active auth broadcasted: %s\n", string(result))
}
```

### Usar CustomJSONOperation directamente

```go
package main

import (
    "encoding/json"
    "fmt"
    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemutil/protocol"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    broadcast := client.GetBroadcast()
    
    // Create CustomJSONOperation directly
    followData := []interface{}{
        "follow",
        map[string]interface{}{
            "follower": "your-account-name",
            "following": "steemit",
            "what": []string{"blog"},
        },
    }
    
    jsonStr, _ := json.Marshal(followData)
    
    op := &protocol.CustomJSONOperation{
        RequiredAuths:        []string{},
        RequiredPostingAuths: []string{"your-account-name"},
        ID:                   "follow",
        JSON:                 string(jsonStr),
    }
    
    // Use SendWith to broadcast
    privKeys := map[string]string{
        "posting": "your-posting-private-key",
    }
    
    result, err := broadcast.Send([]protocol.Operation{op}, privKeys)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("CustomJSONOperation broadcasted: %s\n", string(result))
}
```

### Precio de feed del witness (feed_publish)

```go
package main

import (
    "fmt"
    "log"

    "github.com/steemit/steemgosdk"
    "github.com/steemit/steemgosdk/broadcast"
)

func main() {
    client := steemgosdk.GetClient("https://api.steemit.com")
    bc := client.GetBroadcast()

    rate := broadcast.ExchangeRate{
        Base:  "0.500 SBD",
        Quote: "1.000 STEEM",
    }

    // Use the witness account active key (WIF). Block signing keys cannot sign feed_publish.
    result, err := bc.FeedPublish("your-witness-account", rate, "your-active-private-key")
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("feed_publish result: %s\n", string(result))
}
```

## Notas

## Notas

- **Seguridad**: nunca incluyas claves privadas ni contraseñas en el código de producción. Usa variables de entorno o sistemas seguros de gestión de claves.
- **Claves privadas de prueba**: la clave privada `5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg` usada en los ejemplos es **solo una clave de prueba/de ejemplo**. Es públicamente conocida y **NUNCA** debe usarse en producción. Usa siempre tus propias claves privadas generadas a partir del nombre de tu cuenta y tu contraseña.
- **Manejo de errores**: comprueba siempre los errores devueltos por los métodos del SDK.
- **Autoridad de CustomJson**:
  - si `requiredAuths` no está vacío, debes proporcionar una clave privada **activa**
  - si solo está establecido `requiredPostingAuths`, debes proporcionar una clave privada **de publicación**
  - el método `CustomJson()` determina automáticamente qué tipo de clave usar según las autoridades proporcionadas
- **Red**: los ejemplos usan `https://api.steemit.com` como nodo predeterminado. Puedes usar cualquier URL de nodo de Steem.
- **Formato WIF**: las claves privadas deben estar en Wallet Import Format (WIF) y comenzar con '5'.
- **Claves públicas**: las claves públicas deben estar en formato Steem y comenzar con 'STM'.
- **Cifrado de memos**: los memos que comienzan con '#' se cifran automáticamente. Los memos de texto plano se envían tal cual.
- **Métodos de la API**: el SDK ofrece métodos convenientes como `GetBlock()`, `GetBlocks()`, `GetDynamicGlobalProperties()` y `GetTransactionHex()` en la instancia `API`. Úsalos en lugar del `Call()` genérico cuando sea posible, para una mayor seguridad de tipos y un código más simple.
- **Broadcast**: la instancia `Broadcast` maneja automáticamente la preparación de la transacción (ref_block_num, ref_block_prefix, expiration) y la firma. Solo necesitas proporcionar operaciones y claves privadas. La instancia Broadcast crea internamente una instancia de la API para obtener las propiedades globales dinámicas.


## Qué hacer a continuación

- [Inicio rápido](/es/tutorials/steemgosdk/index.html) - configuración del cliente, autenticación/claves y ejemplos de URI de Steem.
- [SignedCall API](/es/tutorials/steemgosdk/signed-call.html) - lecturas autenticadas desde Go.
