export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  tailwindcss: { cssPath: '~/assets/css/tailwind.css' },
  postcss: { plugins: { tailwindcss: {}, autoprefixer: {} } },
  nitro: { preset: 'vercel' },
  app: { head: { title: 'Toko Emas — Prototype v4.1' } }
})
