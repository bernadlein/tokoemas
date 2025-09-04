// composables/useConfirm.ts
type Opt = {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}

type State = {
  open: boolean
  opts: Required<Opt>
  resolver: ((v: boolean) => void) | null
  mounted: boolean
}

const defaults: Required<Opt> = {
  title: 'Konfirmasi',
  message: 'Yakin ingin melanjutkan?',
  confirmText: 'Ya, lanjut',
  cancelText: 'Batal',
  variant: 'default'
}

export function useConfirm() {
  const state = useState<State>('confirm-state', () => ({
    open: false,
    opts: defaults,
    resolver: null,
    mounted: false
  }))

  function ask(opts: Opt = {}): Promise<boolean> {
    const merged = { ...defaults, ...opts }

    // Fallback: kalau host dialog belum mounted, pakai native confirm
    if (process.client && !state.value.mounted) {
      const text = (merged.title ? merged.title + '\n\n' : '') + (merged.message || '')
      return Promise.resolve(window.confirm(text))
    }

    return new Promise<boolean>((resolve) => {
      state.value.open = true
      state.value.opts = merged
      state.value.resolver = resolve
    })
  }

  function resolve(v: boolean) {
    state.value.open = false
    state.value.resolver?.(v)
    state.value.resolver = null
  }

  function markMounted(v: boolean) {
    state.value.mounted = v
  }

  return { state, ask, resolve, markMounted }
}
