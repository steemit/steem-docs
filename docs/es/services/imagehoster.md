---
title: ImageHoster
description: Referencia de uso HTTP del servicio de alojamiento de imágenes, proxy y avatares de Steem.
---

# ImageHoster

ImageHoster es el servicio de imágenes detrás de las aplicaciones Steem. Aloja las imágenes subidas, obtiene y transforma imágenes de fuentes aprobadas a través de un endpoint de proxy, y sirve los avatares de los usuarios. Las imágenes subidas y las servidas mediante proxy las almacena el propio servicio; no se escribe ningún dato de imagen en la blockchain.

**URL base del servicio:** `https://steemitimages.com`

Todos los ejemplos siguientes usan esta URL base.

## Convenciones

- Los endpoints que devuelven JSON responden con `"success": true` en caso de éxito.
- La mayoría de los errores causados por el usuario (entrada incorrecta, archivos ausentes, firmas fallidas) devuelven intencionadamente **HTTP 200** con un cuerpo JSON que describe el error:

  ```json
  {
    "success": false,
    "error": {
      "name": "ErrorCode",
      "message": "Human-readable message"
    }
  }
  ```

- Los endpoints que devuelven imágenes responden con los bytes crudos de la imagen y un `Content-Type` `image/*`.
- Los formatos de imagen aceptados son **JPEG, PNG, GIF y WebP**.

## Subir una imagen

```
POST /:username/:signature
```

Sube una imagen y devuelve su URL canónica.

- Envíe la solicitud como `multipart/form-data`; el servicio lee la **primera parte de archivo** que encuentre en el formulario (el nombre del campo es indiferente).
- `:username` es la cuenta Steem que sube la imagen.
- `:signature` es una firma sobre los datos de la imagen — ver [Firma de las subidas](#signing-uploads).
- Se requiere una cabecera `Content-Length` (`curl` la envía automáticamente).

```bash
curl -sS -F "file=@photo.jpg" \
  "https://steemitimages.com/<username>/<hex-signature>"
```

Respuesta de éxito:

```json
{
  "success": true,
  "url": "https://cdn.steemitimages.com/<DKEY>/<filename>"
}
```

La `url` devuelta es la ubicación canónica de la imagen almacenada. Las subidas no deben superar el tamaño máximo de imagen configurado en el servicio (se tolera un pequeño margen por encima para el encapsulado multipart), y los nombres de archivo se depuran en el servidor.

Las respuestas de error usan el contrato JSON anterior. Nombres de error comunes:

| Error | Significado |
| --- | --- |
| `BadRequest` | Solicitud multipart malformada, cabeceras ausentes o no válidas, nombre de archivo no válido |
| `LengthRequired` | Falta la cabecera `Content-Length` |
| `PayloadTooLarge` | La imagen supera el tamaño máximo permitido |
| `FileMissing` | No hay parte de archivo en el formulario multipart |
| `InvalidImage` | El archivo no es un tipo de imagen admitido |
| `InvalidSignature` | La verificación de la firma falló |
| `NoSuchAccount` | No se encontró la cuenta Steem |
| `Deplorable` | La reputación de la cuenta está por debajo del umbral requerido |
| `Blacklisted` | La cuenta está en la lista negra |
| `QoutaExceeded` | Se superó el límite de frecuencia de subidas |

Por ejemplo, subir con una cuenta desconocida devuelve:

```json
{
  "success": false,
  "error": {
    "name": "NoSuchAccount",
    "message": "failed to get account: account not found: [<username>]"
  }
}
```

## Firma de las subidas

La firma de la subida cubre los datos de la imagen:

1. Concatene la cadena ASCII `ImageSigningChallenge` con los bytes crudos de la imagen.
2. Tome el hash SHA-256 del resultado.
3. Firme el hash con una clave privada autorizada en la cuenta que sube (una clave de la autoridad posting o active de la cuenta).
4. Codifique en hexadecimal la firma recuperable resultante — este es el segmento de ruta `:signature`.

Ejemplo con `dsteem` en Node.js:

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

## Obtener una imagen subida

```
GET /:hash
GET /:hash/:filename
```

Descarga una imagen subida previamente por su clave (`:hash` es la clave de la respuesta de subida). El segmento `:filename` es opcional y solo ayuda a la legibilidad — la cabecera `Content-Type` siempre refleja el tipo real de la imagen.

```bash
curl -O https://steemitimages.com/DQmZi174Xz96UrRVBMNRHb6A2FfU3z1HRPwPPQCgSMgdiUT/test.jpg
```

Las respuestas llevan `Cache-Control: public,max-age=29030400,immutable` — el contenido de una imagen bajo una clave dada nunca cambia, por lo que clientes y CDN pueden almacenarlo en caché de forma agresiva.

## Proxear y transformar una imagen

```
GET /p/:url
```

Descarga una imagen desde una URL de origen, opcionalmente la transforma, guarda el resultado en caché y lo sirve. `:url` es la URL de origen absoluta (HTTP/HTTPS), **codificada en Base58**.

Parámetros de consulta opcionales:

| Parámetro | Valores | Comportamiento |
| --- | --- | --- |
| `width` | entero positivo | Redimensiona a este ancho; la altura se deduce para conservar la proporción cuando `height` no se indica |
| `height` | entero positivo | Redimensiona a esta altura; el ancho se deduce para conservar la proporción cuando `width` no se indica |
| `mode` | `cover` (predeterminado) | Rellena el rectángulo solicitado, recortando el exceso |
| | `fit` | Encaja dentro del rectángulo solicitado, solo reduciendo |
| `format` | `match` (predeterminado) | Conserva el formato de entrada |
| | `jpeg`, `png`, `webp` | Convierte al formato indicado |

```bash
# Base58-encode the source URL, then request a 200px-wide PNG copy:
curl -o out.png "https://steemitimages.com/p/<base58-url>?width=200&format=png"
```

Caché: una transformación servida desde la caché lleva `Cache-Control: public,max-age=29030400,immutable`; la primera obtención de una transformación lleva `Cache-Control: public,max-age=600`.

**GIF animados:** un GIF solo se transmite byte a byte cuando se solicita sin `width`/`height` (con `mode=fit` y conservando el formato de entrada). Cualquier solicitud con dimensiones hace pasar la imagen por el pipeline de transformación, lo que reduce un GIF animado a su primer fotograma estático. Para conservar la animación, solicite el GIF sin parámetros de tamaño.

**Política de acceso:** las obtenciones salientes del proxy están restringidas — solo se aceptan URL de origen HTTP/HTTPS, se rechazan las direcciones de red privadas e internas, y los hosts de destino están limitados por la política de lista de permitidos del operador. Una solicitud cuyo host de destino no esté permitido falla con:

```json
{
  "success": false,
  "error": {
    "name": "TargetHostNotAllowed",
    "message": "target URL host is not allowed"
  }
}
```

Los demás nombres de error de este endpoint incluyen `InvalidProxyUrl` (fallo de decodificación Base58 o de análisis de la URL), `InvalidImage` (tipo de contenido upstream no admitido), `PayloadTooLarge` (imagen upstream demasiado grande) y `NotFound` (la URL apunta a una clave de subida que no existe).

## Avatares de usuario

```
GET /u/:username/avatar
GET /u/:username/avatar/:size
```

Sirve el avatar de una cuenta Steem, tomado de los metadatos de perfil on-chain de la cuenta y servido a través del mismo pipeline de proxy/transformación.

Tamaños:

- `small` — 64×64
- `medium` — 128×128
- `large` — 512×512
- cualquier otro valor, o ningún tamaño — ancho 128 con la proporción natural de la imagen

Si la cuenta no tiene avatar — o su `profile_image` apunta a un host externo — se sirve un avatar por defecto en su lugar. Las respuestas de avatar usan siempre un tiempo de caché corto (`Cache-Control: public,max-age=600`) para que los cambios de avatar se propaguen rápidamente.

```bash
# 64x64 avatar for the @steemit account
curl -o avatar.png https://steemitimages.com/u/steemit/avatar/small

# 128px-wide avatar with natural aspect ratio
curl -o avatar.png https://steemitimages.com/u/steemit/avatar
```
