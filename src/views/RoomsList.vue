<template>
  <div>
    <div class="flex gap-3 justify-center items-end w-full mb-3">
      <h1 class="text-3xl font-bold">Rooms</h1>
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
    <div
      class="flex justify-center mb-4 mx-auto relative"
      style="width: calc(100% - 75px)"
    >
      <input
        class="rounded-xl w-full py-3 text-gray-800"
        placeholder="Party code ..."
        type="text"
        v-model="code"
      />
      <FwbButton
        color="yellow"
        @click="code && $router.push({ name: 'Party', params: { code } })"
        class="absolute top-1/2 -translate-y-1/2 right-2 !rounded-xl"
        >Join</FwbButton
      >
    </div>
    <div
      v-if="parties"
      class="grid grid-cols-3 overflow-y-auto max-h-[260px] place-items-center gap-y-4 px-6"
    >
      <div
        v-for="party of parties"
        class="shadow bg-blue-600 rounded-xl py-6 border-4"
      >
        <div class="flex flex-col px-12">
          <div
            class="w-16 mb-1 h-16 shrink-0 flex justify-center items-center object-cover bg-yellow-500 rounded-full overflow-hidden"
            alt=""
          >
            <h1 class="text-xl text-white truncate">{{ party.host.name }}</h1>
          </div>
          <h1 class="mb-3 text-center">{{ party.name }}</h1>
          <div class="flex justify-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              class="fill-white w-4"
            >
              <path
                d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
              />
            </svg>
            <h1>{{ party.members.length }} / 4</h1>
          </div>
        </div>
        <div class="flex justify-center">
          <FwbButton
            color="yellow"
            class="w-1/2 transition"
            @click="
              $router.push({ name: 'Party', params: { code: party.code } })
            "
            >Join</FwbButton
          >
        </div>
      </div>
    </div>
    <FwbSpinner class="mx-auto mt-5" size="12" v-else color="yellow" />
  </div>
</template>

<script setup>
import { FwbButton, FwbSpinner } from "flowbite-vue";
import { axiosClient } from "@/axios";
import { tryCatch } from "@/errorHandler";
import { ref } from "vue";
import { onMounted } from "vue";

const parties = ref();
const code = ref();

const getParties = tryCatch(async () => {
  parties.value = (await axiosClient.get("/party/")).data;
});

onMounted(getParties);
</script>
