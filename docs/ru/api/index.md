---
title: "Справочник API"
description: "Сгенерированный обзор JSON-RPC API из data/apidefinitions (русская версия)"
---

<!--
русский API-обзор (T13, рукописная статическая страница). Эта страница —
русское соответствие docs/api/index.md (генерируется на этапе сборки):
количество карточек и счётчики должны оставаться синхронными с ней (при
изменении файлов данных docs:gen обновляет английский обзор, эта страница
обновляется вручную). 17 карточек методов API указывают на русские индексные
страницы в /ru/api/; у 2 API списков операций (broadcast_ops*) русской версии
пока нет — карточки ведут прямо на английские страницы.
Внимание: frontmatter должен стоять в самом начале файла (иначе сборщик не
сможет разобрать title/description); служебные комментарии — только после него.
-->

Ниже приведён справочник JSON-RPC API, генерируемый на этапе сборки из `data/apidefinitions/*.yml`. Русские индексные страницы перечисляют все методы каждого API; страницы методов пока не переведены на русский язык — ссылки в таблицах ведут на соответствующие английские страницы методов.

# Справочник API

<div class="api-cards">

<div class="api-card">

[Account by key API](/ru/api/account_by_key_api/) <span class="badge badge-count">1 метод</span>

<p class="api-card-summary">Поиск информации об аккаунте по публичному ключу. API AppBase, всё ещё в разработке; интерфейс может меняться.</p>

</div>

<div class="api-card">

[Account history API](/ru/api/account_history_api/) <span class="badge badge-count">4 метода</span>

<p class="api-card-summary">Запрос истории аккаунта (журнал операций). API AppBase, всё ещё в разработке; интерфейс может меняться.</p>

</div>

<div class="api-card">

[block_api](/ru/api/block_api/) <span class="badge badge-count">2 метода</span>

<p class="api-card-summary">Запрос данных, относящихся к плагину блоков. API AppBase, всё ещё в разработке; интерфейс может меняться.</p>

</div>

<div class="api-card">

[Bridge](/ru/api/bridge/) <span class="badge badge-count">5 методов</span>

<p class="api-card-summary">Представляет данные, интерпретируемые базой данных hivemind, в виде JSON-RPC.</p>

</div>

<div class="api-card">

[condenser_api](/ru/api/condenser_api/) <span class="badge badge-count">88 методов</span>

<p class="api-card-summary">Агрегирующий API для плавной миграции: содержит все существующие методы и сохраняет прежний формат параметров — старым приложениям достаточно направить запросы на condenser_api, чтобы работать с AppBase.</p>

</div>

<div class="api-card">

[Database API](/ru/api/database_api/) <span class="badge badge-count">57 методов</span>

<p class="api-card-summary">Запрос данных об аккаунтах, транзакциях и блокчейне.</p>

</div>

<div class="api-card">

[debug_node_api](/ru/api/debug_node_api/) <span class="badge badge-count">9 методов</span>

<p class="api-card-summary">Приватный плагин для разного рода «what-if»-экспериментов над цепочкой; публичные узлы не предоставляют это семейство методов.</p>

</div>

<div class="api-card">

[Follow API](/ru/api/follow_api/) <span class="badge badge-count">10 методов</span>

<p class="api-card-summary">Запрос данных о социальных связях: репутация, подписки аккаунтов. API AppBase, всё ещё в разработке; интерфейс может меняться.</p>

</div>

<div class="api-card">

[JSON RPC](/ru/api/jsonrpc/) <span class="badge badge-count">2 метода</span>

<p class="api-card-summary">Запрос метаданных самого слоя JSON-RPC (например, список доступных API). API AppBase, всё ещё в разработке; интерфейс может меняться.</p>

</div>

<div class="api-card">

[Market history API](/ru/api/market_history_api/) <span class="badge badge-count">7 методов</span>

<p class="api-card-summary">Запрос истории рынка (цены и объёмы торгов). API AppBase, всё ещё в разработке; интерфейс может меняться.</p>

</div>

<div class="api-card">

[Network Broadcast API](/ru/api/network_broadcast_api/) <span class="badge badge-count">2 метода</span>

<p class="api-card-summary">Широковещательная передача транзакций и блоков. API AppBase, всё ещё в разработке; интерфейс может меняться.</p>

</div>

<div class="api-card">

[Resource Credit API](/ru/api/rc_api/) <span class="badge badge-count">3 метода</span>

<p class="api-card-summary">Запрос показателей ресурсных кредитов (RC). См.: система RC-пропускной способности, примечания к выпуску 0.20.2, руководство разработчика: система ресурсных кредитов.</p>

</div>

<div class="api-card">

[reputation_api](/ru/api/reputation_api/) <span class="badge badge-count">1 метод</span>

<p class="api-card-summary">Запрос значения репутации аккаунта; condenser_api по мере необходимости вызывает follow_api или reputation_api.</p>

</div>

<div class="api-card">

[rewards_api](/ru/api/rewards_api/) <span class="badge badge-count">1 метод</span>

<p class="api-card-summary">Моделирование расчёта по кривой выплат. Параметры: curve:string; var1:string.</p>

</div>

<div class="api-card">

[Tags API](/ru/api/tags_api/) <span class="badge badge-count">20 методов</span>

<p class="api-card-summary">Запрос тегов, постов и обсуждений. API AppBase, всё ещё в разработке; интерфейс может меняться.</p>

</div>

<div class="api-card">

[transaction_status_api](/ru/api/transaction_status_api/) <span class="badge badge-count">1 метод</span>

<p class="api-card-summary">Оценка состояния транзакции в цепочке после вызова condenser_api.broadcast_transaction.</p>

</div>

<div class="api-card">

[Witness API](/ru/api/witness_api/) <span class="badge badge-count">2 метода</span>

<p class="api-card-summary">API свидетелей (witness); начиная с 0.20.6 удалён и сохранён только как архив.</p>

</div>

<div class="api-card">

[broadcast_ops](/api/broadcast_ops/) <span class="badge badge-count">75 операций (английская страница)</span>

<p class="api-card-summary">Полный набор операций широковещания в цепочке Steem — операция (operation) является базовой единицей выражения намерения в цепочке; операции организованы по типам и собираются в транзакции перед широковещательной передачей.</p>

</div>

<div class="api-card">

[broadcast_ops_communities](/api/broadcast_ops_communities/) <span class="badge badge-count">10 операций (английская страница)</span>

<p class="api-card-summary">Операции custom_json для взаимодействия с системой сообществ (id = community; также сообществом распознаются follow, reblog и другие id).</p>

</div>

</div>
