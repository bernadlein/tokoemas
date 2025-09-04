<script setup lang="ts">
definePageMeta({ ssr: false })

const s = useDataStore()
const ready = ref(false)

onMounted(async () => {
  try { await (s.init?.() as any) } finally { ready.value = true }
})

// clone reaktif agar selalu render ulang saat store berubah
const list = computed(() => [...(s.products || [])])

const FALLBACK =
  'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=1200&auto=format&fit=crop'
const photoSrc = (p: any) => (p && (p.image || p.photo) ? p.image || p.photo : FALLBACK)

const fmt = (n: unknown, frac = 2) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: frac }).format(Number(n) || 0)
</script>

<template>
  <section v-if="ready" class="p-4 pb-20 mx-auto max-w-7xl sm:pb-6">
    <h1 class="mb-4 text-xl font-semibold">Katalog</h1>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="(p, i) in list"
        :key="p?.id ?? i"
        class="p-4 transition bg-white rounded-2xl ring-1 ring-amber-100 hover:shadow-sm"
      >
        <img :src="photoSrc(p)" class="object-cover w-full h-40 rounded-xl" alt="" />
        <div class="mt-3">
          <div class="font-medium truncate">
            {{ p?.name ?? 'Tanpa Nama' }}
            <span class="text-xs text-slate-500">({{ p?.code ?? '-' }})</span>
          </div>
          <div class="text-xs text-slate-500">
            {{ p?.category }} • {{ p?.jenis }} • {{ p?.karat }}K/{{ p?.kadar }}%
          </div>
          <div class="mt-1 text-xs">
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
          </div>
        </div>
      </article>

      <p v-if="!list.length" class="text-sm text-slate-500">Belum ada produk.</p>
    </div>
  </section>
</template>
