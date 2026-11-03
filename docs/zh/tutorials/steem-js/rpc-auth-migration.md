# RPC 认证测试迁移

## 概述

本文档描述将测试从 `@steemit/rpc-auth` 包迁移到 `steem-js` v1.0.11 的过程。

## 迁移详情

### 来源
- **原包**：`@steemit/rpc-auth` v1.1.1
- **源码位置**：本地的 `rpc-auth` 仓库检出
- **原测试文件**：`test/index.ts`
- **测试框架**：Mocha

### 目标
- **目标包**：`@steemit/steem-js` v1.0.11
- **目标位置**：本地的 `steem-js` 仓库检出
- **新测试文件**：`test/rpc-auth.test.ts`
- **测试框架**：Vitest

## 所做的更改

### 1. 测试框架迁移

**原 Mocha：**
```typescript
import 'mocha'
import * as assert from 'assert'

describe('rpc auth', function() {
  it('signs and validates', async function() {
    assert.equal(...)
  })
})
```

**改为 Vitest：**
```typescript
import { describe, it, expect } from 'vitest'

describe('RPC Auth', () => {
  it('should sign and validate a request', async () => {
    expect(...).toBe(...)
  })
})
```

### 2. 依赖更新

**移除：**
- `dsteem`（旧的 steem-js 库）
- `node-fetch`（用于创建测试网账户）
- Mocha 专属工具

**替换为：**
- `steem-js` 自带的 API（`steem.auth`、`steem.api`）
- 原生 `crypto.randomBytes`
- Vitest 断言

### 3. 测试账户处理

**原来：**
- 动态创建测试网账户
- 使用 `dsteem.Client.testnet()`
- 需要网络访问

**现在：**
- 使用环境变量或测试密钥
- 不再动态创建账户
- 大多数测试可在无网络环境下运行

### 4. 验证函数

**原来：**
```typescript
const dsteemVerify: VerifyMessage = async (message, signatures, account) => {
  const opts = { hash: message, signatures, required_posting: [account] }
  const rv = await client.database.call('verify_signatures', [opts])
  if (rv.valid !== true) throw new Error('Signature invalid')
}
```

**现在：**
```typescript
const createVerifyFunction = () => {
  return async (message: Buffer, signatures: string[], account: string) => {
    const accounts = await api.getAccountsAsync([account])
    const postingKeys = accounts[0].posting?.key_auths?.map(k => k[0]) || []
    // Verify using steem-js Signature and PublicKey classes
  }
}
```

## 测试覆盖

### 已迁移的测试

✅ **sign and validate** - 基本的签名与校验流程
✅ **invalid requests** - 全面的错误处理测试：
  - 无效的 JSON RPC 请求
  - 缺少签名载荷
  - 无效的请求参数
  - 缺少账户
  - 无效的编码参数
  - 无效的 nonce（多种情况）
  - 无效的时间戳
  - 已过期的签名
  - 验证失败

✅ **signing errors** - 签名时的错误处理：
  - 缺少 params
  - 空的密钥数组

✅ **signature format** - 签名结构校验：
  - 有效的签名格式
  - 唯一的 nonce
  - 有效的时间戳

✅ **multiple signatures** - 支持多把密钥

### 跳过的测试

⏭️ **invalid signatures（集成测试）** - 需要：
  - 真实的测试网账户
  - 网络访问
  - 可通过 `STEEM_USERNAME` 与 `STEEM_PASSWORD` 环境变量启用

## 测试结果

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

## 关键差异

### 错误消息格式

**原 rpc-auth：**
```
ValidationError: Verification failed (Nope)
```

**steem-js v1.0.11：**
```
Error: Verification failed: Nope
```

错误格式从 `(message)` 变为 `: message`，测试已相应更新。

### API 变化

1. **PrivateKey 处理**：
   - 原来：`PrivateKey.from(key)` 或 `PrivateKey.fromString(key)`
   - 现在：`PrivateKey.fromWif(key)`

2. **签名创建**：
   - 原来：先 `key.sign(message.buffer)` 再 `hexify()`
   - 现在：`Signature.signBufferSha256(message, privateKey)` 再 `.toHex()`

3. **不再有 ValidationError 类**：
   - 原来：自定义 `ValidationError` 类
   - 现在：带格式化消息的标准 `Error`

## 运行测试

```bash
# Run all rpc-auth tests
pnpm test -- rpc-auth.test.ts

# Run with coverage
pnpm test:coverage -- rpc-auth.test.ts

# Run specific test
pnpm test -- rpc-auth.test.ts -t "should sign and validate"
```

## 集成测试环境准备

要运行被跳过的集成测试，请设置环境变量：

```bash
export STEEM_USERNAME="your-testnet-account"
export STEEM_PASSWORD="your-password"
pnpm test -- rpc-auth.test.ts
```

## 备注

- 所有核心功能测试均已成功迁移
- 测试套件保持了与原来相同的覆盖范围
- 集成测试默认跳过，但可以启用
- 测试与 vitest 及现代 TypeScript 兼容
- 大多数测试无需外部依赖

---

自 steem-js 仓库文档迁移而来；其中验证工具的用法在[签名调用与签名验证](/zh/tutorials/steem-js/signed-calls.html)中有演示。
