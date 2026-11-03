---
title: steemgosdk - Operazioni di broadcast
description: Trasmetti ogni operazione Steem da Go — voti, trasferimenti, memo cifrati, commenti, beneficiari, transazioni multi-operazione, custom_json ed esempi completi.
---

# steemgosdk: Operazioni di broadcast

L'istanza `Broadcast` dello [Steem Go SDK](https://github.com/steemit/steemgosdk) gestisce automaticamente la preparazione della transazione (ref_block_num, ref_block_prefix, expiration) e la firma — tu fornisci solo le operazioni (operation) e le chiavi private (private key). Questa pagina riporta gli esempi di broadcast completi dalla documentazione dello SDK; la configurazione del client e la generazione delle chiavi sono nell'[Avvio rapido](/it/tutorials/steemgosdk/index.html).

> **⚠️ Avviso di sicurezza**: le chiavi private usate negli esempi qui sotto (`5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg`) sono **solo chiavi di test/di esempio**. Sono pubblicamente note e **NON** vanno **MAI** usate in produzione. Genera sempre le tue chiavi private dal nome account e dalla password con i metodi `auth.ToWif()` o `auth.GetPrivateKeys()`.

> I dettagli «on the wire» di ogni operazione sono documentati nel [riferimento delle operazioni di broadcast](/it/api/broadcast_ops/) generato.

## Esempi di broadcast

## Esempi di broadcast

### Votare un post

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

### Trasferire STEEM o dollari STEEM (SBD)

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

### Trasferimento con memo cifrato

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

### Creare un commento

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

### Post con opzioni dei commenti (beneficiari)

Usa `CommentOptionsOperation` per impostare i beneficiari che riceveranno una parte delle ricompense del post:

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

### Post con opzioni dei commenti (senza beneficiari)

Puoi usare `CommentOptionsOperation` anche senza impostare beneficiari:

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

### Più operazioni in una sola transazione

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

## Esempi completi

## Esempi completi

### Esempio completo di trasferimento

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

### Esempio completo di voto e commento

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

## Esempi CustomJson

## Esempi CustomJson

### Operazione CustomJson di base

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

### Operazione di notifica (setLastRead)

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

### CustomJson con authority attiva (active authority)

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

### Usare CustomJSONOperation direttamente

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

### Prezzo di feed del witness (feed_publish)

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

## Note

## Note

- **Sicurezza**: non inserire mai chiavi private o password nel codice di produzione. Usa variabili d'ambiente o sistemi sicuri di gestione delle chiavi.
- **Chiavi private di test**: la chiave privata `5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg` usata negli esempi è **solo una chiave di test/di esempio**. È pubblicamente nota e **NON** va **MAI** usata in produzione. Usa sempre le tue chiavi private generate dal nome account e dalla password.
- **Gestione degli errori**: controlla sempre gli errori restituiti dai metodi dello SDK.
- **Authority di CustomJson**:
  - se `requiredAuths` non è vuoto, devi fornire una chiave privata **attiva**
  - se è impostato solo `requiredPostingAuths`, devi fornire una chiave privata **di posting**
  - il metodo `CustomJson()` determina automaticamente quale tipo di chiave usare in base alle authority fornite
- **Rete**: gli esempi usano `https://api.steemit.com` come nodo predefinito. Puoi usare qualsiasi URL di nodo Steem.
- **Formato WIF**: le chiavi private devono essere in Wallet Import Format (WIF) e iniziare con '5'.
- **Chiavi pubbliche**: le chiavi pubbliche devono essere in formato Steem e iniziare con 'STM'.
- **Cifratura dei memo**: i memo che iniziano con '#' vengono cifrati automaticamente. I memo in testo semplice vengono inviati così come sono.
- **Metodi dell'API**: lo SDK fornisce metodi comodi come `GetBlock()`, `GetBlocks()`, `GetDynamicGlobalProperties()` e `GetTransactionHex()` sull'istanza `API`. Usali quando possibile al posto del generico `Call()`, per una migliore sicurezza dei tipi e un codice più semplice.
- **Broadcast**: l'istanza `Broadcast` gestisce automaticamente la preparazione della transazione (ref_block_num, ref_block_prefix, expiration) e la firma. Devi fornire solo operazioni e chiavi private. L'istanza Broadcast crea internamente un'istanza API per recuperare le proprietà globali dinamiche.


## Prossimi passi

- [Avvio rapido](/it/tutorials/steemgosdk/index.html) - configurazione del client, autenticazione/chiavi ed esempi di Steem URI.
- [SignedCall API](/it/tutorials/steemgosdk/signed-call.html) - letture autenticate da Go.
