<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <!-- Topbar -->
    <header class="sticky top-0 z-50 border-b bg-white/80 backdrop-blur dark:bg-slate-900/85 dark:border-slate-800">
      <div class="px-4 mx-auto max-w-7xl">
        <div class="flex items-center justify-between py-3">
          <!-- Brand -->
          <NuxtLink to="/" class="inline-flex items-center gap-2">
            <span class="inline-block rounded-lg size-3 bg-amber-400 ring-1 ring-amber-300/60"></span>
            <span class="font-semibold tracking-tight text-slate-800 dark:text-slate-100">Toko Emas</span>
          </NuxtLink>

          <!-- Right nav -->
          <nav class="items-center hidden gap-2 md:flex">
            <NuxtLink
              to="/catalog"
              class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl text-slate-600 ring-1 ring-transparent hover:bg-amber-50 hover:ring-amber-100 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:ring-slate-700"
            >
              Katalog
            </NuxtLink>
            <NuxtLink
              to="/admin"
              class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl text-slate-600 ring-1 ring-transparent hover:bg-amber-50 hover:ring-amber-100 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:ring-slate-700"
            >
              Admin
            </NuxtLink>

            <!-- Dark mode toggle -->
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>

    <!-- Page -->
    <main id="site-main" class="relative z-0 p-4 mx-auto max-w-7xl text-slate-900 dark:text-slate-100">
      <NuxtPage />
    </main>

    <!-- Bottom nav (mobile only) -->
    <!-- penting: bottom-0 + inset-x-0 + pointer-events-auto; JANGAN inset-0 -->
    <nav class="fixed inset-x-0 bottom-0 z-40 border-t pointer-events-auto bg-white/95 backdrop-blur md:hidden dark:bg-slate-900/95 dark:border-slate-800">
      <div class="grid grid-cols-2 mx-auto max-w-7xl">
        <NuxtLink to="/" class="py-2 text-sm font-medium text-center hover:bg-amber-50 dark:hover:bg-slate-800">Home</NuxtLink>
        <NuxtLink to="/admin" class="py-2 text-sm font-medium text-center hover:bg-amber-50 dark:hover:bg-slate-800">Admin</NuxtLink>
      </div>
    </nav>

    <!-- Global toast -->
    <AppToast />
  </div>
</template>

<script setup lang="ts">
// layout umum (publik). Tidak ada komponen admin di sini.
// Pastikan komponen ThemeToggle & AppToast tersedia (auto import Nuxt).
</script>
