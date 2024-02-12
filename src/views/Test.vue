<template>
  <div class="flex gap-3">
    <h1 class="text-center text-2xl dark:text-white">
      {{ $t("Welcome") }}: {{ user.name }}
    </h1>
    <FwbButton @click="logout">{{ $t("Log out") }}</FwbButton>
    <SwitchTheme />

    <LanguageSwitch class="absolute bottom-20 left-20" />
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/userStore";
import { FwbButton } from "flowbite-vue";
import LanguageSwitch from "@/components/LanguageSwitch.vue";
import SwitchTheme from "@/components/SwitchTheme.vue";
import DrawingCanvas from "@/components/DrawingCanvas.vue";

const { user, logout } = useUserStore();
</script>
