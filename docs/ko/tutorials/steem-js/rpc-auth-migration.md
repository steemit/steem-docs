# RPC 인증 테스트 마이그레이션

## 개요

이 문서는 `@steemit/rpc-auth` 패키지에서 `steem-js` v1.0.11로 테스트를 마이그레이션한 과정을 설명합니다.

## 마이그레이션 상세

### 원본
- **원본 패키지**: `@steemit/rpc-auth` v1.1.1
- **원본 위치**: 로컬 `rpc-auth` 저장소 체크아웃
- **원본 테스트 파일**: `test/index.ts`
- **테스트 프레임워크**: Mocha

### 대상
- **대상 패키지**: `@steemit/steem-js` v1.0.11
- **대상 위치**: 로컬 `steem-js` 저장소 체크아웃
- **새 테스트 파일**: `test/rpc-auth.test.ts`
- **테스트 프레임워크**: Vitest

## 적용된 변경 사항

### 1. 테스트 프레임워크 마이그레이션

**Mocha에서:**
```typescript
import 'mocha'
import * as assert from 'assert'

describe('rpc auth', function() {
  it('signs and validates', async function() {
    assert.equal(...)
  })
})
```

**Vitest로 변경:**
```typescript
import { describe, it, expect } from 'vitest'

describe('RPC Auth', () => {
  it('should sign and validate a request', async () => {
    expect(...).toBe(...)
  })
})
```

### 2. 의존성 업데이트

**제거:**
- `dsteem` (구버전 steem-js 라이브러리)
- `node-fetch` (테스트넷 계정 생성용)
- Mocha 전용 유틸리티

**대체:**
- `steem-js` 자체 API (`steem.auth`, `steem.api`)
- 네이티브 `crypto.randomBytes`
- Vitest 어설션

### 3. 테스트 계정 처리

**이전:**
- 테스트넷 계정을 동적으로 생성
- `dsteem.Client.testnet()` 사용
- 네트워크 접근 필요

**현재:**
- 환경 변수 또는 테스트 키 사용
- 동적 계정 생성 없음
- 네트워크 없이 실행 가능(대부분의 테스트)

### 4. 검증 함수

**이전:**
```typescript
const dsteemVerify: VerifyMessage = async (message, signatures, account) => {
  const opts = { hash: message, signatures, required_posting: [account] }
  const rv = await client.database.call('verify_signatures', [opts])
  if (rv.valid !== true) throw new Error('Signature invalid')
}
```

**현재:**
```typescript
const createVerifyFunction = () => {
  return async (message: Buffer, signatures: string[], account: string) => {
    const accounts = await api.getAccountsAsync([account])
    const postingKeys = accounts[0].posting?.key_auths?.map(k => k[0]) || []
    // Verify using steem-js Signature and PublicKey classes
  }
}
```

## 테스트 커버리지

### 마이그레이션된 테스트

✅ **sign and validate** - 기본 서명 및 검증 흐름
✅ **invalid requests** - 포괄적인 오류 처리 테스트:
  - 잘못된 JSON RPC 요청
  - 서명된 페이로드 누락
  - 잘못된 요청 파라미터
  - 계정 누락
  - 잘못된 인코딩 파라미터
  - 잘못된 nonce (여러 케이스)
  - 잘못된 타임스탬프
  - 만료된 서명
  - 검증 실패

✅ **signing errors** - 서명 시 오류 처리:
  - params 누락
  - 빈 키 배열

✅ **signature format** - 서명 구조 검사:
  - 유효한 서명 형식
  - 고유한 nonce
  - 유효한 타임스탬프

✅ **multiple signatures** - 다중 키 지원

### 건너뛴 테스트

⏭️ **invalid signatures (통합 테스트)** - 필요한 것:
  - 실제 테스트넷 계정
  - 네트워크 접근
  - `STEEM_USERNAME`, `STEEM_PASSWORD` 환경 변수로 활성화 가능

## 테스트 결과

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

## 주요 차이점

### 오류 메시지 형식

**기존 rpc-auth:**
```
ValidationError: Verification failed (Nope)
```

**steem-js v1.0.11:**
```
Error: Verification failed: Nope
```

오류 형식이 `(message)`에서 `: message`로 바뀌었으며, 테스트에도 이 변경이 반영되었습니다.

### API 변경 사항

1. **PrivateKey 처리**:
   - 이전: `PrivateKey.from(key)` 또는 `PrivateKey.fromString(key)`
   - 현재: `PrivateKey.fromWif(key)`

2. **서명 생성**:
   - 이전: `key.sign(message.buffer)` 후 `hexify()`
   - 현재: `Signature.signBufferSha256(message, privateKey)` 후 `.toHex()`

3. **ValidationError 클래스 없음**:
   - 이전: 커스텀 `ValidationError` 클래스
   - 현재: 형식화된 메시지를 담은 표준 `Error`

## 테스트 실행

```bash
# Run all rpc-auth tests
pnpm test -- rpc-auth.test.ts

# Run with coverage
pnpm test:coverage -- rpc-auth.test.ts

# Run specific test
pnpm test -- rpc-auth.test.ts -t "should sign and validate"
```

## 통합 테스트 준비

건너뛴 통합 테스트를 실행하려면 환경 변수를 설정하십시오:

```bash
export STEEM_USERNAME="your-testnet-account"
export STEEM_PASSWORD="your-password"
pnpm test -- rpc-auth.test.ts
```

## 참고

- 모든 핵심 기능 테스트가 성공적으로 마이그레이션되었습니다
- 테스트 스위트는 원본과 동일한 커버리지를 유지합니다
- 통합 테스트는 기본적으로 건너뛰어지지만 활성화할 수 있습니다
- 테스트는 vitest 및 최신 TypeScript와 호환됩니다
- 대부분의 테스트는 외부 의존성이 필요하지 않습니다

---

steem-js 저장소 문서에서 마이그레이션되었습니다. 여기서 사용된 검증 유틸리티는 [서명된 호출과 서명 검증](/ko/tutorials/steem-js/signed-calls.html)에서 시연됩니다.
