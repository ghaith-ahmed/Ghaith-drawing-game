import { axiosClient } from "@/axios";
import { defineStore } from "pinia";
import { ref } from "vue";
import { toast } from "vue-sonner";
import { tryCatch } from "@/errorHandler";
import { useRouter } from "vue-router";

export const useUserStore = defineStore("user", () => {
  const user = ref();
  const router = useRouter();

  const getUser = async () => {
    try {
      const { data } = await axiosClient.get("/users");

      user.value = data;
    } catch (e) {
      logout();
      router.push({ name: "Login" });
      toast.error(e);
    }
  };

  const logout = tryCatch(async () => {
    await axiosClient.post("/users/logout");
    user.user = null;
    localStorage.removeItem("token");
    router.push({ name: "Login" });
  });

  return { user, getUser, logout };
});
