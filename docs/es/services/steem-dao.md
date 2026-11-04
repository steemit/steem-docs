---
title: Steem DAO
description: El Steem DAO — la tesorería on-chain y la financiación de propuestas detrás del Steem Proposal System.
---

# Steem DAO

El Steem DAO es el mecanismo de financiación on-chain detrás del **Steem Proposal System (SPS, «sistema de propuestas de Steem»)**, introducido por el Hardfork 21 en agosto de 2019. Consiste en una cuenta de tesorería, `@steem.dao`, y un conjunto de **propuestas (proposal)** — solicitudes de financiación almacenadas en la blockchain, votadas por los interesados según su stake y pagadas a diario en dólares STEEM (SBD) desde la tesorería.

Las propuestas son la forma en que la cadena financia el trabajo de desarrollo e infraestructura: cualquiera puede crear una, el stake decide cuánto apoyo tiene, y la tesorería paga las propuestas que los interesados clasifican lo suficientemente alto.

## Cómo funciona

- **Creación** — una operación `create_proposal` almacena la propuesta en la cadena. Una propuesta tiene un creador (creator), una cuenta **receptora (receiver)** (quien recibe los pagos), fechas de inicio y fin, un pago diario denominado en SBD y un subject con un permlink (enlace permanente) que apunta a la publicación de discusión que la describe.
- **Votación** — las cuentas votan a favor (o en contra) de las propuestas con una operación `update_proposal_votes`. El poder de voto se pondera por stake, igual que la votación de witness: cada propuesta acumula una cifra `total_votes` en acciones de vesting (VESTS).
- **Financiación diaria** — cada día, las propuestas activas se clasifican por `total_votes` y se financian por orden de clasificación hasta agotar el presupuesto diario de propuestas. Las propuestas clasificadas fuera del presupuesto no reciben nada ese día.
- **La Return Proposal** — la propuesta con id 0 («Return Proposal» de @gtg) es una convención permanente. Lleva un enorme `daily_pay` y se mantiene votada al alza para drenar de vuelta a la tesorería lo que quede del presupuesto del día. En la práctica actúa como techo de gasto: los votos movidos entre la Return Proposal y las propuestas en marcha deciden cuánto gasta realmente el DAO cada día.
- **Eliminación** — el creador de una propuesta puede eliminarla con una operación `remove_proposal` mientras esté en curso; los votos pueden añadirse o revocarse en cualquier momento.

## Tesorería

La tesorería es la cuenta `@steem.dao`. Guarda el presupuesto no gastado — una parte de la inflación diaria más lo que devuelve la Return Proposal — y crece con el tiempo cuando los interesados votan gastar menos de lo que se acumula. En noviembre de 2026 la tesorería guarda alrededor de **2,59 millones de SBD**.

Consúltala en vivo:

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.get_accounts","params":[["steem.dao"]],"id":1}'
```

## Consultar propuestas

Obtener propuestas concretas por id:

```bash
curl -sS -X POST https://api.steemit.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"condenser_api.find_proposals","params":[[0,1,2]],"id":1}'
```

Cada objeto de propuesta lleva `proposal_id`, `creator`, `receiver`, `start_date`, `end_date`, `daily_pay`, `subject`, `permlink` y `total_votes`. La lista completa, ordenada y filtrada por estado, está disponible mediante `list_proposals`; los votos individuales detrás de `total_votes` los lista `list_proposal_votes`.

## Ciclo de vida

Una propuesta se vuelve **activa** en su `start_date`, sigue financiada mientras permanece activa y clasificada dentro del presupuesto diario, y pasa a **expirada** en su `end_date`. Las primeras propuestas datan del lanzamiento del sistema el 27 de agosto de 2019 — la propuesta con id 0, la Return Proposal, sigue en curso con fecha de fin el 31 de diciembre de 2029.

## Referencia de API

| API | Propósito |
|---|---|
| [condenser_api.find_proposals](/api/condenser_api/find_proposals.html) | Obtener propuestas por id |
| [condenser_api.list_proposals](/api/condenser_api/list_proposals.html) | Listar propuestas, ordenadas y filtradas por estado |
| [condenser_api.list_proposal_votes](/api/condenser_api/list_proposal_votes.html) | Listar los votos detrás de `total_votes` |
| [database_api.find_proposals](/api/database_api/find_proposals.html) | Variante nativa del plugin |
| [database_api.list_proposals](/api/database_api/list_proposals.html) | Variante nativa del plugin |
| [database_api.list_proposal_votes](/api/database_api/list_proposal_votes.html) | Variante nativa del plugin |

Crear propuestas, votarlas y eliminarlas (`create_proposal`, `update_proposal_votes`, `remove_proposal`) son operaciones de broadcast — requieren una transacción firmada, por lo que pertenecen a los flujos de broadcast de las bibliotecas cliente y no a simples llamadas RPC.
