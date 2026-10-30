/// <reference types="vitest/config" />
import { defineConfig, Plugin } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Injects the list of emitted app-shell files and a build id into dist/sw.js,
 * so the service worker can precache the app for offline use and drop stale caches.
 */
function precacheManifest(): Plugin {
  let outDir = 'dist';
  const files: string[] = [];
  return {
    name: 'precache-manifest',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    generateBundle(_, bundle) {
      for (const fileName of Object.keys(bundle)) {
        // Browsers only fetch woff2; the woff fallbacks are not worth precaching
        if (/\.(js|css|woff2)$/.test(fileName)) files.push(`/${fileName}`);
      }
    },
    closeBundle() {
      const swPath = join(outDir, 'sw.js');
      const urls = ['/', '/manifest.webmanifest', '/icon.svg', ...files.sort()];
      const buildId = Date.now().toString(36);
      const source = readFileSync(swPath, 'utf8')
        .replace('__BUILD_ID__', buildId)
        .replace('self.__PRECACHE_MANIFEST__', JSON.stringify(urls));
      writeFileSync(swPath, source);
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [precacheManifest()],
  server: {
    port: 3000,
    host: '127.0.0.1',
    open: false
  },
  build: {
    target: 'esnext',
    minify: 'esbuild'
  },
  test: {
    environment: 'jsdom'
  }
});
