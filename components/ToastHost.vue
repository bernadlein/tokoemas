<template>
  <teleport to="body">
    <TransitionGroup name="toast" tag="div"
      class="fixed z-[60] bottom-4 right-4 flex flex-col gap-2 w-[min(92vw,360px)]">
      <div v-for="t in list" :key="t.id"
        class="px-4 py-3 text-sm shadow-lg rounded-2xl ring-1 backdrop-blur"
        :class="{
          'bg-emerald-50/90 ring-emerald-200 text-emerald-900': t.type==='success',
          'bg-rose-50/90 ring-rose-200 text-rose-900': t.type==='error',
          'bg-sky-50/90 ring-sky-200 text-sky-900': t.type==='info',
        }">
        {{ t.message }}
      </div>
    </TransitionGroup>
  </teleport>
</template>

<script setup lang="ts">
const { list } = useToast()
</script>

<style>
.toast-enter-active, .toast-leave-active { transition: all .18s ease; }
.toast-enter-from { opacity: 0; transform: translateY(6px) scale(.98); }
.toast-leave-to   { opacity: 0; transform: translateY(6px) scale(.98); }
</style>
