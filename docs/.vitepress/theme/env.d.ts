// Ambient declarations for the theme. VitePress builds with esbuild (no type
// checking), these exist for the editor language server.

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
