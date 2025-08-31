<script setup lang="ts">
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, BarController, BarElement, Tooltip, Legend } from 'chart.js'
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, BarController, BarElement, Tooltip, Legend)
const s=useDataStore(); onMounted(()=>{ s.init(); draw() })
const cashCanvas = ref<HTMLCanvasElement|null>(null)
const salesCanvas = ref<HTMLCanvasElement|null>(null)
function draw(){
  const cash = s.cashDaily
  const sales = s.salesDaily
  const keys = Array.from(new Set([...Object.keys(cash), ...Object.keys(sales)])).sort()
  const cashData = keys.map(k=> cash[k]||0)
  const pcsData = keys.map(k=> (sales[k]?.pcs)||0 )
  const omzetData = keys.map(k=> (sales[k]?.omzet)||0 )
  if(cashCanvas.value){
    new Chart(cashCanvas.value.getContext('2d')!, { type:'line', data:{ labels: keys, datasets:[{ label:'Net Cashflow (Rp)', data: cashData }] }, options:{ responsive:true } })
  }
  if(salesCanvas.value){
    new Chart(salesCanvas.value.getContext('2d')!, { type:'bar', data:{ labels: keys, datasets:[{ label:'Penjualan (pcs)', data: pcsData }, { label:'Omzet (Rp)', data: omzetData }] }, options:{ responsive:true } })
  }
}
</script>
<template>
  <section class="section pb-20 sm:pb-6">
    <AdminNav class="hidden sm:flex" />
    <div class="grid md:grid-cols-4 gap-4 mt-4">
      <div class="kpi"><p class="text-sm text-slate-600">Stok (pcs)</p><p class="text-2xl font-semibold mt-1">{{ s.totalPcs }}</p></div>
      <div class="kpi"><p class="text-sm text-slate-600">Stok (gram)</p><p class="text-2xl font-semibold mt-1">{{ s.totalGram.toFixed(2) }} gr</p></div>
      <div class="kpi"><p class="text-sm text-slate-600">Buyback (pcs)</p><p class="text-2xl font-semibold mt-1">{{ s.buybackPcs }}</p></div>
      <div class="kpi"><p class="text-sm text-slate-600">Buyback (gram)</p><p class="text-2xl font-semibold mt-1">{{ s.buybackGram.toFixed(2) }} gr</p></div>
    </div>
    <div class="grid md:grid-cols-2 gap-4 mt-4">
      <div class="card"><h3 class="font-semibold mb-2">Grafik Cashflow (Net per Hari)</h3><canvas ref="cashCanvas" height="160"></canvas></div>
      <div class="card"><h3 class="font-semibold mb-2">Grafik Penjualan (pcs & omzet)</h3><canvas ref="salesCanvas" height="160"></canvas></div>
    </div>
    <AdminBottomNav />
  </section>
</template>
