import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    host: '127.0.0.1',
    open: false
  },
  build: {
    target: 'esnext',
    minify: 'esbuild'
  }
});
