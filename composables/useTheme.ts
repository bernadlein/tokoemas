// composables/useTheme.ts
export function useTheme() {
  const isDark = useState<boolean>('__theme_is_dark__', () => false)

  const apply = (v: boolean) => {
    isDark.value = v
    if (process.client) {
      const root = document.documentElement
      root.classList.toggle('dark', v)
      try { localStorage.setItem('theme', v ? 'dark' : 'light') } catch {}
    }
  }

  // Inisialisasi saat client mount
  onMounted(() => {
    if (!process.client) return
    const saved = (() => {
      try { return localStorage.getItem('theme') as 'dark' | 'light' | null } catch { return null }
    })()
    const preferDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    apply((saved ?? (preferDark ? 'dark' : 'light')) === 'dark')
  })

  const toggle = () => apply(!isDark.value)

  return { isDark, toggle, setTheme: apply }
}
