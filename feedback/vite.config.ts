import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  define: {
    __JAT_FEEDBACK_VERSION__: JSON.stringify(pkg.version)
  },
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true
      }
    })
  ],
  resolve: {
    alias: {
      // chalk is a Node.js terminal coloring lib — noop in browser context
      // page-agent uses it for debug logging; stubbing saves ~5KB
      'chalk': fileURLToPath(new URL('./src/shims/chalk.ts', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'JatFeedback',
      formats: ['iife', 'es'],
      fileName: (format) => format === 'iife' ? 'jat-feedback.js' : 'jat-feedback.mjs'
    },
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});
