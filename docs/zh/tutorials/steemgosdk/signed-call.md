# SignedCall API 文档

## 概述

`SignedCall` 功能提供对 Steem 区块链的经过认证的 JSON-RPC 调用。它使用加密签名来证明账户所有权，并访问私有或受限数据。

该实现与 `steem-js` 库的 `signedCall` 方法完全兼容，确保 JavaScript 与 Go 应用之间的互操作性。

## 特性

- **加密认证**：无需传输私钥即可证明账户所有权
- **重放保护**：使用唯一的 nonce 与时间戳来防止重放攻击
- **基于时间的过期**：出于安全考虑，签名在 60 秒后过期
- **多密钥支持**：可同时使用多个私钥签名
- **仅限 HTTP**：出于安全原因要求 HTTP/HTTPS 传输

## 快速开始

### 基础用法

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

## API 参考

### 客户端方法

#### `SignedCall(method, params, keyType) -> (*RpcResultData, error)`

使用已存储的凭据发起经过签名的 RPC 调用。

**参数：**
- `method` (string)：要调用的 RPC 方法（例如 "condenser_api.get_accounts"）
- `params` ([]interface{})：RPC 方法的参数
- `keyType` (string)：使用哪个私钥（"active"、"posting"、"owner"、"memo"）

**返回：**
- `*RpcResultData`：原始 RPC 响应数据
- `error`：调用失败时的错误

#### `SignedCallWithResult(method, params, keyType, result) -> error`

发起经过签名的 RPC 调用，并将结果反序列化（unmarshal）到给定对象中。

**参数：**
- `method` (string)：要调用的 RPC 方法
- `params` ([]interface{})：RPC 方法的参数
- `keyType` (string)：使用哪个私钥
- `result` (interface{})：指向用于接收反序列化结果的对象的指针

**返回：**
- `error`：调用失败或反序列化失败时的错误

### API 方法

#### `SignedCall(method, params, account, privateKey) -> (*RpcResultData, error)`

低层级的签名调用方法。

**参数：**
- `method` (string)：要调用的 RPC 方法
- `params` ([]interface{})：RPC 方法的参数
- `account` (string)：用于签名的账户名
- `privateKey` (string)：WIF 格式的私钥

**返回：**
- `*RpcResultData`：原始 RPC 响应数据
- `error`：调用失败时的错误

#### `SignedCallWithResult(method, params, account, privateKey, result) -> error`

低层级的签名调用，带结果反序列化。

## 常见用例

### 1. 获取账户信息

```go
var accounts []map[string]interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_accounts",
    []interface{}{[]string{"username"}},
    consts.ACTIVE_KEY,
    &accounts,
)
```

### 2. 获取账户历史

```go
var history []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_account_history",
    []interface{}{"username", -1, 100},
    consts.ACTIVE_KEY,
    &history,
)
```

### 3. 获取关注者/正在关注

```go
var followers []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_followers",
    []interface{}{"username", "", "blog", 100},
    consts.POSTING_KEY,
    &followers,
)
```

### 4. 批量操作

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

## 错误处理

### 常见错误

#### 传输错误
```go
// Error: "signed calls can only be made when using HTTP transport"
client := steemgosdk.GetClient("wss://api.steemit.com") // WebSocket not supported
```

#### 认证错误
```go
// Error: "invalid key type: invalid_key"
err := client.SignedCall(method, params, "invalid_key")
```

#### 缺少凭据
```go
// Error: "account name not set"
client := steemgosdk.GetClient(url)
// client.AccountName not set
err := client.SignedCall(method, params, consts.ACTIVE_KEY)
```

#### 签名过期
```go
// Error: "signature expired"
// Occurs when request takes longer than 60 seconds to reach server
```

### 错误处理模式

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

## 安全考量

### 最佳实践

1. **仅使用 HTTPS**：签名调用始终使用 HTTPS 端点
2. **校验私钥**：调用前验证密钥格式
3. **处理过期**：为过期签名实现重试逻辑
4. **安全存储密钥**：绝不记录或暴露私钥
5. **环境变量**：敏感数据使用环境变量

### 安全特性

- **不传输密钥**：私钥从不离开你的应用
- **唯一 nonce**：每个请求使用唯一的 8 字节随机 nonce
- **时间戳校验**：签名在 60 秒后过期
- **跨协议保护**：使用协议特定的签名常量

### 安全实现示例

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

## 高级用法

### 自定义验证

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

### 多密钥签名

```go
// Sign with multiple keys
privateKeys := []string{
    "active-key-wif",
    "posting-key-wif",
}

signedRequest, err := rpc.Sign(request, account, privateKeys)
// signedRequest will contain multiple signatures
```

## 测试

### 单元测试

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

### 集成测试

完整的集成测试示例见 `test-gosdk/examples/signed_call/main.go`。

## 兼容性

该实现与 `steem-js` 签名调用完全兼容：

- 使用相同的签名算法与消息格式
- 生成完全相同的签名结构
- 支持相同的安全特性（nonce、时间戳、过期）
- 可以验证由 `steem-js` 创建的签名，反之亦然

## 性能

- **签名开销**：每次签名约 1-5ms
- **网络延迟**：取决于节点响应时间
- **内存占用**：相比普通 RPC 调用的额外开销极小
- **并发调用**：完全线程安全，支持并发的签名调用

## 故障排查

### 常见问题

1. **"传输错误"**：确保你使用的是 HTTP/HTTPS，而不是 WebSocket
2. **"无效密钥"**：验证私钥格式与权限
3. **"账户未设置"**：调用前设置 `client.AccountName`
4. **"签名过期"**：网络较慢时实现重试逻辑
5. **"网络错误"**：检查节点可用性与网络连通性

### 调试模式

设置 `DEBUG` 环境变量以启用详细日志：

```bash
DEBUG=1 go run your-program.go
```

这将显示请求/响应细节与签名信息。

---

## 更多 SignedCall 示例

## SignedCall 示例

### 基础签名 API 调用

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

### 获取账户历史（认证）

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

### 批量签名调用

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

### 签名调用的错误处理

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

### 直接使用 API 方法

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

## 下一步

同一协议的 steem-js 侧内容见 [steem-js：签名调用与签名验证](/zh/tutorials/steem-js/signed-calls.html)；两个实现在线路上互相兼容。
