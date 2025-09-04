export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', 'nuxt-icon'],

  devtools: { enabled: true },

  vite: {
    define: {
      __VUE_PROD_DEVTOOLS__: true
    },
    css: {
      devSourcemap: true
    }
  },

  tailwindcss: { cssPath: '~/assets/css/tailwind.css' },
  postcss: { plugins: { tailwindcss: {}, autoprefixer: {} } },

  nitro: { preset: 'vercel' },

  app: {
    head: {
      title: 'Toko Emas — Gilang',
      htmlAttrs: { lang: 'id' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // Beri tahu browser kita mendukung light & dark
        { name: 'color-scheme', content: 'light dark' },
        // Theme-color untuk light & dark (agar status bar mobile ikut tema)
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#f59e0b' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)',  content: '#0f172a' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // Font modern (Inter)
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }
      ]
    }
  }
})
