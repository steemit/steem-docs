---
title: Tutoriels
description: Tutoriels pratiques et exemples d'utilisation pour les bibliothèques clientes officielles de Steem — steem-js pour JavaScript/TypeScript et steemgosdk pour Go.
---

# Tutoriels

Cette section rassemble des exemples d'utilisation pratiques pour les deux bibliothèques clientes officielles de Steem (client library). Chaque exemple provient de la documentation des bibliothèques elles-mêmes, et les démonstrations sont exécutables sur un nœud public (node) tel que `https://api.steemit.com`.

## Les bibliothèques

| Bibliothèque | Langage | Paquet / module | Dépôt |
|---------|----------|------------------|------------|
| steem-js | JavaScript / TypeScript | paquet npm `@steemit/steem-js` 1.2.4 | [steemit/steem-js](https://github.com/steemit/steem-js) |
| steemgosdk | Go | module Go `github.com/steemit/steemgosdk` | [steemit/steemgosdk](https://github.com/steemit/steemgosdk) |

Les deux bibliothèques parlent la même API JSON-RPC que documente, méthode par méthode, la [Référence API](/fr/api/) générée. Utilisez les tutoriels pour apprendre les patterns côté client ; utilisez la Référence API pour les détails « on the wire » de chaque méthode.

## Pages steem-js

- [Démarrage rapide](/fr/tutorials/steem-js/) - installation, utilisation dans le navigateur, configuration (`config.set`, `api.setUrl`, `setOptions`, plusieurs instances d'API), aperçu de JSON-RPC, routage des API, exemples d'utilisation de bout en bout, prise en charge de TypeScript et gestion des erreurs.
- [Lire les données de la chaîne](/fr/tutorials/steem-js/read-api.html) - tous les helpers de lecture : tags (tag), blog et discussions, blocs (block), propriétés globales, comptes, marché, votes, contenu, witness, ainsi que les helpers login/follow et les utilitaires hors ligne d'authentification, de formatage et utils.
- [Opérations de diffusion](/fr/tutorials/steem-js/broadcast.html) - le catalogue complet des opérations `steem.broadcast`, les patterns promise/callback, le multisig et la sérialisation binaire des transactions (transaction).
- [Appels signés et vérification de signature](/fr/tutorials/steem-js/signed-calls.html) - les requêtes `signedCall` authentifiées et la boîte à outils de vérification de signature, avec les guides d'exemples complets.
- [Migration des tests RPC auth](/fr/tutorials/steem-js/rpc-auth-migration.html) - comment la suite de tests `rpc-auth` a été migrée dans steem-js.

## Pages steemgosdk

- [Démarrage rapide](/fr/tutorials/steemgosdk/) - configuration du client, exemples d'API de lecture de la chaîne, exemples de génération de clés pour l'authentification et exemples de signature d'URI Steem.
- [Opérations de diffusion](/fr/tutorials/steemgosdk/broadcast.html) - votes, transferts, commentaires, options de commentaire avec bénéficiaires (beneficiary), transactions multi-opérations et diffusions custom_json, plus des exemples complets de bout en bout.
- [SignedCall API](/fr/tutorials/steemgosdk/signed-call.html) - appels JSON-RPC authentifiés depuis Go, interopérables avec les appels signés de steem-js.

## Remarques

- Les tutoriels sont pour l'instant en anglais uniquement, à l'image de la section Guides.
- Les exemples référencent des clés de test bien connues issues de la documentation des bibliothèques ; ne les utilisez jamais en production — générez vos propres clés comme montré dans les exemples d'authentification.
