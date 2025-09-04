<!-- /components/PrintReceiptButton.vue -->
<template>
  <button class="inline-flex items-center px-3 text-sm text-white h-9 rounded-xl bg-amber-500 hover:bg-amber-600"
          @click="print">
    Cetak Nota
  </button>
</template>

<script setup lang="ts">
import { generateReceipt, type ReceiptItem } from '~/utils/receipt'

const props = defineProps<{
  type: 'JUAL' | 'BUYBACK'
  nomor: string
  tanggal: string
  tokoNama: string
  tokoAlamat?: string
  pelanggan?: string
  items: ReceiptItem[]
  total: number
  logoUrl?: string
  tandaTanganUrl?: string
  catatan?: string
}>()

function print(){
  generateReceipt({
    ...props,
    logoUrl: props.logoUrl ?? '/logo.png',
    tandaTanganUrl: props.tandaTanganUrl ?? '/signature.png'
  })
}
</script>
