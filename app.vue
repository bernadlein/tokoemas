<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
    <ClientOnly>
      <ToastHost />
      <ConfirmDialog />
    </ClientOnly>
  </NuxtLayout>
</template>

