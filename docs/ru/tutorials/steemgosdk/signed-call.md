# Документация SignedCall API

## Обзор

Функциональность `SignedCall` предоставляет аутентифицированные JSON-RPC вызовы к блокчейну Steem. Она использует криптографические подписи, чтобы доказать владение аккаунтом и получить доступ к приватным или ограниченным данным.

Эта реализация полностью совместима с методом `signedCall` библиотеки `steem-js`, что обеспечивает совместимость приложений на JavaScript и Go.

## Возможности

- **Криптографическая аутентификация**: доказывает владение аккаунтом без передачи приватных ключей
- **Защита от повторов**: используются уникальные nonce и метки времени для предотвращения replay-атак
- **Истечение по времени**: в целях безопасности подписи истекают через 60 секунд
- **Поддержка нескольких ключей**: можно подписывать сразу несколькими приватными ключами
- **Только HTTP**: по соображениям безопасности требуется транспорт HTTP/HTTPS

## Быстрый старт

### Базовое использование

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

## Справочник API

### Методы клиента

#### `SignedCall(method, params, keyType) -> (*RpcResultData, error)`

Выполняет подписанный RPC-вызов, используя сохранённые учётные данные.

**Параметры:**
- `method` (string): вызываемый RPC-метод (например, "condenser_api.get_accounts")
- `params` ([]interface{}): параметры RPC-метода
- `keyType` (string): какой приватный ключ использовать ("active", "posting", "owner", "memo")

**Возвращает:**
- `*RpcResultData`: необработанные данные ответа RPC
- `error`: ошибка, если вызов не удался

#### `SignedCallWithResult(method, params, keyType, result) -> error`

Выполняет подписанный RPC-вызов и распаковывает (unmarshal) результат в переданный объект.

**Параметры:**
- `method` (string): вызываемый RPC-метод
- `params` ([]interface{}): параметры RPC-метода
- `keyType` (string): какой приватный ключ использовать
- `result` (interface{}): указатель на объект, в который распаковывается результат

**Возвращает:**
- `error`: ошибка, если вызов или распаковка не удались

### Методы API

#### `SignedCall(method, params, account, privateKey) -> (*RpcResultData, error)`

Метод подписанного вызова низкого уровня.

**Параметры:**
- `method` (string): вызываемый RPC-метод
- `params` ([]interface{}): параметры RPC-метода
- `account` (string): имя аккаунта, от имени которого выполняется подписание
- `privateKey` (string): приватный ключ в формате WIF

**Возвращает:**
- `*RpcResultData`: необработанные данные ответа RPC
- `error`: ошибка, если вызов не удался

#### `SignedCallWithResult(method, params, account, privateKey, result) -> error`

Подписанный вызов низкого уровня с распаковкой результата.

## Типовые сценарии

### 1. Получение информации об аккаунте

```go
var accounts []map[string]interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_accounts",
    []interface{}{[]string{"username"}},
    consts.ACTIVE_KEY,
    &accounts,
)
```

### 2. Получение истории аккаунта

```go
var history []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_account_history",
    []interface{}{"username", -1, 100},
    consts.ACTIVE_KEY,
    &history,
)
```

### 3. Получение подписчиков/подписок

```go
var followers []interface{}
err := client.SignedCallWithResult(
    "condenser_api.get_followers",
    []interface{}{"username", "", "blog", 100},
    consts.POSTING_KEY,
    &followers,
)
```

### 4. Пакетные операции

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

## Обработка ошибок

### Частые ошибки

#### Ошибка транспорта
```go
// Error: "signed calls can only be made when using HTTP transport"
client := steemgosdk.GetClient("wss://api.steemit.com") // WebSocket not supported
```

#### Ошибка аутентификации
```go
// Error: "invalid key type: invalid_key"
err := client.SignedCall(method, params, "invalid_key")
```

#### Отсутствуют учётные данные
```go
// Error: "account name not set"
client := steemgosdk.GetClient(url)
// client.AccountName not set
err := client.SignedCall(method, params, consts.ACTIVE_KEY)
```

#### Истечение подписи
```go
// Error: "signature expired"
// Occurs when request takes longer than 60 seconds to reach server
```

### Паттерн обработки ошибок

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

## Соображения безопасности

### Лучшие практики

1. **Только HTTPS**: для подписанных вызовов всегда используйте HTTPS-эндпоинты
2. **Проверяйте приватные ключи**: проверяйте формат ключа перед вызовами
3. **Обрабатывайте истечение**: реализуйте логику повторных попыток для истёкших подписей
4. **Безопасное хранение ключей**: никогда не логируйте и не раскрывайте приватные ключи
5. **Переменные окружения**: для чувствительных данных используйте переменные окружения

### Функции безопасности

- **Ключи не передаются**: приватные ключи никогда не покидают ваше приложение
- **Уникальные nonce**: каждый запрос использует уникальный случайный nonce из 8 байт
- **Проверка метки времени**: подписи истекают через 60 секунд
- **Защита от кросс-протокольных атак**: используется специфичная для протокола константа подписания

### Пример безопасной реализации

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

## Продвинутое использование

### Пользовательская проверка

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

### Подписание несколькими ключами

```go
// Sign with multiple keys
privateKeys := []string{
    "active-key-wif",
    "posting-key-wif",
}

signedRequest, err := rpc.Sign(request, account, privateKeys)
// signedRequest will contain multiple signatures
```

## Тестирование

### Модульные тесты

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

### Интеграционные тесты

Полный пример интеграционного теста см. в `test-gosdk/examples/signed_call/main.go`.

## Совместимость

Эта реализация полностью совместима с подписанными вызовами `steem-js`:

- используется тот же алгоритм подписания и формат сообщения
- генерируются идентичные структуры подписей
- поддерживаются те же функции безопасности (nonce, метки времени, истечение)
- можно проверять подписи, созданные `steem-js`, и наоборот

## Производительность

- **Накладные расходы на подписание**: ~1-5 мс на подпись
- **Сетевая задержка**: зависит от времени отклика узла
- **Использование памяти**: минимальные дополнительные накладные расходы по сравнению с обычными RPC-вызовами
- **Параллельные вызовы**: полная потокобезопасность, поддерживаются параллельные подписанные вызовы

## Устранение неполадок

### Частые проблемы

1. **"Ошибка транспорта"**: убедитесь, что вы используете HTTP/HTTPS, а не WebSocket
2. **"Недопустимый ключ"**: проверьте формат и полномочия приватного ключа
3. **"Аккаунт не задан"**: задайте `client.AccountName` перед вызовами
4. **"Подпись истекла"**: реализуйте логику повторов для медленных сетей
5. **"Сетевая ошибка"**: проверьте доступность узла и сетевое соединение

### Режим отладки

Установите переменную окружения `DEBUG`, чтобы включить подробное журналирование:

```bash
DEBUG=1 go run your-program.go
```

Здесь будут показаны детали запроса/ответа и информация о подписании.

---

## Больше примеров SignedCall

## Примеры SignedCall

### Базовый подписанный вызов API

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

### Получение истории аккаунта (с аутентификацией)

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

### Пакетные подписанные вызовы

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

### Обработка ошибок подписанных вызовов

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

### Использование прямых методов API

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

## Что дальше

Сторона steem-js того же протокола описана в [steem-js: подписанные вызовы и проверка подписи](/ru/tutorials/steem-js/signed-calls.html); обе реализации совместимы на уровне wire-формата.
