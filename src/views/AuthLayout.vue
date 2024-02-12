<template>
  <div
    class="absolute bg-white/40 backdrop-blur-md rounded-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 py-12"
  >
    <div class="w-full">
      <span
        class="text-4xl bg-gradient-to-r from-rose-600 to-indigo-600 bg-clip-text text-transparent font-bold text-center w-full flex justify-center h-[50px]"
        >{{ $t(appName) }}</span
      >
    </div>
    <RouterView />
  </div>
</template>

<script setup>
const appName = import.meta.env.VITE_APP_NAME;
</script>
