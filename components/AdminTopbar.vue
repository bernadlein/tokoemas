<script setup lang="ts">
const route = useRoute()

const tabs = [
  { label: 'Dashboard',         to: '/admin' },
  { label: 'Produk',            to: '/admin/products' },
  { label: 'Transaksi Emas',    to: '/admin/trade' },
  { label: 'Inventori Buyback', to: '/admin/buyback' },
  { label: 'Kas',               to: '/admin/cashflow' },
  { label: 'Laporan',           to: '/admin/reports' },
  { label: 'Import CSV',        to: '/admin/import' },
  { label: 'Settings',          to: '/admin/settings' },
]

const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b bg-white/90 backdrop-blur dark:bg-slate-900/90 dark:border-slate-800"
  >
    <div class="px-4 mx-auto max-w-7xl">
      <!-- Brand + Right nav -->
      <div class="flex items-center justify-between py-3">
        <NuxtLink to="/" class="inline-flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
          <span class="rounded-lg size-3 bg-amber-400 ring-1 ring-amber-300/60"></span>
          <span class="font-semibold tracking-tight text-slate-800 dark:text-slate-100">Toko Emas</span>
        </NuxtLink>

        <nav class="items-center hidden gap-2 md:flex">
          <NuxtLink
            to="/catalog"
            class="px-3 py-2 text-sm rounded-xl ring-1 ring-transparent hover:bg-amber-50 hover:ring-amber-100 text-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:ring-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Katalog
          </NuxtLink>
          <NuxtLink
            to="/admin"
            class="px-3 py-2 text-sm rounded-xl ring-1 ring-transparent hover:bg-amber-50 hover:ring-amber-100 text-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:ring-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Admin
          </NuxtLink>

          <!-- Dark mode toggle (client-only agar aman SSR) -->
          <ClientOnly>
            <ThemeToggle />
          </ClientOnly>
        </nav>
      </div>

      <!-- Tabs -->
      <div class="flex w-full gap-2 pb-3 overflow-x-auto">
        <NuxtLink
          v-for="t in tabs"
          :key="t.to"
          :to="t.to"
          class="whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition
                 hover:bg-amber-50 dark:hover:bg-slate-800
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          :class="isActive(t.to)
            ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300'
            : 'border-amber-100 text-slate-700 dark:border-slate-700 dark:text-slate-200'"
          :aria-current="isActive(t.to) ? 'page' : undefined"
        >
          {{ t.label }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
