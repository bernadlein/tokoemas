<script setup lang="ts">
const route = useRoute()
const items = [
  { label: 'Dash',   to: '/admin' },
  { label: 'Produk', to: '/admin/products' },
  { label: 'Kas',    to: '/admin/cashflow' },
  { label: 'Import', to: '/admin/import' },
]
</script>

<template>
  <!-- perhatikan: bottom-0 + inset-x-0, BUKAN inset-0 -->
  <nav class="fixed inset-x-0 bottom-0 z-40 border-t pointer-events-auto bg-white/95 backdrop-blur md:hidden">
    <div class="grid grid-cols-4 mx-auto max-w-7xl">
      <NuxtLink
        v-for="i in items"
        :key="i.to"
        :to="i.to"
        class="flex flex-col items-center justify-center py-2 text-xs"
        :class="route.path.startsWith(i.to) ? 'text-amber-700' : 'text-slate-600'"
      >
        <span>{{ i.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
