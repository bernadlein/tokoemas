<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const s = useDataStore()

const local = reactive({
  storeName: s.settings?.storeName || 'Toko Emas',
  logoUrl: s.settings?.logoUrl || '',
  signatureUrl: s.settings?.signatureUrl || '',
  usdToIdr: s.settings?.usdToIdr || 16000,
  markups: {
    perhiasan: s.settings?.markups?.perhiasan ?? 8,
    logammulia: s.settings?.markups?.logammulia ?? 3
  },
})

function save() {
  ;(s as any).saveSettings?.(JSON.parse(JSON.stringify(local))) ||
  ((s as any).settings = JSON.parse(JSON.stringify(local)))
  alert('Tersimpan')
}
</script>

<template>
  <section class="pb-24 section sm:pb-6">
    <div class="grid gap-6 mt-4 md:grid-cols-2">
      <div class="card">
        <h3 class="mb-3 font-semibold">Identitas Toko</h3>
        <div class="grid gap-3">
          <input v-model="local.storeName" class="input" placeholder="Nama Toko" />
          <input v-model="local.logoUrl" class="input" placeholder="URL Logo (untuk nota)" />
          <input v-model="local.signatureUrl" class="input" placeholder="URL Tanda Tangan (untuk nota)" />
          <div class="flex justify-end">
            <button class="btn-primary" @click="save">Simpan</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="mb-3 font-semibold">Harga Emas & Markup</h3>
        <div class="grid gap-3">
          <input type="number" v-model.number="local.usdToIdr" class="input" placeholder="Kurs USD→IDR (opsional)" />
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Markup Perhiasan (%)</label>
              <input type="number" v-model.number="local.markups.perhiasan" class="input" />
            </div>
            <div>
              <label class="label">Markup Logam Mulia (%)</label>
              <input type="number" v-model.number="local.markups.logammulia" class="input" />
            </div>
          </div>
          <div class="flex justify-end">
            <button class="btn" @click="save">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
