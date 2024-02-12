<template>
  <div class="flex gap-3 justify-center items-end w-full mb-3">
    <h1 class="text-3xl font-bold">Play</h1>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      class="w-8 fill-white cursor-pointer"
      @click="$router.push({ name: 'Welcome' })"
    >
      <path
        d="M48 256a208 208 0 1 1 416 0A208 208 0 1 1 48 256zm464 0A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM217.4 376.9c4.2 4.5 10.1 7.1 16.3 7.1c12.3 0 22.3-10 22.3-22.3V304h96c17.7 0 32-14.3 32-32V240c0-17.7-14.3-32-32-32H256V150.3c0-12.3-10-22.3-22.3-22.3c-6.2 0-12.1 2.6-16.3 7.1L117.5 242.2c-3.5 3.8-5.5 8.7-5.5 13.8s2 10.1 5.5 13.8l99.9 107.1z"
      />
    </svg>
  </div>
  <div class="flex justify-center">
    <div class="main p-8 pt-2">
      <h1 class="text-2xl mb-2">Create party</h1>
      <input
        placeholder="Party name ..."
        v-model="name"
        class="w-full text-xl rounded-xl border-black/30 placeholder:opacity-60 text-gray-800"
        type="text"
      />
      <FwbButton color="yellow" @click="createParty" class="text-2xl transition"
        >Create</FwbButton
      >
    </div>
    <div class="main p-8 pt-2">
      <h1 class="text-2xl mb-2">Join party</h1>
      <input
        v-model="code"
        placeholder="Party code ..."
        class="w-full text-xl rounded-xl border-black/30 placeholder:opacity-60 text-gray-800"
        type="text"
      />
      <FwbButton @click="joinParty" color="yellow" class="text-xl transition"
        >Join</FwbButton
      >
    </div>
  </div>
</template>

<script setup>
import { FwbButton } from "flowbite-vue";
import { useUserStore } from "@/stores/userStore";
import { axiosClient } from "@/axios";
import { ref, onMounted } from "vue";
import { tryCatch } from "@/errorHandler";
import router from "@/router";

const { user } = useUserStore();
const name = ref();
const code = ref();
const canvas = ref();

const createParty = tryCatch(async () => {
  if (!name.value) throw new Error("Name is required !");
  if (name.value.length > 10)
    throw new Error("Name  must be less than or equal to 10 characters");

  const { data } = await axiosClient.post("/party/", { name: name.value });

  router.push({ name: "Party", params: { code: data } });
});

const joinParty = tryCatch(async () => {
  if (!code.value) throw new Error("Code is required !");

  router.push({ name: "Party", params: { code: code.value } });
});
</script>

<style scoped>
.main {
  @apply flex flex-col gap-3 text-center w-full;
}
</style>
