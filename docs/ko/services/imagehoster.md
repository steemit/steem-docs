---
title: ImageHoster
description: Steem 이미지 호스팅, 프록시 및 아바타 서비스의 HTTP 사용 참조.
---

# ImageHoster

ImageHoster는 Steem 애플리케이션 뒤에서 동작하는 이미지 서비스입니다. 업로드된 이미지를 호스팅하고, 승인된 소스의 이미지를 프록시 엔드포인트를 통해 가져와 변환하며, 사용자 아바타를 제공합니다. 업로드 및 프록시된 이미지는 서비스 자체에 저장되며, 블록체인에는 어떤 이미지 데이터도 기록되지 않습니다.

**서비스 기본 URL:** `https://steemitimages.com`

아래의 모든 예제는 이 기본 URL을 사용합니다.

## 규칙

- JSON을 반환하는 엔드포인트는 성공 시 `"success": true`로 응답합니다.
- 사용자 원인의 대부분의 오류(잘못된 입력, 누락된 파일, 서명 실패)는 의도적으로 오류를 설명하는 JSON 본문과 함께 **HTTP 200**을 반환합니다:

  ```json
  {
    "success": false,
    "error": {
      "name": "ErrorCode",
      "message": "Human-readable message"
    }
  }
  ```

- 이미지를 반환하는 엔드포인트는 이미지의 원시 바이트와 `image/*` `Content-Type`으로 응답합니다.
- 지원되는 이미지 형식은 **JPEG, PNG, GIF, WebP**입니다.

## 이미지 업로드

```
POST /:username/:signature
```

이미지를 업로드하고 그 정식 URL을 반환합니다.

- 요청은 `multipart/form-data`로 보내며, 서비스는 폼에서 발견한 **첫 번째 파일 파트**를 읽습니다(필드 이름은 무엇이든 됩니다).
- `:username`은 이미지를 업로드하는 Steem 계정입니다.
- `:signature`는 이미지 데이터에 대한 서명입니다 — [업로드 서명](#signing-uploads)을 참고하세요.
- `Content-Length` 헤더가 필요합니다(`curl`은 자동으로 보냅니다).

```bash
curl -sS -F "file=@photo.jpg" \
  "https://steemitimages.com/<username>/<hex-signature>"
```

성공 응답:

```json
{
  "success": true,
  "url": "https://cdn.steemitimages.com/<DKEY>/<filename>"
}
```

반환된 `url`은 저장된 이미지의 정식 위치입니다. 업로드는 서비스에 설정된 최대 이미지 크기를 초과할 수 없고(그 위에 multipart 프레이밍을 위한 약간의 여유는 허용됨), 파일 이름은 서버 측에서 정제됩니다.

오류 응답은 위의 JSON 규약을 사용합니다. 자주 나타나는 오류 이름:

| 오류 | 의미 |
| --- | --- |
| `BadRequest` | 잘못된 형식의 multipart 요청, 누락되었거나 유효하지 않은 헤더, 유효하지 않은 파일 이름 |
| `LengthRequired` | `Content-Length` 헤더 누락 |
| `PayloadTooLarge` | 이미지가 허용되는 최대 크기를 초과 |
| `FileMissing` | multipart 폼에 파일 파트가 없음 |
| `InvalidImage` | 파일이 지원되는 이미지 유형이 아님 |
| `InvalidSignature` | 서명 검증 실패 |
| `NoSuchAccount` | Steem 계정을 찾을 수 없음 |
| `Deplorable` | 계정 평판이 요구되는 임계값 미만 |
| `Blacklisted` | 계정이 블랙리스트에 있음 |
| `QoutaExceeded` | 업로드 빈도 제한 초과 |

예를 들어 알 수 없는 계정으로 업로드하면 다음을 반환합니다:

```json
{
  "success": false,
  "error": {
    "name": "NoSuchAccount",
    "message": "failed to get account: account not found: [<username>]"
  }
}
```

## 업로드 서명

업로드 서명은 이미지 데이터를 대상으로 합니다:

1. ASCII 문자열 `ImageSigningChallenge`를 이미지의 원시 바이트와 연결합니다.
2. 그 결과의 SHA-256 해시를 구합니다.
3. 업로드하는 계정에 승인된 개인 키로 해시에 서명합니다(계정의 posting 또는 active 권한 키).
4. 만들어진 복구 가능한 서명을 16진수로 인코딩합니다 — 이것이 `:signature` 경로 세그먼트입니다.

Node.js에서 `dsteem`을 사용하는 예제:

```javascript
const dsteem = require('dsteem')
const crypto = require('crypto')
const fs = require('fs')

const [wif, file] = process.argv.slice(2)

if (!wif || !file) {
  process.stderr.write(`Usage: ./sign.js <posting_wif> <file>\n`)
  process.exit(1)
}

const data = fs.readFileSync(file)
const key = dsteem.PrivateKey.fromString(wif)
const imageHash = crypto.createHash('sha256')
  .update('ImageSigningChallenge')
  .update(data)
  .digest()

process.stdout.write(key.sign(imageHash).toString() + '\n')
```

## 업로드된 이미지 가져오기

```
GET /:hash
GET /:hash/:filename
```

키로 이전에 업로드한 이미지를 다운로드합니다(`:hash`는 업로드 응답의 키입니다). `:filename` 세그먼트는 선택 사항이며 가독성을 위한 것일 뿐입니다 — `Content-Type` 헤더는 항상 실제 이미지 유형을 반영합니다.

```bash
curl -O https://steemitimages.com/DQmZi174Xz96UrRVBMNRHb6A2FfU3z1HRPwPPQCgSMgdiUT/test.jpg
```

응답은 `Cache-Control: public,max-age=29030400,immutable`을 포함합니다 — 주어진 키 아래의 이미지 내용은 절대 변하지 않으므로 클라이언트와 CDN이 공격적으로 캐시할 수 있습니다.

## 이미지 프록시 및 변환

```
GET /p/:url
```

소스 URL에서 이미지를 다운로드하고, 선택적으로 변환하고, 결과를 캐시한 뒤 제공합니다. `:url`은 절대 소스 URL(HTTP/HTTPS)이며 **Base58로 인코딩**됩니다.

선택적 쿼리 파라미터:

| 파라미터 | 값 | 동작 |
| --- | --- | --- |
| `width` | 양의 정수 | 이 너비로 조정; `height`가 주어지지 않으면 가로세로 비를 유지하도록 높이를 산출 |
| `height` | 양의 정수 | 이 높이로 조정; `width`가 주어지지 않으면 가로세로 비를 유지하도록 너비를 산출 |
| `mode` | `cover` (기본값) | 요청한 사각형을 채우고 넘치는 부분은 잘라냄 |
| | `fit` | 요청한 사각형 안에 맞추되 축소만 함 |
| `format` | `match` (기본값) | 입력 형식을 유지 |
| | `jpeg`, `png`, `webp` | 지정된 형식으로 변환 |

```bash
# Base58-encode the source URL, then request a 200px-wide PNG copy:
curl -o out.png "https://steemitimages.com/p/<base58-url>?width=200&format=png"
```

캐싱: 캐시에서 제공된 변환 결과는 `Cache-Control: public,max-age=29030400,immutable`을 포함하고, 변환 결과의 첫 번째 가져오기는 `Cache-Control: public,max-age=600`을 포함합니다.

**애니메이션 GIF:** `width`/`height` 없이(`mode=fit` 및 입력 형식 유지) 요청한 경우에만 GIF가 바이트 단위로 그대로 전달됩니다. 크기를 지정한 요청은 이미지를 변환 파이프라인에 통과시키며, 이는 애니메이션 GIF를 정적인 첫 프레임으로 축소합니다. 애니메이션을 유지하려면 크기 파라미터 없이 GIF를 요청하세요.

**접근 정책:** 아웃바운드 프록시 가져오기는 제한됩니다 — HTTP/HTTPS 소스 URL만 허용되고, 사설 및 내부 네트워크 주소는 거부되며, 대상 호스트는 운영자의 허용 목록 정책으로 제한됩니다. 대상 호스트가 허용되지 않는 요청은 다음과 함께 실패합니다:

```json
{
  "success": false,
  "error": {
    "name": "TargetHostNotAllowed",
    "message": "target URL host is not allowed"
  }
}
```

이 엔드포인트의 다른 오류 이름으로는 `InvalidProxyUrl`(Base58 디코딩 또는 URL 파싱 실패), `InvalidImage`(지원되지 않는 업스트림 콘텐츠 유형), `PayloadTooLarge`(업스트림 이미지가 너무 큼), `NotFound`(URL이 존재하지 않는 업로드 키를 가리킴)가 있습니다.

## 사용자 아바타

```
GET /u/:username/avatar
GET /u/:username/avatar/:size
```

Steem 계정의 아바타를 제공하며, 계정의 온체인 프로필 메타데이터에서 가져와 동일한 프록시/변환 파이프라인을 통해 제공됩니다.

크기:

- `small` — 64×64
- `medium` — 128×128
- `large` — 512×512
- 그 외의 값 또는 크기 없음 — 너비 128, 이미지의 원래 가로세로 비

계정에 아바타가 설정되어 있지 않거나 — 그 `profile_image`가 외부 호스트를 가리키는 경우 — 기본 아바타가 대신 제공됩니다. 아바타 응답은 항상 짧은 캐시 수명(`Cache-Control: public,max-age=600`)을 사용하여 아바타 변경이 빠르게 전파되도록 합니다.

```bash
# 64x64 avatar for the @steemit account
curl -o avatar.png https://steemitimages.com/u/steemit/avatar/small

# 128px-wide avatar with natural aspect ratio
curl -o avatar.png https://steemitimages.com/u/steemit/avatar
```
