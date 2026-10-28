import { defineConfig } from 'vitepress'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Normalize: VITEPRESS_BASE must start AND end with '/' — every downstream
// consumer (links, hostname, sitemap, og tags) assumes the trailing slash.
const _rawBase = process.env.VITEPRESS_BASE || '/steem-docs/'
const _clean = _rawBase.replace(/^\/+|\/+$/g, '')
const base = _clean ? `/${_clean}/` : '/'

// Canonical production origin + base. VitePress passes sitemap.hostname straight to the
// `sitemap` package, which prepends it to page paths that do NOT include
// `base`, so the base path must already be part of the hostname here. One
// constant feeds sitemap, og:url, canonical and og:image. Moving to a custom
// domain = change the origin in this constant AND set VITEPRESS_BASE to the
// matching path.
const hostname = `https://steemit.github.io${base}`

// Convert a page's relativePath ('index.md', 'api/condenser_api/get_content.md')
// to its public URL path (site-root relative, no base). cleanUrls is false, so
// non-index pages keep the .html suffix; index pages map to their directory URL
// ('index.md' -> '/', 'api/index.md' -> '/api/') — GitHub Pages serves the
// directory's index.html there.
function pageUrl(relativePath: string): string {
  const noExt = relativePath.replace(/\.md$/, '')
  if (noExt === 'index') return '/'
  if (noExt.endsWith('/index')) return `/${noExt.slice(0, -'/index'.length)}/`
  return `/${noExt}.html`
}

// The API sidebar is assembled from the manifest emitted by `pnpm docs:gen`
// (scripts/gen-api-docs.mjs -> docs/.vitepress/gen/api-manifest.json). When the
// manifest is missing (e.g. generator not run yet) degrade to an empty sidebar
// instead of failing the build.
//
// Each API becomes a collapsible group (the group node links to the API index
// page) whose children are the API's method pages, so VitePress can highlight
// the exact method page currently open instead of leaving method URLs without
// any active sidebar entry. Links are theme-config paths: VitePress applies
// `base` itself, and its isActive() comparison ignores .md/.html suffixes and
// /index, so `/api/<stem>/<method>` matches the generated page exactly.
function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// opts.indexPrefix  — where the collapsible GROUP (API index) links point.
// opts.methodPrefix — where the method CHILDREN link point. Since T12 final
//                     (all 215 method purposes translated) the zh sidebar
//                     points BOTH groups and children into the zh tree
//                     ('/zh/api/'): every manifest method now has a zh page.
//                     This retires the T11-era per-method mixed sidebar
//                     deferral; i18nRouting stays off until the T13 locales
//                     (ru/fr/de/it/es, partial coverage) finish.
function apiSidebar(opts: { indexPrefix?: string; methodPrefix?: string } = {}) {
  const indexPrefix = opts.indexPrefix ?? '/api/';
  const methodPrefix = opts.methodPrefix ?? '/api/';
  const manifestPath = join(dirname(fileURLToPath(import.meta.url)), 'gen', 'api-manifest.json')
  if (!existsSync(manifestPath)) {
    console.warn('[vitepress] docs/.vitepress/gen/api-manifest.json not found — run `pnpm docs:gen`; API sidebar disabled.')
    return []
  }
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    return manifest.apis.map((api) => {
      const children = (api.methods ?? []).map((m) => ({
        // v-html surface: default theme renders sidebar text as HTML, so
        // every text we emit must be escaped (same as the group label).
        text: escapeHtml(m.full),
        link: `${methodPrefix}${api.stem}/${m.short}`
      }))
      return {
        // Sidebar item text is rendered with v-html by the default theme.
        text: escapeHtml(api.displayName),
        link: `${indexPrefix}${api.stem}/`,
        // Ops-only APIs (broadcast_ops*) have no method pages: stay a plain
        // link instead of an empty collapsible group.
        ...(children.length > 0 ? { collapsed: true, items: children } : {})
      }
    })
  } catch (err) {
    console.warn('[vitepress] failed to parse api-manifest.json — API sidebar disabled.', err)
    return []
  }
}

// ---------------------------------------------------------------------------
// Local-search tokenizers (T11 hard spec ③)
//
// WHY a top-level tokenizer: VitePress 1.6.4's localSearchPlugin reads ONLY
// `site.themeConfig.search.options` (the top-level one) when it builds the
// MiniSearch indexes. Per-locale index ISOLATION still exists — one MiniSearch
// instance per locale (getLocaleForPath: 'root' vs 'zh'), each shipped as its
// own virtual module — but the OPTIONS used to build them are shared. The zh
// index therefore must be built with CJK-aware tokenization configured here,
// at the top level. The function below splits non-CJK text exactly like
// MiniSearch's default tokenizer (`text.split(/[\n\r\p{Z}\p{P}]+/u)`), so the
// English index terms — and therefore English search behavior — are unchanged;
// only tokens CONTAINING CJK get the extra treatment.
//
// WHY both functions are self-contained (no closures over module scope):
// VitePress serializes themeConfig functions into site data via
// `fn.toString()` (`_vp-fn_` + deserializeFunctions), and rehydrates them in
// the BROWSER — any closed-over helper would be undefined there.
//
// Query-side tokenization is configured per locale (locales.zh.themeConfig
// .search): with MiniSearch's default settings VitePress combines query
// tokens with AND + prefix matching, so a multi-char query token like 证人
// (the middle of 见证人) can never prefix-match and mid-word search would
// fail. The zh query tokenizer therefore emits SINGLE code points for CJK —
// 见证 -> [见, 证] — which matches the single-character terms the build
// tokenizer also indexes. Intl.Segmenter (granularity 'word') is used when
// available so that mixed Latin/CJK runs keep their Latin words whole; where
// Segmenter is missing (or at query time, where word tokens would break the
// AND semantics) we degrade to per-code-point splitting. This trade-off
// (recall over precision) is the documented pilot choice: mid-word search
// beats exact-word precision for the acceptance case 搜「见证」→ 命中「见证人」.
// ---------------------------------------------------------------------------
function buildSearchTokenize(text: string) {
  const SPACE_OR_PUNCTUATION = /[\n\r\p{Z}\p{P}]+/u
  const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u
  // Built once per call (not per CJK token) but INSIDE the function body:
  // search options are serialized via _vp-fn_, so the body must stay
  // self-contained — no references to module-scope helpers.
  const segmenter =
    typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
      ? new Intl.Segmenter('zh-Hans', { granularity: 'word' })
      : null
  const tokens = []
  for (const raw of text.split(SPACE_OR_PUNCTUATION)) {
    if (!raw) continue
    if (!CJK_RE.test(raw)) {
      // No CJK: identical to MiniSearch's default tokenizer output.
      tokens.push(raw)
      continue
    }
    // CJK-bearing: prefer Intl.Segmenter word segmentation (fallback: the
    // whole run), index each CJK word AND its individual code points.
    let words = [raw]
    if (segmenter) {
      words = Array.from(segmenter.segment(raw), (s) => s.segment).filter((w) => w.length > 0)
    }
    for (const word of words) {
      if (!CJK_RE.test(word)) {
        tokens.push(word)
        continue
      }
      tokens.push(word)
      for (const ch of word) tokens.push(ch)
    }
  }
  return tokens
}

function zhQueryTokenize(text: string) {
  const SPACE_OR_PUNCTUATION = /[\n\r\p{Z}\p{P}]+/u
  const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u
  const tokens = []
  for (const raw of text.split(SPACE_OR_PUNCTUATION)) {
    if (!raw) continue
    // Single code points for CJK (needed for mid-word matching under AND +
    // prefix); keep non-CJK runs whole, exactly like MiniSearch's default.
    let latinRun = ''
    for (const ch of raw) {
      if (CJK_RE.test(ch)) {
        if (latinRun) tokens.push(latinRun)
        latinRun = ''
        tokens.push(ch)
      } else {
        latinRun += ch
      }
    }
    if (latinRun) tokens.push(latinRun)
  }
  return tokens
}

// ---------------------------------------------------------------------------
// i18n locales — zh pilot ACTIVE (T11) + ru/fr/de/it/es rollouts (T13).
// Structure:
//   docs/             -> en (root locale, existing content)
//   docs/zh/*.md      -> hand-written zh static pages (home, API overview)
//   docs/zh/api/      -> GENERATED bridge index pages + zh method pages for
//                        translated purposes (docs:gen --locale zh; T11+T12)
//   docs/ru/*.md      -> hand-written ru static pages (home, API overview)
//   docs/ru/api/      -> GENERATED bridge index pages (docs:gen --locale ru);
//                        NO ru method pages this phase — all rows bridge en
//   docs/{fr,de,it,es}/*.md -> hand-written static pages, same shape as ru
//   docs/{fr,de,it,es}/api/ -> GENERATED bridge index pages
//                        (docs:gen --locale <code>); method pages deferred
//   docs/ko/*.md       -> hand-written ko static pages, same shape as es (T26)
//   docs/ko/api/       -> GENERATED bridge index pages (docs:gen --locale ko)
//
// Merge semantics (official resolveSiteDataByRoute): each page's themeConfig
// is `{ ...topLevel.themeConfig, ...locales[localeIndex].themeConfig }` — a
// SHALLOW merge. Consequences this config relies on:
//   * keys set at the TOP level (i18nRouting, search defaults, logo) apply to
//     every locale unless the locale overrides them wholesale;
//   * locales.root does NOT take part in the zh-page merge — anything that
//     must affect zh pages cannot live there;
//   * a locale that sets `search` replaces the WHOLE search object, so the
//     zh block below carries a complete provider + options config.
// ---------------------------------------------------------------------------

export default defineConfig({
  lang: 'en',
  title: 'Steem Developer Docs',
  description: 'JSON-RPC API reference for the Steem blockchain, rebuilt with VitePress.',
  base,
  // Content pages carry no meaningful git timestamps (the YAML data files are
  // the source of truth), so the "Last updated" footer is disabled.
  lastUpdated: false,
  sitemap: { hostname },
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: `${base}favicon.png` }],
    // Open Graph / Twitter card basics. og:* tags use property="", twitter:*
    // uses name="" (per the respective specs). og:image is absolute so crawlers
    // resolve it regardless of the page they arrive from. og:url is NOT set
    // here — it is page-specific and generated per page in transformHead below.
    //
    // og:image deliberately points at favicon.png, not logo.svg: social
    // crawlers (Facebook, X/Twitter, Slack, iMessage, ...) generally do not
    // render SVG for og:image, so a raster PNG is required for the card image
    // to show up at all. Dimensions match docs/public/favicon.png (250x250).
    ['meta', { property: 'og:site_name', content: 'Steem Developer Docs' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: `${hostname}favicon.png` }],
    ['meta', { property: 'og:image:width', content: '250' }],
    ['meta', { property: 'og:image:height', content: '250' }],
    ['meta', { property: 'og:image:alt', content: 'Steem Developer Docs logo' }],
    ['meta', { name: 'twitter:card', content: 'summary' }]
  ],
  // Per-page og:url / canonical / og:title / og:description. The global `head`
  // above is identical for every page, so page-specific tags are generated
  // here instead: transformHead runs once per page at build time and its
  // returned tags are merged with the global head (VitePress 1.6.4 signature:
  // (ctx: { pageData, siteConfig }) => HeadConfig[]).
  transformHead({ pageData, siteConfig }) {
    // hostname already ends with '/', pageUrl starts with '/' — trim one so
    // index pages don't render '.../steem-docs//' with a double slash.
    const url = `${hostname.replace(/\/$/, '')}${pageUrl(pageData.relativePath)}`
    return [
      ['meta', { property: 'og:url', content: url }],
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:title', content: pageData.title || siteConfig.site.title }],
      ['meta', { property: 'og:description', content: pageData.frontmatter?.description || siteConfig.site.description }]
    ]
  },
  themeConfig: {
    // VitePress applies withBase() to themeConfig.logo itself — passing
    // `${base}logo.svg` would double the prefix (/steem-docs/steem-docs/...).
    logo: '/logo.svg',

    // T11 hard spec ② — i18nRouting DISABLED during the translation
    // transition. MUST live here at the TOP-level themeConfig:
    // resolveSiteDataByRoute merges `{...topLevel.themeConfig,
    // ...locales[route].themeConfig}` (shallow), so locales.root's copy would
    // never reach a zh page. With i18nRouting false the language switcher
    // navigates to the OTHER LOCALE'S HOME (locales.*.link) instead of
    // 1:1-swapping the current path. zh itself now has full 1:1 coverage
    // (all 215 method pages since T12 final), but T13 registered five
    // partial locales (ru/fr/de/it/es — index pages only, no method pages)
    // where 1:1 swaps would 404 — so this stays off until those locales
    // complete method-page translation (phase-2 plan, post-T13 decision).
    i18nRouting: false,

    // T11 hard spec ③ — local search, ROOT/en side + BUILD-TIME options.
    // This top-level block is what the zh pages are NOT supposed to use
    // (they get locales.zh.themeConfig.search below); it stays here because
    // (a) the 1.6.4 localSearchPlugin builds every locale's index from the
    // top-level options (see the tokenizer comment above — this is why
    // buildSearchTokenize must live HERE), and (b) root pages resolve their
    // themeConfig from this same block when locales.root sets no `search`.
    // It is deliberately NOT the same thing as `search.options.locales` —
    // that sub-key (used in the zh block below) only carries per-locale
    // SEARCH-MODAL UI translations keyed by locale index, never index/tokenize
    // options. Do not move tokenize options into it.
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            tokenize: buildSearchTokenize
          }
        },
        // T13/T26 — ru + fr/de/it/es/ko search-modal UI strings, keyed by
        // locale index so only those locales' pages pick them up (en resolves
        // no matching key -> default English UI; zh replaces the whole search
        // object below). NO tokenizer override anywhere for these locales:
        // Russian words are whitespace/punctuation-delimited (the shared
        // build tokenizer, which only special-cases CJK runs, indexes
        // Cyrillic terms whole — identical to MiniSearch's default), the
        // fr/de/it/es locales are Latin-script like en, and ko is
        // space-delimited Hangul — MiniSearch's default query tokenizer
        // matches them all as-is.
        locales: {
          ru: {
            translations: {
              button: {
                buttonText: 'Поиск',
                buttonAriaLabel: 'Поиск'
              },
              modal: {
                displayDetails: 'Показать подробный список',
                resetButtonTitle: 'Сбросить запрос',
                backButtonTitle: 'Вернуться назад',
                noResultsText: 'Результатов не найдено',
                footer: {
                  selectText: 'Выбрать',
                  selectKeyAriaLabel: 'Выбрать',
                  navigateText: 'Переключить',
                  navigateUpKeyAriaLabel: 'Стрелка вверх',
                  navigateDownKeyAriaLabel: 'Стрелка вниз',
                  closeText: 'Закрыть',
                  closeKeyAriaLabel: 'Закрыть'
                }
              }
            }
          },
          fr: {
            translations: {
              button: {
                buttonText: 'Rechercher',
                buttonAriaLabel: 'Rechercher'
              },
              modal: {
                displayDetails: 'Afficher la liste détaillée',
                resetButtonTitle: 'Réinitialiser la recherche',
                backButtonTitle: 'Retour',
                noResultsText: 'Aucun résultat trouvé',
                footer: {
                  selectText: 'Sélectionner',
                  selectKeyAriaLabel: 'Sélectionner',
                  navigateText: 'Naviguer',
                  navigateUpKeyAriaLabel: 'Flèche vers le haut',
                  navigateDownKeyAriaLabel: 'Flèche vers le bas',
                  closeText: 'Fermer',
                  closeKeyAriaLabel: 'Fermer'
                }
              }
            }
          },
          de: {
            translations: {
              button: {
                buttonText: 'Suche',
                buttonAriaLabel: 'Suche'
              },
              modal: {
                displayDetails: 'Detaillierte Liste anzeigen',
                resetButtonTitle: 'Suche zurücksetzen',
                backButtonTitle: 'Zurück',
                noResultsText: 'Keine Ergebnisse gefunden',
                footer: {
                  selectText: 'Auswählen',
                  selectKeyAriaLabel: 'Auswählen',
                  navigateText: 'Navigieren',
                  navigateUpKeyAriaLabel: 'Pfeil nach oben',
                  navigateDownKeyAriaLabel: 'Pfeil nach unten',
                  closeText: 'Schließen',
                  closeKeyAriaLabel: 'Schließen'
                }
              }
            }
          },
          it: {
            translations: {
              button: {
                buttonText: 'Cerca',
                buttonAriaLabel: 'Cerca'
              },
              modal: {
                displayDetails: 'Mostra elenco dettagliato',
                resetButtonTitle: 'Reimposta ricerca',
                backButtonTitle: 'Indietro',
                noResultsText: 'Nessun risultato trovato',
                footer: {
                  selectText: 'Seleziona',
                  selectKeyAriaLabel: 'Seleziona',
                  navigateText: 'Passa',
                  navigateUpKeyAriaLabel: 'Freccia su',
                  navigateDownKeyAriaLabel: 'Freccia giù',
                  closeText: 'Chiudi',
                  closeKeyAriaLabel: 'Chiudi'
                }
              }
            }
          },
          es: {
            translations: {
              button: {
                buttonText: 'Buscar',
                buttonAriaLabel: 'Buscar'
              },
              modal: {
                displayDetails: 'Mostrar lista detallada',
                resetButtonTitle: 'Restablecer búsqueda',
                backButtonTitle: 'Atrás',
                noResultsText: 'No se encontraron resultados',
                footer: {
                  selectText: 'Seleccionar',
                  selectKeyAriaLabel: 'Seleccionar',
                  navigateText: 'Navegar',
                  navigateUpKeyAriaLabel: 'Flecha arriba',
                  navigateDownKeyAriaLabel: 'Flecha abajo',
                  closeText: 'Cerrar',
                  closeKeyAriaLabel: 'Cerrar'
                }
              }
            }
          },
          ko: {
            translations: {
              button: {
                buttonText: '검색',
                buttonAriaLabel: '검색'
              },
              modal: {
                displayDetails: '상세 목록 표시',
                resetButtonTitle: '검색 초기화',
                backButtonTitle: '뒤로',
                noResultsText: '검색 결과가 없습니다',
                footer: {
                  selectText: '선택',
                  selectKeyAriaLabel: '선택',
                  navigateText: '이동',
                  navigateUpKeyAriaLabel: '위쪽 화살표',
                  navigateDownKeyAriaLabel: '아래쪽 화살표',
                  closeText: '닫기',
                  closeKeyAriaLabel: '닫기'
                }
              }
            }
          }
        }
      }
    }
  },
  // Locale registry (site-level, sibling of themeConfig — resolveSiteDataByRoute
  // reads siteData.locales, never themeConfig.locales). root keeps the existing
  // en content; zh adds the pilot subtree.
  locales: {
    root: {
      label: 'English', // required: the switcher renders nothing without it
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'API', link: '/api/' }
        ],
        sidebar: [
          {
            text: 'API Reference',
            items: apiSidebar()
          }
        ],
        // T13 review fixes — language-switcher flyout label + 404 page copy.
        // Every locale carries both (see the per-locale blocks below); the
        // static 404.html snapshot is rendered from THIS root locale, so the
        // English strings must live here and not only in the other locales.
        langMenuLabel: 'Change language',
        notFound: {
          title: 'PAGE NOT FOUND',
          quote: 'But if you don’t change your direction, and if you keep looking, you may end up where you are heading.',
          linkLabel: 'go to home',
          linkText: 'Take me home'
        }
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-Hans',
      // Switcher target while i18nRouting is off: always the zh homepage.
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          { text: 'API', link: '/zh/api/' }
        ],
        // zh index pages and all 215 translated method pages are generated;
        // since T12 final the sidebar children point into the zh tree too
        // (see apiSidebar opts comment).
        sidebar: [
          {
            text: 'API 参考',
            items: apiSidebar({ indexPrefix: '/zh/api/', methodPrefix: '/zh/api/' })
          }
        ],
        // Default-theme UI strings (VitePress default theme overridables).
        // No `lastUpdated` text override: the feature itself is off
        // site-wide (`lastUpdated: false` above).
        outline: { label: '本页目录' },
        docFooter: { prev: '上一页', next: '下一页' },
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '外观',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
        skipToContentLabel: '跳到正文',
        langMenuLabel: '切换语言',
        notFound: {
          title: '页面不存在',
          quote: '您访问的页面不存在或已被移动。',
          linkLabel: '返回首页',
          linkText: '返回首页'
        },
        // T11 hard spec ③ — zh search side. `search` REPLACES the top-level
        // object on zh pages (shallow merge), so provider + full options
        // live here. miniSearch.searchOptions.tokenize drives QUERY
        // tokenization (client spreads it over VitePress's own
        // fuzzy/prefix/boost defaults); miniSearch.options.tokenize keeps
        // the loaded instance consistent. Modal UI strings use the
        // `options.locales` sub-key — UI translations ONLY (see comment at
        // the top-level search block for the distinction).
        search: {
          provider: 'local',
          options: {
            miniSearch: {
              options: { tokenize: zhQueryTokenize },
              searchOptions: { tokenize: zhQueryTokenize }
            },
            locales: {
              zh: {
                translations: {
                  button: {
                    buttonText: '搜索文档',
                    buttonAriaLabel: '搜索文档'
                  },
                  modal: {
                    displayDetails: '显示详细列表',
                    resetButtonTitle: '重置搜索',
                    backButtonTitle: '返回',
                    noResultsText: '没有找到相关结果',
                    footer: {
                      selectText: '选择',
                      selectKeyAriaLabel: '选中',
                      navigateText: '切换',
                      navigateUpKeyAriaLabel: '上移',
                      navigateDownKeyAriaLabel: '下移',
                      closeText: '关闭',
                      closeKeyAriaLabel: '关闭'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      // Switcher target while i18nRouting is off: always the ru homepage.
      link: '/ru/',
      themeConfig: {
        nav: [
          { text: 'Главная', link: '/ru/' },
          { text: 'API', link: '/ru/api/' }
        ],
        // T27 full locale: ru index pages AND all 238 translated method pages
        // are generated, so the sidebar children point into the ru tree too
        // (same shape as the zh sidebar since T12).
        sidebar: [
          {
            text: 'Справочник API',
            items: apiSidebar({ indexPrefix: '/ru/api/', methodPrefix: '/ru/api/' })
          }
        ],
        // Default-theme UI strings (VitePress default theme overridables).
        // No `lastUpdated` text override: the feature itself is off
        // site-wide (`lastUpdated: false` above). Search modal strings for
        // ru live in the TOP-LEVEL search block (see the locales key there) —
        // ru deliberately sets no `search` here: MiniSearch's default
        // tokenization already suits Cyrillic, and omitting the block lets
        // ru pages reuse the shared provider/options configuration.
        outline: { label: 'На этой странице' },
        docFooter: { prev: 'Предыдущая', next: 'Следующая' },
        returnToTopLabel: 'Вернуться к началу',
        sidebarMenuLabel: 'Меню',
        darkModeSwitchLabel: 'Оформление',
        lightModeSwitchTitle: 'Переключить на светлую тему',
        darkModeSwitchTitle: 'Переключить на тёмную тему',
        skipToContentLabel: 'Перейти к содержимому',
        langMenuLabel: 'Изменить язык',
        notFound: {
          title: 'СТРАНИЦА НЕ НАЙДЕНА',
          quote: 'Запрашиваемая страница не существует или была перемещена.',
          linkLabel: 'на главную',
          linkText: 'На главную'
        }
      }
    },
    fr: {
      label: 'Français',
      lang: 'fr',
      // Switcher target while i18nRouting is off: always the fr homepage.
      link: '/fr/',
      themeConfig: {
        nav: [
          { text: 'Accueil', link: '/fr/' },
          { text: 'API', link: '/fr/api/' }
        ],
        // T28 full locale: fr index pages AND all 238 translated method pages
        // are generated, so the sidebar children point into the fr tree too
        // (same shape as the zh/ru sidebars since T27).
        sidebar: [
          {
            text: 'Référence API',
            items: apiSidebar({ indexPrefix: '/fr/api/', methodPrefix: '/fr/api/' })
          }
        ],
        // Search modal strings live in the TOP-LEVEL search block (see the
        // locales key there) — fr deliberately sets no `search` here, so its
        // pages reuse the shared provider/options configuration (default
        // tokenization suits Latin-script French).
        outline: { label: 'Sur cette page' },
        docFooter: { prev: 'Page précédente', next: 'Page suivante' },
        returnToTopLabel: 'Retour en haut',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Apparence',
        lightModeSwitchTitle: 'Passer au thème clair',
        darkModeSwitchTitle: 'Passer au thème sombre',
        skipToContentLabel: 'Aller au contenu',
        langMenuLabel: 'Changer de langue',
        notFound: {
          title: 'PAGE INTROUVABLE',
          quote: 'La page demandée n’existe pas ou a été déplacée.',
          linkLabel: 'aller à l’accueil',
          linkText: 'Retour à l’accueil'
        }
      }
    },
    de: {
      label: 'Deutsch',
      lang: 'de',
      // Switcher target while i18nRouting is off: always the de homepage.
      link: '/de/',
      themeConfig: {
        nav: [
          { text: 'Startseite', link: '/de/' },
          { text: 'API', link: '/de/api/' }
        ],
        // T29 full locale: de index pages AND all 238 translated method pages
        // are generated, so the sidebar children point into the de tree too
        // (same shape as the zh sidebar since T12).
        sidebar: [
          {
            text: 'API-Referenz',
            items: apiSidebar({ indexPrefix: '/de/api/', methodPrefix: '/de/api/' })
          }
        ],
        outline: { label: 'Auf dieser Seite' },
        docFooter: { prev: 'Vorherige Seite', next: 'Nächste Seite' },
        returnToTopLabel: 'Zurück nach oben',
        sidebarMenuLabel: 'Menü',
        darkModeSwitchLabel: 'Erscheinungsbild',
        lightModeSwitchTitle: 'Zum hellen Design wechseln',
        darkModeSwitchTitle: 'Zum dunklen Design wechseln',
        skipToContentLabel: 'Zum Inhalt springen',
        langMenuLabel: 'Sprache wechseln',
        notFound: {
          title: 'SEITE NICHT GEFUNDEN',
          quote: 'Die angeforderte Seite existiert nicht oder wurde verschoben.',
          linkLabel: 'zur Startseite',
          linkText: 'Zur Startseite'
        }
      }
    },
    it: {
      label: 'Italiano',
      lang: 'it',
      // Switcher target while i18nRouting is off: always the it homepage.
      link: '/it/',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/it/' },
          { text: 'API', link: '/it/api/' }
        ],
        sidebar: [
          {
            text: 'Riferimento API',
            // T30 full locale: it index pages AND all 238 translated method
            // pages are generated, so the sidebar children point into the it
            // tree too (same shape as the zh/ru/fr sidebars since T27).
            items: apiSidebar({ indexPrefix: '/it/api/', methodPrefix: '/it/api/' })
          }
        ],
        outline: { label: 'In questa pagina' },
        docFooter: { prev: 'Pagina precedente', next: 'Pagina successiva' },
        returnToTopLabel: 'Torna all’inizio',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Aspetto',
        lightModeSwitchTitle: 'Passa al tema chiaro',
        darkModeSwitchTitle: 'Passa al tema scuro',
        skipToContentLabel: 'Vai al contenuto',
        langMenuLabel: 'Cambia lingua',
        notFound: {
          title: 'PAGINA NON TROVATA',
          quote: 'La pagina richiesta non esiste o è stata spostata.',
          linkLabel: 'vai alla home',
          linkText: 'Torna alla home'
        }
      }
    },
    es: {
      label: 'Español',
      lang: 'es',
      // Switcher target while i18nRouting is off: always the es homepage.
      link: '/es/',
      themeConfig: {
        nav: [
          { text: 'Inicio', link: '/es/' },
          { text: 'API', link: '/es/api/' }
        ],
        sidebar: [
          {
            text: 'Referencia de API',
            items: apiSidebar({ indexPrefix: '/es/api/', methodPrefix: '/api/' })
          }
        ],
        outline: { label: 'En esta página' },
        docFooter: { prev: 'Página anterior', next: 'Página siguiente' },
        returnToTopLabel: 'Volver arriba',
        sidebarMenuLabel: 'Menú',
        darkModeSwitchLabel: 'Apariencia',
        lightModeSwitchTitle: 'Cambiar al tema claro',
        darkModeSwitchTitle: 'Cambiar al tema oscuro',
        skipToContentLabel: 'Ir al contenido',
        langMenuLabel: 'Cambiar idioma',
        notFound: {
          title: 'PÁGINA NO ENCONTRADA',
          quote: 'La página solicitada no existe o ha sido movida.',
          linkLabel: 'ir al inicio',
          linkText: 'Volver al inicio'
        }
      }
    },
    ko: {
      label: '한국어',
      lang: 'ko',
      // Switcher target while i18nRouting is off: always the ko homepage.
      link: '/ko/',
      themeConfig: {
        nav: [
          { text: '홈', link: '/ko/' },
          { text: 'API', link: '/ko/api/' }
        ],
        // T26 partial locale: ko has NO method pages, so the collapsible
        // GROUP nodes (API index pages) point into the ko tree while the
        // method CHILDREN bridge to the en tree — same as ru/fr/de/it/es.
        sidebar: [
          {
            text: 'API 레퍼런스',
            items: apiSidebar({ indexPrefix: '/ko/api/', methodPrefix: '/api/' })
          }
        ],
        // Search modal strings live in the TOP-LEVEL search block (see the
        // locales key there) — ko deliberately sets no `search` here, so its
        // pages reuse the shared provider/options configuration (default
        // tokenization suits space-delimited Hangul).
        outline: { label: '이 페이지에서' },
        docFooter: { prev: '이전 페이지', next: '다음 페이지' },
        returnToTopLabel: '맨 위로',
        sidebarMenuLabel: '메뉴',
        darkModeSwitchLabel: '테마',
        lightModeSwitchTitle: '라이트 모드로 전환',
        darkModeSwitchTitle: '다크 모드로 전환',
        skipToContentLabel: '본문으로 건너뛰기',
        langMenuLabel: '언어 변경',
        notFound: {
          title: '페이지를 찾을 수 없습니다',
          quote: '요청한 페이지가 존재하지 않거나 이동되었습니다.',
          linkLabel: '홈으로 이동',
          linkText: '홈으로'
        }
      }
    }
  }
})
