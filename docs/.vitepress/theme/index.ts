// Extend the VitePress default theme with site-wide custom styles.
// We deliberately keep the default theme intact (layout, sidebar, search) and
// only layer our own CSS on top — no component rewrites. The one exception is
// DaoTreasuryBalance, a self-contained live-data component used by markdown
// pages (it fetches in the browser only; SSR renders the fallback).
import DefaultTheme from 'vitepress/theme';
import type { App } from 'vue';
import DaoTreasuryBalance from './DaoTreasuryBalance.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    app.component('DaoTreasuryBalance', DaoTreasuryBalance);
  }
};
