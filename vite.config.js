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
      registerType: 'autoUpdate', // 새 빌드 배포 시 자동 갱신 체크
      srcDir: 'src',
      filename: 'sw.js',          // 네가 만든 서비스워커 파일
      strategies: 'injectManifest', // sw.js에 프리캐시 주입
      injectRegister: 'auto',     // 클라이언트에서 자동 등록
      type: 'module', // 서비스 워커를 ES 모듈로 명시
      manifest: {
        name: 'Planet',
        short_name: 'Planet',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#111827',
        icons: [
          { src: '/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/planet-logo-512.png', sizes: '512x512', type: 'image/png' },        // ← 실제 512
          { src: '/planet-logo-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }, // 선택
          { src: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      devOptions: {
        enabled: false, // 개발환경(https 아님)에서는 SW 비활성 권장
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
})