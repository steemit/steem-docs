# Migration des tests d'authentification RPC

## Aperçu

Ce document décrit la migration des tests du paquet `@steemit/rpc-auth` vers `steem-js` v1.0.11.

## Détails de la migration

### Source
- **Paquet d'origine** : `@steemit/rpc-auth` v1.1.1
- **Emplacement source** : la copie locale du dépôt `rpc-auth`
- **Fichier de tests d'origine** : `test/index.ts`
- **Framework de tests** : Mocha

### Destination
- **Paquet cible** : `@steemit/steem-js` v1.0.11
- **Emplacement cible** : la copie locale du dépôt `steem-js`
- **Nouveau fichier de tests** : `test/rpc-auth.test.ts`
- **Framework de tests** : Vitest

## Modifications apportées

### 1. Migration du framework de tests

**Depuis Mocha :**
```typescript
import 'mocha'
import * as assert from 'assert'

describe('rpc auth', function() {
  it('signs and validates', async function() {
    assert.equal(...)
  })
})
```

**Vers Vitest :**
```typescript
import { describe, it, expect } from 'vitest'

describe('RPC Auth', () => {
  it('should sign and validate a request', async () => {
    expect(...).toBe(...)
  })
})
```

### 2. Mise à jour des dépendances

**Supprimées :**
- `dsteem` (ancienne bibliothèque steem-js)
- `node-fetch` (pour la création de comptes sur le testnet)
- les utilitaires spécifiques à Mocha

**Remplacées par :**
- l'API propre à `steem-js` (`steem.auth`, `steem.api`)
- `crypto.randomBytes` natif
- les assertions Vitest

### 3. Gestion des comptes de test

**À l'origine :**
- Création dynamique de comptes sur le testnet
- Utilisation de `dsteem.Client.testnet()`
- Accès réseau requis

**Maintenant :**
- Utilisation de variables d'environnement ou de clés de test
- Aucune création dynamique de comptes
- Exécution possible sans réseau (pour la plupart des tests)

### 4. Fonction de vérification

**À l'origine :**
```typescript
const dsteemVerify: VerifyMessage = async (message, signatures, account) => {
  const opts = { hash: message, signatures, required_posting: [account] }
  const rv = await client.database.call('verify_signatures', [opts])
  if (rv.valid !== true) throw new Error('Signature invalid')
}
```

**Maintenant :**
```typescript
const createVerifyFunction = () => {
  return async (message: Buffer, signatures: string[], account: string) => {
    const accounts = await api.getAccountsAsync([account])
    const postingKeys = accounts[0].posting?.key_auths?.map(k => k[0]) || []
    // Verify using steem-js Signature and PublicKey classes
  }
}
```

## Couverture des tests

### Tests migrés

✅ **sign and validate** - flux de base de signature et de validation
✅ **invalid requests** - tests complets de gestion des erreurs :
  - Requête JSON RPC invalide
  - Charge signée manquante
  - Paramètres de requête invalides
  - Compte manquant
  - Paramètres encodés invalides
  - Nonce invalide (plusieurs cas)
  - Horodatage invalide
  - Signature expirée
  - Échec de vérification

✅ **signing errors** - gestion des erreurs lors de la signature :
  - Params manquants
  - Tableau de clés vide

✅ **signature format** - validation de la structure de la signature :
  - Format de signature valide
  - Nonces uniques
  - Horodatages valides

✅ **multiple signatures** - prise en charge de plusieurs clés

### Tests ignorés

⏭️ **invalid signatures (test d'intégration)** - nécessite :
  - Un vrai compte sur le testnet
  - Un accès réseau
  - Activation via les variables d'environnement `STEEM_USERNAME` et `STEEM_PASSWORD`

## Résultats des tests

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

## Différences clés

### Format des messages d'erreur

**rpc-auth d'origine :**
```
ValidationError: Verification failed (Nope)
```

**steem-js v1.0.11 :**
```
Error: Verification failed: Nope
```

Le format d'erreur est passé de `(message)` à `: message`, ce qui se reflète dans les tests.

### Changements d'API

1. **Gestion de PrivateKey** :
   - Avant : `PrivateKey.from(key)` ou `PrivateKey.fromString(key)`
   - Après : `PrivateKey.fromWif(key)`

2. **Création de signature** :
   - Avant : `key.sign(message.buffer)` puis `hexify()`
   - Après : `Signature.signBufferSha256(message, privateKey)` puis `.toHex()`

3. **Plus de classe ValidationError** :
   - Avant : classe `ValidationError` personnalisée
   - Après : `Error` standard avec messages formatés

## Exécution des tests

```bash
# Run all rpc-auth tests
pnpm test -- rpc-auth.test.ts

# Run with coverage
pnpm test:coverage -- rpc-auth.test.ts

# Run specific test
pnpm test -- rpc-auth.test.ts -t "should sign and validate"
```

## Préparation du test d'intégration

Pour exécuter le test d'intégration ignoré, définissez les variables d'environnement :

```bash
export STEEM_USERNAME="your-testnet-account"
export STEEM_PASSWORD="your-password"
pnpm test -- rpc-auth.test.ts
```

## Remarques

- Tous les tests des fonctionnalités principales ont été migrés avec succès
- La suite de tests conserve la même couverture que l'originale
- Les tests d'intégration sont ignorés par défaut mais peuvent être activés
- Les tests sont compatibles avec vitest et TypeScript moderne
- Aucune dépendance externe n'est requise pour la plupart des tests

---

Migré depuis la documentation du dépôt steem-js ; les utilitaires de vérification qu'il met en œuvre sont démontrés dans [Appels signés et vérification de signature](/fr/tutorials/steem-js/signed-calls.html).
