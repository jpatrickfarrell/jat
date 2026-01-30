import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background.js'
          if (chunkInfo.name === 'content') return 'content.js'
          return '[name].js'
        },
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.html')) {
            return '[name].[ext]'
          }
          return 'assets/[name].[ext]'
        }
      }
    },
    target: 'es2020',
    minify: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    svelte({
      compilerOptions: {
        // Chrome extension popup runs in its own context
        css: 'injected'
      }
    }),
    {
      name: 'copy-manifest',
      closeBundle() {
        const manifestSrc = resolve(__dirname, 'manifest.json')
        const manifestDest = resolve(__dirname, 'dist/manifest.json')
        fs.copyFileSync(manifestSrc, manifestDest)
        console.log('✓ Copied manifest.json to dist/')
      }
    },
    {
      name: 'copy-html-pages',
      closeBundle() {
        // Vite puts HTML files in dist/src/{dir}/ - copy to dist root
        // and fix script paths to be relative to the new location
        const pages = [
          { src: 'dist/src/popup/index.html', dest: 'dist/popup.html', name: 'popup' },
          { src: 'dist/src/options/index.html', dest: 'dist/options.html', name: 'options' },
        ]
        for (const page of pages) {
          const pageSrc = resolve(__dirname, page.src)
          const pageDest = resolve(__dirname, page.dest)
          if (fs.existsSync(pageSrc)) {
            let html = fs.readFileSync(pageSrc, 'utf-8')
            // Fix relative paths: ../../foo.js -> ./foo.js
            html = html.replace(/src="\.\.\/\.\.\//g, 'src="./')
            html = html.replace(/href="\.\.\/\.\.\//g, 'href="./')
            fs.writeFileSync(pageDest, html)
            console.log(`✓ Copied ${page.name}.html to dist root (paths fixed)`)
          }
        }
        // Remove the nested src/ directory artifact
        const srcDir = resolve(__dirname, 'dist/src')
        if (fs.existsSync(srcDir)) {
          fs.rmSync(srcDir, { recursive: true, force: true })
        }
      }
    },
    {
      name: 'copy-icons',
      closeBundle() {
        const publicDir = resolve(__dirname, 'public')
        const distDir = resolve(__dirname, 'dist')
        if (fs.existsSync(publicDir)) {
          const copyRecursively = (src: string, dest: string) => {
            if (!fs.existsSync(dest)) {
              fs.mkdirSync(dest, { recursive: true })
            }
            fs.readdirSync(src).forEach(file => {
              const srcFile = path.join(src, file)
              const destFile = path.join(dest, file)
              if (fs.statSync(srcFile).isDirectory()) {
                copyRecursively(srcFile, destFile)
              } else {
                fs.copyFileSync(srcFile, destFile)
              }
            })
          }
          copyRecursively(publicDir, distDir)
          console.log('✓ Copied public assets to dist/')
        }
      }
    }
  ]
})
