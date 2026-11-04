---
title: Steem DAO
description: Lo Steem DAO — la tesoreria on-chain e il finanziamento delle proposte dietro lo Steem Proposal System.
---

# Steem DAO

Lo Steem DAO è il meccanismo di finanziamento on-chain dietro lo **Steem Proposal System (SPS, «sistema di proposte Steem»)**, introdotto dall'Hardfork 21 nell'agosto 2019. È costituito da un account di tesoreria, `@steem.dao`, e da un insieme di **proposte (proposal)** — richieste di finanziamento registrate nella blockchain, votate dagli stakeholder in base al loro stake e pagate ogni giorno in dollari STEEM (SBD) dalla tesoreria.

Le proposte sono il modo in cui la catena finanzia il lavoro di sviluppo e delle infrastrutture: chiunque può crearne una, lo stake determina quanto sostegno ha, e la tesoreria paga le proposte che gli stakeholder classificano abbastanza in alto.

## Come funziona

- **Creazione** — un'operazione `create_proposal` registra la proposta sulla catena. Una proposta ha un creatore (creator), un account **destinatario (receiver)** (colui che incassa i pagamenti), date di inizio e fine, un compenso giornaliero denominato in SBD e un subject con un permlink (link permanente) che punta al post di discussione che la descrive.
- **Votazione** — gli account votano a favore (o contro) le proposte con un'operazione `update_proposal_votes`. Il potere di voto è ponderato per stake, come la votazione dei witness: ogni proposta accumula una cifra `total_votes` in quote di vesting (VESTS).
- **Finanziamento giornaliero** — ogni giorno le proposte attive vengono classificate per `total_votes` e finanziate in ordine di classifica fino a esaurimento del budget giornaliero delle proposte. Le proposte classificate oltre il budget non ricevono nulla quel giorno.
- **Il Return Proposal** — la proposta con id 0 («Return Proposal» di @gtg) è una convenzione permanente. Porta un enorme `daily_pay` ed è tenuta con voti favorevoli così da drenare nella tesoreria quanto resta del budget giornaliero. In pratica funge da tetto di spesa: i voti spostati tra il Return Proposal e le proposte in attività decidono quanto il DAO spende davvero ogni giorno.
- **Rimozione** — il creatore di una proposta può rimuoverla con un'operazione `remove_proposal` mentre è in corso; i voti possono essere aggiunti o revocati in qualsiasi momento.

## Tesoreria

La tesoreria è l'account `@steem.dao`. Contiene il budget non speso — una quota dell'inflazione giornaliera più ciò che il Return Proposal restituisce — e cresce nel tempo quando gli stakeholder votano per spendere meno di quanto matura. Saldo attuale della tesoreria: <DaoTreasuryBalance fallback="circa 2,59 milioni di SBD (novembre 2026)" />.

Consultarla in tempo reale:

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.get_accounts","params":[["steem.dao"]],"id":1}'
```

## Consultare le proposte

Recuperare proposte specifiche per id:

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.find_proposals","params":[[0,1,2]],"id":1}'
```

Ogni oggetto proposta contiene `proposal_id`, `creator`, `receiver`, `start_date`, `end_date`, `daily_pay`, `subject`, `permlink` e `total_votes`. L'elenco completo, ordinato e filtrato per stato, è disponibile tramite `list_proposals`; i singoli voti dietro `total_votes` sono elencati da `list_proposal_votes`.

## Ciclo di vita

Una proposta diventa **attiva** alla sua `start_date`, resta finanziata finché rimane attiva e classificata entro il budget giornaliero e diventa **scaduta** alla sua `end_date`. Le prime proposte risalgono al lancio del sistema del 27 agosto 2019 — la proposta con id 0, il Return Proposal, è ancora in corso con data di fine il 31 dicembre 2029.

## Riferimento API

| API | Scopo |
|---|---|
| [condenser_api.find_proposals](/api/condenser_api/find_proposals.html) | Recuperare proposte per id |
| [condenser_api.list_proposals](/api/condenser_api/list_proposals.html) | Elencare le proposte, ordinate e filtrate per stato |
| [condenser_api.list_proposal_votes](/api/condenser_api/list_proposal_votes.html) | Elencare i voti dietro `total_votes` |
| [database_api.find_proposals](/api/database_api/find_proposals.html) | Variante nativa del plugin |
| [database_api.list_proposals](/api/database_api/list_proposals.html) | Variante nativa del plugin |
| [database_api.list_proposal_votes](/api/database_api/list_proposal_votes.html) | Variante nativa del plugin |

Creare proposte, votarle e rimuoverle (`create_proposal`, `update_proposal_votes`, `remove_proposal`) sono operazioni di broadcast — richiedono una transazione firmata, quindi appartengono ai flussi di broadcast delle librerie client e non alle semplici chiamate RPC.
