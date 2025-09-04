<script setup lang="ts">
const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm
           border-amber-200 bg-white text-slate-700 hover:bg-amber-50
           dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800
           focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    :aria-pressed="isDark"
    @click="toggle"
    title="Toggle theme"
  >
    <span v-if="isDark">🌙</span>
    <span v-else>☀️</span>
    <span>{{ isDark ? 'Dark' : 'Light' }}</span>
  </button>
</template>
