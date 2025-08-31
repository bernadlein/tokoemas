<script setup lang="ts">
const q=ref(''); const s=useDataStore(); onMounted(()=>s.init())
const items = computed(()=> s.products.filter(p => [p.name,p.code,p.karat,p.jenis,p.category].join(' ').toLowerCase().includes(q.value.toLowerCase())))
</script>
<template>
  <section class="section">
    <div class="card mb-4">
      <h1 class="text-xl font-semibold">Katalog</h1>
      <div class="mt-3 flex items-center gap-2">
        <input v-model="q" placeholder="Cari produk / kode / kadar / kategori" class="input max-w-md" />
        <span class="text-sm text-slate-500">({{ items.length }} produk)</span>
      </div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      <ProductCard v-for="p in items" :key="p.id" :item="p" />
    </div>
  </section>
</template>
