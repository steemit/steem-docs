# Миграция тестов RPC-аутентификации

## Обзор

Этот документ описывает миграцию тестов из пакета `@steemit/rpc-auth` в `steem-js` v1.0.11.

## Детали миграции

### Источник
- **Исходный пакет**: `@steemit/rpc-auth` v1.1.1
- **Расположение исходников**: локальная копия репозитория `rpc-auth`
- **Исходный файл тестов**: `test/index.ts`
- **Тестовый фреймворк**: Mocha

### Приёмник
- **Целевой пакет**: `@steemit/steem-js` v1.0.11
- **Целевое расположение**: локальная копия репозитория `steem-js`
- **Новый файл тестов**: `test/rpc-auth.test.ts`
- **Тестовый фреймворк**: Vitest

## Внесённые изменения

### 1. Миграция тестового фреймворка

**С Mocha:**
```typescript
import 'mocha'
import * as assert from 'assert'

describe('rpc auth', function() {
  it('signs and validates', async function() {
    assert.equal(...)
  })
})
```

**На Vitest:**
```typescript
import { describe, it, expect } from 'vitest'

describe('RPC Auth', () => {
  it('should sign and validate a request', async () => {
    expect(...).toBe(...)
  })
})
```

### 2. Обновление зависимостей

**Удалено:**
- `dsteem` (старая библиотека steem-js)
- `node-fetch` (для создания аккаунтов в тестовой сети)
- специфичные для Mocha утилиты

**Заменено на:**
- собственный API `steem-js` (`steem.auth`, `steem.api`)
- нативный `crypto.randomBytes`
- ассерты Vitest

### 3. Работа с тестовыми аккаунтами

**Раньше:**
- Аккаунты тестовой сети создавались динамически
- Использовался `dsteem.Client.testnet()`
- Требовался доступ к сети

**Теперь:**
- Используются переменные окружения или тестовые ключи
- Динамическое создание аккаунтов отсутствует
- Большинство тестов может работать без сети

### 4. Функция проверки

**Раньше:**
```typescript
const dsteemVerify: VerifyMessage = async (message, signatures, account) => {
  const opts = { hash: message, signatures, required_posting: [account] }
  const rv = await client.database.call('verify_signatures', [opts])
  if (rv.valid !== true) throw new Error('Signature invalid')
}
```

**Теперь:**
```typescript
const createVerifyFunction = () => {
  return async (message: Buffer, signatures: string[], account: string) => {
    const accounts = await api.getAccountsAsync([account])
    const postingKeys = accounts[0].posting?.key_auths?.map(k => k[0]) || []
    // Verify using steem-js Signature and PublicKey classes
  }
}
```

## Покрытие тестами

### Мигрированные тесты

✅ **sign and validate** - базовый сценарий подписи и валидации
✅ **invalid requests** - исчерпывающие тесты обработки ошибок:
  - Некорректный JSON RPC-запрос
  - Отсутствует подписанная нагрузка
  - Некорректные параметры запроса
  - Отсутствует аккаунт
  - Некорректные закодированные параметры
  - Некорректный nonce (несколько случаев)
  - Некорректная метка времени
  - Истёкшая подпись
  - Ошибка проверки

✅ **signing errors** - обработка ошибок при подписи:
  - Отсутствуют params
  - Пустой массив ключей

✅ **signature format** - валидация структуры подписи:
  - Корректный формат подписи
  - Уникальные nonce
  - Корректные метки времени

✅ **multiple signatures** - поддержка нескольких ключей

### Пропущенные тесты

⏭️ **invalid signatures (интеграционный тест)** - требуется:
  - Реальный аккаунт в тестовой сети
  - Доступ к сети
  - Включается переменными окружения `STEEM_USERNAME` и `STEEM_PASSWORD`

## Результаты тестов

```
✓ test/rpc-auth.test.ts (19 tests | 1 skipped)
  ✓ RPC Auth > sign and validate > should sign and validate a request
  ✓ RPC Auth > invalid requests > should handle invalid JSON RPC request
  ✓ RPC Auth > invalid requests > should handle missing signed payload
  ✓ RPC Auth > invalid requests > should handle invalid request params
  ✓ RPC Auth > invalid requests > should handle missing account
  ✓ RPC Auth > invalid requests > should handle invalid encoded params
  ✓ RPC Auth > invalid requests > should handle invalid nonce (not a string)
  ✓ RPC Auth > invalid requests > should handle invalid nonce (wrong length)
  ✓ RPC Auth > invalid requests > should handle invalid nonce (wrong format)
  ✓ RPC Auth > invalid requests > should handle invalid timestamp
  ✓ RPC Auth > invalid requests > should handle expired signature
  ✓ RPC Auth > invalid requests > should handle verification failure
  ✓ RPC Auth > signing errors > should handle invalid requests when signing
  ✓ RPC Auth > signing errors > should handle empty keys array
  ✓ RPC Auth > signature format > should generate valid signature format
  ✓ RPC Auth > signature format > should generate unique nonces for each request
  ✓ RPC Auth > signature format > should generate valid timestamps
  ✓ RPC Auth > multiple signatures > should support multiple keys
  ↓ RPC Auth > invalid signatures > should handle invalid signatures (integration test)
```

## Ключевые отличия

### Формат сообщений об ошибках

**Исходный rpc-auth:**
```
ValidationError: Verification failed (Nope)
```

**steem-js v1.0.11:**
```
Error: Verification failed: Nope
```

Формат ошибки изменился с `(message)` на `: message`, что отражено в тестах.

### Изменения API

1. **Работа с PrivateKey**:
   - Раньше: `PrivateKey.from(key)` или `PrivateKey.fromString(key)`
   - Теперь: `PrivateKey.fromWif(key)`

2. **Создание подписи**:
   - Раньше: `key.sign(message.buffer)`, затем `hexify()`
   - Теперь: `Signature.signBufferSha256(message, privateKey)`, затем `.toHex()`

3. **Класса ValidationError больше нет**:
   - Раньше: собственный класс `ValidationError`
   - Теперь: стандартный `Error` с форматированными сообщениями

## Запуск тестов

```bash
# Run all rpc-auth tests
pnpm test -- rpc-auth.test.ts

# Run with coverage
pnpm test:coverage -- rpc-auth.test.ts

# Run specific test
pnpm test -- rpc-auth.test.ts -t "should sign and validate"
```

## Настройка интеграционного теста

Чтобы запустить пропущенный интеграционный тест, задайте переменные окружения:

```bash
export STEEM_USERNAME="your-testnet-account"
export STEEM_PASSWORD="your-password"
pnpm test -- rpc-auth.test.ts
```

## Примечания

- Все тесты основной функциональности успешно мигрированы
- Набор тестов сохраняет то же покрытие, что и исходный
- Интеграционные тесты по умолчанию пропускаются, но их можно включить
- Тесты совместимы с vitest и современным TypeScript
- Для большинства тестов внешние зависимости не требуются

---

Мигрировано из документации репозитория steem-js; демонстрация задействованных здесь утилит проверки — в разделе [Подписанные вызовы и проверка подписи](/ru/tutorials/steem-js/signed-calls.html).
