import { defineStore } from 'pinia'
export type Wallet = 'toko' | 'pribadi'
export type Channel = 'cash' | 'debit' | 'transfer'
export type Variant = { id:number; weight:number; stock:number }
export type Product = { id:number; code:string; name:string; category:'perhiasan'|'logammulia'; jenis:string; karat:string; kadarPct:number; image?:string; variants:Variant[] }
export type TradeType = 'penjualan'|'buyback'
export type Trade = { id:number; date:string; type:TradeType; productId:number; variantId:number; qty:number; priceMode:'perPcs'|'perGram'; priceUsed:number; discountNominal:number; discountPercent:number; total:number; channel:Channel; wallet:Wallet }
export type BuybackItem = { id:number; date:string; category:'perhiasan'|'logammulia'; jenis:string; karat:string; kadarPct:number; weight:number; qty:number; note?:string }
export type CashEntry = { id:number; date:string; type:'IN'|'OUT'; amount:number; note:string; wallet:Wallet; channel:Channel; source?:'trade'|'setoran'|'pribadi'|'lainnya' }
type Settings = { markups: { perhiasan:number, logammulia:number }, usdToIdr: number, lastGoldPriceIdr?: number }
type State = { products:Product[]; trades:Trade[]; cash:CashEntry[]; buyback:BuybackItem[]; seq:number; settings: Settings }
const KEY = 'toko-emas-prototype-v41'
function seed(): Product[] {
  return [
    { id:1, code:'KLG-24K', name:'Kalung Rantai 24K', category:'perhiasan', jenis:'kalung', karat:'24K', kadarPct:97, variants:[{id:101, weight:10, stock:5},{id:102, weight:5, stock:10}] },
    { id:2, code:'GEL-24K', name:'Gelang Polos 24K', category:'perhiasan', jenis:'gelang', karat:'24K', kadarPct:97, variants:[{id:201, weight:7, stock:4},{id:202, weight:3, stock:8}] },
    { id:3, code:'LM-ANTAM', name:'Logam Mulia Antam', category:'logammulia', jenis:'LM', karat:'LM', kadarPct:99.99, variants:[{id:301, weight:5, stock:12},{id:302, weight:10, stock:6}] }
  ]
}
function calcTotal(qty:number, mode:'perPcs'|'perGram', price:number, w:number, discNom:number, discPct:number){
  const base = mode==='perPcs' ? price*qty : price*w*qty
  const afterPct = base - base*(discPct/100)
  return Math.max(0, afterPct - discNom)
}
export const useDataStore = defineStore('data', {
  state:():State=>({ products:[], trades:[], cash:[], buyback:[], seq:1000, settings: { markups: { perhiasan: 0.08, logammulia: 0.03 }, usdToIdr: 16000, lastGoldPriceIdr: undefined } }),
  getters:{
    productById:(s)=>(id:number)=> s.products.find(p=>p.id===id),
    variantById:(s)=>(pid:number,vid:number)=> s.products.find(p=>p.id===pid)?.variants.find(v=>v.id===vid),
    inventoryByCategory:(s)=>{ const res:Record<string,{pcs:number,gram:number}>={}; for(const p of s.products){ res[p.category] ||= {pcs:0,gram:0}; for(const v of p.variants){ res[p.category].pcs += v.stock; res[p.category].gram += v.weight*v.stock } } return res },
    totalPcs:(s)=> s.products.reduce((t,p)=> t+p.variants.reduce((x,v)=>x+v.stock,0),0),
    totalGram:(s)=> s.products.reduce((t,p)=> t+p.variants.reduce((x,v)=>x+v.weight*v.stock,0),0),
    buybackPcs:(s)=> s.buyback.reduce((t,b)=> t+b.qty,0),
    buybackGram:(s)=> s.buyback.reduce((t,b)=> t+b.weight*b.qty,0),
    cashBy:(s)=>(wallet?:Wallet,channel?:Channel)=> s.cash.filter(c=>(!wallet||c.wallet===wallet)&&(!channel||c.channel===channel)).reduce((t,c)=>t+(c.type==='IN'?c.amount:-c.amount),0),
    cashDaily:(s)=> { const map: Record<string, number> = {}; for(const c of s.cash){ const d = new Date(c.date).toISOString().slice(0,10); map[d] ||= 0; map[d] += (c.type==='IN'? c.amount : -c.amount) } return map },
    salesDaily:(s)=>{ const map: Record<string, {pcs:number, omzet:number}> = {}; for(const t of s.trades.filter(x=>x.type==='penjualan')){ const d = new Date(t.date).toISOString().slice(0,10); map[d] ||= { pcs:0, omzet:0 }; map[d].pcs += t.qty; map[d].omzet += t.total } return map }
  },
  actions:{
    init(){ const raw = process.client? localStorage.getItem(KEY):null; if(raw) Object.assign(this, JSON.parse(raw)); else { this.products=seed(); this.persist() } },
    persist(){ if(process.client) localStorage.setItem(KEY, JSON.stringify(this.$state)) },
    setMarkups(m:Partial<Settings['markups']>){ this.settings.markups = { ...this.settings.markups, ...m }; this.persist() },
    setUsdToIdr(v:number){ this.settings.usdToIdr = v; this.persist() },
    setLastGoldPriceIdr(v:number){ this.settings.lastGoldPriceIdr = v; this.persist() },
    addProduct(p:Omit<Product,'id'|'variants'>,vars:Omit<Variant,'id'>[]){ const id=++this.seq; const vs=vars.map(v=>({id:++this.seq,...v})); this.products.unshift({id,...p,variants:vs}); this.persist() },
    addVariant(pid:number, v:Omit<Variant,'id'>){ const p=this.products.find(x=>x.id===pid); if(!p) return; p.variants.push({ id:++this.seq, ...v }); this.persist() },
    trade(payload:{type:'penjualan'|'buyback'; productId:number; variantId:number; qty:number; priceMode:'perPcs'|'perGram'; priceUsed:number; discountNominal:number; discountPercent:number; wallet:Wallet; channel:Channel }){
      const p=this.products.find(x=>x.id===payload.productId); if(!p) throw new Error('Produk tidak ditemukan')
      const v=p.variants.find(x=>x.id===payload.variantId); if(!v) throw new Error('Varian tidak ditemukan')
      if(payload.qty<=0) throw new Error('Qty tidak valid')
      const isSale = payload.type==='penjualan'
      if(isSale && v.stock<payload.qty) throw new Error('Stok varian tidak cukup')
      const total = calcTotal(payload.qty, payload.priceMode, payload.priceUsed, v.weight, payload.discountNominal, payload.discountPercent)
      this.trades.unshift({ id:++this.seq, date:new Date().toISOString(), total, ...payload })
      if(isSale){ v.stock -= payload.qty; this.cash.unshift({ id:++this.seq,date:new Date().toISOString(),type:'IN',amount:total,note:`Penjualan ${p.name} ${v.weight}gr x${payload.qty}`,wallet:payload.wallet,channel:payload.channel,source:'trade'}) }
      else { this.buyback.unshift({ id:++this.seq, date:new Date().toISOString(), category:p.category, jenis:p.jenis, karat:p.karat, kadarPct:p.kadarPct, weight:v.weight, qty:payload.qty }); this.cash.unshift({ id:++this.seq,date:new Date().toISOString(),type:'OUT',amount:total,note:`Buyback ${p.name} ${v.weight}gr x${payload.qty}`,wallet:payload.wallet,channel:payload.channel,source:'trade'}) }
      this.persist()
    },
    processBuybackToStock(bid:number,pid:number,vid:number,qty:number){
      const b=this.buyback.find(x=>x.id===bid); if(!b) throw new Error('Item buyback tidak ditemukan')
      if(qty<=0||qty>b.qty) throw new Error('Qty tidak valid')
      const p=this.products.find(x=>x.id===pid); if(!p) throw new Error('Produk target tidak ditemukan')
      const v=p.variants.find(x=>x.id===vid); if(!v) throw new Error('Varian target tidak ditemukan')
      v.stock += qty; b.qty -= qty; if(b.qty===0) this.buyback=this.buyback.filter(x=>x.id!==b.id); this.persist()
    },
    addCash(e:Omit<CashEntry,'id'|'date'|'source'> & {date?:string,source?:CashEntry['source']}){ this.cash.unshift({ id:++this.seq, date:e.date||new Date().toISOString(), source:e.source||'lainnya', ...e }); this.persist() },
    resetAll(){ if(process.client) localStorage.removeItem(KEY); Object.assign(this.$state,{ products:seed(), trades:[], cash:[], buyback:[], seq:1000, settings: { markups: { perhiasan: 0.08, logammulia: 0.03 }, usdToIdr: 16000, lastGoldPriceIdr: undefined } }); this.persist() }
  }
})
