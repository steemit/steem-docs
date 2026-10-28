---
title: "API-Referenz"
description: "Generierte Übersicht der JSON-RPC-API aus data/apidefinitions (deutsche Version)"
---

<!--
deutsche API-Übersichtsseite (T13, handgeschriebene statische Seite). Diese
Seite ist das deutsche Gegenstück zu docs/api/index.md (zur Build-Zeit
generiert): Kartenanzahl und Zähler müssen mit ihr synchron bleiben (ändert
sich eine Datendatei, aktualisiert docs:gen die englische Übersicht; diese
Seite wird von Hand gepflegt). Die 20 Methoden-API-Karten zeigen auf die
deutschen Indexseiten unter /de/api/; für die 2 Operationslisten-APIs
(broadcast_ops*) gibt es noch keine deutsche Fassung — ihre Karten führen
direkt auf die englischen Seiten.
Achtung: Das Frontmatter muss ganz am Anfang der Datei stehen (sonst kann der
Builder title/description nicht lesen); Hilfskommentare nur danach.
-->

Unten befindet sich die zur Build-Zeit aus `data/apidefinitions/*.yml` generierte JSON-RPC-API-Referenz. Die deutschen Indexseiten listen alle Methoden jeder API auf; die Methodenseiten sind noch nicht übersetzt — die Links in den Tabellen führen zu den englischen Methodenseiten.

# API-Referenz

<div class="api-cards">

<div class="api-card">

[Account by key API](/de/api/account_by_key_api/) <span class="badge badge-count">1 Methode</span>

<p class="api-card-summary">Nachschlagen von Kontoinformationen anhand eines öffentlichen Schlüssels. AppBase-API, noch in Entwicklung; die Schnittstelle kann sich ändern.</p>

</div>

<div class="api-card">

[Account history API](/de/api/account_history_api/) <span class="badge badge-count">4 Methoden</span>

<p class="api-card-summary">Abfrage des Kontoverlaufs (Operationsjournal). AppBase-API, noch in Entwicklung; die Schnittstelle kann sich ändern.</p>

</div>

<div class="api-card">

[block_api](/de/api/block_api/) <span class="badge badge-count">2 Methoden</span>

<p class="api-card-summary">Abfrage von Daten rund um das Block-Plugin. AppBase-API, noch in Entwicklung; die Schnittstelle kann sich ändern.</p>

</div>

<div class="api-card">

[Bridge](/de/api/bridge/) <span class="badge badge-count">19 Methoden</span>

<p class="api-card-summary">Stellt die von der hivemind-Datenbank interpretierten Daten als JSON-RPC bereit.</p>

</div>

<div class="api-card">

[call](/de/api/call/) <span class="badge badge-count">1 Methode</span>

<p class="api-card-summary">Adapter für das Legacy-JSON-RPC-`call`-Format, bereitgestellt vom hivemind-API-Server.</p>

</div>

<div class="api-card">

[chain_api](/de/api/chain_api/) <span class="badge badge-count">2 Methoden</span>

<p class="api-card-summary">Direkte Endpunkte zum Pushen von Blöcken und Transaktionen. Das chain_api-Plugin ist im Quellcode definiert, aber auf öffentlichen Knoten nicht aktiviert.</p>

</div>

<div class="api-card">

[condenser_api](/de/api/condenser_api/) <span class="badge badge-count">90 Methoden</span>

<p class="api-card-summary">Aggregierende API für einen sanften Umstieg: sie enthält alle derzeit existierenden Methoden und behält das bisherige Parameterformat bei — bestehende Anwendungen müssen ihre Anfragen nur an condenser_api richten, um mit Appbase zu arbeiten.</p>

</div>

<div class="api-card">

[Database API](/de/api/database_api/) <span class="badge badge-count">57 Methoden</span>

<p class="api-card-summary">Abfrage von Daten zu Konten, Transaktionen und der Blockchain.</p>

</div>

<div class="api-card">

[debug_node_api](/de/api/debug_node_api/) <span class="badge badge-count">9 Methoden</span>

<p class="api-card-summary">Privates Plugin für allerlei „What-if“-Experimente an der Chain; öffentliche Knoten stellen diese Methodenfamilie nicht bereit.</p>

</div>

<div class="api-card">

[Follow API](/de/api/follow_api/) <span class="badge badge-count">12 Methoden</span>

<p class="api-card-summary">Abfrage sozialer Daten: Reputation, Abonnements zwischen Konten. AppBase-API, noch in Entwicklung; die Schnittstelle kann sich ändern.</p>

</div>

<div class="api-card">

[hive](/de/api/hive/) <span class="badge badge-count">1 Methode</span>

<p class="api-card-summary">Status- und Diagnosemethoden, bereitgestellt vom hivemind-API-Server.</p>

</div>

<div class="api-card">

[JSON RPC](/de/api/jsonrpc/) <span class="badge badge-count">2 Methoden</span>

<p class="api-card-summary">Abfrage der Metadaten der JSON-RPC-Schicht selbst (z. B. die Liste der verfügbaren APIs). AppBase-API, noch in Entwicklung; die Schnittstelle kann sich ändern.</p>

</div>

<div class="api-card">

[Market history API](/de/api/market_history_api/) <span class="badge badge-count">7 Methoden</span>

<p class="api-card-summary">Abfrage der Markthistorie (Preise und Handelsvolumen). AppBase-API, noch in Entwicklung; die Schnittstelle kann sich ändern.</p>

</div>

<div class="api-card">

[Network Broadcast API](/de/api/network_broadcast_api/) <span class="badge badge-count">2 Methoden</span>

<p class="api-card-summary">Broadcast von Transaktionen und Blöcken ins Netzwerk. AppBase-API, noch in Entwicklung; die Schnittstelle kann sich ändern.</p>

</div>

<div class="api-card">

[Resource Credit API](/de/api/rc_api/) <span class="badge badge-count">3 Methoden</span>

<p class="api-card-summary">Abfrage verschiedener Resource-Credits-Kennzahlen (RC). Siehe: RC-Bandwidth-System, Release-Notes 0.20.2, Entwicklerhandbuch: das Resource-Credits-System.</p>

</div>

<div class="api-card">

[reputation_api](/de/api/reputation_api/) <span class="badge badge-count">1 Methode</span>

<p class="api-card-summary">Abfrage des Reputationswerts eines Kontos; condenser_api ruft bei Bedarf follow_api oder reputation_api auf.</p>

</div>

<div class="api-card">

[rewards_api](/de/api/rewards_api/) <span class="badge badge-count">1 Methode</span>

<p class="api-card-summary">Simulation der Auszahlungsberechnung entlang einer Kurve. Parameter: curve:string; var1:string.</p>

</div>

<div class="api-card">

[Tags API](/de/api/tags_api/) <span class="badge badge-count">21 Methoden</span>

<p class="api-card-summary">Abfrage von Tags, Beiträgen und Diskussionen. AppBase-API, noch in Entwicklung; die Schnittstelle kann sich ändern.</p>

</div>

<div class="api-card">

[transaction_status_api](/de/api/transaction_status_api/) <span class="badge badge-count">1 Methode</span>

<p class="api-card-summary">Bewertung des Transaktionsstatus in der Chain nach einem Aufruf von condenser_api.broadcast_transaction.</p>

</div>

<div class="api-card">

[Witness API](/de/api/witness_api/) <span class="badge badge-count">2 Methoden</span>

<p class="api-card-summary">Witness-API; seit 0.20.6 entfernt und nur noch als Archiv erhalten.</p>

</div>

<div class="api-card">

[broadcast_ops](/api/broadcast_ops/) <span class="badge badge-count">75 Operationen (englische Seite)</span>

<p class="api-card-summary">Die vollständige Menge der Broadcast-Operationen in der Steem-Chain — eine Operation (operation) ist die Basiseinheit, um eine Absicht in der Chain auszudrücken; Operationen sind nach Typen organisiert und werden vor dem Broadcast zu Transaktionen gebündelt.</p>

</div>

<div class="api-card">

[broadcast_ops_communities](/api/broadcast_ops_communities/) <span class="badge badge-count">10 Operationen (englische Seite)</span>

<p class="api-card-summary">custom_json-Operationen für die Interaktion mit dem Community-System (id = community; auch follow, reblog und andere IDs werden als Communities erkannt).</p>

</div>

</div>
