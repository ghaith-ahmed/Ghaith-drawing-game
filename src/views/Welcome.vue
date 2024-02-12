<template>
  <div class="flex justify-center gap-10 px-10 py-6">
    <div class="flex flex-col items-center w-full">
      <div
        class="w-20 mb-3 h-20 shrink-0 flex justify-center items-center object-cover bg-yellow-500 rounded-full overflow-hidden"
        alt=""
      >
        <h1 class="text-xl text-white truncate">
          {{ user.name }}
        </h1>
      </div>
      <h1 class="text-xl mb-4">
        {{ user.name }}
      </h1>
      <div class="flex justify-center gap-3 w-full">
        <FwbButton
          color="yellow"
          class="w-24 transition"
          @click="$router.push({ name: 'RoomsList' })"
          >Rooms</FwbButton
        >
        <FwbButton
          color="yellow"
          class="w-24 transition"
          @click="$router.push({ name: 'CreateJoinRoom' })"
          >Play</FwbButton
        >
      </div>
    </div>
    <div class="flex flex-col gap-4 w-full justify-center">
      <FwbButton color="green" class="w-full">Settings</FwbButton>
      <FwbButton color="red" @click="logout" class="w-full">Log out</FwbButton>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "../stores/userStore";
import { FwbButton } from "flowbite-vue";

const { user, logout } = useUserStore();
</script>
