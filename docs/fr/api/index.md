---
title: "Référence API"
description: "Vue d’ensemble de l’API JSON-RPC générée à partir de data/apidefinitions (version française)"
---

<!--
page d'API française (T13, page statique écrite à la main). Cette page est
l'équivalent français de docs/api/index.md (généré à la construction) : le
nombre de cartes et les compteurs doivent rester synchrones avec elle (lorsque
les fichiers de données changent, docs:gen met à jour la vue d'ensemble
anglaise ; cette page doit être mise à jour à la main). Les 17 cartes d'API de
méthodes pointent vers les pages d'index françaises sous /fr/api/ ; les 2 API
de listes d'opérations (broadcast_ops*) n'ont pas encore de version française —
leurs cartes mènent directement aux pages anglaises.
Attention : le frontmatter doit figurer tout au début du fichier (sinon le
builder ne peut pas lire title/description) ; les commentaires utilitaires ne
se placent qu'après lui.
-->

Voici la référence de l’API JSON-RPC, générée à la construction à partir de `data/apidefinitions/*.yml`. Les pages d’index françaises listent toutes les méthodes de chaque API ; les pages de méthodes ne sont pas encore traduites — les liens des tableaux mènent aux pages de méthodes anglaises.

# Référence API

<div class="api-cards">

<div class="api-card">

[Account by key API](/fr/api/account_by_key_api/) <span class="badge badge-count">1 méthode</span>

<p class="api-card-summary">Recherche d’informations sur un compte à partir d’une clé publique. API AppBase, encore en développement ; l’interface peut changer.</p>

</div>

<div class="api-card">

[Account history API](/fr/api/account_history_api/) <span class="badge badge-count">4 méthodes</span>

<p class="api-card-summary">Consultation de l’historique d’un compte (journal des opérations). API AppBase, encore en développement ; l’interface peut changer.</p>

</div>

<div class="api-card">

[block_api](/fr/api/block_api/) <span class="badge badge-count">2 méthodes</span>

<p class="api-card-summary">Consultation des données liées au plugin des blocs. API AppBase, encore en développement ; l’interface peut changer.</p>

</div>

<div class="api-card">

[Bridge](/fr/api/bridge/) <span class="badge badge-count">5 méthodes</span>

<p class="api-card-summary">Expose sous forme de JSON-RPC les données interprétées par la base de données hivemind.</p>

</div>

<div class="api-card">

[condenser_api](/fr/api/condenser_api/) <span class="badge badge-count">88 méthodes</span>

<p class="api-card-summary">API d’agrégation conçue pour une migration en douceur : elle regroupe toutes les méthodes existantes et conserve le format historique des paramètres — les applications existantes n’ont qu’à adresser leurs requêtes à condenser_api pour fonctionner avec Appbase.</p>

</div>

<div class="api-card">

[Database API](/fr/api/database_api/) <span class="badge badge-count">57 méthodes</span>

<p class="api-card-summary">Consultation des données relatives aux comptes, aux transactions et à la blockchain.</p>

</div>

<div class="api-card">

[debug_node_api](/fr/api/debug_node_api/) <span class="badge badge-count">9 méthodes</span>

<p class="api-card-summary">Plugin privé permettant toutes sortes d’expériences « what-if » sur la chaîne ; les nœuds publics ne fournissent pas cette famille de méthodes.</p>

</div>

<div class="api-card">

[Follow API](/fr/api/follow_api/) <span class="badge badge-count">10 méthodes</span>

<p class="api-card-summary">Consultation des données sociales : réputation, abonnements entre comptes. API AppBase, encore en développement ; l’interface peut changer.</p>

</div>

<div class="api-card">

[JSON RPC](/fr/api/jsonrpc/) <span class="badge badge-count">2 méthodes</span>

<p class="api-card-summary">Consultation des métadonnées de la couche JSON-RPC elle-même (par exemple la liste des API disponibles). API AppBase, encore en développement ; l’interface peut changer.</p>

</div>

<div class="api-card">

[Market history API](/fr/api/market_history_api/) <span class="badge badge-count">7 méthodes</span>

<p class="api-card-summary">Consultation de l’historique du marché (prix et volumes échangés). API AppBase, encore en développement ; l’interface peut changer.</p>

</div>

<div class="api-card">

[Network Broadcast API](/fr/api/network_broadcast_api/) <span class="badge badge-count">2 méthodes</span>

<p class="api-card-summary">Diffusion de transactions et de blocs sur le réseau. API AppBase, encore en développement ; l’interface peut changer.</p>

</div>

<div class="api-card">

[Resource Credit API](/fr/api/rc_api/) <span class="badge badge-count">3 méthodes</span>

<p class="api-card-summary">Consultation des indicateurs des Resource Credits (RC). Voir : le système RC Bandwidth, les notes de version 0.20.2, le guide du développeur : le système de Resource Credits.</p>

</div>

<div class="api-card">

[reputation_api](/fr/api/reputation_api/) <span class="badge badge-count">1 méthode</span>

<p class="api-card-summary">Consultation de la valeur de réputation d’un compte ; condenser_api appelle au besoin follow_api ou reputation_api.</p>

</div>

<div class="api-card">

[rewards_api](/fr/api/rewards_api/) <span class="badge badge-count">1 méthode</span>

<p class="api-card-summary">Simulation du calcul des paiements selon une courbe. Paramètres : curve:string ; var1:string.</p>

</div>

<div class="api-card">

[Tags API](/fr/api/tags_api/) <span class="badge badge-count">20 méthodes</span>

<p class="api-card-summary">Consultation des tags, des publications et des discussions. API AppBase, encore en développement ; l’interface peut changer.</p>

</div>

<div class="api-card">

[transaction_status_api](/fr/api/transaction_status_api/) <span class="badge badge-count">1 méthode</span>

<p class="api-card-summary">Évaluation du statut d’une transaction dans la chaîne après un appel à condenser_api.broadcast_transaction.</p>

</div>

<div class="api-card">

[Witness API](/fr/api/witness_api/) <span class="badge badge-count">2 méthodes</span>

<p class="api-card-summary">API des témoins (witness) ; retirée en 0.20.6 et conservée uniquement à titre d’archive.</p>

</div>

<div class="api-card">

[broadcast_ops](/api/broadcast_ops/) <span class="badge badge-count">75 opérations (page en anglais)</span>

<p class="api-card-summary">L’ensemble complet des opérations de diffusion dans la chaîne Steem — une opération (operation) est l’unité de base pour exprimer une intention sur la chaîne ; les opérations sont organisées par type et regroupées en transactions avant diffusion.</p>

</div>

<div class="api-card">

[broadcast_ops_communities](/api/broadcast_ops_communities/) <span class="badge badge-count">10 opérations (page en anglais)</span>

<p class="api-card-summary">Opérations custom_json pour interagir avec le système des communautés (id = community ; follow, reblog et d’autres id sont également reconnus comme des communautés).</p>

</div>

</div>
