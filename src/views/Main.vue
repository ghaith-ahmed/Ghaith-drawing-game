<template>
  <div v-if="user.user" class="min-h-dvh">
    <RouterView />
  </div>
  <div
    v-else
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  >
    <FwbSpinner color="blue" size="12" />
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/userStore";
import { FwbSpinner } from "flowbite-vue";
import { onMounted } from "vue";

const user = useUserStore();

onMounted(user.getUser);
</script>
