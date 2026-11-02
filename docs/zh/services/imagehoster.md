---
title: ImageHoster
description: Steem 图片托管、代理与头像服务的 HTTP 用法参考。
---

# ImageHoster

ImageHoster 是 Steem 应用背后的图片服务。它托管上传的图片，通过代理端点（proxy）从许可来源抓取并转换图片，并提供用户头像。上传与代理的图片均由服务自身存储——不会向区块链写入任何图片数据。

**服务基址：** `https://steemitimages.com`

下文所有示例均使用该基址。

## 通用约定

- 返回 JSON 的端点在成功时回复 `"success": true`。
- 大多数由用户造成的错误（输入有误、文件缺失、签名失败）会刻意返回 **HTTP 200**，并在 JSON 正文中描述错误：

  ```json
  {
    "success": false,
    "error": {
      "name": "ErrorCode",
      "message": "Human-readable message"
    }
  }
  ```

- 返回图片的端点回复原始图片字节，`Content-Type` 为 `image/*`。
- 支持的图片格式为 **JPEG、PNG、GIF 和 WebP**。

## 上传图片

```
POST /:username/:signature
```

上传图片并返回其规范 URL。

- 请求以 `multipart/form-data` 发送；服务读取表单中找到的**第一个文件部分**（字段名任意）。
- `:username` 是上传图片的 Steem 账户。
- `:signature` 是对图片数据的签名——参见[上传签名](#signing-uploads)。
- 必须携带 `Content-Length` 请求头（`curl` 会自动发送）。

```bash
curl -sS -F "file=@photo.jpg" \
  "https://steemitimages.com/<username>/<hex-signature>"
```

成功响应：

```json
{
  "success": true,
  "url": "https://cdn.steemitimages.com/<DKEY>/<filename>"
}
```

返回的 `url` 是所存图片的规范位置。上传不得超过服务配置的最大图片尺寸（在其基础上允许为 multipart 封装保留少量余量），文件名会在服务端做净化处理。

错误响应使用上述 JSON 约定。常见错误名：

| 错误 | 含义 |
| --- | --- |
| `BadRequest` | multipart 请求格式有误、请求头缺失或无效、文件名无效 |
| `LengthRequired` | 缺少 `Content-Length` 请求头 |
| `PayloadTooLarge` | 图片超过允许的最大尺寸 |
| `FileMissing` | multipart 表单中没有文件部分 |
| `InvalidImage` | 文件不是受支持的图片类型 |
| `InvalidSignature` | 签名校验失败 |
| `NoSuchAccount` | 找不到该 Steem 账户 |
| `Deplorable` | 账户声誉低于要求阈值 |
| `Blacklisted` | 账户在黑名单中 |
| `QoutaExceeded` | 超出上传频率限制 |

例如，使用未知账户上传会返回：

```json
{
  "success": false,
  "error": {
    "name": "NoSuchAccount",
    "message": "failed to get account: account not found: [<username>]"
  }
}
```

## 上传签名

上传签名覆盖图片数据：

1. 将 ASCII 字符串 `ImageSigningChallenge` 与原始图片字节拼接。
2. 对结果取 SHA-256 哈希。
3. 用在上传账户上授权的私钥对哈希签名（来自该账户 posting 或 active 权限的密钥）。
4. 将得到的可恢复签名做十六进制编码——这就是 `:signature` 路径段。

Node.js 中使用 `dsteem` 的示例：

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

## 获取已上传的图片

```
GET /:hash
GET /:hash/:filename
```

按键下载先前上传的图片（`:hash` 即上传响应中的键）。`:filename` 段可选，仅用于提高可读性——`Content-Type` 请求头始终反映真实的图片类型。

```bash
curl -O https://steemitimages.com/DQmZi174Xz96UrRVBMNRHb6A2FfU3z1HRPwPPQCgSMgdiUT/test.jpg
```

响应携带 `Cache-Control: public,max-age=29030400,immutable`——同一键下的图片内容永不改变，因此客户端与 CDN 可以放心地积极缓存。

## 代理与转换图片

```
GET /p/:url
```

从源 URL 下载图片，可选地进行转换，缓存结果并提供服务。`:url` 是绝对源 URL（HTTP/HTTPS），**以 Base58 编码**。

可选查询参数：

| 参数 | 取值 | 行为 |
| --- | --- | --- |
| `width` | 正整数 | 缩放到该宽度；未给出 `height` 时按纵横比推导高度 |
| `height` | 正整数 | 缩放到该高度；未给出 `width` 时按纵横比推导宽度 |
| `mode` | `cover`（默认） | 填满目标矩形，裁掉溢出部分 |
| | `fit` | 在目标矩形内完整呈现，只做缩小采样 |
| `format` | `match`（默认） | 保持输入格式 |
| | `jpeg`、`png`、`webp` | 转换为指定格式 |

```bash
# 对源 URL 做 Base58 编码，然后请求一张 200 像素宽的 PNG 副本：
curl -o out.png "https://steemitimages.com/p/<base58-url>?width=200&format=png"
```

缓存：命中缓存的转换结果携带 `Cache-Control: public,max-age=29030400,immutable`；转换结果的首次抓取携带 `Cache-Control: public,max-age=600`。

**动图 GIF：**只有在不带 `width`/`height`（且 `mode=fit`、保持输入格式）请求时，GIF 才会逐字节原样通过。任何带尺寸的请求都会使图片经过转换管线，这会把动图 GIF 缩减为静态首帧。要保留动画，请不带尺寸参数请求 GIF。

**访问策略：**出站代理抓取受到限制——仅接受 HTTP/HTTPS 源 URL，拒绝私有与内部网络地址，目标主机受运营方许可列表策略约束。目标主机不被允许的请求会失败并返回：

```json
{
  "success": false,
  "error": {
    "name": "TargetHostNotAllowed",
    "message": "target URL host is not allowed"
  }
}
```

该端点的其他错误名还包括 `InvalidProxyUrl`（Base58 解码或 URL 解析失败）、`InvalidImage`（上游内容类型不受支持）、`PayloadTooLarge`（上游图片过大）与 `NotFound`（URL 指向的上传键不存在）。

## 用户头像

```
GET /u/:username/avatar
GET /u/:username/avatar/:size
```

提供 Steem 账户的头像，取自账户的链上资料元数据，并经由同一代理/转换管线提供。

尺寸：

- `small` — 64×64
- `medium` — 128×128
- `large` — 512×512
- 其他取值或不带尺寸 — 宽度 128，保持图片原始纵横比

如果账户未设置头像——或其 `profile_image` 指向外部主机——则改为提供默认头像。头像响应始终使用较短的缓存生存期（`Cache-Control: public,max-age=600`），以便头像变更快速生效。

```bash
# @steemit 账户的 64x64 头像
curl -o avatar.png https://steemitimages.com/u/steemit/avatar/small

# 128 像素宽、保持原始纵横比的头像
curl -o avatar.png https://steemitimages.com/u/steemit/avatar
```
