<template>
  <teleport to="body">
    <div class="fixed z-[9999] top-4 right-4 space-y-2">
      <TransitionGroup name="slide-fade">
        <div v-for="t in toasts" :key="t.id"
             class="min-w-[260px] max-w-[380px] rounded-xl px-4 py-3 shadow-lg ring-1 bg-white/90 backdrop-blur
                    ring-slate-200 flex items-start gap-3"
             :class="t.variant==='success' ? 'border-l-4 border-emerald-500' :
                     t.variant==='error'   ? 'border-l-4 border-rose-500' :
                                             'border-l-4 border-amber-500'">
          <div class="mt-0.5 text-lg">
            <span v-if="t.variant==='success'">✅</span>
            <span v-else-if="t.variant==='error'">⚠️</span>
            <span v-else>💡</span>
          </div>
          <div class="min-w-0">
            <div v-if="t.title" class="font-medium">{{ t.title }}</div>
            <div class="text-sm break-words text-slate-700">{{ t.message }}</div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
const { toasts } = useToast()
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active { transition: all .25s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateY(-6px) }
.slide-fade-leave-to   { opacity: 0; transform: translateY(-6px) }
</style>
