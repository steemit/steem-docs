---
title: steemgosdk - 브로드캐스트 오퍼레이션
description: Go에서 모든 Steem 오퍼레이션을 브로드캐스트합니다 — 투표, 전송, 암호화된 메모, 댓글, 수혜자, 다중 오퍼레이션 트랜잭션, custom_json 및 완전한 예제.
---

# steemgosdk: 브로드캐스트 오퍼레이션

[Steem Go SDK](https://github.com/steemit/steemgosdk)의 `Broadcast` 인스턴스는 트랜잭션 준비(ref_block_num, ref_block_prefix, expiration)와 서명을 자동으로 처리합니다 — 여러분은 오퍼레이션 (operation)과 개인 키 (private key)만 제공하면 됩니다. 이 페이지는 SDK 문서의 브로드캐스트 예제 전부를 담고 있습니다. 클라이언트 설정과 키 생성은 [빠른 시작](/ko/tutorials/steemgosdk/index.html)에 있습니다.

> **⚠️ 보안 경고**: 아래 예제에서 사용하는 개인 키(`5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg`)는 **테스트/예제 전용 키**입니다. 널리 알려져 있으므로 프로덕션에서는 **절대로** 사용하면 안 됩니다. 항상 `auth.ToWif()` 또는 `auth.GetPrivateKeys()` 메서드로 자신의 계정 이름과 비밀번호에서 개인 키를 생성하세요.

> 모든 오퍼레이션의 온와이어 세부 사항은 생성된 [브로드캐스트 오퍼레이션 레퍼런스](/ko/api/broadcast_ops/)에 문서화되어 있습니다.

## 브로드캐스트 예제

## 브로드캐스트 예제

### 포스트에 투표하기

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

### STEEM 또는 스팀 달러 (SBD) 전송

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

### 암호화된 메모와 함께 전송

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

### 댓글 작성하기

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

### 댓글 옵션이 있는 포스트 (수혜자)

`CommentOptionsOperation`을 사용해 포스트 보상의 일부를 받을 수혜자를 지정합니다:

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

### 댓글 옵션이 있는 포스트 (수혜자 없음)

수혜자를 지정하지 않고 `CommentOptionsOperation`을 사용할 수도 있습니다:

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

### 하나의 트랜잭션에 여러 오퍼레이션

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

## 완전한 예제

## 완전한 예제

### 완전한 전송 예제

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

### 완전한 투표·댓글 예제

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

## CustomJson 예제

## CustomJson 예제

### 기본 CustomJson 오퍼레이션

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

### 알림 오퍼레이션 (setLastRead)

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

### 액티브 권한 (active authority)을 사용하는 CustomJson

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

### CustomJSONOperation 직접 사용하기

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

### 위트니스 피드 가격 (feed_publish)

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

## 참고

## 참고

- **보안**: 프로덕션 코드에 개인 키나 비밀번호를 하드코딩하지 마십시오. 환경 변수나 안전한 키 관리 시스템을 사용하세요.
- **테스트용 개인 키**: 예제에서 사용하는 개인 키 `5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg`는 **테스트/예제 전용 키**입니다. 널리 알려져 있으므로 프로덕션에서는 **절대로** 사용하면 안 됩니다. 항상 자신의 계정 이름과 비밀번호에서 생성한 개인 키를 사용하세요.
- **오류 처리**: SDK 메서드가 반환하는 오류는 항상 확인하세요.
- **CustomJson 권한**:
  - `requiredAuths`가 비어 있지 않으면 **액티브 (active)** 개인 키가 필요합니다
  - `requiredPostingAuths`만 설정되어 있으면 **포스팅 (posting)** 개인 키가 필요합니다
  - `CustomJson()` 메서드는 제공된 권한을 보고 사용할 키 유형을 자동으로 판단합니다
- **네트워크**: 예제는 기본 노드로 `https://api.steemit.com`을 사용합니다. 어떤 Steem 노드 URL이든 사용할 수 있습니다.
- **WIF 형식**: 개인 키는 월렛 임포트 형식 (Wallet Import Format, WIF)이어야 하며 '5'로 시작해야 합니다.
- **공개 키**: 공개 키는 Steem 형식이어야 하며 'STM'으로 시작해야 합니다.
- **메모 암호화**: '#'로 시작하는 메모는 자동으로 암호화됩니다. 평문 메모는 그대로 전송됩니다.
- **API 메서드**: SDK는 `API` 인스턴스에 `GetBlock()`, `GetBlocks()`, `GetDynamicGlobalProperties()`, `GetTransactionHex()` 같은 편의 메서드를 제공합니다. 더 나은 타입 안전성과 더 간단한 코드를 위해 가능하면 범용 `Call()` 대신 이들을 사용하세요.
- **브로드캐스트**: `Broadcast` 인스턴스는 트랜잭션 준비(ref_block_num, ref_block_prefix, expiration)와 서명을 자동으로 처리합니다. 오퍼레이션과 개인 키만 제공하면 됩니다. Broadcast 인스턴스는 동적 전역 속성 (dynamic global properties)을 가져 오기 위해 내부적으로 API 인스턴스를 생성합니다.


## 다음 단계

- [빠른 시작](/ko/tutorials/steemgosdk/index.html) - 클라이언트 설정, 인증/키, Steem URI 예제.
- [SignedCall API](/ko/tutorials/steemgosdk/signed-call.html) - Go에서 인증된 읽기.
