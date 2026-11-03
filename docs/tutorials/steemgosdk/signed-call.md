# SignedCall API Documentation

## Overview

The `SignedCall` functionality provides authenticated JSON-RPC calls to the Steem blockchain. It uses cryptographic signatures to prove account ownership and access private or restricted data.

This implementation is fully compatible with the `steem-js` library's `signedCall` method, ensuring interoperability between JavaScript and Go applications.

## Features

- **Cryptographic Authentication**: Proves account ownership without transmitting private keys
- **Replay Protection**: Uses unique nonces and timestamps to prevent replay attacks
- **Time-based Expiration**: Signatures expire after 60 seconds for security
- **Multiple Key Support**: Can sign with multiple private keys simultaneously
- **HTTP Only**: Requires HTTP/HTTPS transport for security reasons

## Quick Start

### Basic Usage

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

## API Reference

### Client Methods

#### `SignedCall(method, params, keyType) -> (*RpcResultData, error)`

Makes a signed RPC call using stored credentials.

**Parameters:**
- `method` (string): The RPC method to call (e.g., "condenser_api.get_accounts")
- `params` ([]interface{}): Parameters for the RPC method
- `keyType` (string): Which private key to use ("active", "posting", "owner", "memo")

**Returns:**
- `*RpcResultData`: Raw RPC response data
- `error`: Error if the call fails

#### `SignedCallWithResult(method, params, keyType, result) -> error`

Makes a signed RPC call and unmarshals the result into the provided object.

**Parameters:**
- `method` (string): The RPC method to call
- `params` ([]interface{}): Parameters for the RPC method  
- `keyType` (string): Which private key to use
- `result` (interface{}): Pointer to object to unmarshal result into

**Returns:**
- `error`: Error if the call fails or unmarshaling fails

### API Methods

#### `SignedCall(method, params, account, privateKey) -> (*RpcResultData, error)`

Low-level signed call method.

**Parameters:**
- `method` (string): The RPC method to call
- `params` ([]interface{}): Parameters for the RPC method
- `account` (string): Account name to sign as
- `privateKey` (string): Private key in WIF format

**Returns:**
- `*RpcResultData`: Raw RPC response data
- `error`: Error if the call fails

#### `SignedCallWithResult(method, params, account, privateKey, result) -> error`

Low-level signed call with result unmarshaling.

## Common Use Cases

### 1. Get Account Information

```go
var accounts []map[string]interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_accounts",
    []interface{}{[]string{"username"}},
    consts.ACTIVE_KEY,
    &accounts,
)
```

### 2. Get Account History

```go
var history []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_account_history",
    []interface{}{"username", -1, 100},
    consts.ACTIVE_KEY,
    &history,
)
```

### 3. Get Followers/Following

```go
var followers []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_followers",
    []interface{}{"username", "", "blog", 100},
    consts.POSTING_KEY,
    &followers,
)
```

### 4. Batch Operations

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

## Error Handling

### Common Errors

#### Transport Error
```go
// Error: "signed calls can only be made when using HTTP transport"
client := steemgosdk.GetClient("wss://api.steemit.com") // WebSocket not supported
```

#### Authentication Error
```go
// Error: "invalid key type: invalid_key"
err := client.SignedCall(method, params, "invalid_key")
```

#### Missing Credentials
```go
// Error: "account name not set"
client := steemgosdk.GetClient(url)
// client.AccountName not set
err := client.SignedCall(method, params, consts.ACTIVE_KEY)
```

#### Signature Expiration
```go
// Error: "signature expired"
// Occurs when request takes longer than 60 seconds to reach server
```

### Error Handling Pattern

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

## Security Considerations

### Best Practices

1. **Use HTTPS Only**: Always use HTTPS endpoints for signed calls
2. **Validate Private Keys**: Verify key format before making calls
3. **Handle Expiration**: Implement retry logic for expired signatures
4. **Secure Key Storage**: Never log or expose private keys
5. **Environment Variables**: Use environment variables for sensitive data

### Security Features

- **No Key Transmission**: Private keys never leave your application
- **Unique Nonces**: Each request uses a unique 8-byte random nonce
- **Timestamp Validation**: Signatures expire after 60 seconds
- **Cross-Protocol Protection**: Uses protocol-specific signing constant

### Example Secure Implementation

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

## Advanced Usage

### Custom Verification

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

### Multiple Key Signing

```go
// Sign with multiple keys
privateKeys := []string{
    "active-key-wif",
    "posting-key-wif",
}

signedRequest, err := rpc.Sign(request, account, privateKeys)
// signedRequest will contain multiple signatures
```

## Testing

### Unit Tests

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

### Integration Tests

See `test-gosdk/examples/signed_call/main.go` for a complete integration test example.

## Compatibility

This implementation is fully compatible with `steem-js` signed calls:

- Uses the same signing algorithm and message format
- Generates identical signature structures
- Supports the same security features (nonces, timestamps, expiration)
- Can validate signatures created by `steem-js` and vice versa

## Performance

- **Signing Overhead**: ~1-5ms per signature
- **Network Latency**: Depends on node response time
- **Memory Usage**: Minimal additional overhead over regular RPC calls
- **Concurrent Calls**: Fully thread-safe, supports concurrent signed calls

## Troubleshooting

### Common Issues

1. **"Transport Error"**: Ensure you're using HTTP/HTTPS, not WebSocket
2. **"Invalid Key"**: Verify private key format and permissions
3. **"Account Not Set"**: Set `client.AccountName` before making calls
4. **"Signature Expired"**: Implement retry logic for slow networks
5. **"Network Error"**: Check node availability and network connectivity

### Debug Mode

Set the `DEBUG` environment variable to enable detailed logging:

```bash
DEBUG=1 go run your-program.go
```

This will show request/response details and signing information.

---

## More SignedCall Examples

## SignedCall Examples

### Basic Signed API Call

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

### Get Account History (Authenticated)

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

### Batch Signed Calls

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

### Error Handling for Signed Calls

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

### Using Direct API Methods

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

## Where to go next

The steem-js side of the same protocol is covered in [steem-js: Signed Calls and Signature Verification](/tutorials/steem-js/signed-calls.html); the two implementations are wire-compatible.
