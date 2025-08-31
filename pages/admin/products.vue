<script setup lang="ts">
const s = useDataStore(); onMounted(()=>s.init())
const form = reactive({ code:'', name:'', category:'perhiasan' as 'perhiasan'|'logammulia', jenis:'kalung', karat:'24K', kadarPct:97, image:'', variants:[{weight:10,stock:0},{weight:5,stock:0}] })
const preview = computed(()=> form.image || 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=800&auto=format&fit=crop')
function add(){ if(!form.code || !form.name) return alert('Lengkapi kode & nama'); s.addProduct({ code:form.code, name:form.name, category:form.category, jenis:form.jenis, karat:form.karat, kadarPct:form.kadarPct, image: form.image || undefined }, form.variants); Object.assign(form,{ code:'', name:'', category:'perhiasan', jenis:'kalung', karat:'24K', kadarPct:97, image:'', variants:[{weight:10,stock:0}] }) }
function addVariant(){ form.variants.push({ weight:1, stock:0 }) }
</script>
<template>
  <section class="section pb-20 sm:pb-6">
    <AdminNav class="hidden sm:flex" />
    <div class="grid md:grid-cols-3 gap-4 mt-4">
      <div class="card md:col-span-1">
        <h3 class="font-semibold mb-2">Tambah Produk</h3>
        <img :src="preview" class="w-full h-40 object-cover rounded-2xl mb-3 border" />
        <div class="grid gap-2">
          <label class="label">Kode</label><input v-model="form.code" class="input" />
          <label class="label">Nama</label><input v-model="form.name" class="input" />
          <label class="label">Kategori</label>
          <select v-model="form.category" class="input"><option value="perhiasan">Perhiasan</option><option value="logammulia">Logam Mulia</option></select>
          <label class="label">Jenis</label><input v-model="form.jenis" class="input" placeholder="kalung/gelang/LM dsb" />
          <div class="grid grid-cols-2 gap-2">
            <div><label class="label">Karat</label><input v-model="form.karat" class="input" /></div>
            <div><label class="label">Kadar (%)</label><input type="number" step="0.01" v-model.number="form.kadarPct" class="input" /></div>
          </div>
          <label class="label">URL Foto</label><input v-model="form.image" class="input" placeholder="https://..." />
          <div class="mt-2">
            <div class="flex items-center justify-between"><h4 class="font-medium">Varian Berat</h4><button class="btn" @click="addVariant">+ Varian</button></div>
            <div v-for="(v,i) in form.variants" :key="i" class="grid grid-cols-2 gap-2 mt-2">
              <input type="number" step="0.01" v-model.number="v.weight" class="input" placeholder="Berat (gr)" />
              <input type="number" v-model.number="v.stock" class="input" placeholder="Stok (pcs)" />
            </div>
          </div>
          <button class="btn-primary mt-3" @click="add">Simpan</button>
        </div>
      </div>
      <div class="card md:col-span-2">
        <h3 class="font-semibold mb-2">Daftar Produk</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <ProductCard v-for="p in s.products" :key="p.id" :item="p" />
        </div>
      </div>
    </div>
    <AdminBottomNav />
  </section>
</template>
