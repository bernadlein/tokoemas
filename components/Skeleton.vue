<template>
  <div
    :class="['animate-pulse bg-slate-200/70 dark:bg-slate-700/50', rounded]"
    :style="{ width, height }"
  />
</template>

<script setup lang="ts">
defineProps<{ width?: string; height?: string; rounded?: string }>()
</script>
