import { toast } from "vue-sonner";

export const tryCatch = (func, finallyFunc) => async () => {
  try {
    await func();
  } catch (e) {
    console.log(e);

    if (e.response?.data) {
      return toast.error(e.response.data);
    }
    if (e.message) {
      return toast.error(e.message);
    }
    return toast.error("Something went wrong");
  } finally {
    if (finallyFunc) finallyFunc();
  }
};
