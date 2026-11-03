---
title: steemgosdk - 빠른 시작
description: Steem Go SDK 설정 — 클라이언트 초기화, 체인 읽기 API 예제, 키 생성 인증 예제 및 Steem URI 서명 예제.
---

# steemgosdk: 빠른 시작

[steemgosdk](https://github.com/steemit/steemgosdk)는 Steem 블록체인의 공식 Go 라이브러리입니다 (Go 모듈 `github.com/steemit/steemgosdk`, Go 1.18+ 대상). `go get github.com/steemit/steemgosdk`로 설치한 뒤, SDK 자체 문서에서 옮겨 온 아래 예제를 따라 해 보세요.

> 아래의 모든 헬퍼는 생성된 [API 레퍼런스](/ko/api/)가 문서화하는 동일한 JSON-RPC 메서드를 사용합니다 — 예를 들어 `GetAccounts`는 [condenser_api.get_accounts](/ko/api/condenser_api/get_accounts.html)에 해당합니다.

## 기본 설정

## 기본 설정

### 클라이언트 초기화

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

### API, Broadcast, Auth 인스턴스 얻기

```go
// Get API instance for making RPC calls
api := client.GetAPI()

// Get Broadcast instance for signing and broadcasting transactions
broadcast := client.GetBroadcast()

// Get Auth instance for authentication and key management
auth := client.GetAuth()
```

## API 예제

## API 예제

### 블록 정보 얻기

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

### 여러 블록 얻기

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

### 계정 정보 얻기

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

### 평판 (reputation) 계산과 함께 계정 정보 얻기

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

### 동적 전역 속성 얻기

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

### 콘텐츠 얻기 (포스트/댓글)

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

### 트랜잭션 헥스 얻기

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

## 인증 예제

## 인증 예제

### 계정 이름과 비밀번호로 키 생성

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

### 개인 키 (WIF) 얻기

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

### 계정 이름과 비밀번호를 WIF로 변환

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

### WIF와 공개 키 검증

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

### 메모 (memo) 암호화와 복호화

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

## Steem URI 예제

## Steem URI 예제

`steemuri` 패키지는 [Steem URI 서명 프로토콜](https://github.com/steemit/steem-uri-spec)을 구현하여, Steem 트랜잭션을 공유 가능한 `steem://` 링크로 인코딩하고 다시 디코딩할 수 있게 해 줍니다.

### 단일 오퍼레이션을 URI로 인코딩

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

### 파라미터와 함께 인코딩

```go
// Encode with signer and callback URL
params := steemuri.Parameters{
    Signer:   "alice",
    Callback: "https://myapp.com/callback?tx={{id}}",
}

uri, err := steemuri.EncodeOp(voteOp, params, steemuri.ProtocolSteem)
// Output: steem://sign/op/...?s=alice&cb=...
```

### 여러 오퍼레이션 인코딩

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

### Steem URI 디코딩

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

### 트랜잭션 플레이스홀더 해석

디코딩 후 트랜잭션에는 플레이스홀더(`__signer`, `__ref_block_num` 등)가 포함될 수 있으며, 서명 전에 해석해야 합니다:

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

### 콜백 URL 해석

트랜잭션이 확정된 후 콜백 URL의 템플릿 변수를 해석합니다:

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

## 다음 단계

- [브로드캐스트 오퍼레이션](/ko/tutorials/steemgosdk/broadcast.html) - 투표, 전송, 댓글, 수혜자, custom_json과 완전한 엔드투엔드 예제.
- [SignedCall API](/ko/tutorials/steemgosdk/signed-call.html) - Go에서 인증된 JSON-RPC 호출.
