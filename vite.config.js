import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      srcDir: 'src',
      filename: 'sw.js',
      strategies: 'injectManifest',
      injectRegister: 'auto',
      type: 'module',
      manifest: {
        name: 'planet',
        short_name: 'planet',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        description: 'Planet PWA Service',
        icons: [
          {
            src: "icons/planet-logo-48x48.png",
            sizes: "48x48",
            type: "image/png"
          },
          {
            src: "icons/planet-logo-72x72.png",
            sizes: "72x72",
            type: "image/png"
          },
          {
            src: "icons/planet-logo-96x96.png",
            sizes: "96x96",
            type: "image/png"
          },
          {
            src: "icons/planet-logo-128x128.png",
            sizes: "128x128",
            type: "image/png"
          },
          {
            src: "icons/planet-logo-144x144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "icons/planet-logo-152x152.png",
            sizes: "152x152",
            type: "image/png"
          },
          {
            src: "icons/planet-logo-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icons/planet-logo-256x256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "icons/planet-logo-384x384.png",
            sizes: "384x384",
            type: "image/png"
          },
          {
            src: "icons/planet-logo-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          // {
          //   src: '/planet-logo-512.png',
          //   sizes: '512x512',
          //   type: 'image/png'
          // },
          {
            src: '/planet-logo-512-maskable-1.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
        ],
      },
      pwaAssets: {
        disabled: true
      },
      devOptions: {
        enabled: false,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // @ → src 폴더 매핑
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  optimizeDeps: {
    include: ['sockjs-client']
  }
})