---
title: "API 레퍼런스"
description: "data/apidefinitions에서 생성한 JSON-RPC API 개요 (한국어 버전)"
---

<!--
한국어 API 페이지 (T26, 직접 작성한 정적 페이지). 이 페이지는 docs/api/index.md의
한국어 판입니다(빌드 시점 생성): 카드 수와 카운터는 항상 이 페이지와 동기화를
유지해야 합니다 (데이터 파일이 바뀌면 docs:gen이 영어 요약을 갱신하고, 이 페이지는
수동 갱신 — gen-api-docs.mjs의 overview count guard가 불일치를 빌드 실패로
잡아줍니다). 메서드 20개 API 카드는 /ko/api/ 아래 한국어 인덱스 페이지로 연결되고,
작업 목록 2개 API(broadcast_ops*)에는 아직 한국어판이 없습니다 — 해당 카드는
영어 페이지로 바로 연결됩니다.
주의: frontmatter는 파일 맨 앞에 있어야 하며(그렇지 않으면 컴파일러가
title/description을 읽을 수 없습니다), 서비스 주석은 그 뒤에만 위치합니다.
-->

다음은 `data/apidefinitions/*.yml`에서 빌드 시점에 생성한 JSON-RPC API 레퍼런스입니다. 한국어 인덱스 페이지는 각 API의 모든 메서드를 나열하며, 메서드 페이지는 아직 번역되지 않았습니다 — 표의 링크는 영어 메서드 페이지로 연결됩니다.

# API 레퍼런스

<div class="api-cards">

<div class="api-card">

[Account by key API](/ko/api/account_by_key_api/) <span class="badge badge-count">1개 메서드</span>

<p class="api-card-summary">공개 키로 계정 정보를 조회합니다. AppBase API로, 아직 개발 중이며 인터페이스가 변경될 수 있습니다.</p>

</div>

<div class="api-card">

[Account history API](/ko/api/account_history_api/) <span class="badge badge-count">4개 메서드</span>

<p class="api-card-summary">계정의 기록(오퍼레이션 이력)을 조회합니다. AppBase API로, 아직 개발 중이며 인터페이스가 변경될 수 있습니다.</p>

</div>

<div class="api-card">

[block_api](/ko/api/block_api/) <span class="badge badge-count">2개 메서드</span>

<p class="api-card-summary">블록 플러그인 관련 데이터를 조회합니다. AppBase API로, 아직 개발 중이며 인터페이스가 변경될 수 있습니다.</p>

</div>

<div class="api-card">

[Bridge](/ko/api/bridge/) <span class="badge badge-count">19개 메서드</span>

<p class="api-card-summary">hivemind 데이터베이스가 해석한 데이터를 JSON-RPC 형태로 노출합니다.</p>

</div>

<div class="api-card">

[Call](/ko/api/call/) <span class="badge badge-count">1개 메서드</span>

<p class="api-card-summary">구버전 ‘call’ JSON-RPC 호출 규약을 위한 어댑터로, hivemind API 서버가 제공합니다.</p>

</div>

<div class="api-card">

[Chain API](/ko/api/chain_api/) <span class="badge badge-count">2개 메서드</span>

<p class="api-card-summary">블록과 트랜잭션을 전송하는 직접 엔드포인트입니다. chain_api 플러그인은 소스 코드에 정의되어 있지만 퍼블릭 노드에서는 활성화되어 있지 않습니다.</p>

</div>

<div class="api-card">

[condenser_api](/ko/api/condenser_api/) <span class="badge badge-count">90개 메서드</span>

<p class="api-card-summary">원활한 마이그레이션을 위한 통합 API: 기존 메서드를 모두 모으고 과거의 파라미터 형식을 유지합니다 — 기존 애플리케이션은 요청만 condenser_api로 보내면 Appbase에서 그대로 동작합니다.</p>

</div>

<div class="api-card">

[Database API](/ko/api/database_api/) <span class="badge badge-count">57개 메서드</span>

<p class="api-card-summary">계정, 트랜잭션, 블록체인 관련 데이터를 조회합니다.</p>

</div>

<div class="api-card">

[debug_node_api](/ko/api/debug_node_api/) <span class="badge badge-count">9개 메서드</span>

<p class="api-card-summary">체인을 대상으로 각종 ‘가정(what-if)’ 실험을 하기 위한 프라이빗 플러그인입니다. 퍼블릭 노드는 이 메서드 패밀리를 제공하지 않습니다.</p>

</div>

<div class="api-card">

[Follow API](/ko/api/follow_api/) <span class="badge badge-count">12개 메서드</span>

<p class="api-card-summary">소셜 데이터 조회: 평판, 계정 간 팔로우. AppBase API로, 아직 개발 중이며 인터페이스가 변경될 수 있습니다.</p>

</div>

<div class="api-card">

[Hive](/ko/api/hive/) <span class="badge badge-count">1개 메서드</span>

<p class="api-card-summary">hivemind API 서버가 제공하는 상태·진단 메서드입니다.</p>

</div>

<div class="api-card">

[JSON RPC](/ko/api/jsonrpc/) <span class="badge badge-count">2개 메서드</span>

<p class="api-card-summary">JSON-RPC 레이어 자체의 메타데이터(예: 사용 가능한 API 목록)를 조회합니다. AppBase API로, 아직 개발 중이며 인터페이스가 변경될 수 있습니다.</p>

</div>

<div class="api-card">

[Market history API](/ko/api/market_history_api/) <span class="badge badge-count">7개 메서드</span>

<p class="api-card-summary">시장 기록(거래된 가격과 거래량)을 조회합니다. AppBase API로, 아직 개발 중이며 인터페이스가 변경될 수 있습니다.</p>

</div>

<div class="api-card">

[Network Broadcast API](/ko/api/network_broadcast_api/) <span class="badge badge-count">2개 메서드</span>

<p class="api-card-summary">트랜잭션과 블록을 네트워크에 브로드캐스트합니다. AppBase API로, 아직 개발 중이며 인터페이스가 변경될 수 있습니다.</p>

</div>

<div class="api-card">

[Resource Credit API](/ko/api/rc_api/) <span class="badge badge-count">3개 메서드</span>

<p class="api-card-summary">Resource Credit (RC) 지표를 조회합니다. 참고: RC Bandwidth 시스템, 버전 0.20.2 릴리스 노트, 개발자 가이드의 Resource Credits 문서.</p>

</div>

<div class="api-card">

[reputation_api](/ko/api/reputation_api/) <span class="badge badge-count">1개 메서드</span>

<p class="api-card-summary">계정의 평판 점수를 조회합니다. condenser_api는 필요할 때 follow_api나 reputation_api를 호출합니다.</p>

</div>

<div class="api-card">

[rewards_api](/ko/api/rewards_api/) <span class="badge badge-count">1개 메서드</span>

<p class="api-card-summary">곡선에 따른 지급액 계산을 시뮬레이션합니다. 파라미터: curve:string; var1:string.</p>

</div>

<div class="api-card">

[Tags API](/ko/api/tags_api/) <span class="badge badge-count">21개 메서드</span>

<p class="api-card-summary">태그, 게시물, 토론을 조회합니다. AppBase API로, 아직 개발 중이며 인터페이스가 변경될 수 있습니다.</p>

</div>

<div class="api-card">

[transaction_status_api](/ko/api/transaction_status_api/) <span class="badge badge-count">1개 메서드</span>

<p class="api-card-summary">condenser_api.broadcast_transaction 호출 이후 체인에서 트랜잭션의 상태를 확인합니다.</p>

</div>

<div class="api-card">

[Witness API](/ko/api/witness_api/) <span class="badge badge-count">2개 메서드</span>

<p class="api-card-summary">위트니스(witness) API로, 버전 0.20.6부터 폐기되었으며 기록 보관용으로만 남아 있습니다.</p>

</div>

<div class="api-card">

[broadcast_ops](/api/broadcast_ops/) <span class="badge badge-count">75개 작업 (영어 페이지)</span>

<p class="api-card-summary">Steem 체인의 모든 브로드캐스트 작업 — 오퍼레이션(operation)은 체인에 의도를 표현하는 기본 단위이며, 유형별로 분류되어 트랜잭션으로 묶인 뒤 브로드캐스트됩니다.</p>

</div>

<div class="api-card">

[broadcast_ops_communities](/api/broadcast_ops_communities/) <span class="badge badge-count">10개 작업 (영어 페이지)</span>

<p class="api-card-summary">커뮤니티 시스템과 상호작용하기 위한 custom_json 작업 (id = community; follow, reblog 등의 id도 커뮤니티로 인식됩니다).</p>

</div>

</div>
