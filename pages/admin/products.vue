<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const s = useDataStore(); onMounted(() => s.init?.())

// Form tambah cepat (1 varian awal)
const f = reactive({
  code: '', name: '', category: 'Perhiasan', jenis: 'kalung',
  karat: 24, kadar: 97, photo: '',
  variantWeight: 5, variantStock: 1
})

function addQuick() {
  if (!f.code || !f.name) return alert('Isi kode & nama')
  const payload: any = {
    code: f.code, name: f.name, category: f.category, jenis: f.jenis,
    karat: Number(f.karat), kadar: Number(f.kadar), photo: f.photo,
    variants: [{ id: Date.now(), weight: Number(f.variantWeight), stock: Number(f.variantStock) }]
  }
  ;(s as any).addProduct?.(payload) || (s as any).upsertProduct?.(payload)
  Object.assign(f, { code:'', name:'', photo:'', variantWeight:5, variantStock:1 })
}

const FALLBACK =
  'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=1200&auto=format&fit=crop'
</script>

<template>
  <section class="pb-24 section sm:pb-6">
    <div class="mt-4 grid gap-6 lg:grid-cols-[380px,1fr]">
      <!-- Form -->
      <div class="card">
        <h3 class="mb-3 font-semibold">Tambah Produk</h3>

        <div class="grid gap-3">
          <img :src="f.photo || FALLBACK" class="object-cover w-full h-44 rounded-xl" />
          <input v-model="f.photo" class="input" placeholder="URL Foto (opsional)" />

          <div class="grid grid-cols-2 gap-3">
            <input v-model="f.code" class="input" placeholder="Kode / SKU" />
            <input v-model="f.name" class="input" placeholder="Nama Produk" />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <select v-model="f.category" class="input">
              <option>Perhiasan</option><option>Logammulia</option>
            </select>
            <input v-model="f.jenis" class="input" placeholder="Jenis (kalung/gelang/LM)" />
            <input type="number" v-model.number="f.karat" class="input" placeholder="Karat" />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <input type="number" v-model.number="f.kadar" class="input" placeholder="Kadar (%)" />
            <input type="number" v-model.number="f.variantWeight" class="input" placeholder="Varian gram" />
            <input type="number" v-model.number="f.variantStock" class="input" placeholder="Stok varian" />
          </div>

          <button class="btn-primary" @click="addQuick">Simpan</button>
        </div>
      </div>

      <!-- List -->
      <div class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div v-for="p in s.products" :key="p.id" class="card">
            <img :src="p.photo || FALLBACK" class="object-cover w-full h-36 rounded-xl" />
            <div class="mt-3">
              <div class="font-semibold leading-tight">
                {{ p.name }} <span class="text-xs text-slate-500">({{ p.code }})</span>
              </div>
              <div class="text-xs text-slate-500">
                {{ p.category }} • {{ p.jenis }} • {{ p.karat }}K/{{ p.kadar }}%
              </div>
              <div class="mt-1 text-xs">
                Total: {{
                  new Intl.NumberFormat('id-ID',{maximumFractionDigits:2})
                    .format((p.variants||[]).reduce((sum:number,v:any)=> sum+(v.weight||0)*(v.stock||0),0))
                }} gr
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
