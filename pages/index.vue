<script setup lang="ts">
definePageMeta({ layout: 'admin', ssr: false })

const s = useDataStore()
const isClient = typeof window !== 'undefined'

// init ringan
const ready = ref(false)
onMounted(() => { try { s.init?.() } finally { ready.value = true } })

// tanggal (YYYY-MM-DD)
const date = ref<string>(new Date().toISOString().slice(0, 10))

const fmtIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

// rows untuk UI & export (dinormalisasi ke number)
const rowsComputed = computed(() => {
  const d = date.value
  return (s.trades || [])
    .filter((t: any) => (t.date || '').slice(0, 10) === d)
    .map((t: any) => ({
      id: t.id,
      date: t.date,
      type: t.type,
      productName: s.productById?.(t.productId)?.name || '',
      variantWeight: Number(s.variantById?.(t.productId, t.variantId)?.weight || 0),
      qty: Number(t.qty || 0),
      priceMode: t.priceMode,
      priceUsed: Number(t.priceUsed || 0),
      discountPercent: Number(t.discountPercent || 0),
      discountNominal: Number(t.discountNominal || 0),
      total: Number(t.total || 0),
      wallet: t.wallet,
      channel: t.channel
    }))
})

const totalJual = computed(() =>
  rowsComputed.value.filter(r => r.type === 'penjualan').reduce((a, b) => a + (b.total || 0), 0)
)
const totalBuyback = computed(() =>
  rowsComputed.value.filter(r => r.type === 'buyback').reduce((a, b) => a + (b.total || 0), 0)
)

const exporting = ref(false)

/** Export PDF: impor jsPDF & autotable langsung (client-only) agar bebas isu SSR/bundling */
async function exportDailyPdf () {
  if (!isClient) return
  if (!rowsComputed.value.length) {
    alert('Tidak ada data pada tanggal ini.')
    return
  }
  exporting.value = true
  try {
    // Dynamic import — hanya dieksekusi di browser
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ])

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const marginX = 40
    const top = 70

    // Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(`${s.settings?.storeName || 'Toko Emas'} — Rekap Transaksi`, marginX, 40)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Tanggal: ${date.value}`, marginX, 58)

    // Tabel
    autoTable(doc, {
      head: [['Jam', 'Jenis', 'Item', 'Qty', 'Gram', 'Total', 'Dompet', 'Channel']],
      body: rowsComputed.value.map(r => ([
        new Date(r.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        r.type === 'penjualan' ? 'Jual' : 'Buyback',
        r.productName,
        String(r.qty ?? 0),
        Number(r.variantWeight ?? 0).toFixed(2),
        fmtIDR(Number(r.total || 0)),
        r.wallet,
        r.channel
      ])),
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [245, 245, 245], textColor: [20, 20, 20] },
      columnStyles: {
        0: { cellWidth: 40 },           // Jam
        1: { cellWidth: 54 },           // Jenis
        2: { cellWidth: 240 },          // Item
        3: { cellWidth: 36, halign: 'right' }, // Qty
        4: { cellWidth: 44, halign: 'right' }, // Gram
        5: { cellWidth: 90, halign: 'right' }, // Total
        6: { cellWidth: 60 },           // Dompet
        7: { cellWidth: 70 }            // Channel
      },
      margin: { top, left: marginX, right: marginX, bottom: 40 },
      theme: 'grid',
      tableWidth: 'wrap',
      pageBreak: 'auto'
    })

    // Ringkasan total di akhir
    // @ts-ignore
    const endY = (doc as any).lastAutoTable.finalY + 14
    doc.setFont('helvetica', 'bold')
    doc.text(`Total Penjualan: ${fmtIDR(totalJual.value)}`, marginX, endY)
    doc.text(`Total Buyback (uang keluar): ${fmtIDR(totalBuyback.value)}`, marginX, endY + 18)

    doc.save(`rekap-${date.value}.pdf`)
  } catch (err) {
    console.error('[reports] exportDailyPdf failed:', err)
    alert('Export PDF tidak tersedia.')
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section v-if="ready" class="pb-20 section sm:pb-6">
    <div class="grid gap-4 md:grid-cols-3">
      <div class="card">
        <h3 class="mb-2 font-semibold">Filter</h3>
        <label class="label">Tanggal</label>
        <input type="date" v-model="date" class="input" />
        <button class="w-full mt-3 btn-primary" :disabled="exporting" @click="exportDailyPdf">
          {{ exporting ? 'Mengekspor...' : 'Export PDF Harian' }}
        </button>
      </div>

      <div class="card">
        <h3 class="mb-2 font-semibold">Ringkasan Hari Ini</h3>
        <div class="kpi">
          <div class="label">Total Penjualan</div>
          <div class="mt-1 text-xl font-semibold">{{ fmtIDR(totalJual) }}</div>
        </div>
        <div class="mt-2 kpi">
          <div class="label">Total Buyback (uang keluar)</div>
          <div class="mt-1 text-xl font-semibold">{{ fmtIDR(totalBuyback) }}</div>
        </div>
      </div>

      <div class="card">
        <h3 class="mb-2 font-semibold">Info</h3>
        <p class="muted">
          Ekspor di halaman ini memakai <i>dynamic import</i> langsung ke <code>jspdf</code> dan
          <code>jspdf-autotable</code> (client-only). Jika masih gagal, lihat Console (F12) atau restart dev server.
        </p>
      </div>
    </div>

    <div class="mt-4 card">
      <h3 class="mb-2 font-semibold">Preview Data ({{ rowsComputed.length }} baris)</h3>
      <div class="overflow-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left border-b border-amber-100 dark:border-slate-800">
              <th class="py-2 pr-2">Jam</th>
              <th class="py-2 pr-2">Jenis</th>
              <th class="py-2 pr-2">Item</th>
              <th class="py-2 pr-2">Qty</th>
              <th class="py-2 pr-2">Gram</th>
              <th class="py-2 pr-2 text-right">Total</th>
              <th class="py-2 pr-2">Dompet</th>
              <th class="py-2 pr-2">Channel</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rowsComputed" :key="r.id" class="border-b border-amber-50 dark:border-slate-800/60">
              <td class="py-2 pr-2">
                {{ new Date(r.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
              </td>
              <td class="py-2 pr-2">
                <span class="badge" :class="r.type === 'penjualan' ? 'badge-green' : 'badge-red'">
                  {{ r.type === 'penjualan' ? 'Jual' : 'Buyback' }}
                </span>
              </td>
              <td class="py-2 pr-2">{{ r.productName }}</td>
              <td class="py-2 pr-2">{{ r.qty }}</td>
              <td class="py-2 pr-2">{{ (r.variantWeight || 0).toFixed(2) }}</td>
              <td class="py-2 pr-2 text-right">{{ fmtIDR(r.total) }}</td>
              <td class="py-2 pr-2">{{ r.wallet }}</td>
              <td class="py-2 pr-2">{{ r.channel }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!rowsComputed.length" class="mt-2 muted">Tidak ada data.</p>
      </div>
    </div>
  </section>
</template>
