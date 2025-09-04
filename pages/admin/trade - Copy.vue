<script setup lang="ts">
definePageMeta({ layout: 'admin', ssr: false })

const s = useDataStore()

// Toast
import { useToast } from '~/composables/useToast'
const { show: toast } = useToast()

// Render setelah store dipanggil init (tidak menunggu promise—ringan & aman)
const ready = ref(false)
onMounted(() => { try { s.init?.() } finally { ready.value = true } })

// ====== FORM ======
const type    = ref<'penjualan' | 'buyback'>('penjualan')
const wallet  = ref<'toko' | 'pribadi'>('toko')
const channel = ref<'cash' | 'debit' | 'transfer'>('cash')

const pid = ref<number | null>(null)
const vid = ref<number | null>(null)
const qty = ref(1)

const mode    = ref<'perPcs' | 'perGram'>('perGram')
const price   = ref<number>(0)
const discPct = ref(0)
const discNom = ref(0)

const product = computed(() => s.productById?.(pid.value || -1))
const variant = computed(() =>
  pid.value && vid.value ? s.variantById?.(pid.value, vid.value) : null
)

const suggested = ref<number | null>(null)

const total = computed(() => {
  const w = Number(variant.value?.weight || 0)
  const base = mode.value === 'perPcs'
    ? Number(price.value) * Number(qty.value)
    : Number(price.value) * w * Number(qty.value)
  const afterPct = base - base * (Number(discPct.value) / 100)
  return Math.max(0, afterPct - Number(discNom.value))
})

watch(pid, (nv) => {
  if (nv) {
    const p = s.productById?.(nv)
    vid.value = p?.variants?.[0]?.id ?? null
  } else {
    vid.value = null
  }
})

watch(mode, () => {
  if (mode.value === 'perGram' && suggested.value) price.value = suggested.value
})

// ====== HARGA OTOMATIS (dynamic import agar tidak bikin halaman gagal mount) ======
async function getAutoPrice () {
  try {
    const { fetchGoldPriceIDR, applyMarkup } = await import('~/composables/useGoldPrice')
    const res = await fetchGoldPriceIDR(s.settings?.usdToIdr)
    if (!res?.priceIDR) {
      toast('Gagal mengambil harga otomatis. Isi manual ya.', { variant: 'error' })
      return
    }

    s.setLastGoldPriceIdr?.(res.priceIDR)
    if (product.value) {
      const perGram = applyMarkup(res.priceIDR, product.value.category, s.settings?.markups)
      suggested.value = Math.round(perGram)
      if (mode.value === 'perGram') price.value = Math.round(perGram)
      toast('Harga emas otomatis diperbarui ✓', { variant: 'success' })
    }
  } catch (e) {
    console.error(e)
    toast('Harga otomatis tidak tersedia.', { variant: 'error' })
  }
}
const applySuggested = () => {
  if (suggested.value) {
    price.value = suggested.value
    toast('Harga auto diterapkan', { variant: 'info' })
  }
}

// ====== RIWAYAT (reactive kuat) ======
const listKey = ref(0)
const tradesView = computed(() =>
  [...(s.trades || [])].sort(
    (a: any, b: any) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime()
  )
)

// ====== SIMPAN ======
async function submit () {
  if (!pid.value || !vid.value) { toast('Pilih produk & varian.', { variant: 'error' }); return }
  if (Number(price.value) <= 0)  { toast('Isi harga terlebih dahulu.', { variant: 'error' }); return }

  try {
    s.trade?.({
      type: type.value,
      productId: pid.value,
      variantId: vid.value,
      qty: Number(qty.value),
      priceMode: mode.value,
      priceUsed: Number(price.value),
      discountNominal: Number(discNom.value),
      discountPercent: Number(discPct.value),
      wallet: wallet.value,
      channel: channel.value
    })

    // paksa re-render list (jaga-jaga kalau store mutasinya tidak memicu reactivity)
    if (Array.isArray(s.trades)) s.trades = [...s.trades]
    listKey.value++

    // reset ringan
    qty.value = 1; discPct.value = 0; discNom.value = 0
    toast('Transaksi tersimpan ✓', { variant: 'success' })
  } catch (e: any) {
    console.error(e)
    toast(e?.message || 'Gagal menyimpan', { variant: 'error' })
  }
}

// ====== PDF (dynamic import supaya aman di mount) ======
const isClient = typeof window !== 'undefined'

async function toDataUrl (path: string): Promise<string> {
  if (!isClient) return ''
  try {
    const res  = await fetch(path)
    const blob = await res.blob()
    return await new Promise<string>((resolve) => {
      const fr = new FileReader()
      fr.onload = () => resolve(String(fr.result || ''))
      fr.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}

async function pdf (t: any) {
  if (!isClient) return
  try {
    // genReceipt ada di utils/receipt.ts; genTradePdf disediakan sbg alias kompatibel
    const { genReceipt, genTradePdf } = await import('~/utils/receipt')
    const make = genReceipt || (genTradePdf as any)

    // sematkan logo/tanda tangan jika ada
    const logo = await toDataUrl('/branding/logo.png')
    const sign = await toDataUrl('/branding/signature.png')

    const doc = await make(
      {
        id: t.id,
        date: t.date,
        type: t.type,
        productName: s.productById?.(t.productId)?.name || '',
        variantWeight: s.variantById?.(t.productId, t.variantId)?.weight || 0,
        qty: t.qty,
        priceMode: t.priceMode,
        priceUsed: t.priceUsed,
        discountPercent: t.discountPercent,
        discountNominal: t.discountNominal,
        total: t.total,
        wallet: t.wallet,
        channel: t.channel
      },
      {
        storeName: s.settings?.storeName || 'Toko Emas',
        logoDataUrl: logo || undefined,
        signDataUrl: sign || undefined
      }
    )
    doc.save(`nota-${t.type}-${t.id}.pdf`)
  } catch (e) {
    console.error(e)
    toast('Generator PDF tidak tersedia.', { variant: 'error' })
  }
}

async function exportToday () {
  if (!isClient) return
  try {
    const today = new Date().toISOString().slice(0, 10)
    const { exportDailySummary } = await import('~/utils/pdf')

    const rows = (s.trades || [])
      .filter((t: any) => (t.date || '').slice(0, 10) === today)
      .map((t: any) => ({
        id: t.id,
        date: t.date,
        type: t.type,
        productName: s.productById?.(t.productId)?.name || '',
        variantWeight: s.variantById?.(t.productId, t.variantId)?.weight || 0,
        qty: t.qty,
        priceMode: t.priceMode,
        priceUsed: t.priceUsed,
        discountPercent: t.discountPercent,
        discountNominal: t.discountNominal,
        total: t.total,
        wallet: t.wallet,
        channel: t.channel
      }))

    const doc = await exportDailySummary(rows, today, { storeName: s.settings?.storeName || 'Toko Emas' })
    doc.save(`rekap-${today}.pdf`)
  } catch (e) {
    console.error(e)
    toast('Export PDF tidak tersedia.', { variant: 'error' })
  }
}

const fmtIDR = (n:number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)
</script>

<template>
  <section v-if="ready" class="pb-20 section sm:pb-6">
    <div class="grid gap-4 mt-4 md:grid-cols-2">
      <!-- FORM -->
      <div class="card">
        <h3 class="mb-2 font-semibold">Transaksi Emas</h3>
        <div class="grid gap-2">
          <label class="label">Jenis</label>
          <select v-model="type" class="input">
            <option value="penjualan">Penjualan (emas keluar, uang masuk)</option>
            <option value="buyback">Buyback (emas masuk, uang keluar — inventori buyback)</option>
          </select>

          <div class="grid gap-2 sm:grid-cols-2">
            <div>
              <label class="label">Dompet</label>
              <select v-model="wallet" class="input">
                <option value="toko">Kas Toko</option>
                <option value="pribadi">Kas Pribadi</option>
              </select>
            </div>
            <div>
              <label class="label">Channel</label>
              <select v-model="channel" class="input">
                <option value="cash">Cash</option>
                <option value="debit">Debit</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>

          <label class="label">Produk</label>
          <select v-model.number="pid" class="input">
            <option :value="null" disabled>Pilih...</option>
            <option v-for="p in s.products" :key="p.id" :value="p.id">
              {{ p.code }} - {{ p.name }} ({{ p.category }}/{{ p.jenis }})
            </option>
          </select>

          <label class="label">Varian (berat)</label>
          <select v-model.number="vid" class="input" :disabled="!pid">
            <option :value="null" disabled>Pilih...</option>
            <option v-for="v in (product?.variants || [])" :key="v.id" :value="v.id">
              {{ v.weight }} gr — stok: {{ v.stock }}
            </option>
          </select>

          <div class="grid gap-2 sm:grid-cols-2">
            <div>
              <label class="label">Harga</label>
              <div class="flex gap-2">
                <select v-model="mode" class="input max-w-[140px]">
                  <option value="perPcs">per Pcs</option>
                  <option value="perGram">per Gram</option>
                </select>
                <input type="number" v-model.number="price" class="input" placeholder="Nominal" />
              </div>
              <div class="mt-1 muted">
                Auto per-gram (markup terapkan):
                <b v-if="suggested">Rp {{ new Intl.NumberFormat('id-ID').format(suggested) }}</b>
                <span v-else>—</span>
              </div>
              <div class="flex gap-2 mt-2">
                <button class="btn" @click="getAutoPrice">Ambil Harga Emas</button>
                <button class="btn" :disabled="!suggested" @click="applySuggested">Pakai Harga Auto</button>
              </div>
            </div>
            <div>
              <label class="label">Qty</label>
              <input type="number" v-model.number="qty" min="1" class="input" />
            </div>
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
            <div>
              <label class="label">Diskon (%)</label>
              <input type="number" v-model.number="discPct" class="input" />
            </div>
            <div>
              <label class="label">Diskon (Rp)</label>
              <input type="number" v-model.number="discNom" class="input" />
            </div>
          </div>

          <div class="mt-2 font-semibold">Total: {{ fmtIDR(total) }}</div>
          <button class="mt-2 btn-primary" @click="submit">Simpan</button>
        </div>
      </div>

      <!-- RIWAYAT -->
      <div class="card" :key="listKey">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold">Riwayat</h3>
          <button class="btn" @click="exportToday">Export Rekap Hari Ini (PDF)</button>
        </div>

        <div class="max-h-[420px] space-y-2 overflow-auto">
          <div v-for="t in tradesView" :key="t.id" class="p-2 border rounded-2xl">
            <div class="flex justify-between text-sm">
              <div>
                <div class="font-medium">
                  <span class="mr-2 badge" :class="t.type === 'penjualan' ? 'badge-green' : 'badge-red'">
                    {{ t.type === 'penjualan' ? 'Penjualan' : 'Buyback' }}
                  </span>
                  {{ s.productById?.(t.productId)?.name }} •
                  {{ s.variantById?.(t.productId, t.variantId)?.weight }}gr ×{{ t.qty }}
                </div>
                <div class="text-slate-500">
                  {{ new Date(t.date).toLocaleString('id-ID') }} • {{ t.channel }} • {{ t.wallet }}
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div :class="t.type === 'penjualan' ? 'text-emerald-700' : 'text-rose-700'" class="font-semibold">
                  {{ fmtIDR(t.total) }}
                </div>
                <button class="btn" @click="pdf(t)">Nota PDF</button>
              </div>
            </div>
          </div>

          <p v-if="!tradesView.length" class="text-sm text-slate-500">Belum ada data.</p>
        </div>
      </div>
    </div>
  </section>
</template>
