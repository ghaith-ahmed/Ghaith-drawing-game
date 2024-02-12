<template>
  <h2
    class="mt-10 text-center dark:text-white text-2xl font-bold leading-9 tracking-tight text-gray-900"
  >
    {{ $t("Sign in to your account") }}
  </h2>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <div class="space-y-6">
      <div>
        <label
          for="email"
          class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
          >{{ $t("Email address") }}</label
        >
        <div class="mt-2">
          <input
            v-model="email"
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <label
            for="password"
            class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
            >{{ $t("Password") }}</label
          >
        </div>
        <div class="mt-2">
          <input
            v-model="password"
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <button
          @click="login"
          class="flex w-full gap-3 justify-center items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {{ $t("Login") }}
          <FwbSpinner v-if="loading" color="white" />
        </button>
        <GoogleButton class="flex justify-center" />
      </div>
    </div>

    <p class="mt-10 text-center text-sm text-gray-500">
      {{ $t("Not a member ?") }}
      <router-link
        :to="{ name: 'Register' }"
        class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >{{ $t("Register") }}</router-link
      >
    </p>
  </div>
</template>

<script setup>
import { axiosClient } from "@/axios";
import { useUserStore } from "../stores/userStore";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { tryCatch } from "@/errorHandler";
import GoogleButton from "@/components/GoogleButton.vue";
import { FwbSpinner } from "flowbite-vue";

const email = ref();
const password = ref();
const router = useRouter();
const user = useUserStore();
const loading = ref(false);

const login = tryCatch(
  async () => {
    if (!email.value) throw new Error("Email is required !");
    if (!password.value) throw new Error("Password is required !");
    loading.value = true;
    const { data } = await axiosClient.post(
      "/users/login",
      {
        email: email.value,
        password: password.value,
      },
      {
        withCredentials: true,
      }
    );

    if (data.user) {
      user.user = data.user;
      localStorage.setItem("token", data.token);
      router.push({ name: "Main" });
    }
  },
  () => (loading.value = false)
);
</script>
