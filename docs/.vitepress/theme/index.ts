// Extend the VitePress default theme with site-wide custom styles.
// We deliberately keep the default theme intact (layout, sidebar, search) and
// only layer our own CSS on top — no component rewrites.
import DefaultTheme from 'vitepress/theme';
import './custom.css';

export default DefaultTheme;
