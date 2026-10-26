import { defineConfig } from 'vitepress'

const base = process.env.VITEPRESS_BASE || '/steem-docs/'

export default defineConfig({
  lang: 'en',
  title: 'Steem Developer Docs',
  description: 'JSON-RPC API reference for the Steem blockchain, rebuilt with VitePress.',
  base,
  head: [['link', { rel: 'icon', type: 'image/png', href: `${base}favicon.png` }]],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/api/' }
    ],
    search: {
      provider: 'local'
    }
  }
})
