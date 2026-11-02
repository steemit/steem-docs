---
title: ImageHoster
description: Référence d'utilisation HTTP du service d'hébergement d'images, de proxy et d'avatars de Steem.
---

# ImageHoster

ImageHoster est le service d'images derrière les applications Steem. Il héberge les images téléversées, récupère et transforme les images provenant de sources approuvées via un point de terminaison proxy, et sert les avatars des utilisateurs. Les images téléversées et servies par proxy sont stockées par le service lui-même — aucune donnée d'image n'est écrite sur la blockchain.

**URL de base du service :** `https://steemitimages.com`

Tous les exemples ci-dessous utilisent cette URL de base.

## Conventions

- Les points de terminaison qui renvoient du JSON répondent `"success": true` en cas de succès.
- La plupart des erreurs causées par l'utilisateur (entrée invalide, fichiers manquants, signature échouée) renvoient intentionnellement **HTTP 200** avec un corps JSON décrivant l'erreur :

  ```json
  {
    "success": false,
    "error": {
      "name": "ErrorCode",
      "message": "Human-readable message"
    }
  }
  ```

- Les points de terminaison qui renvoient des images répondent avec les octets bruts de l'image et un `Content-Type` `image/*`.
- Les formats d'images acceptés sont **JPEG, PNG, GIF et WebP**.

## Téléverser une image

```
POST /:username/:signature
```

Téléverse une image et renvoie son URL canonique.

- Envoyez la requête en `multipart/form-data` ; le service lit la **première partie fichier** trouvée dans le formulaire (n'importe quel nom de champ convient).
- `:username` est le compte Steem qui téléverse l'image.
- `:signature` est une signature sur les données de l'image — voir [Signature des téléversements](#signing-uploads).
- Un en-tête `Content-Length` est requis (`curl` l'envoie automatiquement).

```bash
curl -sS -F "file=@photo.jpg" \
  "https://steemitimages.com/<username>/<hex-signature>"
```

Réponse de succès :

```json
{
  "success": true,
  "url": "https://cdn.steemitimages.com/<DKEY>/<filename>"
}
```

L'`url` renvoyée est l'emplacement canonique de l'image stockée. Les téléversements ne doivent pas dépasser la taille maximale d'image configurée du service (une petite marge au-dessus, pour l'encapsulation multipart, est tolérée), et les noms de fichiers sont assainis côté serveur.

Les réponses d'erreur suivent le contrat JSON ci-dessus. Noms d'erreur courants :

| Erreur | Signification |
| --- | --- |
| `BadRequest` | Requête multipart mal formée, en-têtes manquants ou invalides, nom de fichier invalide |
| `LengthRequired` | En-tête `Content-Length` manquant |
| `PayloadTooLarge` | L'image dépasse la taille maximale autorisée |
| `FileMissing` | Aucune partie fichier dans le formulaire multipart |
| `InvalidImage` | Le fichier n'est pas un type d'image pris en charge |
| `InvalidSignature` | La vérification de la signature a échoué |
| `NoSuchAccount` | Compte Steem introuvable |
| `Deplorable` | La réputation du compte est en dessous du seuil requis |
| `Blacklisted` | Le compte est sur liste noire |
| `QoutaExceeded` | Limite de débit des téléversements dépassée |

Par exemple, téléverser avec un compte inconnu renvoie :

```json
{
  "success": false,
  "error": {
    "name": "NoSuchAccount",
    "message": "failed to get account: account not found: [<username>]"
  }
}
```

## Signer les téléversements

La signature de téléversement couvre les données de l'image :

1. Concaténez la chaîne ASCII `ImageSigningChallenge` avec les octets bruts de l'image.
2. Calculez le hachage SHA-256 du résultat.
3. Signez le hachage avec une clé privée autorisée sur le compte qui téléverse (une clé issue de l'autorité posting ou active du compte).
4. Encodez en hexadécimal la signature récupérable obtenue — c'est le segment de chemin `:signature`.

Exemple utilisant `dsteem` dans Node.js :

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

## Récupérer une image téléversée

```
GET /:hash
GET /:hash/:filename
```

Télécharge une image précédemment téléversée à partir de sa clé (`:hash` est la clé de la réponse de téléversement). Le segment `:filename` est facultatif et ne sert qu'à la lisibilité — l'en-tête `Content-Type` reflète toujours le type réel de l'image.

```bash
curl -O https://steemitimages.com/DQmZi174Xz96UrRVBMNRHb6A2FfU3z1HRPwPPQCgSMgdiUT/test.jpg
```

Les réponses portent `Cache-Control: public,max-age=29030400,immutable` — le contenu d'une image sous une clé donnée ne change jamais, les clients et les CDN peuvent donc la mettre en cache de manière agressive.

## Proxy et transformation d'une image

```
GET /p/:url
```

Télécharge une image depuis une URL source, la transforme facultativement, met le résultat en cache et le sert. `:url` est l'URL source absolue (HTTP/HTTPS), **encodée en Base58**.

Paramètres de requête facultatifs :

| Paramètre | Valeurs | Comportement |
| --- | --- | --- |
| `width` | entier positif | Redimensionne à cette largeur ; la hauteur est déduite pour préserver le rapport d'aspect lorsque `height` n'est pas fourni |
| `height` | entier positif | Redimensionne à cette hauteur ; la largeur est déduite pour préserver le rapport d'aspect lorsque `width` n'est pas fourni |
| `mode` | `cover` (par défaut) | Remplit le rectangle demandé en rognant le débordement |
| | `fit` | Tient dans le rectangle demandé, en réduisant uniquement |
| `format` | `match` (par défaut) | Conserve le format d'entrée |
| | `jpeg`, `png`, `webp` | Convertit vers le format indiqué |

```bash
# Base58-encode the source URL, then request a 200px-wide PNG copy:
curl -o out.png "https://steemitimages.com/p/<base58-url>?width=200&format=png"
```

Mise en cache : une transformation servie depuis le cache porte `Cache-Control: public,max-age=29030400,immutable` ; la première récupération d'une transformation porte `Cache-Control: public,max-age=600`.

**GIF animés :** un GIF n'est transmis octet par octet que s'il est demandé sans `width`/`height` (avec `mode=fit` et le format d'entrée conservé). Toute demande avec dimensions fait passer l'image par le pipeline de transformation, ce qui réduit un GIF animé à sa première image statique. Pour préserver l'animation, demandez le GIF sans paramètres de taille.

**Politique d'accès :** les récupérations proxy sortantes sont restreintes — seules les URL sources HTTP/HTTPS sont acceptées, les adresses réseau privées et internes sont rejetées, et les hôtes cibles sont limités par la politique de liste d'autorisation de l'opérateur. Une requête dont l'hôte cible n'est pas autorisé échoue avec :

```json
{
  "success": false,
  "error": {
    "name": "TargetHostNotAllowed",
    "message": "target URL host is not allowed"
  }
}
```

Les autres noms d'erreur de ce point de terminaison incluent `InvalidProxyUrl` (échec du décodage Base58 ou de l'analyse de l'URL), `InvalidImage` (type de contenu amont non pris en charge), `PayloadTooLarge` (image amont trop grande) et `NotFound` (l'URL pointe vers une clé de téléversement qui n'existe pas).

## Avatars utilisateur

```
GET /u/:username/avatar
GET /u/:username/avatar/:size
```

Sert l'avatar d'un compte Steem, tiré des métadonnées de profil on-chain du compte et servi via le même pipeline proxy/transformation.

Tailles :

- `small` — 64×64
- `medium` — 128×128
- `large` — 512×512
- toute autre valeur, ou aucune taille — largeur 128 avec le rapport d'aspect naturel de l'image

Si le compte n'a pas d'avatar défini — ou si son `profile_image` pointe vers un hôte externe — un avatar par défaut est servi à la place. Les réponses d'avatar utilisent toujours une durée de cache courte (`Cache-Control: public,max-age=600`) afin que les changements d'avatar se propagent rapidement.

```bash
# 64x64 avatar for the @steemit account
curl -o avatar.png https://steemitimages.com/u/steemit/avatar/small

# 128px-wide avatar with natural aspect ratio
curl -o avatar.png https://steemitimages.com/u/steemit/avatar
```
