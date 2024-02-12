<template></template>

<script setup>
import { useRoute } from "vue-router";
import { onMounted } from "vue";

const route = useRoute();
onMounted(() => {
  localStorage.setItem("token", route.params.token);
  window.close();
});
</script>
