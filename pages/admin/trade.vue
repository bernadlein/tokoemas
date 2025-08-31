<script setup lang="ts">
import { fetchGoldPriceIDR, applyMarkup } from '~/composables/useGoldPrice'
import { genTradePdf, exportDailySummary } from '~/utils/pdf'
const s=useDataStore(); onMounted(()=>s.init())
const type=ref<'penjualan'|'buyback'>('penjualan'); const wallet=ref<'toko'|'pribadi'>('toko'); const channel=ref<'cash'|'debit'|'transfer'>('cash')
const pid=ref<number|null>(null); const vid=ref<number|null>(null); const qty=ref(1)
const mode=ref<'perPcs'|'perGram'>('perGram'); const price=ref<number>(0); const discPct=ref(0); const discNom=ref(0)
const product = computed(()=> s.productById(pid.value || -1)); const variant = computed(()=> pid.value && vid.value ? s.variantById(pid.value, vid.value) : null)
const suggested = ref<number|null>(null)
const total = computed(()=>{ const w=variant.value?.weight||0; const base = mode.value==='perPcs'? price.value*qty.value: price.value*w*qty.value; const afterPct = base - base*(discPct.value/100); return Math.max(0, afterPct - discNom.value) })
watch(pid, (nv)=>{ if(nv){ const p = s.productById(nv); vid.value = p?.variants?.[0]?.id ?? null } else { vid.value = null } })
watch(mode, ()=>{ if(mode.value==='perGram' && suggested.value){ price.value = suggested.value } })
async function getAutoPrice(){ const res = await fetchGoldPriceIDR(s.settings.usdToIdr); if(res.priceIDR){ s.setLastGoldPriceIdr(res.priceIDR); if(product.value){ const perGram = applyMarkup(res.priceIDR, product.value.category, s.settings.markups); suggested.value = Math.round(perGram); if(mode.value==='perGram'){ price.value = Math.round(perGram) } } } else { alert('Gagal ambil harga otomatis. Isi manual ya.') } }
function applySuggested(){ if(suggested.value){ price.value = suggested.value } }
function submit(){ if(!pid.value||!vid.value) return alert('Pilih produk & varian'); if(price.value<=0) return alert('Isi harga'); try{ s.trade({ type:type.value, productId:pid.value, variantId:vid.value, qty:qty.value, priceMode:mode.value, priceUsed:price.value, discountNominal:discNom.value, discountPercent:discPct.value, wallet:wallet.value, channel:channel.value }); qty.value=1; discPct.value=0; discNom.value=0; alert('Transaksi tersimpan') } catch(e:any){ alert(e.message||'Gagal') } }
function pdf(t:any){ const doc = genTradePdf({ id:t.id, date:t.date, type:t.type, productName:s.productById(t.productId)?.name||'', variantWeight:s.variantById(t.productId, t.variantId)?.weight||0, qty:t.qty, priceMode:t.priceMode, priceUsed:t.priceUsed, discountPercent:t.discountPercent, discountNominal:t.discountNominal, total:t.total, wallet:t.wallet, channel:t.channel }, { storeName:'Toko Emas' }); doc.save(`nota-${t.type}-${t.id}.pdf`) }
function exportToday(){ const today=new Date().toISOString().slice(0,10); const list = s.trades.filter(t=> t.date.slice(0,10)===today).map(t=> ({ id:t.id, date:t.date, type:t.type, productName:s.productById(t.productId)?.name||'', variantWeight:s.variantById(t.productId, t.variantId)?.weight||0, qty:t.qty, priceMode:t.priceMode, priceUsed:t.priceUsed, discountPercent:t.discountPercent, discountNominal:t.discountNominal, total:t.total, wallet:t.wallet, channel:t.channel })); const doc = exportDailySummary(list, today, { storeName:'Toko Emas' }); doc.save(`rekap-${today}.pdf`) }
</script>
<template>
  <section class="section pb-20 sm:pb-6">
    <AdminNav class="hidden sm:flex" />
    <div class="grid md:grid-cols-2 gap-4 mt-4">
      <div class="card">
        <h3 class="font-semibold mb-2">Transaksi Emas</h3>
        <div class="grid gap-2">
          <label class="label">Jenis</label>
          <select v-model="type" class="input">
            <option value="penjualan">Penjualan (emas keluar, uang masuk)</option>
            <option value="buyback">Buyback (emas masuk, uang keluar — inventori buyback)</option>
          </select>
          <div class="grid sm:grid-cols-2 gap-2">
            <div><label class="label">Dompet</label><select v-model="wallet" class="input"><option value="toko">Kas Toko</option><option value="pribadi">Kas Pribadi</option></select></div>
            <div><label class="label">Channel</label><select v-model="channel" class="input"><option value="cash">Cash</option><option value="debit">Debit</option><option value="transfer">Transfer</option></select></div>
          </div>
          <label class="label">Produk</label>
          <select v-model.number="pid" class="input"><option :value="null" disabled>Pilih...</option><option v-for="p in s.products" :key="p.id" :value="p.id">{{ p.code }} - {{ p.name }} ({{ p.category }}/{{ p.jenis }})</option></select>
          <label class="label">Varian (berat)</label>
          <select v-model.number="vid" class="input" :disabled="!pid"><option :value="null" disabled>Pilih...</option><option v-for="v in product?.variants||[]" :key="v.id" :value="v.id">{{ v.weight }} gr — stok: {{ v.stock }}</option></select>
          <div class="grid sm:grid-cols-2 gap-2">
            <div>
              <label class="label">Harga</label>
              <div class="flex gap-2">
                <select v-model="mode" class="input max-w-[140px]"><option value="perPcs">per Pcs</option><option value="perGram">per Gram</option></select>
                <input type="number" v-model.number="price" class="input" placeholder="Nominal" />
              </div>
              <div class="muted mt-1">Auto per-gram (markup terapkan): <b v-if="suggested">Rp {{ new Intl.NumberFormat('id-ID').format(suggested) }}</b><span v-else>—</span></div>
              <div class="flex gap-2 mt-2">
                <button class="btn" @click="getAutoPrice">Ambil Harga Emas</button>
                <button class="btn" :disabled="!suggested" @click="applySuggested">Pakai Harga Auto</button>
              </div>
            </div>
            <div><label class="label">Qty</label><input type="number" v-model.number="qty" min="1" class="input" /></div>
          </div>
          <div class="grid sm:grid-cols-2 gap-2">
            <div><label class="label">Diskon (%)</label><input type="number" v-model.number="discPct" class="input" /></div>
            <div><label class="label">Diskon (Rp)</label><input type="number" v-model.number="discNom" class="input" /></div>
          </div>
          <div class="font-semibold mt-2">Total: {{ new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(total) }}</div>
          <button class="btn-primary mt-2" @click="submit">Simpan</button>
        </div>
      </div>
      <div class="card">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold">Riwayat</h3>
          <button class="btn" @click="exportToday">Export Rekap Hari Ini (PDF)</button>
        </div>
        <div class="space-y-2 max-h-[420px] overflow-auto">
          <div v-for="t in s.trades" :key="t.id" class="border rounded-2xl p-2">
            <div class="flex justify-between text-sm">
              <div>
                <div class="font-medium">
                  <span :class="t.type==='penjualan' ? 'badge-green' : 'badge-red'" class="badge mr-2">{{ t.type==='penjualan'?'Penjualan':'Buyback' }}</span>
                  {{ s.productById(t.productId)?.name }} • {{ s.variantById(t.productId,t.variantId)?.weight }}gr x{{ t.qty }}
                </div>
                <div class="text-slate-500">
                  {{ new Date(t.date).toLocaleString('id-ID') }} • {{ t.channel }} • {{ t.wallet }}
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div :class="t.type==='penjualan' ? 'text-emerald-700' : 'text-rose-700'" class="font-semibold">
                  {{ new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(t.total) }}
                </div>
                <button class="btn" @click="pdf(t)">Nota PDF</button>
              </div>
            </div>
          </div>
          <p v-if="!s.trades.length" class="text-sm text-slate-500">Belum ada data.</p>
        </div>
      </div>
    </div>
    <AdminBottomNav />
  </section>
</template>
