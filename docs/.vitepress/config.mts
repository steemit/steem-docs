import { defineConfig } from 'vitepress'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.env.VITEPRESS_BASE || '/steem-docs/'

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

function apiSidebar() {
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
        link: `/api/${api.stem}/${m.short}`
      }))
      return {
        // Sidebar item text is rendered with v-html by the default theme.
        text: escapeHtml(api.displayName),
        link: `/api/${api.stem}/`,
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
    search: {
      provider: 'local'
    }
  }
})
