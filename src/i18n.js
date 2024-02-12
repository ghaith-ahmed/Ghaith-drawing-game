import { createI18n } from "vue-i18n";
import En from "./locales/en.json";
import Ar from "./locales/ar.json";
export const i18n = createI18n({
  locale: "En",
  messages: {
    En,
    Ar,
  },
});
