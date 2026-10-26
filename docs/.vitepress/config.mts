import { defineConfig } from 'vitepress'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.env.VITEPRESS_BASE || '/steem-docs/'

// The API sidebar is assembled from the manifest emitted by `pnpm docs:gen`
// (scripts/gen-api-docs.mjs -> docs/.vitepress/gen/api-manifest.json). When the
// manifest is missing (e.g. generator not run yet) degrade to an empty sidebar
// instead of failing the build.
function apiSidebar() {
  const manifestPath = join(dirname(fileURLToPath(import.meta.url)), 'gen', 'api-manifest.json')
  if (!existsSync(manifestPath)) {
    console.warn('[vitepress] docs/.vitepress/gen/api-manifest.json not found — run `pnpm docs:gen`; API sidebar disabled.')
    return []
  }
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    return manifest.apis.map((api) => ({ text: api.displayName, link: `/api/${api.stem}/` }))
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
