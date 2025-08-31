<script setup lang="ts">
const s=useDataStore(); onMounted(()=>s.init())
const perhiasan = ref(s.settings.markups.perhiasan)
const lm = ref(s.settings.markups.logammulia)
const usd = ref(s.settings.usdToIdr)
function save(){ s.setMarkups({ perhiasan: Number(perhiasan.value||0), logammulia: Number(lm.value||0) }); s.setUsdToIdr(Number(usd.value||0)); alert('Disimpan') }
</script>
<template>
  <section class="section pb-20 sm:pb-6">
    <AdminNav class="hidden sm:flex" />
    <div class="card mt-4">
      <h3 class="font-semibold mb-2">Settings Harga & Markup</h3>
      <div class="grid sm:grid-cols-3 gap-3">
        <div>
          <label class="label">Markup Perhiasan</label>
          <div class="flex items-center gap-2"><input type="number" step="0.01" v-model.number="perhiasan" class="input" /><span class="muted">contoh 0.08 untuk 8%</span></div>
        </div>
        <div>
          <label class="label">Markup Logam Mulia</label>
          <div class="flex items-center gap-2"><input type="number" step="0.01" v-model.number="lm" class="input" /><span class="muted">contoh 0.03 untuk 3%</span></div>
        </div>
        <div>
          <label class="label">USD → IDR (fallback)</label>
          <div class="flex items-center gap-2"><input type="number" v-model.number="usd" class="input" /><span class="muted">dipakai jika API error</span></div>
        </div>
      </div>
      <div class="mt-4 muted">Terakhir harga emas/gram: <b v-if="s.settings.lastGoldPriceIdr">Rp {{ new Intl.NumberFormat('id-ID').format(s.settings.lastGoldPriceIdr) }}</b><span v-else>—</span></div>
    </div>
    <AdminBottomNav />
  </section>
</template>
