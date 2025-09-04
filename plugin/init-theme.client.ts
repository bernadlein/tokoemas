// plugins/init-theme.client.ts
export default defineNuxtPlugin(() => {
  try {
    const saved = localStorage.getItem('theme')
    const preferDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    const isDark = (saved ?? (preferDark ? 'dark' : 'light')) === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
  } catch {
    // abaikan
  }
})
