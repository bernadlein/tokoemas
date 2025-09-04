<script setup lang="ts">
definePageMeta({ layout: 'admin', ssr: false })

const s = useDataStore()
onMounted(() => s.init?.())

// ====== Data ======
const source = computed<any[]>(() => {
  const anyS = s as any
  if (Array.isArray(anyS.buybacks)) return anyS.buybacks
  if (Array.isArray(anyS.buyback))  return anyS.buyback
  return []
})

const sel = reactive<{ id:any, targetPid:number|null, targetVid:number|null, qty:number }>(
  { id:null, targetPid:null, targetVid:null, qty:1 }
)

const selected = computed(() => source.value.find(b => (b.id ?? b._id) === sel.id) || null)
const targetProduct = computed(() =>
  (s.products || []).find((p:any) => p.id === sel.targetPid) || null
)
const variants = computed(() => targetProduct.value?.variants || [])

// ====== UX helpers ======
const fmt2 = (n: unknown) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Number(n) || 0)

const { success, error } = useToast()

// mapping jenis → code produk (fallback)
const JENIS_TO_CODE: Record<string, string> = {
  lm: 'LM-ANTAM',
  gelang: 'GEL-24K',
  kalung: 'KLG-24K',
  cincin: 'A1'
}

function resolveProductIdFromBuyback(b: any): number | null {
  if (!b) return null
  const prods = (s.products || []) as any[]
  const nameBB = (b.name || '').toString().trim().toLowerCase()
  const jenisBB = (b.jenis || '').toString().trim().toLowerCase()

  const byName = prods.find(p => (p.name || '').toString().trim().toLowerCase() === nameBB)
  if (byName) return byName.id ?? null

  const code = JENIS_TO_CODE[jenisBB]
  if (code) {
    const byCode = prods.find(p => (p.code || '').toString().trim().toLowerCase() === code.toLowerCase())
    if (byCode) return byCode.id ?? null
  }

  const fuzzy = prods.find(p =>
    (p.name || '').toString().toLowerCase().includes(nameBB) && nameBB.length >= 3
  )
  return fuzzy?.id ?? null
}

// ====== Search / Filter / Sort ======
const q = ref('')
const jenisFilter = ref<'all'|'lm'|'gelang'|'kalung'|'cincin'>('all')
const sortBy = ref<'terbaru'|'terberat'|'teringan'|'karat'>('terbaru')

const filtered = computed(() => {
  const text = q.value.trim().toLowerCase()
  return (source.value || []).filter(b => {
    const matchText = !text || [b.name,b.category,b.jenis].join(' ').toLowerCase().includes(text)
    const matchJenis = jenisFilter.value === 'all' || (b.jenis || '').toLowerCase() === jenisFilter.value
    return matchText && matchJenis
  })
})
const sorted = computed(() => {
  const arr = [...filtered.value]
  const weight = (b:any) => (Number(b.weight)||0) * (Number(b.qty)||0)
  switch (sortBy.value) {
    case 'terberat': arr.sort((a,b)=> weight(b)-weight(a)); break
    case 'teringan': arr.sort((a,b)=> weight(a)-weight(b)); break
    case 'karat':    arr.sort((a,b)=> (Number(b.karat)||0)-(Number(a.karat)||0)); break
    default:         arr.sort((a,b)=> (b.id||0)-(a.id||0)) // asumsi id increment
  }
  return arr
})

// Summary
const summary = computed(() => {
  const totalItem = filtered.value.length
  const totalQty  = filtered.value.reduce((n,b)=> n+(Number(b.qty)||0), 0)
  const totalGr   = filtered.value.reduce((n,b)=> n+((Number(b.weight)||0)*(Number(b.qty)||0)), 0)
  return { totalItem, totalQty, totalGr }
})

// Auto pilih pertama
watch(source, (arr) => {
  if (!sel.id && arr?.length) sel.id = arr[0].id ?? arr[0]._id
}, { immediate: true })

// Saat ganti item → auto pilih product & varian
watch(selected, (b) => {
  const pid = resolveProductIdFromBuyback(b)
  sel.targetPid = pid
  sel.targetVid = null
  if (pid && variants.value?.length === 1) sel.targetVid = variants.value[0].id
}, { immediate: true })

// Ganti produk → reset/auto varian
watch(() => sel.targetPid, () => {
  sel.targetVid = null
  if (variants.value?.length === 1) sel.targetVid = variants.value[0].id
})

// Keyboard navigation
onMounted(() => {
  const onKey = (e: KeyboardEvent) => {
    if (['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement)?.tagName)) return
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault()
      const idx = sorted.value.findIndex(b => (b.id ?? b._id) === sel.id)
      const next = sorted.value[idx+1] ?? sorted.value[0]
      if (next) sel.id = next.id ?? next._id
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault()
      const idx = sorted.value.findIndex(b => (b.id ?? b._id) === sel.id)
      const prev = sorted.value[idx-1] ?? sorted.value.at(-1)
      if (prev) sel.id = prev.id ?? prev._id
    } else if (e.key === 'Enter') {
      if (sel.id && sel.targetPid && sel.targetVid) processToStock()
    } else if (e.key === '/') {
      const el = document.getElementById('bb-search') as HTMLInputElement|null
      el?.focus()
      e.preventDefault()
    }
  }
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
})

// Proses
async function processToStock() {
  if (!sel.id || !sel.targetPid || !sel.targetVid) {
    return error('Lengkapi pilihan dahulu.')
  }

  const fn =
    (s as any).processBuybackToStock ||
    (s as any).processBuyback ||
    (s as any).convertBuybackToStock

  if (!fn) return error('Action proses buyback belum ada di store.')

  try {
    await Promise.resolve(fn({
      buybackId: sel.id,
      productId: sel.targetPid,
      variantId: sel.targetVid,
      qty: Number(sel.qty || 1)
    }))
    success('Berhasil diproses ke stok.')
    Object.assign(sel, { id:null, targetPid:null, targetVid:null, qty:1 })
  } catch (e) {
    error('Gagal memproses. Coba lagi.')
    console.error(e)
  }
}
</script>

<template>
  <section class="p-4 pb-24 mx-auto max-w-7xl sm:pb-6">
    <!-- Header + Summary -->
    <div class="flex flex-col gap-3 mb-4 md:flex-row md:items-center">
      <div class="flex-1">
        <h1 class="text-lg font-semibold">Inventori Buyback</h1>
        <p class="text-xs text-slate-500">
          {{ summary.totalItem }} item • {{ summary.totalQty }} pcs • {{ fmt2(summary.totalGr) }} gr
        </p>
      </div>

      <div class="flex w-full gap-2 md:w-auto">
        <input id="bb-search" v-model="q" type="search" placeholder="Cari nama/jenis ( / untuk fokus )"
          class="w-full input md:w-72" />
        <select v-model="jenisFilter" class="input w-36">
          <option value="all">Semua jenis</option>
          <option value="lm">LM</option>
          <option value="gelang">Gelang</option>
          <option value="kalung">Kalung</option>
          <option value="cincin">Cincin</option>
        </select>
        <select v-model="sortBy" class="input w-36">
          <option value="terbaru">Terbaru</option>
          <option value="terberat">Terberat</option>
          <option value="teringan">Teringan</option>
          <option value="karat">Karat tertinggi</option>
        </select>
      </div>
    </div>

    <div class="mt-2 grid gap-6 md:grid-cols-[1fr,380px]">
      <!-- List buyback -->
      <div class="card">
        <div class="max-h-[520px] overflow-auto space-y-2 pr-1">
          <button
            v-for="b in sorted"
            :key="b.id || b._id"
            @click="sel.id = b.id ?? b._id"
            class="w-full p-3 text-left transition-all border cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2"
            :class="sel.id===(b.id??b._id)
              ? 'border-amber-300 bg-amber-50/70 ring-amber-300'
              : 'border-slate-200 hover:border-slate-300 hover:bg-white'"
            :aria-selected="sel.id===(b.id??b._id)"
          >
            <div class="flex justify-between gap-3">
              <div class="min-w-0">
                <div class="font-medium truncate">{{ b.name || b.item || 'Item Buyback' }}</div>
                <div class="text-xs text-slate-500">
                  <span class="inline-flex items-center gap-1">
                    <span class="rounded-full bg-slate-100 px-2 py-0.5">{{ b.category }}</span>
                    <span>•</span>
                    <span class="rounded-full bg-slate-100 px-2 py-0.5">{{ b.jenis }}</span>
                  </span>
                  <span v-if="b.karat || b.kadar"> • {{ b.karat ? (b.karat+'K') : '' }}{{ b.kadar ? ('/'+b.kadar+'%') : '' }}</span>
                </div>
              </div>
              <div class="text-sm text-right shrink-0">
                <div class="font-medium">{{ Number(b.weight)||0 }} gr</div>
                <div class="text-xs text-slate-500">× {{ Number(b.qty)||0 }}</div>
              </div>
            </div>
          </button>

          <p v-if="!sorted.length" class="p-3 text-sm text-slate-500">
            Tidak ada data yang cocok filter/pencarian.
          </p>
        </div>
      </div>

      <!-- Proses -->
      <div class="sticky card top-4 h-fit">
        <h3 class="mb-3 font-semibold">Proses ke Stok</h3>

        <div class="grid gap-3">
          <div class="muted">
            Item terpilih: <b>{{ selected?.name || selected?.item || '-' }}</b>
          </div>

          <select v-model.number="sel.targetPid" class="input">
            <option :value="null" disabled>Pilih produk tujuan…</option>
            <!-- hanya tampilkan opsi yang berhasil dipetakan dari data buyback -->
            <option
              v-for="p in (s.products || []).filter(pp => sorted.some(b => resolveProductIdFromBuyback(b) === pp.id))"
              :key="p.id" :value="p.id">
              {{ p.code ? `${p.code} — ` : '' }}{{ p.name }}
            </option>
          </select>

          <div class="flex flex-wrap gap-2" v-if="variants.length">
            <button
              v-for="v in variants"
              :key="v.id"
              type="button"
              class="px-3 py-1.5 rounded-xl text-sm border transition-all"
              :class="sel.targetVid===v.id
                ? 'border-amber-400 bg-amber-50'
                : 'border-slate-200 hover:bg-slate-50'"
              @click="sel.targetVid = v.id"
            >
              {{ v.weight }} gr • stok: {{ v.stock }}
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <input type="number" v-model.number="sel.qty" min="1" class="input" />
            <button class="btn-primary"
              :disabled="!sel.id || !sel.targetPid || !sel.targetVid || Number(sel.qty) < 1"
              @click="processToStock"
              title="Enter untuk cepat proses"
            >
              Proses
            </button>
          </div>

          <p class="text-xs text-slate-500">
            Tips: gunakan tombol panah (↑/↓) untuk memilih item, <kbd>Enter</kbd> untuk proses, dan tekan <kbd>/</kbd> untuk fokus pencarian.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
