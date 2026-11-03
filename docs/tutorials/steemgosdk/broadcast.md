---
title: steemgosdk - Broadcasting Operations
description: Broadcast every Steem operation from Go - votes, transfers, encrypted memos, comments, beneficiaries, multi-operation transactions, custom_json and complete examples.
---

# steemgosdk: Broadcasting Operations

The `Broadcast` instance of the [Steem Go SDK](https://github.com/steemit/steemgosdk) automatically handles transaction preparation (ref_block_num, ref_block_prefix, expiration) and signing - you only provide operations and private keys. This page carries the complete broadcast examples from the SDK documentation; client setup and key generation live in [Getting started](/tutorials/steemgosdk/index.html).

> **⚠️ Security Warning**: The private keys used in the examples below (`5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg`) are **test/example keys only**. They are publicly known and should **NEVER** be used in production. Always generate your own private keys from your account name and password using the `auth.ToWif()` or `auth.GetPrivateKeys()` methods.

> On-the-wire details of every operation are documented in the generated [broadcast operations reference](/api/broadcast_ops/).

## Broadcast Examples

## Broadcast Examples

### Vote on a Post

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

### Transfer STEEM or SBD

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

### Transfer with Encrypted Memo

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

### Create a Comment

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

### Post with Comment Options (Beneficiaries)

Use `CommentOptionsOperation` to set beneficiaries who will receive a portion of the post rewards:

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

### Post with Comment Options (No Beneficiaries)

You can also use `CommentOptionsOperation` without setting beneficiaries:

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

### Multiple Operations in One Transaction

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

## Complete Examples

## Complete Examples

### Complete Transfer Example

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

### Complete Vote and Comment Example

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

## CustomJson Examples

## CustomJson Examples

### Basic CustomJson Operation

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

### Notify Operation (setLastRead)

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

### CustomJson with Active Authority

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

### Using CustomJSONOperation Directly

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

### Witness Price Feed (feed_publish)

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

## Notes

## Notes

- **Security**: Never hardcode private keys or passwords in production code. Use environment variables or secure key management systems.
- **Test Private Keys**: The private key `5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg` used in examples is a **test/example key only**. It is publicly known and should **NEVER** be used in production. Always use your own private keys generated from your account name and password.
- **Error Handling**: Always check errors returned by SDK methods.
- **CustomJson Authority**: 
  - If `requiredAuths` is not empty, you need to provide an **active** private key
  - If only `requiredPostingAuths` is set, you need to provide a **posting** private key
  - The `CustomJson()` method automatically determines which key type to use based on the provided auths
- **Network**: The examples use `https://api.steemit.com` as the default node. You can use any Steem node URL.
- **WIF Format**: Private keys should be in Wallet Import Format (WIF), starting with '5'.
- **Public Keys**: Public keys should be in Steem format, starting with 'STM'.
- **Memo Encryption**: Memos starting with '#' are automatically encrypted. Plain text memos are sent as-is.
- **API Methods**: The SDK provides convenient methods like `GetBlock()`, `GetBlocks()`, `GetDynamicGlobalProperties()`, and `GetTransactionHex()` in the `API` instance. Use these instead of generic `Call()` when possible for better type safety and simpler code.
- **Broadcast**: The `Broadcast` instance automatically handles transaction preparation (ref_block_num, ref_block_prefix, expiration) and signing. You only need to provide operations and private keys. The Broadcast instance internally creates an API instance for fetching dynamic global properties.


## Where to go next

- [Getting started](/tutorials/steemgosdk/index.html) - client setup, auth/keys and Steem URI examples.
- [SignedCall API](/tutorials/steemgosdk/signed-call.html) - authenticated reads from Go.
