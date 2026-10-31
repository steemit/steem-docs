---
title: ImageHoster
description: HTTP usage reference for the Steem image hosting, proxy and avatar service.
---

# ImageHoster

ImageHoster is the image service behind Steem applications. It hosts uploaded images, fetches and transforms images from approved sources through a proxy endpoint, and serves user avatars. Uploaded and proxied images are stored by the service itself — no image data is written to the blockchain.

**Service base URL:** `https://steemitimages.com`

All examples below use this base URL.

## Conventions

- Endpoints that return JSON reply with `"success": true` on success.
- Most user-caused errors (bad input, missing files, failed signatures) intentionally return **HTTP 200** with a JSON body describing the error:

  ```json
  {
    "success": false,
    "error": {
      "name": "ErrorCode",
      "message": "Human-readable message"
    }
  }
  ```

- Endpoints that return images reply with the raw image bytes and an `image/*` `Content-Type`.
- Accepted image formats are **JPEG, PNG, GIF, and WebP**.

## Upload an image

```
POST /:username/:signature
```

Uploads an image and returns its canonical URL.

- Send the request as `multipart/form-data`; the service reads the **first file part** found in the form (any field name works).
- `:username` is the Steem account uploading the image.
- `:signature` is a signature over the image data — see [Signing uploads](#signing-uploads).
- A `Content-Length` header is required (`curl` sends it automatically).

```bash
curl -sS -F "file=@photo.jpg" \
  "https://steemitimages.com/<username>/<hex-signature>"
```

Success response:

```json
{
  "success": true,
  "url": "https://cdn.steemitimages.com/<DKEY>/<filename>"
}
```

The returned `url` is the canonical location of the stored image. Uploads must not exceed the service's configured maximum image size (a small allowance for multipart framing on top of it is accepted), and filenames are sanitized server-side.

Error responses use the JSON contract above. Common error names:

| Error | Meaning |
| --- | --- |
| `BadRequest` | Malformed multipart request, missing or invalid headers, invalid filename |
| `LengthRequired` | Missing `Content-Length` header |
| `PayloadTooLarge` | Image exceeds the maximum allowed size |
| `FileMissing` | No file part in the multipart form |
| `InvalidImage` | File is not a supported image type |
| `InvalidSignature` | Signature verification failed |
| `NoSuchAccount` | Steem account not found |
| `Deplorable` | Account reputation is below the required threshold |
| `Blacklisted` | Account is blacklisted |
| `QoutaExceeded` | Upload rate limit exceeded |

For example, uploading with an unknown account returns:

```json
{
  "success": false,
  "error": {
    "name": "NoSuchAccount",
    "message": "failed to get account: account not found: [<username>]"
  }
}
```

## Signing uploads

The upload signature covers the image data:

1. Concatenate the ASCII string `ImageSigningChallenge` with the raw image bytes.
2. Take the SHA-256 hash of the result.
3. Sign the hash with a private key authorized on the uploading account (a key from the account's posting or active authority).
4. Hex-encode the resulting recoverable signature — this is the `:signature` path segment.

Example using `dsteem` in Node.js:

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

## Fetch an uploaded image

```
GET /:hash
GET /:hash/:filename
```

Downloads a previously uploaded image by its key (`:hash` is the key from the upload response). The `:filename` segment is optional and only aids readability — the `Content-Type` header always reflects the actual image type.

```bash
curl -O https://steemitimages.com/DQmZi174Xz96UrRVBMNRHb6A2FfU3z1HRPwPPQCgSMgdiUT/test.jpg
```

Responses carry `Cache-Control: public,max-age=29030400,immutable` — image content under a given key never changes, so clients and CDNs may cache it aggressively.

## Proxy and transform an image

```
GET /p/:url
```

Downloads an image from a source URL, optionally transforms it, caches the result, and serves it. `:url` is the absolute source URL (HTTP/HTTPS), **Base58-encoded**.

Optional query parameters:

| Parameter | Values | Behavior |
| --- | --- | --- |
| `width` | positive integer | Resize to this width; height is derived to preserve aspect ratio when `height` is not given |
| `height` | positive integer | Resize to this height; width is derived to preserve aspect ratio when `width` is not given |
| `mode` | `cover` (default) | Fill the requested rectangle, cropping the overflow |
| | `fit` | Fit inside the requested rectangle, downsample only |
| `format` | `match` (default) | Keep the input format |
| | `jpeg`, `png`, `webp` | Convert to the given format |

```bash
# Base58-encode the source URL, then request a 200px-wide PNG copy:
curl -o out.png "https://steemitimages.com/p/<base58-url>?width=200&format=png"
```

Caching: a served transform that came from cache carries `Cache-Control: public,max-age=29030400,immutable`; the first fetch of a transform carries `Cache-Control: public,max-age=600`.

**Animated GIFs:** a GIF is passed through byte-for-byte only when requested without `width`/`height` (with `mode=fit` and the input format kept). Any sized request runs the image through the transform pipeline, which reduces an animated GIF to its static first frame. To preserve animation, request the GIF without size parameters.

**Access policy:** outbound proxy fetches are restricted — only HTTP/HTTPS source URLs are accepted, private and internal network addresses are rejected, and target hosts are limited by the operator's allowlist policy. A request whose target host is not allowed fails with:

```json
{
  "success": false,
  "error": {
    "name": "TargetHostNotAllowed",
    "message": "target URL host is not allowed"
  }
}
```

Other error names from this endpoint include `InvalidProxyUrl` (Base58 decode or URL parse failed), `InvalidImage` (unsupported upstream content type), `PayloadTooLarge` (upstream image too large), and `NotFound` (the URL points at an upload key that does not exist).

## User avatars

```
GET /u/:username/avatar
GET /u/:username/avatar/:size
```

Serves the avatar for a Steem account, taken from the account's on-chain profile metadata and served through the same proxy/transform pipeline.

Sizes:

- `small` — 64×64
- `medium` — 128×128
- `large` — 512×512
- any other value, or no size at all — width 128 with the image's natural aspect ratio

If the account has no avatar set — or its `profile_image` points at an external host — a default avatar is served instead. Avatar responses always use a short cache lifetime (`Cache-Control: public,max-age=600`) so that avatar changes propagate quickly.

```bash
# 64x64 avatar for the @steemit account
curl -o avatar.png https://steemitimages.com/u/steemit/avatar/small

# 128px-wide avatar with natural aspect ratio
curl -o avatar.png https://steemitimages.com/u/steemit/avatar
```
