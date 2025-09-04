<script setup lang="ts">
definePageMeta({ layout: 'admin', ssr: false })

const s = useDataStore()
onMounted(() => s.init?.())

const source = computed<any[]>(() => {
  const anyS = s as any
  if (Array.isArray(anyS.buybacks)) return anyS.buybacks
  if (Array.isArray(anyS.buyback))  return anyS.buyback
  return []
})

const sel = reactive<{ id:number|null, targetPid:number|null, targetVid:number|null, qty:number }>(
  { id:null, targetPid:null, targetVid:null, qty:1 }
)

const selected      = computed(() => source.value.find(b => b.id === sel.id) || null)
const targetProduct = computed(() => (s.products || []).find(p => p.id === sel.targetPid) || null)
const variants      = computed(() => targetProduct.value?.variants || [])

const fmt2 = (n: unknown) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Number(n) || 0)

function processToStock() {
  if (!sel.id || !sel.targetPid || !sel.targetVid) return alert('Lengkapi pilihan.')

  const fn = (s as any).processBuyback || (s as any).convertBuybackToStock
  if (!fn) return alert('Action proses buyback belum ada di store.')

  fn({
    buybackId: sel.id,
    productId: sel.targetPid,
    variantId: sel.targetVid,
    qty: Number(sel.qty || 1)
  })

  Object.assign(sel, { id:null, targetPid:null, targetVid:null, qty:1 })
}
</script>

<template>
  <section class="p-4 pb-24 mx-auto max-w-7xl sm:pb-6">
    <div class="mt-4 grid gap-6 md:grid-cols-[1fr,380px]">
      <!-- List buyback -->
      <div class="card">
        <h3 class="mb-3 font-semibold">Inventori Buyback</h3>
        <div class="max-h-[520px] overflow-auto space-y-2">
          <div
            v-for="b in source"
            :key="b.id"
            class="p-3 border cursor-pointer rounded-2xl"
            :class="sel.id===b.id ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200'"
            @click="sel.id = b.id"
          >
            <div class="flex justify-between">
              <div>
                <div class="font-medium leading-tight">{{ b.name || b.item }}</div>
                <div class="text-xs text-slate-500">
                  {{ b.category }} • {{ b.jenis }} • {{ b.karat }}K/{{ b.kadar }}% •
                  {{ Number(b.weight) || 0 }} gr × {{ Number(b.qty) || 0 }}
                </div>
              </div>
              <div class="text-sm text-right">
                {{ fmt2((Number(b.weight)||0) * (Number(b.qty)||0)) }} gr
              </div>
            </div>
          </div>
          <p v-if="!source.length" class="text-sm text-slate-500">Belum ada data.</p>
        </div>
      </div>

      <!-- Proses -->
      <div class="card">
        <h3 class="mb-3 font-semibold">Proses ke Stok</h3>
        <div class="grid gap-3">
          <div class="muted">Item terpilih: <b>{{ selected?.name || selected?.item || '-' }}</b></div>

          <select v-model.number="sel.targetPid" class="input">
            <option :value="null" disabled>Pilih produk tujuan…</option>
            <option v-for="p in s.products" :key="p.id" :value="p.id">{{ p.code }} — {{ p.name }}</option>
          </select>

          <select v-model.number="sel.targetVid" class="input" :disabled="!sel.targetPid">
            <option :value="null" disabled>Pilih varian berat…</option>
            <option v-for="v in variants" :key="v.id" :value="v.id">{{ v.weight }} gr • stok: {{ v.stock }}</option>
          </select>

          <div class="grid grid-cols-2 gap-3">
            <input type="number" v-model.number="sel.qty" min="1" class="input" />
            <button class="btn-primary" @click="processToStock">Proses</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
