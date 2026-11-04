---
title: Steem DAO
description: Le Steem DAO — la trésorerie on-chain et le financement des propositions derrière le Steem Proposal System.
---

# Steem DAO

Le Steem DAO est le mécanisme de financement on-chain derrière le **Steem Proposal System (SPS, « système de propositions Steem »)**, introduit par le Hardfork 21 en août 2019. Il se compose d'un compte de trésorerie, `@steem.dao`, et d'un ensemble de **propositions (proposal)** — des demandes de financement stockées dans la blockchain, votées par les parties prenantes au prorata de leur mise (stake), et payées chaque jour en dollars STEEM (SBD) depuis la trésorerie.

Les propositions sont la façon dont la chaîne finance le travail de développement et d'infrastructure : n'importe qui peut en créer une, la mise détermine le niveau de soutien, et la trésorerie paie les propositions que les parties prenantes classent suffisamment haut.

## Fonctionnement

- **Création** — une opération `create_proposal` enregistre la proposition dans la chaîne. Une proposition comporte un créateur (creator), un compte **bénéficiaire (receiver)** (celui qui reçoit les paiements), des dates de début et de fin, une rémunération quotidienne libellée en SBD, ainsi qu'un subject avec un permlink (lien permanent) pointant vers le post de discussion qui la décrit.
- **Vote** — les comptes votent pour (ou contre) les propositions au moyen d'une opération `update_proposal_votes`. Le pouvoir de vote est pondéré par la mise, comme le vote pour les witness : chaque proposition accumule un chiffre `total_votes` en parts de vesting (VESTS).
- **Financement quotidien** — chaque jour, les propositions actives sont classées selon `total_votes` et financées par ordre de classement jusqu'à épuisement du budget quotidien des propositions. Les propositions classées au-delà du budget ne reçoivent rien ce jour-là.
- **Le Return Proposal** — la proposition d'id 0 (« Return Proposal » de @gtg) est une convention permanente. Elle porte un `daily_pay` énorme et reste maintenue votée positivement afin de renvoyer à la trésorerie ce qui reste du budget du jour. En pratique, elle joue le rôle de plafond de dépenses : les votes déplacés entre le Return Proposal et les propositions actives déterminent ce que le DAO dépense réellement chaque jour.
- **Suppression** — le créateur d'une proposition peut la supprimer au moyen d'une opération `remove_proposal` tant qu'elle est en cours ; les votes peuvent être ajoutés ou révoqués à tout moment.

## Trésorerie

La trésorerie est le compte `@steem.dao`. Elle détient le budget non dépensé — une part de l'inflation quotidienne plus ce que renvoie le Return Proposal — et grossit avec le temps lorsque les parties prenantes votent pour dépenser moins que ce qui s'accumule. Solde actuel de la trésorerie : <DaoTreasuryBalance fallback="environ 2,59 millions de SBD (novembre 2026)" />.

L'interroger en direct :

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.get_accounts","params":[["steem.dao"]],"id":1}'
```

## Interroger les propositions

Récupérer des propositions spécifiques par id :

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.find_proposals","params":[[0,1,2]],"id":1}'
```

Chaque objet proposition contient `proposal_id`, `creator`, `receiver`, `start_date`, `end_date`, `daily_pay`, `subject`, `permlink` et `total_votes`. La liste complète, triée et filtrée par statut, est disponible via `list_proposals` ; les votes individuels derrière `total_votes` sont listés par `list_proposal_votes`.

## Cycle de vie

Une proposition devient **active** à sa `start_date`, reste financée tant qu'elle demeure active et classée dans le budget quotidien, et devient **expirée** à sa `end_date`. Les premières propositions datent du lancement du système le 27 août 2019 — la proposition d'id 0, le Return Proposal, est toujours en cours avec une date de fin au 31 décembre 2029.

## Référence API

| API | Objectif |
|---|---|
| [condenser_api.find_proposals](/api/condenser_api/find_proposals.html) | Récupérer des propositions par id |
| [condenser_api.list_proposals](/api/condenser_api/list_proposals.html) | Lister les propositions, triées et filtrées par statut |
| [condenser_api.list_proposal_votes](/api/condenser_api/list_proposal_votes.html) | Lister les votes derrière `total_votes` |
| [database_api.find_proposals](/api/database_api/find_proposals.html) | Variante native du plugin |
| [database_api.list_proposals](/api/database_api/list_proposals.html) | Variante native du plugin |
| [database_api.list_proposal_votes](/api/database_api/list_proposal_votes.html) | Variante native du plugin |

La création, le vote et la suppression de propositions (`create_proposal`, `update_proposal_votes`, `remove_proposal`) sont des opérations de diffusion — elles exigent une transaction signée et relèvent donc des flux de diffusion des bibliothèques clientes plutôt que de simples appels RPC.
