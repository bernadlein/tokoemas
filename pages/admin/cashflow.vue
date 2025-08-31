<script setup lang="ts">
const s=useDataStore(); onMounted(()=>s.init())
const form = reactive({ type:'IN' as 'IN'|'OUT', amount:0, note:'', wallet:'toko' as 'toko'|'pribadi', channel:'cash' as 'cash'|'debit'|'transfer' })
const idr = (n:number)=> new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n||0)
</script>
<template>
  <section class="section pb-20 sm:pb-6">
    <AdminNav class="hidden sm:flex" />
    <div class="grid md:grid-cols-2 gap-4 mt-4">
      <div class="card">
        <h3 class="font-semibold mb-2">Catat Kas</h3>
        <div class="grid gap-2">
          <label class="label">Dompet</label><select v-model="form.wallet" class="input"><option value="toko">Kas Toko</option><option value="pribadi">Kas Pribadi</option></select>
          <label class="label">Channel</label><select v-model="form.channel" class="input"><option value="cash">Cash</option><option value="debit">Debit</option><option value="transfer">Transfer</option></select>
          <label class="label">Tipe</label><select v-model="form.type" class="input"><option value="IN">Masuk</option><option value="OUT">Keluar</option></select>
          <label class="label">Nominal</label><input type="number" v-model.number="form.amount" class="input" />
          <label class="label">Catatan</label><input v-model="form.note" class="input" placeholder="Contoh: Setoran kas harian" />
          <button class="btn-primary mt-2" @click="s.addCash(form)">Simpan</button>
        </div>
      </div>
      <div class="card">
        <h3 class="font-semibold mb-2">Ringkasan</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <div><p class="text-sm text-slate-600">Toko (Cash)</p><p class="text-xl font-semibold">{{ idr(s.cashBy('toko','cash')) }}</p></div>
          <div><p class="text-sm text-slate-600">Toko (Debit)</p><p class="text-xl font-semibold">{{ idr(s.cashBy('toko','debit')) }}</p></div>
          <div><p class="text-sm text-slate-600">Pribadi (Cash)</p><p class="text-xl font-semibold">{{ idr(s.cashBy('pribadi','cash')) }}</p></div>
          <div><p class="text-sm text-slate-600">Pribadi (Debit)</p><p class="text-xl font-semibold">{{ idr(s.cashBy('pribadi','debit')) }}</p></div>
        </div>
      </div>
    </div>
    <div class="card mt-4">
      <h3 class="font-semibold mb-2">Mutasi Kas</h3>
      <div class="space-y-2 max-h-[420px] overflow-auto">
        <div v-for="c in s.cash" :key="c.id" class="border rounded-2xl p-2">
          <div class="flex items-center justify-between text-sm">
            <div>
              <div class="font-medium"><span :class="c.type==='IN' ? 'badge-green' : 'badge-red'" class="badge mr-2">{{ c.type==='IN'?'Masuk':'Keluar' }}</span>{{ c.wallet }} • {{ c.channel }}</div>
              <div class="text-slate-500">{{ new Date(c.date).toLocaleString('id-ID') }} • {{ c.note }}</div>
            </div>
            <div :class="c.type==='IN' ? 'text-emerald-700' : 'text-rose-700'" class="font-semibold">{{ idr(c.amount) }}</div>
          </div>
        </div>
        <p v-if="!s.cash.length" class="text-sm text-slate-500">Belum ada mutasi kas.</p>
      </div>
    </div>
    <AdminBottomNav />
  </section>
</template>
