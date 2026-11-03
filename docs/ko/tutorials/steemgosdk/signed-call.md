# SignedCall API 문서

## 개요

`SignedCall` 기능은 Steem 블록체인에 대한 인증된 JSON-RPC 호출을 제공합니다. 암호화 서명을 사용해 계정 소유권을 증명하고 비공개 또는 제한된 데이터에 접근합니다.

이 구현은 `steem-js` 라이브러리의 `signedCall` 메서드와 완전히 호환되므로, JavaScript 애플리케이션과 Go 애플리케이션 간의 상호 운용이 보장됩니다.

## 특징

- **암호화 인증**: 개인 키를 전송하지 않고 계정 소유권을 증명합니다
- **리플레이 방지**: 고유한 nonce와 타임스탬프로 리플레이 공격을 방지합니다
- **시간 기반 만료**: 보안을 위해 서명은 60초 후 만료됩니다
- **다중 키 지원**: 여러 개인 키로 동시에 서명할 수 있습니다
- **HTTP 전용**: 보안상의 이유로 HTTP/HTTPS 전송이 필요합니다

## 빠른 시작

### 기본 사용법

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

## API 레퍼런스

### 클라이언트 메서드

#### `SignedCall(method, params, keyType) -> (*RpcResultData, error)`

저장된 자격 증명을 사용해 서명된 RPC 호출을 수행합니다.

**파라미터:**
- `method` (string): 호출할 RPC 메서드 (예: "condenser_api.get_accounts")
- `params` ([]interface{}): RPC 메서드의 파라미터
- `keyType` (string): 사용할 개인 키 ("active", "posting", "owner", "memo")

**반환:**
- `*RpcResultData`: RPC 응답의 원본 데이터
- `error`: 호출이 실패하면 오류

#### `SignedCallWithResult(method, params, keyType, result) -> error`

서명된 RPC 호출을 수행하고 결과를 지정된 객체로 언마셜(unmarshal)합니다.

**파라미터:**
- `method` (string): 호출할 RPC 메서드
- `params` ([]interface{}): RPC 메서드의 파라미터
- `keyType` (string): 사용할 개인 키
- `result` (interface{}): 결과를 언마셜할 객체의 포인터

**반환:**
- `error`: 호출이나 언마셜이 실패하면 오류

### API 메서드

#### `SignedCall(method, params, account, privateKey) -> (*RpcResultData, error)`

저수준 서명 호출 메서드.

**파라미터:**
- `method` (string): 호출할 RPC 메서드
- `params` ([]interface{}): RPC 메서드의 파라미터
- `account` (string): 서명에 사용할 계정 이름
- `privateKey` (string): WIF 형식의 개인 키

**반환:**
- `*RpcResultData`: RPC 응답의 원본 데이터
- `error`: 호출이 실패하면 오류

#### `SignedCallWithResult(method, params, account, privateKey, result) -> error`

결과 언마셜이 포함된 저수준 서명 호출.

## 일반적인 사용 사례

### 1. 계정 정보 얻기

```go
var accounts []map[string]interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_accounts",
    []interface{}{[]string{"username"}},
    consts.ACTIVE_KEY,
    &accounts,
)
```

### 2. 계정 기록 얻기

```go
var history []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_account_history",
    []interface{}{"username", -1, 100},
    consts.ACTIVE_KEY,
    &history,
)
```

### 3. 팔로워/팔로잉 얻기

```go
var followers []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_followers",
    []interface{}{"username", "", "blog", 100},
    consts.POSTING_KEY,
    &followers,
)
```

### 4. 배치 오퍼레이션

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

## 오류 처리

### 자주 발생하는 오류

#### 전송 오류
```go
// Error: "signed calls can only be made when using HTTP transport"
client := steemgosdk.GetClient("wss://api.steemit.com") // WebSocket not supported
```

#### 인증 오류
```go
// Error: "invalid key type: invalid_key"
err := client.SignedCall(method, params, "invalid_key")
```

#### 자격 증명 없음
```go
// Error: "account name not set"
client := steemgosdk.GetClient(url)
// client.AccountName not set
err := client.SignedCall(method, params, consts.ACTIVE_KEY)
```

#### 서명 만료
```go
// Error: "signature expired"
// Occurs when request takes longer than 60 seconds to reach server
```

### 오류 처리 패턴

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

## 보안 고려 사항

### 모범 사례

1. **HTTPS만 사용**: 서명된 호출에는 항상 HTTPS 엔드포인트를 사용하세요
2. **개인 키 검증**: 호출 전에 키 형식을 확인하세요
3. **만료 처리**: 만료된 서명을 위한 재시도 로직을 구현하세요
4. **안전한 키 보관**: 개인 키를 로그에 남기거나 노출하지 마세요
5. **환경 변수**: 민감한 데이터는 환경 변수를 사용하세요

### 보안 기능

- **키 미전송**: 개인 키는 절대 애플리케이션 밖으로 나가지 않습니다
- **고유 nonce**: 각 요청은 8바이트 길이의 고유한 무작위 nonce를 사용합니다
- **타임스탬프 검증**: 서명은 60초 후 만료됩니다
- **크로스 프로토콜 방지**: 프로토콜 고유의 서명 상수를 사용합니다

### 안전한 구현 예제

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

## 고급 사용법

### 사용자 지정 검증

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

### 다중 키 서명

```go
// Sign with multiple keys
privateKeys := []string{
    "active-key-wif",
    "posting-key-wif",
}

signedRequest, err := rpc.Sign(request, account, privateKeys)
// signedRequest will contain multiple signatures
```

## 테스트

### 단위 테스트

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

### 통합 테스트

완전한 통합 테스트 예제는 `test-gosdk/examples/signed_call/main.go`를 참고하세요.

## 호환성

이 구현은 `steem-js` 서명된 호출과 완전히 호환됩니다:

- 동일한 서명 알고리즘과 메시지 형식을 사용합니다
- 동일한 서명 구조를 생성합니다
- 동일한 보안 기능(nonce, 타임스탬프, 만료)을 지원합니다
- `steem-js`로 생성된 서명을 검증할 수 있고 그 반대도 가능합니다

## 성능

- **서명 오버헤드**: 서명당 약 1-5ms
- **네트워크 지연**: 노드 응답 시간에 따라 다릅니다
- **메모리 사용량**: 일반 RPC 호출 대비 추가 오버헤드는 매우 적습니다
- **동시 호출**: 완전한 스레드 안전(thread-safe)이며 동시 서명 호출을 지원합니다

## 문제 해결

### 자주 발생하는 문제

1. **"전송 오류"**: WebSocket이 아니라 HTTP/HTTPS를 사용하고 있는지 확인하세요
2. **"잘못된 키"**: 개인 키의 형식과 권한을 확인하세요
3. **"계정 미설정"**: 호출 전에 `client.AccountName`을 설정하세요
4. **"서명 만료"**: 느린 네트워크를 위한 재시도 로직을 구현하세요
5. **"네트워크 오류"**: 노드 가용성과 네트워크 연결을 확인하세요

### 디버그 모드

상세 로깅을 활성화하려면 `DEBUG` 환경 변수를 설정하세요:

```bash
DEBUG=1 go run your-program.go
```

요청/응답 세부 사항과 서명 정보가 표시됩니다.

---

## SignedCall 추가 예제

## SignedCall 예제

### 기본 서명 API 호출

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

### 계정 기록 얻기 (인증)

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

### 배치 서명 호출

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

### 서명 호출의 오류 처리

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

### API 메서드 직접 사용하기

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

## 다음 단계

같은 프로토콜의 steem-js 측은 [steem-js: 서명된 호출과 서명 검증](/ko/tutorials/steem-js/signed-calls.html)에서 다룹니다. 두 구현은 와이어 호환입니다.
