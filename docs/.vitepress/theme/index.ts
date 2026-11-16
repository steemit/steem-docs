// Extend the VitePress default theme with site-wide custom styles.
// We deliberately keep the default theme intact (layout, sidebar, search) and
// only layer our own CSS and the sidebar filter slot on top. DaoTreasuryBalance
// is a self-contained live-data component used by markdown pages (it fetches in
// the browser only; SSR renders the fallback).
import DefaultTheme from 'vitepress/theme';
import { h, type App } from 'vue';
import ApiSidebarFilter from './ApiSidebarFilter.vue';
import DaoTreasuryBalance from './DaoTreasuryBalance.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'sidebar-nav-before': () => h(ApiSidebarFilter)
  }),
  enhanceApp({ app }: { app: App }) {
    app.component('DaoTreasuryBalance', DaoTreasuryBalance);
  }
};
