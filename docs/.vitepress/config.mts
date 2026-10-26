import { defineConfig } from 'vitepress'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.env.VITEPRESS_BASE || '/steem-docs/'

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
  head: [['link', { rel: 'icon', type: 'image/png', href: `${base}favicon.png` }]],
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
