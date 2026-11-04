---
title: Steem DAO
description: Das Steem DAO — die On-Chain-Schatzkammer und die Vorschlagsfinanzierung hinter dem Steem Proposal System.
---

# Steem DAO

Das Steem DAO ist der On-Chain-Finanzierungsmechanismus hinter dem **Steem Proposal System (SPS, „Steem-Vorschlagssystem“)**, eingeführt mit dem Hardfork 21 im August 2019. Es besteht aus einem Schatzkammer-Konto, `@steem.dao`, und einer Reihe von **Vorschlägen (proposal)** — Finanzierungsanfragen, die in der Blockchain gespeichert, von Stakeholdern mit ihrem Stake abgestimmt und täglich in STEEM-Dollar (SBD) aus der Schatzkammer ausgezahlt werden.

Vorschläge sind der Weg, mit dem die Chain Entwicklungs- und Infrastrukturarbeit finanziert: Jeder kann einen erstellen, der Stake bestimmt, wie viel Unterstützung er hat, und die Schatzkammer bezahlt jene Vorschläge, welche die Stakeholder hoch genug einstufen.

## Wie es funktioniert

- **Erstellung** — eine `create_proposal`-Operation speichert einen Vorschlag in der Chain. Ein Vorschlag hat einen Ersteller (creator), ein **Empfänger**-Konto (receiver) (das die Auszahlungen erhält), ein Start- und ein Enddatum, eine tägliche Vergütung in SBD sowie ein subject mit einem Permlink (permanenter Link), der auf den Diskussionsbeitrag verweist, der ihn beschreibt.
- **Abstimmung** — Konten stimmen per `update_proposal_votes`-Operation für (oder gegen) Vorschläge ab. Die Stimmmacht ist wie das Witness-Voting nach Stake gewichtet: Jeder Vorschlag akkumuliert eine `total_votes`-Zahl in Vesting-Anteilen (VESTS).
- **Tägliche Finanzierung** — jeden Tag werden aktive Vorschläge nach `total_votes` gerangiert und in Rangreihenfolge finanziert, bis das Tagesbudget der Vorschläge erschöpft ist. Vorschläge, die hinter dem Budget rangieren, erhalten an diesem Tag nichts.
- **Der Return Proposal** — Vorschlag id 0 („Return Proposal“ von @gtg) ist eine stehende Konvention. Er trägt ein enormes `daily_pay` und wird dauerhaft mit Ja-Stimmen gehalten, damit er den Rest des Tagesbudgets zurück in die Schatzkammer ableitet. In der Praxis wirkt er als Ausgabenobergrenze: Stimmen, die zwischen dem Return Proposal und arbeitenden Vorschlägen verschoben werden, bestimmen, wie viel das DAO tatsächlich pro Tag ausgibt.
- **Entfernung** — der Ersteller eines Vorschlags kann ihn mit einer `remove_proposal`-Operation entfernen, solange er läuft; Stimmen können jederzeit hinzugefügt oder widerrufen werden.

## Schatzkammer

Die Schatzkammer ist das Konto `@steem.dao`. Sie hält das unverbrauchte Budget — einen Anteil der täglichen Inflation plus das, was der Return Proposal zurückführt — und wächst mit der Zeit, wenn Stakeholder dafür stimmen, weniger auszugeben als zufließt. Stand November 2026 hält die Schatzkammer rund **2,59 Millionen SBD**.

Live abfragen:

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.get_accounts","params":[["steem.dao"]],"id":1}'
```

## Vorschläge abfragen

Konkrete Vorschläge per id abrufen:

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.find_proposals","params":[[0,1,2]],"id":1}'
```

Jedes Vorschlagsobjekt trägt `proposal_id`, `creator`, `receiver`, `start_date`, `end_date`, `daily_pay`, `subject`, `permlink` und `total_votes`. Die vollständige Liste, sortiert und nach Status gefiltert, ist über `list_proposals` verfügbar; die einzelnen Stimmen hinter `total_votes` listet `list_proposal_votes` auf.

## Lebenszyklus

Ein Vorschlag wird zu seiner `start_date` **aktiv**, bleibt finanziert, solange er aktiv bleibt und innerhalb des Tagesbudgets rangiert, und wird zu seiner `end_date` **abgelaufen**. Die frühesten Vorschläge stammen aus der Einführung des Systems am 27. August 2019 — Vorschlag id 0, der Return Proposal, läuft noch mit einem Enddatum am 31. Dezember 2029.

## API-Referenz

| API | Zweck |
|---|---|
| [condenser_api.find_proposals](/api/condenser_api/find_proposals.html) | Vorschläge per id abrufen |
| [condenser_api.list_proposals](/api/condenser_api/list_proposals.html) | Vorschläge auflisten, sortiert und nach Status gefiltert |
| [condenser_api.list_proposal_votes](/api/condenser_api/list_proposal_votes.html) | Die Stimmen hinter `total_votes` auflisten |
| [database_api.find_proposals](/api/database_api/find_proposals.html) | Plugin-native Variante |
| [database_api.list_proposals](/api/database_api/list_proposals.html) | Plugin-native Variante |
| [database_api.list_proposal_votes](/api/database_api/list_proposal_votes.html) | Plugin-native Variante |

Vorschläge zu erstellen, über sie abzustimmen und sie zu entfernen (`create_proposal`, `update_proposal_votes`, `remove_proposal`) sind Broadcast-Operationen — sie benötigen eine signierte Transaktion und gehören daher zu den Broadcast-Workflows der Client-Bibliotheken statt zu einfachen RPC-Aufrufen.
