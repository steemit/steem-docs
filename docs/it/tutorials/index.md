---
title: Tutorial
description: Tutorial pratici ed esempi di utilizzo per le librerie client ufficiali di Steem — steem-js per JavaScript/TypeScript e steemgosdk per Go.
---

# Tutorial

Questa sezione raccoglie esempi di utilizzo pratici per le due librerie client ufficiali di Steem (client library). Ogni esempio è stato migrato dalla documentazione delle librerie stesse, e le demo sono eseguibili contro un nodo pubblico (node) come `https://api.steemit.com`.

## Le librerie

| Libreria | Linguaggio | Pacchetto / modulo | Repository |
|---------|----------|------------------|------------|
| steem-js | JavaScript / TypeScript | pacchetto npm `@steemit/steem-js` 1.2.4 | [steemit/steem-js](https://github.com/steemit/steem-js) |
| steemgosdk | Go | modulo Go `github.com/steemit/steemgosdk` | [steemit/steemgosdk](https://github.com/steemit/steemgosdk) |

Entrambe le librerie parlano la stessa API JSON-RPC documentata, metodo per metodo, dal [Riferimento API](/it/api/) generato. Usa i tutorial per imparare i pattern lato client; usa il Riferimento API per i dettagli «on the wire» di ogni metodo.

## Pagine steem-js

- [Avvio rapido](/it/tutorials/steem-js/) - installazione, uso nel browser, configurazione (`config.set`, `api.setUrl`, `setOptions`, più istanze dell'API), panoramica di JSON-RPC, routing delle API, esempi d'uso end-to-end, supporto TypeScript e gestione degli errori.
- [Leggere i dati della catena](/it/tutorials/steem-js/read-api.html) - tutti gli helper di lettura: tag, blog e discussioni, blocchi (block), proprietà globali, account, mercato, voti, contenuti, witness, oltre agli helper login/follow e alle utility offline di autenticazione, formattazione e utils.
- [Operazioni di broadcast](/it/tutorials/steem-js/broadcast.html) - il catalogo completo delle operazioni `steem.broadcast`, i pattern promise/callback, il multisig e la serializzazione binaria delle transazioni (transaction).
- [Chiamate firmate e verifica delle firme](/it/tutorials/steem-js/signed-calls.html) - le richieste `signedCall` autenticate e il toolkit di verifica delle firme, con le guide di esempio complete.
- [Migrazione dei test RPC auth](/it/tutorials/steem-js/rpc-auth-migration.html) - come la suite di test `rpc-auth` è stata migrata in steem-js.

## Pagine steemgosdk

- [Avvio rapido](/it/tutorials/steemgosdk/) - configurazione del client, esempi di API di lettura della catena, esempi di generazione delle chiavi per l'autenticazione ed esempi di firma di URI Steem.
- [Operazioni di broadcast](/it/tutorials/steemgosdk/broadcast.html) - voti, trasferimenti, commenti, opzioni dei commenti con beneficiari (beneficiary), transazioni multi-operazione e broadcast custom_json, oltre a esempi completi end-to-end.
- [SignedCall API](/it/tutorials/steemgosdk/signed-call.html) - chiamate JSON-RPC autenticate da Go, interoperabili con le chiamate firmate di steem-js.

## Note

- I tutorial sono per ora solo in inglese, come la sezione Guides.
- Gli esempi usano chiavi di test note, presenti nella documentazione delle librerie; non usarle mai in produzione — genera le tue chiavi come mostrato negli esempi di autenticazione.
