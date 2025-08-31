<script setup lang="ts">
const s = useDataStore(); onMounted(()=> s.init())
</script>
<template>
  <section class="section">
    <div class="grid gap-4 md:grid-cols-4">
      <div class="card md:col-span-2"><h2 class="font-semibold mb-2">Ringkasan</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="kpi"><p class="text-sm text-slate-600">Total Stok (pcs)</p><p class="text-2xl font-semibold mt-1">{{ s.totalPcs }}</p></div>
          <div class="kpi"><p class="text-sm text-slate-600">Total Stok (gram)</p><p class="text-2xl font-semibold mt-1">{{ s.totalGram.toFixed(2) }} gr</p></div>
        </div>
      </div>
      <div class="card"><p class="text-sm">Buyback (pcs)</p><p class="text-2xl font-semibold mt-1">{{ s.buybackPcs }}</p></div>
      <div class="card"><p class="text-sm">Buyback (gram)</p><p class="text-2xl font-semibold mt-1">{{ s.buybackGram.toFixed(2) }} gr</p></div>
    </div>
    <div class="mt-6">
      <h2 class="font-semibold mb-2">Produk Terbaru</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <ProductCard v-for="p in s.products.slice(0,4)" :key="p.id" :item="p" />
      </div>
    </div>
  </section>
</template>
