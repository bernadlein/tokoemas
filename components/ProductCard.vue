<script setup lang="ts">
const props = defineProps<{ item: any }>();
const totalPcs = computed(()=> props.item.variants.reduce((t:any,v:any)=> t+v.stock,0));
const totalGram = computed(()=> props.item.variants.reduce((t:any,v:any)=> t+v.weight*v.stock,0));
</script>
<template>
  <div class="card">
    <div class="flex gap-4">
      <img :src="item.image || 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=800&auto=format&fit=crop'"
           class="object-cover w-40 h-28 rounded-2xl ring-1 ring-white/60" />
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">{{ item.name }}</h3>
          <div class="flex gap-2">
            <span class="capitalize badge">{{ item.category }}</span>
            <span class="badge">{{ item.karat }} ({{ item.kadarPct }}%)</span>
          </div>
        </div>
        <p class="text-xs text-slate-500">Kode: {{ item.code }} • Jenis: {{ item.jenis }}</p>
        <p class="mt-1 text-xs text-slate-500">
         Total: {{ totalPcs }} pcs • {{ fmt(totalGram) }} gr
        </p>
      </div>
    </div>
  </div>
</template>
