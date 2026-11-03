---
title: Tutorials
description: Praxisnahe Tutorials und Verwendungsbeispiele für die offiziellen Steem-Client-Bibliotheken — steem-js für JavaScript/TypeScript und steemgosdk für Go.
---

# Tutorials

Dieser Abschnitt sammelt praxisnahe Verwendungsbeispiele für die beiden offiziellen Steem-Client-Bibliotheken (client library). Jedes Beispiel wurde aus der Dokumentation der Bibliotheken selbst übernommen, und die Demos lassen sich gegen einen öffentlichen Knoten (node) wie `https://api.steemit.com` ausführen.

## Die Bibliotheken

| Bibliothek | Sprache | Paket / Modul | Repository |
|---------|----------|------------------|------------|
| steem-js | JavaScript / TypeScript | npm-Paket `@steemit/steem-js` 1.2.4 | [steemit/steem-js](https://github.com/steemit/steem-js) |
| steemgosdk | Go | Go-Modul `github.com/steemit/steemgosdk` | [steemit/steemgosdk](https://github.com/steemit/steemgosdk) |

Beide Bibliotheken sprechen dieselbe JSON-RPC-API, die die generierte [API-Referenz](/de/api/) Methode für Methode dokumentiert. Nutzen Sie die Tutorials, um die clientseitigen Muster zu lernen; nutzen Sie die API-Referenz für die On-the-wire-Details jeder Methode.

## steem-js-Seiten

- [Schnellstart](/de/tutorials/steem-js/) - Installation, Browser-Nutzung, Konfiguration (`config.set`, `api.setUrl`, `setOptions`, mehrere API-Instanzen), JSON-RPC-Überblick, API-Routing, End-to-End-Beispiele, TypeScript-Unterstützung und Fehlerbehandlung.
- [Chain-Daten lesen](/de/tutorials/steem-js/read-api.html) - alle Lese-Helper: Tags (tag), Blog und Diskussionen, Blöcke (block), globale Eigenschaften, Konten, Markt, Votes, Inhalte, Witness, dazu die Login-/Follow-Helper und die Offline-Dienstprogramme für Authentifizierung, Formatter und Utils.
- [Broadcast-Operationen](/de/tutorials/steem-js/broadcast.html) - der komplette `steem.broadcast`-Operationskatalog, Promise-/Callback-Muster, Multisig und binäre Transaktionsserialisierung.
- [Signierte Aufrufe und Signaturprüfung](/de/tutorials/steem-js/signed-calls.html) - authentifizierte `signedCall`-Anfragen und das Toolkit zur Signaturprüfung, mit den vollständigen Beispielanleitungen.
- [RPC-Auth-Testmigration](/de/tutorials/steem-js/rpc-auth-migration.html) - wie die `rpc-auth`-Testsuite nach steem-js migriert wurde.

## steemgosdk-Seiten

- [Schnellstart](/de/tutorials/steemgosdk/) - Client-Setup, API-Beispiele zum Lesen der Chain, Auth-Beispiele zur Schlüsselerzeugung und Beispiele zum Signieren von Steem-URIs.
- [Broadcast-Operationen](/de/tutorials/steemgosdk/broadcast.html) - Votes, Transfers, Kommentare, Kommentaroptionen mit Beneficiaries, Multi-Operations-Transaktionen und custom_json-Broadcasts, dazu vollständige End-to-End-Beispiele.
- [SignedCall API](/de/tutorials/steemgosdk/signed-call.html) - authentifizierte JSON-RPC-Aufrufe aus Go, interoperabel mit den signierten Aufrufen von steem-js.

## Hinweise

- Die Tutorials sind derzeit nur auf Englisch, entsprechend dem Guides-Abschnitt.
- Die Beispiele verwenden bekannte Testschlüssel aus der Dokumentation der Bibliotheken; verwenden Sie sie niemals in der Produktion — erzeugen Sie eigene Schlüssel, wie in den Auth-Beispielen gezeigt.
