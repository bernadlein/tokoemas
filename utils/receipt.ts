// utils/receipt.ts — aman untuk Nuxt/Vite (lazy import jsPDF & AutoTable)

export type ReceiptType = 'penjualan' | 'buyback'

export interface ReceiptInput {
  id: number | string
  date: string // ISO
  type: ReceiptType
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

export interface ReceiptOptions {
  storeName: string
  cashierName?: string
  customerName?: string
  logoDataUrl?: string // base64 data URL (opsional)
  signDataUrl?: string // base64 data URL (opsional)
}

const rupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0)

async function loadJsPDF() {
  try {
    const m: any = await import('jspdf')
    return m.jsPDF || m.default
  } catch {
    const m: any = await import('jspdf/dist/jspdf.umd.min.js')
    return m.jsPDF || m.default
  }
}

async function loadAutoTable() {
  const m: any = await import('jspdf-autotable')
  return m.default || m.autoTable
}

/** Nota/kwitansi (async) */
export async function genReceipt(input: ReceiptInput, opt: ReceiptOptions) {
  const JsPDF = await loadJsPDF()
  const autoTable = await loadAutoTable()

  const doc = new JsPDF({ unit: 'pt', format: 'a4' })
  const marginX = 40
  const marginTop = 48
  let cursorY = marginTop

  // HEADER
  if (opt.logoDataUrl) {
    try {
      doc.addImage(opt.logoDataUrl, 'PNG', marginX, cursorY - 8, 28, 28)
    } catch { /* ignore bad image */ }
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(opt.storeName || 'Toko Emas', marginX + 36, cursorY + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  cursorY += 26
  const title = input.type === 'penjualan' ? 'KWITANSI PENJUALAN' : 'KWITANSI BUYBACK'
  doc.text(title, marginX, cursorY)

  // Info kanan (pelanggan)
  const rightX = 420
  doc.text(`Pelanggan: ${opt.customerName || '-'}`, rightX, cursorY)
  cursorY += 16

  // Meta kiri
  doc.text(`No: ${input.id}`, marginX, cursorY)
  doc.text(`Tanggal: ${new Date(input.date).toLocaleString('id-ID')}`, marginX + 160, cursorY)
  doc.text(`Kasir: ${opt.cashierName || 'Admin'}`, marginX + 340, cursorY)

  // GARIS PEMBATAS
  cursorY += 10
  doc.setDrawColor(220)
  doc.line(marginX, cursorY, 555, cursorY)

  // TABEL ITEM
  cursorY += 14
  const priceLabel = input.priceMode === 'perGram' ? 'Harga /gr' : 'Harga'
  const rows = [[
    String(input.qty ?? 0),
    `${input.productName}`,
    Number(input.variantWeight ?? 0).toFixed(2),
    rupiah(input.priceUsed || 0),
    rupiah(input.total || 0),
  ]]

  autoTable(doc, {
    startY: cursorY,
    head: [['Qty', 'Item', 'Gram', priceLabel, 'Total']],
    body: rows,
    styles: { fontSize: 10, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [245, 245, 245], textColor: [20, 20, 20] },
    columnStyles: {
      0: { cellWidth: 40 },                 // Qty
      1: { cellWidth: 260 },                // Item
      2: { cellWidth: 60, halign: 'right' },// Gram
      3: { cellWidth: 80, halign: 'right' },// Harga
      4: { cellWidth: 90, halign: 'right' },// Total
    },
    margin: { left: marginX, right: marginX, top: 0, bottom: 0 },
    theme: 'grid',
    tableWidth: 'wrap',
  })

  // posisi sesudah tabel
  const afterTableY = (doc as any).lastAutoTable?.finalY ?? (cursorY + 24)
  cursorY = afterTableY + 14

  // RINCIAN TOTAL & CATATAN (kanan)
  const rightBoxX = 405
  doc.setFont('helvetica', 'bold')
  doc.text(`Grand Total  ${rupiah(input.total || 0)}`, rightBoxX, cursorY)
  doc.setFont('helvetica', 'normal')
  cursorY += 14

  const discPct = input.discountPercent || 0
  const discNom = input.discountNominal || 0
  if (discPct || discNom) {
    doc.text(`Diskon: ${discPct}%  ${discNom ? `(${rupiah(discNom)})` : ''}`, rightBoxX, cursorY)
    cursorY += 14
  }

  doc.text(`Bayar (${input.channel})  ${rupiah(input.total || 0)}`, rightBoxX, cursorY)
  cursorY += 14
  doc.text(`Kembali  ${rupiah(0)}`, rightBoxX, cursorY)
  cursorY += 6

  doc.setFont('helvetica', 'italic')
  doc.text(
    `Harga ${input.priceMode === 'perGram' ? 'per gram' : 'per pcs'} • Channel: ${input.channel} • Dompet: ${input.wallet}`,
    rightBoxX,
    cursorY + 18
  )
  doc.setFont('helvetica', 'normal')

  // TANDA TANGAN (kiri)
  const signTop = afterTableY + 14
  doc.text('Tanda Tangan', marginX, signTop)
  if (opt.signDataUrl) {
    try {
      doc.addImage(opt.signDataUrl, 'PNG', marginX, signTop + 4, 120, 44)
    } catch { /* ignore bad image */ }
  }

  return doc
}

// Kompat: biar kode lama yang pakai genTradePdf tetap jalan
export const genTradePdf = genReceipt
