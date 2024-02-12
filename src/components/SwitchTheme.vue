<template>
  <FwbButton @click="switchTheme">{{ $t("Switch Theme") }}</FwbButton>
</template>

<script setup>
import { FwbButton } from "flowbite-vue";

const switchTheme = () => {
  if (document.body.classList.contains("dark")) {
    document.body.classList.remove("dark");
    localStorage.setItem("dark", false);
  } else {
    document.body.classList.add("dark");
    localStorage.setItem("dark", true);
  }
};
</script>
