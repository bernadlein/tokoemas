// stores/data.ts
import { defineStore } from 'pinia'

type PriceMode = 'perPcs' | 'perGram'
type TradeType  = 'penjualan' | 'buyback'
type Wallet     = 'toko' | 'pribadi'
type Channel    = 'cash' | 'debit' | 'transfer'

export type Variant = { id:number; weight:number; stock:number }
export type Product = {
  id:number; code:string; name:string; category:string; jenis:string;
  karat:number; kadar:number; photo?:string; variants:Variant[]
}
export type Trade = {
  id:number; date:string; type:TradeType;
  productId:number; variantId:number; qty:number;
  priceMode: PriceMode; priceUsed:number;
  discountPercent:number; discountNominal:number;
  total:number; wallet:Wallet; channel:Channel
}
export type BuybackItem = {
  id:number;
  name:string; // nama/item
  category:string; jenis:string; karat:number; kadar:number;
  weight:number; // gram per pcs
  qty:number;    // pcs
}
export type Settings = {
  storeName:string; logoUrl?:string; signatureUrl?:string;
  usdToIdr:number; markups:{ perhiasan:number; logammulia:number }
}

const LS_KEY = 'tokoemas:data:v1'

export const useDataStore = defineStore('data', {
  state: () => ({
    products: [] as Product[],
    trades: [] as Trade[],
    buybacks: [] as BuybackItem[],
    settings: {
      storeName: 'Toko Emas',
      usdToIdr: 16000,
      markups: { perhiasan: 8, logammulia: 3 },
      logoUrl: '',
      signatureUrl: ''
    } as Settings,
    lastGoldPriceIdr: 0
  }),

  getters: {
    productById: (s) => (id:number) => s.products.find(p => p.id === id),
    variantById: (s) => (pid:number, vid:number) =>
      s.products.find(p => p.id === pid)?.variants.find(v => v.id === vid)
  },

  actions: {
    /* ---------- persistence ---------- */
    saveAll() {
      localStorage.setItem(LS_KEY, JSON.stringify({
        products: this.products,
        trades: this.trades,
        buybacks: this.buybacks,
        settings: this.settings,
        lastGoldPriceIdr: this.lastGoldPriceIdr
      }))
    },
    init() {
      try {
        const raw = localStorage.getItem(LS_KEY)
        if (raw) {
          const data = JSON.parse(raw)
          this.products = data.products || []
          this.trades   = data.trades   || []
          this.buybacks = data.buybacks || []
          this.settings = { ...this.settings, ...(data.settings||{}) }
          this.lastGoldPriceIdr = data.lastGoldPriceIdr || 0
        } else if (!this.products.length) {
          // seed kecil agar UI hidup
          const now = Date.now()
          this.products = [
            {
              id: now+1, code: 'KLG-24K', name: 'Kalung Rantai 24K',
              category: 'Perhiasan', jenis: 'kalung', karat: 24, kadar: 97,
              variants: [{ id: now+11, weight: 6.5, stock: 14 }],
              photo: ''
            },
            {
              id: now+2, code: 'GEL-24K', name: 'Gelang Polos 24K',
              category: 'Perhiasan', jenis: 'gelang', karat: 24, kadar: 97,
              variants: [{ id: now+21, weight: 4.2, stock: 12 }],
              photo: ''
            },
            {
              id: now+3, code: 'LM-ANTAM', name: 'Logam Mulia Antam',
              category: 'Logammulia', jenis: 'LM', karat: 24, kadar: 99.99,
              variants: [{ id: now+31, weight: 10, stock: 18 }],
              photo: ''
            }
          ]
          this.saveAll()
        }
      } catch (e) {
        console.warn('init failed', e)
      }
    },

    /* ---------- helpers ---------- */
    setLastGoldPriceIdr(v:number){ this.lastGoldPriceIdr = v; this.saveAll() },

    /* ---------- product CRUD ---------- */
    addProduct(p: Partial<Product>) {
      const id = p.id ?? Date.now() + Math.floor(Math.random()*1000)
      const payload: Product = {
        id,
        code: p.code!, name: p.name!, category: p.category!, jenis: p.jenis!,
        karat: Number(p.karat||0), kadar: Number(p.kadar||0),
        photo: p.photo || '',
        variants: (p.variants || []).map(v => ({
          id: v.id ?? (Date.now()+Math.floor(Math.random()*1000)),
          weight: Number(v.weight||0), stock: Number(v.stock||0)
        }))
      }
      this.products.push(payload)
      this.saveAll()
      return payload
    },
    upsertProduct(p: Partial<Product>) {
      const found = this.products.find(x => (!!p.id && x.id===p.id) || x.code===p.code)
      if (!found) return this.addProduct(p)
      found.name = p.name ?? found.name
      found.category = p.category ?? found.category
      found.jenis = p.jenis ?? found.jenis
      found.karat = Number(p.karat ?? found.karat)
      found.kadar = Number(p.kadar ?? found.kadar)
      found.photo = p.photo ?? found.photo
      if (p.variants?.length) {
        // simple replace; bisa dibuat merge jika perlu
        found.variants = p.variants.map(v => ({
          id: v.id ?? (Date.now()+Math.floor(Math.random()*1000)),
          weight: Number(v.weight||0), stock: Number(v.stock||0)
        }))
      }
      this.saveAll()
      return found
    },

    /* ---------- buyback inventory ---------- */
    addBuybackItem(b: Partial<BuybackItem>) {
      const item: BuybackItem = {
        id: b.id ?? Date.now() + Math.floor(Math.random()*1000),
        name: b.name || b['item'] || 'Buyback',
        category: b.category || 'Perhiasan',
        jenis: b.jenis || '-',
        karat: Number(b.karat||0),
        kadar: Number(b.kadar||0),
        weight: Number(b.weight||0),
        qty: Number(b.qty||0)
      }
      if (item.qty <= 0) return
      // merge by detail (nama+spesifikasi+berat)
      const same = this.buybacks.find(x =>
        x.name===item.name && x.category===item.category && x.jenis===item.jenis &&
        x.karat===item.karat && x.kadar===item.kadar && x.weight===item.weight
      )
      if (same) same.qty += item.qty
      else this.buybacks.push(item)
      this.saveAll()
    },

    processBuyback(payload: { buybackId:number; productId:number; variantId:number; qty:number }) {
      const bb = this.buybacks.find(x => x.id === payload.buybackId)
      if (!bb) throw new Error('Item buyback tidak ditemukan')
      if (payload.qty <= 0) throw new Error('Qty harus > 0')
      if (payload.qty > bb.qty) throw new Error('Qty melebihi inventori buyback')

      const v = this.variantById(payload.productId, payload.variantId)
      if (!v) throw new Error('Varian tujuan tidak ditemukan')

      // tambahkan ke stok
      v.stock += payload.qty

      // kurangi dari buyback
      bb.qty -= payload.qty
      if (bb.qty <= 0) this.buybacks = this.buybacks.filter(x => x.id !== bb.id)

      this.saveAll()
    },
    // alias agar kompatibel dengan kode lama
    convertBuybackToStock(args:any){ return this.processBuyback(args) },

    /* ---------- transaksi ---------- */
    trade(payload: {
      type: TradeType; productId:number; variantId:number; qty:number;
      priceMode: PriceMode; priceUsed:number;
      discountPercent:number; discountNominal:number;
      wallet: Wallet; channel: Channel
    }) {
      const p = this.productById(payload.productId)
      const v = this.variantById(payload.productId, payload.variantId)
      if (!p || !v) throw new Error('Produk/varian tidak ditemukan')

      const base = payload.priceMode === 'perPcs'
        ? payload.priceUsed * payload.qty
        : payload.priceUsed * (v.weight||0) * payload.qty
      const afterPct = base - base * (payload.discountPercent/100)
      const total = Math.max(0, afterPct - payload.discountNominal)

      const t: Trade = {
        id: Date.now() + Math.floor(Math.random()*1000),
        date: new Date().toISOString(),
        type: payload.type,
        productId: payload.productId,
        variantId: payload.variantId,
        qty: Number(payload.qty||0),
        priceMode: payload.priceMode,
        priceUsed: Number(payload.priceUsed||0),
        discountPercent: Number(payload.discountPercent||0),
        discountNominal: Number(payload.discountNominal||0),
        total,
        wallet: payload.wallet,
        channel: payload.channel
      }
      this.trades.unshift(t)

      if (payload.type === 'penjualan') {
        // keluarkan stok
        if (v.stock < t.qty) throw new Error('Stok tidak cukup')
        v.stock -= t.qty
      } else {
        // masuk ke inventori buyback
        this.addBuybackItem({
          name: p.name, category: p.category, jenis: p.jenis,
          karat: p.karat, kadar: p.kadar,
          weight: v.weight, qty: t.qty
        })
      }

      this.saveAll()
      return t
    },

    /* ---------- settings & demo ---------- */
    saveSettings(s: Settings){ this.settings = JSON.parse(JSON.stringify(s)); this.saveAll() },

    resetDemo(){
      this.trades = []
      this.buybacks = []
      // reset stok ke default (tanpa hapus produk)
      this.products = this.products.map(p => ({
        ...p,
        variants: p.variants.map(v => ({ ...v, stock: Math.max(0, Math.round(v.stock)) }))
      }))
      this.saveAll()
    }
  }
})
