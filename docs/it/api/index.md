---
title: "Riferimento API"
description: "Panoramica generata delle API JSON-RPC da data/apidefinitions (versione italiana)"
---

<!--
pagina API italiana (T13, pagina statica scritta a mano). Questa pagina è
l'equivalente italiano di docs/api/index.md (generata in fase di build): il
numero di schede e i contatori devono restare sincronizzati con essa (quando i
file di dati cambiano, docs:gen aggiorna la panoramica inglese; questa pagina
va aggiornata a mano). Le 20 schede delle API di metodi puntano alle pagine di
indice italiane sotto /it/api/; per le 2 API di elenchi di operazioni
(broadcast_ops*) non esiste ancora una versione italiana — le loro schede
portano direttamente alle pagine inglesi.
Attenzione: il frontmatter deve trovarsi all'inizio del file (altrimenti il
builder non riesce a leggere title/description); i commenti di servizio vanno
inseriti solo dopo.
-->

Il riferimento delle API JSON-RPC riportato di seguito è generato in fase di build da `data/apidefinitions/*.yml`. Le pagine di indice italiane elencano tutti i metodi di ogni API; le pagine dei metodi sono tradotte in italiano — i link delle tabelle portano alle pagine dei metodi italiane.

# Riferimento API

<div class="api-cards">

<div class="api-card">

[Account by key API](/it/api/account_by_key_api/) <span class="badge badge-count">1 metodo</span>

<p class="api-card-summary">Ricerca delle informazioni di un account a partire da una chiave pubblica. API AppBase, ancora in sviluppo; l’interfaccia può cambiare.</p>

</div>

<div class="api-card">

[Account history API](/it/api/account_history_api/) <span class="badge badge-count">4 metodi</span>

<p class="api-card-summary">Consultazione della cronologia di un account (registro delle operazioni). API AppBase, ancora in sviluppo; l’interfaccia può cambiare.</p>

</div>

<div class="api-card">

[block_api](/it/api/block_api/) <span class="badge badge-count">2 metodi</span>

<p class="api-card-summary">Consultazione dei dati relativi al plugin dei blocchi. API AppBase, ancora in sviluppo; l’interfaccia può cambiare.</p>

</div>

<div class="api-card">

[Bridge](/it/api/bridge/) <span class="badge badge-count">19 metodi</span>

<p class="api-card-summary">Espone in forma di JSON-RPC i dati interpretati dal database hivemind.</p>

</div>

<div class="api-card">

[call](/it/api/call/) <span class="badge badge-count">1 metodo</span>

<p class="api-card-summary">Adattatore della convenzione di chiamata JSON-RPC legacy «call», servito dal server API hivemind.</p>

</div>

<div class="api-card">

[chain_api](/it/api/chain_api/) <span class="badge badge-count">2 metodi</span>

<p class="api-card-summary">Endpoint diretti per il push di blocchi e transazioni. Il plugin chain_api è definito nel codice sorgente ma non è abilitato sui nodi pubblici.</p>

</div>

<div class="api-card">

[condenser_api](/it/api/condenser_api/) <span class="badge badge-count">90 metodi</span>

<p class="api-card-summary">API di aggregazione pensata per una migrazione graduale: raccoglie tutti i metodi esistenti e conserva il formato storico dei parametri — le applicazioni esistenti devono solo indirizzare le richieste a condenser_api per lavorare con Appbase.</p>

</div>

<div class="api-card">

[Database API](/it/api/database_api/) <span class="badge badge-count">57 metodi</span>

<p class="api-card-summary">Consultazione dei dati relativi ad account, transazioni e blockchain.</p>

</div>

<div class="api-card">

[debug_node_api](/it/api/debug_node_api/) <span class="badge badge-count">9 metodi</span>

<p class="api-card-summary">Plugin privato per ogni sorta di esperimenti «what-if» sulla catena; i nodi pubblici non forniscono questa famiglia di metodi.</p>

</div>

<div class="api-card">

[Follow API](/it/api/follow_api/) <span class="badge badge-count">12 metodi</span>

<p class="api-card-summary">Consultazione dei dati social: reputazione, follow tra account. API AppBase, ancora in sviluppo; l’interfaccia può cambiare.</p>

</div>

<div class="api-card">

[hive](/it/api/hive/) <span class="badge badge-count">1 metodo</span>

<p class="api-card-summary">Metodi di stato e diagnostica serviti dal server API hivemind.</p>

</div>

<div class="api-card">

[JSON RPC](/it/api/jsonrpc/) <span class="badge badge-count">2 metodi</span>

<p class="api-card-summary">Consultazione dei metadati dello strato JSON-RPC stesso (ad esempio l’elenco delle API disponibili). API AppBase, ancora in sviluppo; l’interfaccia può cambiare.</p>

</div>

<div class="api-card">

[Market history API](/it/api/market_history_api/) <span class="badge badge-count">7 metodi</span>

<p class="api-card-summary">Consultazione della cronologia del mercato (prezzi e volumi scambiati). API AppBase, ancora in sviluppo; l’interfaccia può cambiare.</p>

</div>

<div class="api-card">

[Network Broadcast API](/it/api/network_broadcast_api/) <span class="badge badge-count">2 metodi</span>

<p class="api-card-summary">Broadcast di transazioni e blocchi sulla rete. API AppBase, ancora in sviluppo; l’interfaccia può cambiare.</p>

</div>

<div class="api-card">

[Resource Credit API](/it/api/rc_api/) <span class="badge badge-count">3 metodi</span>

<p class="api-card-summary">Consultazione delle metriche dei Resource Credit (RC). Vedere: il sistema RC Bandwidth, le note di rilascio 0.20.2, la guida per gli sviluppatori: il sistema dei Resource Credit.</p>

</div>

<div class="api-card">

[reputation_api](/it/api/reputation_api/) <span class="badge badge-count">1 metodo</span>

<p class="api-card-summary">Consultazione del valore di reputazione di un account; condenser_api chiama all’occorrenza follow_api o reputation_api.</p>

</div>

<div class="api-card">

[rewards_api](/it/api/rewards_api/) <span class="badge badge-count">1 metodo</span>

<p class="api-card-summary">Simulazione del calcolo dei pagamenti lungo una curva. Parametri: curve:string; var1:string.</p>

</div>

<div class="api-card">

[Tags API](/it/api/tags_api/) <span class="badge badge-count">21 metodi</span>

<p class="api-card-summary">Consultazione di tag, post e discussioni. API AppBase, ancora in sviluppo; l’interfaccia può cambiare.</p>

</div>

<div class="api-card">

[transaction_status_api](/it/api/transaction_status_api/) <span class="badge badge-count">1 metodo</span>

<p class="api-card-summary">Valutazione dello stato di una transazione nella catena dopo una chiamata a condenser_api.broadcast_transaction.</p>

</div>

<div class="api-card">

[Witness API](/it/api/witness_api/) <span class="badge badge-count">2 metodi</span>

<p class="api-card-summary">API dei witness; rimossa dalla versione 0.20.6 e conservata solo come archivio.</p>

</div>

<div class="api-card">

[broadcast_ops](/api/broadcast_ops/) <span class="badge badge-count">75 operazioni (pagina in inglese)</span>

<p class="api-card-summary">L’insieme completo delle operazioni di broadcast nella catena Steem — un’operazione (operation) è l’unità di base per esprimere un’intenzione sulla catena; le operazioni sono organizzate per tipo e raggruppate in transazioni prima del broadcast.</p>

</div>

<div class="api-card">

[broadcast_ops_communities](/api/broadcast_ops_communities/) <span class="badge badge-count">10 operazioni (pagina in inglese)</span>

<p class="api-card-summary">Operazioni custom_json per interagire con il sistema delle community (id = community; anche follow, reblog e altri id vengono riconosciuti come community).</p>

</div>

</div>
