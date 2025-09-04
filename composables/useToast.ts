// composables/useToast.ts
import { reactive } from 'vue'

type Variant = 'success' | 'error' | 'info'
export type Toast = {
  id: number
  message: string
  title?: string
  variant?: Variant
  duration?: number
}

// Gunakan useState agar SSR/HMR aman (tak duplikat saat hot-reload)
const useToastState = () => useState<Toast[]>('toasts', () => [])

export function useToast() {
  const toasts = useToastState()

  const remove = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const show = (message: string, opt: Omit<Toast, 'id' | 'message'> = {}) => {
    const t: Toast = {
      id: Date.now() + Math.random(),
      message,
      variant: opt.variant ?? 'info',
      title: opt.title,
      duration: opt.duration ?? 2600
    }
    toasts.value.push(t)
    // auto-dismiss
    if (t.duration && t.duration > 0) {
      setTimeout(() => remove(t.id), t.duration)
    }
  }

  const success = (msg: string, duration?: number) => show(msg, { variant: 'success', duration })
  const error   = (msg: string, duration?: number) => show(msg, { variant: 'error', duration })
  const info    = (msg: string, duration?: number) => show(msg, { variant: 'info', duration })

  const clear = () => { toasts.value = [] }


  return { toasts: toasts.value, show, remove, clear, success, error, info }
}
