<script setup lang="ts">
const s=useDataStore(); onMounted(()=>s.init())
const pick = reactive({ bid:null as null|number, productId:null as null|number, variantId:null as null|number, qty:0 })
const targetProduct = computed(()=> pick.productId ? s.productById(pick.productId) : null)
function processItem(){ if(!pick.bid||!pick.productId||!pick.variantId||!pick.qty) return alert('Lengkapi pilihan'); try{ s.processBuybackToStock(pick.bid,pick.productId,pick.variantId,pick.qty); pick.bid=null; pick.productId=null; pick.variantId=null; pick.qty=0; alert('Diproses ke stok') }catch(e:any){ alert(e.message) } }
</script>
<template>
  <section class="section pb-20 sm:pb-6">
    <AdminNav class="hidden sm:flex" />
    <div class="grid md:grid-cols-2 gap-4 mt-4">
      <div class="card">
        <h3 class="font-semibold mb-2">Inventori Buyback</h3>
        <div class="space-y-2 max-h-[420px] overflow-auto">
          <div v-for="b in s.buyback" :key="b.id" class="border rounded-2xl p-2">
            <div class="flex justify-between text-sm">
              <div>
                <div class="font-medium">{{ b.category }} • {{ b.jenis }} • {{ b.karat }} • {{ b.weight }}gr</div>
                <div class="text-slate-500">{{ new Date(b.date).toLocaleString('id-ID') }}</div>
              </div>
              <div class="font-semibold">{{ b.qty }} pcs</div>
            </div>
          </div>
          <p v-if="!s.buyback.length" class="text-sm text-slate-500">Tidak ada inventori buyback.</p>
        </div>
      </div>
      <div class="card">
        <h3 class="font-semibold mb-2">Proses ke Stok</h3>
        <div class="grid gap-2">
          <label class="label">Item Buyback</label>
          <select v-model.number="pick.bid" class="input"><option :value="null" disabled>Pilih...</option><option v-for="b in s.buyback" :key="b.id" :value="b.id">{{ b.category }}/{{ b.jenis }} • {{ b.karat }} {{ b.weight }}gr ({{ b.qty }} pcs)</option></select>
          <label class="label">Produk Target</label>
          <select v-model.number="pick.productId" class="input"><option :value="null" disabled>Pilih...</option><option v-for="p in s.products" :key="p.id" :value="p.id">{{ p.code }} - {{ p.name }}</option></select>
          <label class="label">Varian Target</label>
          <select v-model.number="pick.variantId" class="input" :disabled="!pick.productId"><option :value="null" disabled>Pilih...</option><option v-for="v in targetProduct?.variants||[]" :key="v.id" :value="v.id">{{ v.weight }} gr — stok: {{ v.stock }}</option></select>
          <label class="label">Qty Diproses (pcs)</label>
          <input type="number" v-model.number="pick.qty" class="input" />
          <button class="btn-primary mt-2" @click="processItem">Proses</button>
        </div>
      </div>
    </div>
    <AdminBottomNav />
  </section>
</template>
