<template>
  <div dir="ltr" class="flex justify-center rounded-xl overflow-hidden">
    <button
      class="bg-blue-600 font-medium text-white px-4 py-2"
      :class="{ 'opacity-50': i18n.global.locale == 'En' }"
      @click="changeLanguage('En')"
    >
      English
    </button>
    <button
      class="bg-blue-600 font-medium text-white px-4 py-2"
      :class="{ 'opacity-50': i18n.global.locale == 'Ar' }"
      @click="changeLanguage('Ar')"
    >
      العربية
    </button>
  </div>
</template>

<script setup>
import { i18n } from "../i18n";
import { FwbButton } from "flowbite-vue";
const changeLanguage = (lang) => {
  i18n.global.locale = lang;
  if (lang == "Ar") {
    document.querySelector("body").dir = "rtl";
  } else {
    document.querySelector("body").dir = "";
  }
  localStorage.setItem("lang", lang);
};
</script>
