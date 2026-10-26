import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en',
  title: 'Steem Developer Docs',
  description: 'JSON-RPC API reference for the Steem blockchain, rebuilt with VitePress.',
  base: process.env.VITEPRESS_BASE || '/steem-docs/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/api/' }
    ]
  }
})
