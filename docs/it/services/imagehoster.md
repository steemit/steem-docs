---
title: ImageHoster
description: Riferimento HTTP per l'uso del servizio di hosting di immagini, proxy e avatar di Steem.
---

# ImageHoster

ImageHoster è il servizio di immagini alla base delle applicazioni Steem. Ospita le immagini caricate, recupera e trasforma le immagini da fonti approvate tramite un endpoint proxy e serve gli avatar degli utenti. Le immagini caricate e quelle gestite tramite proxy vengono archiviate dal servizio stesso — nessun dato immagine viene scritto sulla blockchain.

**URL di base del servizio:** `https://steemitimages.com`

Tutti gli esempi seguenti usano questo URL di base.

## Convenzioni

- Gli endpoint che restituiscono JSON rispondono con `"success": true` in caso di successo.
- La maggior parte degli errori causati dall'utente (input non valido, file mancanti, firme fallite) restituisce intenzionalmente **HTTP 200** con un corpo JSON che descrive l'errore:

  ```json
  {
    "success": false,
    "error": {
      "name": "ErrorCode",
      "message": "Human-readable message"
    }
  }
  ```

- Gli endpoint che restituiscono immagini rispondono con i byte grezzi dell'immagine e un `Content-Type` `image/*`.
- I formati di immagine accettati sono **JPEG, PNG, GIF e WebP**.

## Caricare un'immagine

```
POST /:username/:signature
```

Carica un'immagine e restituisce il suo URL canonico.

- Inviare la richiesta come `multipart/form-data`; il servizio legge la **prima parte file** trovata nel form (qualsiasi nome di campo va bene).
- `:username` è l'account Steem che carica l'immagine.
- `:signature` è una firma sui dati dell'immagine — vedere [Firma degli upload](#signing-uploads).
- È richiesto un header `Content-Length` (`curl` lo invia automaticamente).

```bash
curl -sS -F "file=@photo.jpg" \
  "https://steemitimages.com/<username>/<hex-signature>"
```

Risposta di successo:

```json
{
  "success": true,
  "url": "https://cdn.steemitimages.com/<DKEY>/<filename>"
}
```

L'`url` restituito è la posizione canonica dell'immagine archiviata. Gli upload non devono superare la dimensione massima dell'immagine configurata nel servizio (è tollerata una piccola variazione al di sopra per l'incapsulamento multipart), e i nomi dei file vengono sanificati lato server.

Le risposte di errore usano il contratto JSON sopra. Nomi di errore comuni:

| Errore | Significato |
| --- | --- |
| `BadRequest` | Richiesta multipart malformata, header mancanti o non validi, nome file non valido |
| `LengthRequired` | Header `Content-Length` mancante |
| `PayloadTooLarge` | L'immagine supera la dimensione massima consentita |
| `FileMissing` | Nessuna parte file nel form multipart |
| `InvalidImage` | Il file non è un tipo di immagine supportato |
| `InvalidSignature` | Verifica della firma non riuscita |
| `NoSuchAccount` | Account Steem non trovato |
| `Deplorable` | La reputazione dell'account è sotto la soglia richiesta |
| `Blacklisted` | L'account è nella lista nera |
| `QoutaExceeded` | Superato il limite di frequenza degli upload |

Per esempio, caricare con un account sconosciuto restituisce:

```json
{
  "success": false,
  "error": {
    "name": "NoSuchAccount",
    "message": "failed to get account: account not found: [<username>]"
  }
}
```

## Firma degli upload

La firma dell'upload copre i dati dell'immagine:

1. Concatenare la stringa ASCII `ImageSigningChallenge` con i byte grezzi dell'immagine.
2. Calcolare l'hash SHA-256 del risultato.
3. Firmare l'hash con una chiave privata autorizzata sull'account che carica (una chiave dall'autorità posting o active dell'account).
4. Codificare in esadecimale la firma recuperabile risultante — questo è il segmento di percorso `:signature`.

Esempio con `dsteem` in Node.js:

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

## Recuperare un'immagine caricata

```
GET /:hash
GET /:hash/:filename
```

Scarica un'immagine caricata in precedenza tramite la sua chiave (`:hash` è la chiave della risposta di upload). Il segmento `:filename` è opzionale e serve solo alla leggibilità — l'header `Content-Type` riflette sempre il tipo effettivo dell'immagine.

```bash
curl -O https://steemitimages.com/DQmZi174Xz96UrRVBMNRHb6A2FfU3z1HRPwPPQCgSMgdiUT/test.jpg
```

Le risposte portano `Cache-Control: public,max-age=29030400,immutable` — il contenuto di un'immagine sotto una data chiave non cambia mai, quindi client e CDN possono memorizzarlo nella cache in modo aggressivo.

## Proxy e trasformazione di un'immagine

```
GET /p/:url
```

Scarica un'immagine da un URL di origine, la trasforma facoltativamente, archivia il risultato nella cache e lo serve. `:url` è l'URL di origine assoluto (HTTP/HTTPS), **codificato in Base58**.

Parametri di query facoltativi:

| Parametro | Valori | Comportamento |
| --- | --- | --- |
| `width` | intero positivo | Ridimensiona a questa larghezza; l'altezza viene ricavata per preservare le proporzioni quando `height` non è fornito |
| `height` | intero positivo | Ridimensiona a questa altezza; la larghezza viene ricavata per preservare le proporzioni quando `width` non è fornito |
| `mode` | `cover` (predefinito) | Riempie il rettangolo richiesto, ritagliando l'eccesso |
| | `fit` | Sta dentro il rettangolo richiesto, solo riducendo |
| `format` | `match` (predefinito) | Mantiene il formato di input |
| | `jpeg`, `png`, `webp` | Converte nel formato indicato |

```bash
# Codificate in Base58 l'URL di origine, quindi richiedete una copia PNG larga 200 px:
curl -o out.png "https://steemitimages.com/p/<base58-url>?width=200&format=png"
```

Caching: una trasformazione servita dalla cache porta `Cache-Control: public,max-age=29030400,immutable`; il primo recupero di una trasformazione porta `Cache-Control: public,max-age=600`.

**GIF animate:** una GIF viene trasmessa byte per byte solo se richiesta senza `width`/`height` (con `mode=fit` e formato di input mantenuto). Qualsiasi richiesta con dimensioni fa passare l'immagine attraverso la pipeline di trasformazione, che riduce una GIF animata al suo primo fotogramma statico. Per preservare l'animazione, richiedete la GIF senza parametri di dimensione.

**Politica di accesso:** i recuperi proxy in uscita sono limitati — vengono accettati solo URL di origine HTTP/HTTPS, gli indirizzi di rete privati e interni vengono rifiutati e gli host di destinazione sono limitati dalla politica di allowlist dell'operatore. Una richiesta il cui host di destinazione non è consentito fallisce con:

```json
{
  "success": false,
  "error": {
    "name": "TargetHostNotAllowed",
    "message": "target URL host is not allowed"
  }
}
```

Gli altri nomi di errore di questo endpoint includono `InvalidProxyUrl` (decodifica Base58 o analisi dell'URL non riuscita), `InvalidImage` (tipo di contenuto upstream non supportato), `PayloadTooLarge` (immagine upstream troppo grande) e `NotFound` (l'URL punta a una chiave di upload che non esiste).

## Avatar degli utenti

```
GET /u/:username/avatar
GET /u/:username/avatar/:size
```

Serve l'avatar di un account Steem, ricavato dai metadati del profilo on-chain dell'account e servito attraverso la stessa pipeline proxy/trasformazione.

Dimensioni:

- `small` — 64×64
- `medium` — 128×128
- `large` — 512×512
- qualsiasi altro valore, oppure nessuna dimensione — larghezza 128 con le proporzioni naturali dell'immagine

Se l'account non ha un avatar impostato — o il suo `profile_image` punta a un host esterno — viene servito un avatar predefinito. Le risposte degli avatar usano sempre una durata di cache breve (`Cache-Control: public,max-age=600`) così che le modifiche all'avatar si propaghino rapidamente.

```bash
# Avatar 64x64 per l'account @steemit
curl -o avatar.png https://steemitimages.com/u/steemit/avatar/small

# Avatar largo 128 px con proporzioni naturali
curl -o avatar.png https://steemitimages.com/u/steemit/avatar
```
