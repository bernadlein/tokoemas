<template>
  <nav class="fixed bottom-0 left-0 right-0 sm:hidden bg-white/90 backdrop-blur border-t safe-bottom">
    <div class="max-w-6xl mx-auto grid grid-cols-4 text-xs">
      <NuxtLink to="/admin" class="text-center py-2">Home</NuxtLink>
      <NuxtLink to="/admin/trade" class="text-center py-2">Transaksi</NuxtLink>
      <NuxtLink to="/admin/cashflow" class="text-center py-2">Kas</NuxtLink>
      <NuxtLink to="/admin/products" class="text-center py-2">Produk</NuxtLink>
    </div>
  </nav>
</template>
