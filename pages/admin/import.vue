<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const s = useDataStore()
onMounted(() => s.init?.())

type ImportType = 'produk' | 'buyback'
const tipe = ref<ImportType>('produk')

const source = ref<'upload'|'paste'>('upload')
const file = ref<File | null>(null)
const raw = ref<string>('')

// hasil parse
const headers = ref<string[]>([])
const rows = ref<Record<string, string>[]>([])
const parseError = ref<string>('')

// ringkasan
const previewCount = computed(() => Math.min(rows.value.length, 50))

function onPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] || null
  file.value = f ?? null
}

// ---------- CSV Utils ----------
function detectDelimiter(sample: string): string {
  const lines = sample.split(/\r?\n/).slice(0, 3)
  const cnt = (ch: string) => lines.map(l => (l.match(new RegExp(`\\${ch}`, 'g')) || []).length).reduce((a,b)=>a+b,0)
  const comma = cnt(','); const semi = cnt(';'); const tab = cnt('\t')
  if (tab >= comma && tab >= semi) return '\t'
  if (semi >= comma && semi >= tab) return ';'
  return ','
}

function parseCSV(text: string, delimiter?: string) {
  parseError.value = ''
  try {
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1) // BOM
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n') // normalize
    const delim = delimiter || detectDelimiter(text)

    const out: string[][] = []
    let row: string[] = []
    let cur = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
      const c = text[i]
      if (inQuotes) {
        if (c === '"') {
          const next = text[i+1]
          if (next === '"') { cur += '"'; i++ } else { inQuotes = false }
        } else { cur += c }
        continue
      }
      if (c === '"') { inQuotes = true; continue }
      if (c === delim) { row.push(cur); cur = ''; continue }
      if (c === '\n') { row.push(cur); out.push(row); row = []; cur = ''; continue }
      cur += c
    }
    if (cur.length || row.length) { row.push(cur); out.push(row) }

    if (!out.length) { headers.value = []; rows.value = []; return }
    const head = out[0].map(h => h.trim())
    const recs = out.slice(1)
      .filter(r => r.length && r.some(x => String(x).trim() !== ''))
      .map(r => {
        const o: Record<string, string> = {}
        for (let i = 0; i < head.length; i++) o[head[i]] = (r[i] ?? '').trim()
        return o
      })

    headers.value = head
    rows.value = recs
  } catch (e: any) {
    parseError.value = e?.message || 'Gagal parse CSV'
    headers.value = []; rows.value = []
  }
}

async function readFileToText(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(String(fr.result || ''))
    fr.onerror = () => rej(new Error('Tidak bisa membaca file'))
    fr.readAsText(f)
  })
}

async function doParse() {
  if (source.value === 'upload') {
    if (!file.value) return alert('Pilih file CSV dulu')
    const txt = await readFileToText(file.value)
    parseCSV(txt)
  } else {
    if (!raw.value.trim()) return alert('Paste CSV dulu')
    parseCSV(raw.value)
  }
  if (!headers.value.length) alert('CSV kosong / tidak terbaca')
}

// Helpers
const toNum = (v: string): number => {
  const t = (v || '').replace(/\s/g, '').replace(/\./g,'').replace(',','.')
  const n = Number(t)
  return Number.isFinite(n) ? n : 0
}
function hasHeaders(req: string[]): { ok: boolean; miss: string[] } {
  const set = new Set(headers.value.map(h => h.toLowerCase()))
  const missing = req.filter(h => !set.has(h.toLowerCase()))
  return { ok: missing.length === 0, miss: missing }
}

async function importProduk() {
  const required = ['code','name','category','jenis','karat','kadar','photo','weight','stock']
  const chk = hasHeaders(required)
  if (!chk.ok) return alert('Header kurang: ' + chk.miss.join(', '))

  const grouped: Record<string, any> = {}
  for (const r of rows.value) {
    const code = r.code
    if (!code) continue
    grouped[code] ||= {
      id: undefined,
      code,
      name: r.name,
      category: r.category,
      jenis: r.jenis,
      karat: toNum(r.karat),
      kadar: toNum(r.kadar),
      photo: r.photo,
      variants: [] as any[]
    }
    grouped[code].variants.push({
      id: Date.now() + Math.random(),
      weight: toNum(r.weight),
      stock: toNum(r.stock)
    })
  }

  const items = Object.values(grouped)
  if (!items.length) return alert('Tidak ada baris valid')

  const add = (s as any).addProduct || (s as any).upsertProduct || (s as any).addOrUpdateProduct
  for (const p of items) await add?.(p)

  alert(`Import produk selesai: ${items.length} produk (${rows.value.length} baris)`)
}

async function importBuyback() {
  const required = ['name','category','jenis','karat','kadar','weight','qty']
  const chk = hasHeaders(required)
  if (!chk.ok) return alert('Header kurang: ' + chk.miss.join(', '))

  const addBB = (s as any).addBuybackItem || (s as any).upsertBuybackItem || (s as any).addOrUpdateBuyback
  let ok = 0
  for (const r of rows.value) {
    const payload = {
      id: Date.now() + Math.random(),
      name: r.name, category: r.category, jenis: r.jenis,
      karat: toNum(r.karat), kadar: toNum(r.kadar),
      weight: toNum(r.weight), qty: toNum(r.qty)
    }
    await addBB?.(payload); ok++
  }
  alert(`Import buyback selesai: ${ok} baris`)
}

async function doImport() {
  if (!rows.value.length) return alert('Belum ada data hasil parse')
  if (tipe.value === 'produk') return importProduk()
  return importBuyback()
}

function downloadTemplate(kind: ImportType) {
  let csv = ''
  if (kind === 'produk') {
    csv += 'code,name,category,jenis,karat,kadar,photo,weight,stock\n'
    csv += 'KAL-001,Kalung Emas,Perhiasan,kalung,24,97,https://...,5,2\n'
    csv += 'GEL-101,Gelang Emas,Perhiasan,gelang,24,97,https://...,10,1\n'
    csv += 'LM-05,LM Antam,Logammulia,LM,24,99.9,https://...,5,3\n'
  } else {
    csv += 'name,category,jenis,karat,kadar,weight,qty\n'
    csv += 'Kalung bekas,Perhiasan,kalung,22,91,7.5,1\n'
    csv += 'LM second,Logammulia,LM,24,99.9,10,2\n'
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = kind === 'produk' ? 'template-produk.csv' : 'template-buyback.csv'
  document.body.appendChild(a); a.click(); a.remove()
}

function clearParse() {
  headers.value = []
  rows.value = []
  parseError.value = ''
  raw.value = ''
  file.value = null
}
</script>

<template>
  <section class="pb-20 section sm:pb-6">
    <div class="max-w-5xl mt-4 card">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex gap-2">
          <button class="btn" :class="tipe==='produk' && 'btn-active'" @click="tipe='produk'">Produk & Varian</button>
          <button class="btn" :class="tipe==='buyback' && 'btn-active'" @click="tipe='buyback'">Inventori Buyback</button>
        </div>

        <div class="flex gap-2">
          <button class="btn" @click="downloadTemplate('produk')">Template Produk</button>
          <button class="btn" @click="downloadTemplate('buyback')">Template Buyback</button>
        </div>
      </div>

      <div class="grid gap-4 mt-4 lg:grid-cols-2">
        <!-- LEFT -->
        <div class="p-3 border rounded-2xl">
          <div class="flex gap-3">
            <label class="inline-flex items-center gap-2">
              <input type="radio" value="upload" v-model="source" />
              <span>Upload CSV</span>
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="radio" value="paste" v-model="source" />
              <span>Paste CSV</span>
            </label>
          </div>

          <div v-if="source==='upload'" class="mt-3">
            <label class="label">File CSV</label>
            <input type="file" accept=".csv,text/csv" class="input" @change="onPick" />
            <p class="mt-1 text-sm text-slate-500">Dukungan delimiter: koma, titik koma, dan tab.</p>
          </div>

          <div v-else class="mt-3">
            <label class="label">Paste CSV</label>
            <textarea v-model="raw" rows="10" class="input w-full !h-auto font-mono" placeholder="Tempel data CSV di sini..."></textarea>
          </div>

          <div class="flex justify-end gap-2 mt-3">
            <button class="btn" @click="clearParse">Bersihkan</button>
            <button class="btn-primary" @click="doParse">Parse & Preview</button>
          </div>

          <p v-if="parseError" class="mt-2 text-sm text-rose-600">Error: {{ parseError }}</p>
        </div>

        <!-- RIGHT -->
        <div class="p-3 border rounded-2xl">
          <h3 class="mb-2 font-semibold">Petunjuk Kolom</h3>
          <div v-if="tipe==='produk'" class="space-y-1 text-sm">
            <p><b>Wajib:</b> code, name, category, jenis, karat, kadar, weight, stock</p>
            <p><b>Opsional:</b> photo (URL gambar)</p>
            <p class="muted">Baris dengan code yang sama akan <i>dimerge</i> menjadi satu produk dengan beberapa varian berat.</p>
          </div>
          <div v-else class="space-y-1 text-sm">
            <p><b>Wajib:</b> name, category, jenis, karat, kadar, weight, qty</p>
            <p class="muted">Data masuk ke <b>Inventori Buyback</b>. Proses ke stok jual dilakukan di halaman Buyback.</p>
          </div>
          <hr class="my-3" />
          <p class="text-sm text-slate-500">Tips: Excel dengan pemisah titik koma tetap bisa di-parse otomatis.</p>
        </div>
      </div>

      <!-- PREVIEW -->
      <div v-if="rows.length" class="mt-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold">Preview ({{ previewCount }}/{{ rows.length }} baris)</h3>
          <button class="btn-primary" @click="doImport">Import {{ tipe==='produk' ? 'Produk' : 'Buyback' }}</button>
        </div>

        <div class="overflow-auto border rounded-2xl">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left bg-slate-50 text-slate-500">
                <th v-for="h in headers" :key="h" class="px-2 py-2">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r,i) in rows.slice(0, previewCount)" :key="i" class="border-t">
                <td v-for="h in headers" :key="h" class="px-2 py-2 whitespace-pre-wrap">{{ r[h] }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end mt-3">
          <button class="btn" @click="doImport">Import Sekarang</button>
        </div>
      </div>

      <div v-else class="mt-6 text-sm text-slate-500">
        Belum ada data. Pilih file atau paste CSV, lalu klik <b>Parse & Preview</b>.
      </div>
    </div>
  </section>
</template>
