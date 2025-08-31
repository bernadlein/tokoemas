<script setup lang="ts">
const s=useDataStore(); onMounted(()=>s.init())
</script>
<template>
  <section class="section pb-20 sm:pb-6">
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-xl font-semibold">Admin Dashboard</h1>
      <button class="btn" @click="s.resetAll()">Reset Demo</button>
    </div>
    <AdminNav class="hidden sm:flex" />
    <div class="grid md:grid-cols-3 gap-4 mt-4">
      <div class="kpi"><p class="text-sm text-slate-600">Total Stok (pcs)</p><p class="text-2xl font-semibold mt-1">{{ s.totalPcs }}</p></div>
      <div class="kpi"><p class="text-sm text-slate-600">Total Stok (gram)</p><p class="text-2xl font-semibold mt-1">{{ s.totalGram.toFixed(2) }} gr</p></div>
      <div class="kpi"><p class="text-sm text-slate-600">Inventori Buyback (gram)</p><p class="text-2xl font-semibold mt-1">{{ s.buybackGram.toFixed(2) }} gr</p></div>
    </div>
    <AdminBottomNav />
  </section>
</template>
