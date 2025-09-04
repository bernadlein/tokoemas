<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="state.open" class="fixed inset-0 z-[70]">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="resolve(false)" />
        <div class="absolute inset-0 flex items-end justify-center p-4 md:items-center">
          <transition name="pop">
            <div class="w-full max-w-md card shadow-card">
              <h3 class="mb-2 text-base font-semibold">{{ state.opts.title }}</h3>
              <p class="mb-4 text-sm text-slate-600 dark:text-slate-300">{{ state.opts.message }}</p>
              <div class="flex justify-end gap-2">
                <button class="btn-subtle" @click="resolve(false)">{{ state.opts.cancelText }}</button>
                <button
                  class="btn-primary"
                  :class="state.opts.variant==='danger' ? 'bg-rose-600 hover:bg-rose-700 border-rose-600' : ''"
                  @click="resolve(true)"
                >
                  {{ state.opts.confirmText }}
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
const { state, resolve, markMounted } = useConfirm()
onMounted(() => markMounted(true))
onBeforeUnmount(() => markMounted(false))
</script>

<style>
.fade-enter-active,.fade-leave-active{transition:opacity .15s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
.pop-enter-active,.pop-leave-active{transition:transform .2s ease, opacity .2s ease}
.pop-enter-from,.pop-leave-to{opacity:0; transform:translateY(12px) scale(.98)}
</style>
