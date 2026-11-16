import { defineConfig } from 'vite';
import { inhalte } from './tools/vite-inhalte.ts';

export default defineConfig({
  base: './',
  oxc: {
    jsx: { runtime: 'automatic', importSource: 'preact' },
  },
  plugins: [inhalte()],
});
