---
title: Einführung
description: Was die Entwicklerdokumentation für Steem abdeckt und wie die Website aufgebaut ist.
---

# Einführung

Diese Website ist die Entwicklerdokumentation für die Steem-Blockchain. Ihr Kern ist eine vollständige JSON-RPC-API-Referenz: Jede API-Methode hat eine eigene Seite, generiert zur Build-Zeit aus einer einzigen YAML-Wahrheitsquelle — einzeln adressierbar, vollständig durchsuchbar und in acht Sprachen verfügbar.

## Wie die Website aufgebaut ist

Die Seitenleiste spiegelt die tatsächliche Struktur der Website wider:

- **API-Referenz** — die JSON-RPC-Referenz für [condenser_api](/api/condenser_api/) und die AppBase-API-Namespaces (account history, follow, market history, witness und mehr), wobei jede Methode auf ihrer eigenen Seite dokumentiert ist. Ein generierter [API-Index](/api/) listet alle APIs und ihre Methoden auf.
- **Anleitung** — aufgabenorientierte Dokumentation: die [Einführung](/introduction/) (diese Seite), die [Schnellstart](/quickstart/)-Anleitung mit der Community-Liste der [öffentlichen Knoten](/quickstart/), das [Glossar](/glossary/) der Steem-Begriffe sowie die Bereiche [Ressourcen](/resources/) und [Testnet](/testnet/), die sich in Vorbereitung befinden.
- **Dienste** — Dokumentation der Dienste rund um die Chain: der Image-Dienst [ImageHoster](/services/imagehoster.html), [Jussi](/services/jussi.html) (Dokumentation in Vorbereitung) und [Steem DAO](/services/steem-dao.html) (noch zu organisieren).

## Sprachen

Die API-Referenz ist in acht Sprachen verfügbar — English, 简体中文, Русский, Français, Deutsch, Italiano, Español, 한국어. Wechseln Sie über das Sprachmenü in der oberen Navigationsleiste zwischen ihnen. Im Anleitungsbereich sind derzeit nur Einführung und Schnellstart auf Deutsch verfügbar; die übrigen Seiten sind auf Englisch.

## Externe Ressourcen

- [github.com/steemit](https://github.com/steemit) — die Steem-GitHub-Organisation, Heimat der Knotensoftware der Blockchain ([steemit/steem](https://github.com/steemit/steem)) und verwandter Repositories.
- [steemit.com FAQ](https://steemit.com/faq.html) — Antworten auf häufige Fragen zu Steem, seinen Token und seiner Governance.
- [steem-docs](https://github.com/steemit/steem-docs) — die Quelle dieser Website. Wenn Sie einen Fehler oder eine Lücke finden, öffnen Sie ein Issue oder reichen Sie einen Pull Request ein.
