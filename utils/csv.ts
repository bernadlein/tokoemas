// /utils/csv.ts
export type StockRow = {
  sku?: string
  kategori?: string       // Perhiasan / Logammulia
  jenis?: string          // kalung / gelang / LM
  karat?: string          // 24K / 23K dst (opsional)
  kadar?: number | string // persen, ex: 97
  berat?: number          // gram (varian)
  qty?: number            // pcs
}

export type BuybackRow = {
  kategori?: string
  jenis?: string
  karat?: string
  kadar?: number | string
  berat?: number
  qty?: number
}

function normalizeKey(k: string) {
  return k.toLowerCase().replace(/\s+|_/g, '')
}

export async function parseCsvFile(file: File) {
  const Papa = (await import('papaparse')).default
  return new Promise<{ rows: any[]; errors: string[] }>((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (res) => {
        const errors: string[] = []
        const rows = res.data.map((r: any, idx: number) => {
          const obj: any = {}
          for (const [k, v] of Object.entries(r)) obj[normalizeKey(k)] = v
          // minimal check
          if (!obj.berat || !obj.qty) errors.push(`Baris ${idx + 2}: berat/qty kosong`)
          return obj
        })
        resolve({ rows, errors })
      }
    })
  })
}

// helper untuk mapping ke tipe kita
export function mapToStock(rows: any[]): StockRow[] {
  return rows.map(r => ({
    sku: r.sku ?? r.kode ?? r.kodesku,
    kategori: r.kategori,
    jenis: r.jenis,
    karat: r.karat,
    kadar: r.kadar ?? r.kadarpersen,
    berat: Number(r.berat),
    qty: Number(r.qty)
  }))
}

export function mapToBuyback(rows: any[]): BuybackRow[] {
  return rows.map(r => ({
    kategori: r.kategori,
    jenis: r.jenis,
    karat: r.karat,
    kadar: r.kadar ?? r.kadarpersen,
    berat: Number(r.berat),
    qty: Number(r.qty)
  }))
}
