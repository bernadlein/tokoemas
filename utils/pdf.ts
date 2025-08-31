import jsPDF from 'jspdf'
export type TradeForPdf = { id:number; date:string; type:'penjualan'|'buyback'; productName:string; variantWeight:number; qty:number; priceMode:'perPcs'|'perGram'; priceUsed:number; discountPercent:number; discountNominal:number; total:number; wallet:'toko'|'pribadi'; channel:'cash'|'debit'|'transfer' }
export function genTradePdf(t:TradeForPdf, opts?:{storeName?:string}){
  const doc = new jsPDF(); const storeName = opts?.storeName || 'Toko Emas'
  doc.setFontSize(16); doc.text(storeName,14,16); doc.setFontSize(11)
  doc.text(`Nota ${t.type==='penjualan'?'Penjualan':'Buyback'} #${t.id}`,14,24); doc.text(new Date(t.date).toLocaleString('id-ID'),150,24,{align:'right'})
  doc.line(14,28,196,28)
  const add=(k:string,v:string,y:number)=>{doc.text(k,14,y);doc.text(v,90,y)}
  let y=40; add('Produk',`${t.productName} • ${t.variantWeight}gr x${t.qty}`,y); y+=8
  add('Harga',`${t.priceMode} @ Rp ${new Intl.NumberFormat('id-ID').format(t.priceUsed)}`,y); y+=8
  add('Diskon',`${t.discountPercent}% & Rp ${new Intl.NumberFormat('id-ID').format(t.discountNominal)}`,y); y+=8
  add('Dompet/Channel',`${t.wallet} / ${t.channel}`,y); y+=8
  doc.setFontSize(13); doc.text(`TOTAL: Rp ${new Intl.NumberFormat('id-ID').format(t.total)}`,14,y+8)
  doc.setFontSize(10); doc.text('Terima kasih.',14,285); return doc
}
export function exportDailySummary(trades:TradeForPdf[], dateISO:string, opts?:{storeName?:string}){
  const doc=new jsPDF(); const storeName=opts?.storeName||'Toko Emas'; const d=new Date(dateISO).toLocaleDateString('id-ID')
  doc.setFontSize(16); doc.text(`${storeName} — Rekap Harian ${d}`,14,16); doc.setFontSize(11); doc.text('Transaksi',14,26)
  let y=34,total=0; const idr=(n:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)
  trades.forEach(t=>{ if(y>270){doc.addPage();y=20} doc.text(`#${t.id} ${new Date(t.date).toLocaleTimeString('id-ID')} • ${t.type} • ${t.productName} ${t.variantWeight}gr x${t.qty}`,14,y); y+=6; doc.text(`${t.wallet}/${t.channel}  ${idr(t.total)}`,160,y-6,{align:'right'}); total+=t.total*(t.type==='penjualan'?1:-1) })
  doc.setFontSize(12); doc.text(`Net Total: ${idr(total)}`,14,284); return doc
}
