<!-- pages/admin/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin', ssr: false }) // <- WAJIB untuk menampilkan tab admin

const s = useDataStore()
onMounted(() => s.init?.())

const fmt = (n: unknown, frac = 2) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: frac }).format(Number(n) || 0)

const totalPcs = computed(() =>
  (s.products ?? []).reduce(
    (a, p: any) => a + (p.variants ?? []).reduce((x: number, v: any) => x + (Number(v?.stock) || 0), 0),
    0
  )
)

const totalGram = computed(() =>
  (s.products ?? []).reduce(
    (a, p: any) =>
      a + (p.variants ?? []).reduce(
        (x: number, v: any) => x + (Number(v?.weight) || 0) * (Number(v?.stock) || 0),
        0
      ),
    0
  )
)

const buybackList = computed<any[]>(() => {
  const anyS = s as any
  if (Array.isArray(anyS.buybacks)) return anyS.buybacks
  if (Array.isArray(anyS.buyback)) return anyS.buyback
  return []
})
const buybackGram = computed(() =>
  buybackList.value.reduce(
    (a: number, b: any) => a + (Number(b?.weight) || 0) * (Number(b?.qty) || 0),
    0
  )
)

const latestProducts = computed(() => (s.products ?? []).slice(0, 6))

const FALLBACK =
  'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=1200&auto=format&fit=crop'
const photoSrc = (p: any) => (p && (p.image || p.photo) ? p.image || p.photo : FALLBACK)

function resetDemo() {
  if (confirm('Reset semua data demo?')) (s as any).resetDemo?.()
}
</script>

<template>
  <section class="p-4 pb-20 mx-auto max-w-7xl sm:pb-6">
    <!-- Ringkasan -->
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="p-5 bg-white rounded-2xl ring-1 ring-amber-100">
        <p class="text-sm text-slate-500">Total Stok (pcs)</p>
        <p class="mt-1 text-2xl font-semibold">{{ totalPcs }}</p>
      </div>
      <div class="p-5 bg-white rounded-2xl ring-1 ring-amber-100">
        <p class="text-sm text-slate-500">Total Stok (gram)</p>
        <p class="mt-1 text-2xl font-semibold">{{ fmt(totalGram) }} gr</p>
      </div>
      <div class="p-5 bg-white rounded-2xl ring-1 ring-amber-100">
        <p class="text-sm text-slate-500">Inventori Buyback (gram)</p>
        <p class="mt-1 text-2xl font-semibold">{{ fmt(buybackGram) }} gr</p>
      </div>
    </div>

    <div class="flex justify-end mt-3">
      <button
        class="px-3 py-2 text-sm font-medium bg-white rounded-xl ring-1 ring-amber-200 hover:bg-amber-50"
        @click="resetDemo"
      >
        Reset Demo
      </button>
    </div>

    <!-- Produk terbaru -->
    <div class="mt-6">
      <h2 class="mb-3 text-base font-semibold">Produk Terbaru</h2>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="(p, i) in latestProducts"
          :key="p?.id ?? i"
          class="flex items-center gap-4 p-4 bg-white rounded-2xl ring-1 ring-amber-100"
        >
          <img :src="photoSrc(p)" class="object-cover h-24 w-36 rounded-xl" />
          <div class="min-w-0">
            <h3 class="font-medium truncate">
              {{ p?.name ?? 'Tanpa Nama' }}
              <span class="text-xs text-slate-500">({{ p?.code ?? '-' }})</span>
            </h3>
            <p class="text-xs text-slate-500">
              {{ p?.category }} • {{ p?.jenis }} • {{ p?.karat }}K/{{ p?.kadar }}%
            </p>
            <p class="text-xs text-slate-500">
              Total:
              {{
                fmt(
                  (p?.variants ?? []).reduce(
                    (sum: number, v: any) =>
                      sum + (Number(v?.weight) || 0) * (Number(v?.stock) || 0),
                    0
                  )
                )
              }}
              gr •
              {{
                (p?.variants ?? []).reduce((sum: number, v: any) => sum + (Number(v?.stock) || 0), 0)
              }}
              pcs
            </p>
          </div>
        </article>

        <p v-if="!latestProducts.length" class="text-sm text-slate-500">Belum ada produk.</p>
      </div>
    </div>
  </section>
</template>
