// utils/pdf.ts — aman untuk Nuxt/Vite (lazy import jsPDF & AutoTable)

export interface SummaryRow {
  id: number | string
  date: string        // ISO
  type: 'penjualan' | 'buyback'
  productName: string
  variantWeight: number
  qty: number
  priceMode: 'perPcs' | 'perGram'
  priceUsed: number
  discountPercent?: number
  discountNominal?: number
  total: number
  wallet: 'toko' | 'pribadi'
  channel: 'cash' | 'debit' | 'transfer'
}

const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

async function loadJsPDF() {
  try {
    const m: any = await import('jspdf')                // ESM
    return m.jsPDF || m.default
  } catch {
    const m: any = await import('jspdf/dist/jspdf.umd.min.js') // Fallback UMD
    return m.jsPDF || m.default
  }
}

async function loadAutoTable() {
  const m: any = await import('jspdf-autotable')
  // ESM → default, beberapa bundling expose autoTable
  return m.default || m.autoTable
}

export async function exportDailySummary(
  rows: SummaryRow[],
  tanggalLabel: string,
  opt: { storeName: string }
) {
  const JsPDF = await loadJsPDF()
  const autoTable = await loadAutoTable()

  const doc = new JsPDF({ unit: 'pt', format: 'a4' })
  const marginX = 40
  const topMargin = 70

  const header = () => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(`${opt.storeName} — Rekap Transaksi`, marginX, 40)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Tanggal: ${tanggalLabel}`, marginX, 58)
  }

  autoTable(doc, {
    head: [['Jam', 'Jenis', 'Item', 'Qty', 'Gram', 'Total', 'Dompet', 'Channel']],
    body: rows.map(r => [
      new Date(r.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      r.type === 'penjualan' ? 'Jual' : 'Buyback',
      r.productName,
      String(r.qty ?? 0),
      Number(r.variantWeight ?? 0).toFixed(2),
      rupiah(r.total || 0),
      r.wallet,
      r.channel,
    ]),
    styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [245, 245, 245], textColor: [20, 20, 20] },
    columnStyles: {
      0: { cellWidth: 40 },               // Jam
      1: { cellWidth: 54 },               // Jenis
      2: { cellWidth: 240 },              // Item
      3: { cellWidth: 36, halign: 'right' },  // Qty
      4: { cellWidth: 44, halign: 'right' },  // Gram
      5: { cellWidth: 90, halign: 'right' },  // Total
      6: { cellWidth: 60 },               // Dompet
      7: { cellWidth: 70 },               // Channel
    },
    margin: { top: topMargin, left: marginX, right: marginX, bottom: 40 },
    theme: 'grid',
    tableWidth: 'wrap',
    pageBreak: 'auto',
    didDrawPage: () => header(),
  })

  // Posisi akhir tabel (aman jika plugin belum menulis lastAutoTable)
  const lastY = (doc as any).lastAutoTable?.finalY ?? (topMargin + 40)
  const endY = lastY + 14

  const totalJual = rows.filter(r => r.type === 'penjualan').reduce((a, b) => a + (b.total || 0), 0)
  const totalBuyback = rows.filter(r => r.type === 'buyback').reduce((a, b) => a + (b.total || 0), 0)

  doc.setFont('helvetica', 'bold')
  doc.text(`Total Penjualan: ${rupiah(totalJual)}`, marginX, endY)
  doc.text(`Total Buyback (uang keluar): ${rupiah(totalBuyback)}`, marginX, endY + 18)

  return doc
}
