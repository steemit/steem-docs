---
title: ImageHoster
description: HTTP-Referenz zur Nutzung des Bild-Hosting-, Proxy- und Avatar-Dienstes von Steem.
---

# ImageHoster

ImageHoster ist der Bilddienst hinter den Steem-Anwendungen. Er hostet hochgeladene Bilder, ruft Bilder aus freigegebenen Quellen über einen Proxy-Endpunkt ab und transformiert sie, und liefert die Avatare der Benutzer aus. Hochgeladene und per Proxy ausgelieferte Bilder werden vom Dienst selbst gespeichert — keine Bilddaten werden in die Blockchain geschrieben.

**Basis-URL des Dienstes:** `https://steemitimages.com`

Alle folgenden Beispiele verwenden diese Basis-URL.

## Konventionen

- Endpunkte, die JSON zurückgeben, antworten bei Erfolg mit `"success": true`.
- Die meisten benutzerverursachten Fehler (fehlerhafte Eingabe, fehlende Dateien, gescheiterte Signaturen) geben absichtlich **HTTP 200** mit einem JSON-Körper zurück, der den Fehler beschreibt:

  ```json
  {
    "success": false,
    "error": {
      "name": "ErrorCode",
      "message": "Human-readable message"
    }
  }
  ```

- Endpunkte, die Bilder zurückgeben, antworten mit den rohen Bildbytes und einem `Content-Type` `image/*`.
- Akzeptierte Bildformate sind **JPEG, PNG, GIF und WebP**.

## Bild hochladen

```
POST /:username/:signature
```

Lädt ein Bild hoch und gibt seine kanonische URL zurück.

- Senden Sie die Anfrage als `multipart/form-data`; der Dienst liest den **ersten Dateiteil**, der im Formular gefunden wird (der Feldname ist beliebig).
- `:username` ist das Steem-Konto, das das Bild hochlädt.
- `:signature` ist eine Signatur über die Bilddaten — siehe [Uploads signieren](#signing-uploads).
- Ein `Content-Length`-Header ist erforderlich (`curl` sendet ihn automatisch).

```bash
curl -sS -F "file=@photo.jpg" \
  "https://steemitimages.com/<username>/<hex-signature>"
```

Erfolgsantwort:

```json
{
  "success": true,
  "url": "https://cdn.steemitimages.com/<DKEY>/<filename>"
}
```

Die zurückgegebene `url` ist der kanonische Speicherort des gespeicherten Bildes. Uploads dürfen die konfigurierte maximale Bildgröße des Dienstes nicht überschreiten (ein kleiner Zuschlag darüber für die multipart-Einfassung wird akzeptiert), und Dateinamen werden serverseitig bereinigt.

Fehlerantworten verwenden den obigen JSON-Vertrag. Häufige Fehlernamen:

| Fehler | Bedeutung |
| --- | --- |
| `BadRequest` | Fehlerhafte multipart-Anfrage, fehlende oder ungültige Header, ungültiger Dateiname |
| `LengthRequired` | Fehlender `Content-Length`-Header |
| `PayloadTooLarge` | Bild überschreitet die maximal erlaubte Größe |
| `FileMissing` | Kein Dateiteil im multipart-Formular |
| `InvalidImage` | Datei ist kein unterstützter Bildtyp |
| `InvalidSignature` | Signaturprüfung fehlgeschlagen |
| `NoSuchAccount` | Steem-Konto nicht gefunden |
| `Deplorable` | Die Reputation des Kontos liegt unter der erforderlichen Schwelle |
| `Blacklisted` | Konto steht auf der schwarzen Liste |
| `QoutaExceeded` | Upload-Ratenlimit überschritten |

Eine Upload mit unbekanntem Konto gibt zum Beispiel zurück:

```json
{
  "success": false,
  "error": {
    "name": "NoSuchAccount",
    "message": "failed to get account: account not found: [<username>]"
  }
}
```

## Uploads signieren

Die Upload-Signatur umfasst die Bilddaten:

1. Verketten Sie die ASCII-Zeichenkette `ImageSigningChallenge` mit den rohen Bildbytes.
2. Bilden Sie den SHA-256-Hash des Ergebnisses.
3. Signieren Sie den Hash mit einem privaten Schlüssel, der auf dem hochladenden Konto autorisiert ist (ein Schlüssel aus der Posting- oder Active-Authority des Kontos).
4. Kodieren Sie die resultierende wiederherstellbare Signatur hexadezimal — dies ist das Pfadsegment `:signature`.

Beispiel mit `dsteem` in Node.js:

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

## Ein hochgeladenes Bild abrufen

```
GET /:hash
GET /:hash/:filename
```

Lädt ein zuvor hochgeladenes Bild über seinen Schlüssel herunter (`:hash` ist der Schlüssel aus der Upload-Antwort). Das Segment `:filename` ist optional und dient nur der Lesbarkeit — der `Content-Type`-Header spiegelt stets den tatsächlichen Bildtyp wider.

```bash
curl -O https://steemitimages.com/DQmZi174Xz96UrRVBMNRHb6A2FfU3z1HRPwPPQCgSMgdiUT/test.jpg
```

Antworten tragen `Cache-Control: public,max-age=29030400,immutable` — der Bildinhalt unter einem gegebenen Schlüssel ändert sich nie, daher dürfen Clients und CDNs ihn aggressiv cachen.

## Bilder proxyen und transformieren

```
GET /p/:url
```

Lädt ein Bild von einer Quell-URL herunter, transformiert es optional, cachet das Ergebnis und liefert es aus. `:url` ist die absolute Quell-URL (HTTP/HTTPS), **Base58-kodiert**.

Optionale Abfrageparameter:

| Parameter | Werte | Verhalten |
| --- | --- | --- |
| `width` | positive Ganzzahl | Auf diese Breite skalieren; die Höhe wird abgeleitet, um das Seitenverhältnis zu bewahren, wenn `height` nicht angegeben ist |
| `height` | positive Ganzzahl | Auf diese Höhe skalieren; die Breite wird abgeleitet, um das Seitenverhältnis zu bewahren, wenn `width` nicht angegeben ist |
| `mode` | `cover` (Standard) | Füllt das angeforderte Rechteck und schneidet den Überstand ab |
| | `fit` | Passt sich in das angeforderte Rechteck ein, nur verkleinernd |
| `format` | `match` (Standard) | Behält das Eingabeformat bei |
| | `jpeg`, `png`, `webp` | Konvertiert in das angegebene Format |

```bash
# Base58-kodieren Sie die Quell-URL und fordern Sie dann eine 200 Pixel breite PNG-Kopie an:
curl -o out.png "https://steemitimages.com/p/<base58-url>?width=200&format=png"
```

Caching: Eine aus dem Cache servierte Transformation trägt `Cache-Control: public,max-age=29030400,immutable`; der erste Abruf einer Transformation trägt `Cache-Control: public,max-age=600`.

**Animierte GIFs:** Ein GIF wird nur dann byte für byte durchgereicht, wenn es ohne `width`/`height` angefordert wird (mit `mode=fit` und beibehaltenem Eingabeformat). Jede Anfrage mit Abmessungen führt das Bild durch die Transformations-Pipeline, was ein animiertes GIF auf seinen statischen ersten Frame reduziert. Um die Animation zu erhalten, fordern Sie das GIF ohne Größenparameter an.

**Zugriffsrichtlinie:** Ausgehende Proxy-Abrufe sind eingeschränkt — nur HTTP/HTTPS-Quell-URLs werden akzeptiert, private und interne Netzwerkadressen werden abgelehnt, und Ziel-Hosts sind durch die Allowlist-Richtlinie des Betreibers begrenzt. Eine Anfrage, deren Ziel-Host nicht erlaubt ist, schlägt fehl mit:

```json
{
  "success": false,
  "error": {
    "name": "TargetHostNotAllowed",
    "message": "target URL host is not allowed"
  }
}
```

Weitere Fehlernamen dieses Endpunkts sind `InvalidProxyUrl` (Base58-Dekodierung oder URL-Analyse fehlgeschlagen), `InvalidImage` (nicht unterstützter Upstream-Inhaltstyp), `PayloadTooLarge` (Upstream-Bild zu groß) und `NotFound` (die URL zeigt auf einen Upload-Schlüssel, der nicht existiert).

## Benutzer-Avatare

```
GET /u/:username/avatar
GET /u/:username/avatar/:size
```

Liefert den Avatar eines Steem-Kontos aus, der aus den On-Chain-Profilmetadaten des Kontos stammt und durch dieselbe Proxy-/Transformationspipeline ausgeliefert wird.

Größen:

- `small` — 64×64
- `medium` — 128×128
- `large` — 512×512
- jeder andere Wert oder gar keine Größe — Breite 128 mit dem natürlichen Seitenverhältnis des Bildes

Wenn das Konto keinen Avatar gesetzt hat — oder dessen `profile_image` auf einen externen Host zeigt — wird stattdessen ein Standard-Avatar ausgeliefert. Avatar-Antworten verwenden immer eine kurze Cache-Lebensdauer (`Cache-Control: public,max-age=600`), damit Avatar-Änderungen sich schnell verbreiten.

```bash
# 64x64-Avatar für das Konto @steemit
curl -o avatar.png https://steemitimages.com/u/steemit/avatar/small

# 128 Pixel breiter Avatar mit natürlichem Seitenverhältnis
curl -o avatar.png https://steemitimages.com/u/steemit/avatar
```
