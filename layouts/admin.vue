<!-- layouts/admin.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
    <!-- Topbar + tabs -->
    <AdminTopbar />

    <!-- Konten halaman -->
    <main id="app-main" class="relative z-0 p-4 mx-auto max-w-7xl">
      <slot />
    </main>

    <!-- Bottom nav (mobile) -->
    <AdminBottomNav />
  </div>
</template>

<script setup lang="ts">
// Tidak ada komponen nav lain di halaman-halaman admin.
// Semua halaman admin cukup: definePageMeta({ layout: 'admin' })
</script>
