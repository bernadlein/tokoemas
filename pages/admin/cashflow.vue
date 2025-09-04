<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const s = useDataStore(); onMounted(() => s.init?.())

type Row = { label:string, in:number, out:number }
function sum(rows: Row[]) { return rows.reduce((a, r) => a + r.in - r.out, 0) }

const byWallet = computed<Row[]>(() => {
  const acc: Record<string, Row> = {}
  for (const t of (s.trades || [])) {
    const w = t.wallet || 'toko'
    acc[w] ||= { label: w, in: 0, out: 0 }
    if (t.type === 'penjualan') acc[w].in += t.total || 0
    else acc[w].out += t.total || 0
  }
  return Object.values(acc)
})

const byChannel = computed<Row[]>(() => {
  const acc: Record<string, Row> = {}
  for (const t of (s.trades || [])) {
    const c = t.channel || 'cash'
    acc[c] ||= { label: c, in: 0, out: 0 }
    if (t.type === 'penjualan') acc[c].in += t.total || 0
    else acc[c].out += t.total || 0
  }
  return Object.values(acc)
})
</script>

<template>
  <section class="pb-24 section sm:pb-6">
    <div class="grid gap-6 mt-4 md:grid-cols-2">
      <div class="card">
        <h3 class="mb-2 font-semibold">Dompet (Toko vs Pribadi)</h3>
        <div class="space-y-2">
          <div v-for="r in byWallet" :key="r.label" class="flex items-center justify-between p-2 border rounded-xl">
            <div class="font-medium capitalize">{{ r.label }}</div>
            <div class="text-right">
              <div class="text-emerald-700">IN: {{ r.in.toLocaleString('id-ID') }}</div>
              <div class="text-rose-700">OUT: {{ r.out.toLocaleString('id-ID') }}</div>
              <div class="mt-1 font-semibold">Saldo: {{ (r.in - r.out).toLocaleString('id-ID') }}</div>
            </div>
          </div>
          <div class="p-2 mt-2 text-right border rounded-xl">
            <span class="mr-2 text-slate-500">Total</span>
            <b>{{ sum(byWallet).toLocaleString('id-ID') }}</b>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="mb-2 font-semibold">Channel (Cash/Debit/Transfer)</h3>
        <div class="space-y-2">
          <div v-for="r in byChannel" :key="r.label" class="flex items-center justify-between p-2 border rounded-xl">
            <div class="font-medium capitalize">{{ r.label }}</div>
            <div class="text-right">
              <div class="text-emerald-700">IN: {{ r.in.toLocaleString('id-ID') }}</div>
              <div class="text-rose-700">OUT: {{ r.out.toLocaleString('id-ID') }}</div>
              <div class="mt-1 font-semibold">Net: {{ (r.in - r.out).toLocaleString('id-ID') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
