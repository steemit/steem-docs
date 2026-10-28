---
title: "Referencia de API"
description: "Resumen generado de las API JSON-RPC a partir de data/apidefinitions (versión en español)"
---

<!--
página de API en español (T13, página estática escrita a mano). Esta página es
el equivalente en español de docs/api/index.md (generada en tiempo de
compilación): el número de tarjetas y los contadores deben mantenerse
sincronizados con ella (cuando cambian los archivos de datos, docs:gen
actualiza el resumen en inglés; esta página se actualiza a mano). Las 20
tarjetas de API de métodos apuntan a las páginas de índice en español bajo
/es/api/; las 2 API de listas de operaciones (broadcast_ops*) aún no tienen
versión en español — sus tarjetas llevan directamente a las páginas en inglés.
Atención: el frontmatter debe estar al principio del archivo (de lo contrario
el compilador no puede leer title/description); los comentarios de servicio
van solo después de él.
-->

A continuación se encuentra la referencia de las API JSON-RPC, generada en tiempo de compilación a partir de `data/apidefinitions/*.yml`. Las páginas de índice en español enumeran todos los métodos de cada API; las páginas de métodos aún no están traducidas — los enlaces de las tablas llevan a las páginas de métodos en inglés.

# Referencia de API

<div class="api-cards">

<div class="api-card">

[Account by key API](/es/api/account_by_key_api/) <span class="badge badge-count">1 método</span>

<p class="api-card-summary">Búsqueda de información de una cuenta a partir de una clave pública. API de AppBase, todavía en desarrollo; la interfaz puede cambiar.</p>

</div>

<div class="api-card">

[Account history API](/es/api/account_history_api/) <span class="badge badge-count">4 métodos</span>

<p class="api-card-summary">Consulta del historial de una cuenta (registro de operaciones). API de AppBase, todavía en desarrollo; la interfaz puede cambiar.</p>

</div>

<div class="api-card">

[block_api](/es/api/block_api/) <span class="badge badge-count">2 métodos</span>

<p class="api-card-summary">Consulta de datos relacionados con el plugin de bloques. API de AppBase, todavía en desarrollo; la interfaz puede cambiar.</p>

</div>

<div class="api-card">

[Bridge](/es/api/bridge/) <span class="badge badge-count">19 métodos</span>

<p class="api-card-summary">Expone en forma de JSON-RPC los datos interpretados por la base de datos hivemind.</p>

</div>

<div class="api-card">

[call](/es/api/call/) <span class="badge badge-count">1 método</span>

<p class="api-card-summary">Adaptador de la convención de llamadas JSON-RPC heredada «call», servido por el servidor API de hivemind.</p>

</div>

<div class="api-card">

[chain_api](/es/api/chain_api/) <span class="badge badge-count">2 métodos</span>

<p class="api-card-summary">Endpoints directos para el envío de bloques y transacciones. El plugin chain_api está definido en el código fuente pero no está habilitado en los nodos públicos.</p>

</div>

<div class="api-card">

[condenser_api](/es/api/condenser_api/) <span class="badge badge-count">90 métodos</span>

<p class="api-card-summary">API de agregación pensada para una migración sin sobresaltos: reúne todos los métodos existentes y conserva el formato histórico de los parámetros — las aplicaciones existentes solo tienen que dirigir sus peticiones a condenser_api para funcionar con Appbase.</p>

</div>

<div class="api-card">

[Database API](/es/api/database_api/) <span class="badge badge-count">57 métodos</span>

<p class="api-card-summary">Consulta de datos relativos a cuentas, transacciones y la blockchain.</p>

</div>

<div class="api-card">

[debug_node_api](/es/api/debug_node_api/) <span class="badge badge-count">9 métodos</span>

<p class="api-card-summary">Plugin privado para todo tipo de experimentos «what-if» sobre la cadena; los nodos públicos no ofrecen esta familia de métodos.</p>

</div>

<div class="api-card">

[Follow API](/es/api/follow_api/) <span class="badge badge-count">12 métodos</span>

<p class="api-card-summary">Consulta de datos sociales: reputación, seguimientos entre cuentas. API de AppBase, todavía en desarrollo; la interfaz puede cambiar.</p>

</div>

<div class="api-card">

[hive](/es/api/hive/) <span class="badge badge-count">1 método</span>

<p class="api-card-summary">Métodos de estado y diagnóstico servidos por el servidor API de hivemind.</p>

</div>

<div class="api-card">

[JSON RPC](/es/api/jsonrpc/) <span class="badge badge-count">2 métodos</span>

<p class="api-card-summary">Consulta de los metadatos de la propia capa JSON-RPC (por ejemplo, la lista de API disponibles). API de AppBase, todavía en desarrollo; la interfaz puede cambiar.</p>

</div>

<div class="api-card">

[Market history API](/es/api/market_history_api/) <span class="badge badge-count">7 métodos</span>

<p class="api-card-summary">Consulta del historial de mercado (precios y volúmenes negociados). API de AppBase, todavía en desarrollo; la interfaz puede cambiar.</p>

</div>

<div class="api-card">

[Network Broadcast API](/es/api/network_broadcast_api/) <span class="badge badge-count">2 métodos</span>

<p class="api-card-summary">Broadcast de transacciones y bloques a la red. API de AppBase, todavía en desarrollo; la interfaz puede cambiar.</p>

</div>

<div class="api-card">

[Resource Credit API](/es/api/rc_api/) <span class="badge badge-count">3 métodos</span>

<p class="api-card-summary">Consulta de las métricas de los Resource Credit (RC). Véase: el sistema RC Bandwidth, las notas de la versión 0.20.2, la guía del desarrollador: el sistema de Resource Credits.</p>

</div>

<div class="api-card">

[reputation_api](/es/api/reputation_api/) <span class="badge badge-count">1 método</span>

<p class="api-card-summary">Consulta del valor de reputación de una cuenta; condenser_api llama a follow_api o reputation_api cuando hace falta.</p>

</div>

<div class="api-card">

[rewards_api](/es/api/rewards_api/) <span class="badge badge-count">1 método</span>

<p class="api-card-summary">Simulación del cálculo de pagos según una curva. Parámetros: curve:string; var1:string.</p>

</div>

<div class="api-card">

[Tags API](/es/api/tags_api/) <span class="badge badge-count">21 métodos</span>

<p class="api-card-summary">Consulta de etiquetas, publicaciones y discusiones. API de AppBase, todavía en desarrollo; la interfaz puede cambiar.</p>

</div>

<div class="api-card">

[transaction_status_api](/es/api/transaction_status_api/) <span class="badge badge-count">1 método</span>

<p class="api-card-summary">Evaluación del estado de una transacción en la cadena tras una llamada a condenser_api.broadcast_transaction.</p>

</div>

<div class="api-card">

[Witness API](/es/api/witness_api/) <span class="badge badge-count">2 métodos</span>

<p class="api-card-summary">API de testigos (witness); retirada a partir de la versión 0.20.6 y conservada únicamente como archivo.</p>

</div>

<div class="api-card">

[broadcast_ops](/api/broadcast_ops/) <span class="badge badge-count">75 operaciones (página en inglés)</span>

<p class="api-card-summary">El conjunto completo de operaciones de broadcast en la cadena Steem — una operación (operation) es la unidad básica para expresar una intención en la cadena; las operaciones se organizan por tipos y se agrupan en transacciones antes del broadcast.</p>

</div>

<div class="api-card">

[broadcast_ops_communities](/api/broadcast_ops_communities/) <span class="badge badge-count">10 operaciones (página en inglés)</span>

<p class="api-card-summary">Operaciones custom_json para interactuar con el sistema de comunidades (id = community; follow, reblog y otros id también se reconocen como comunidades).</p>

</div>

</div>
