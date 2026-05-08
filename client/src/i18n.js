import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const savedLanguage = localStorage.getItem("sparvi_lang");
const migratedDefaultLanguage = localStorage.getItem("sparvi_lang_default_migrated");

let initialLanguage = savedLanguage || "en";

if (savedLanguage === "ar" && migratedDefaultLanguage !== "true") {
  initialLanguage = "en";
  localStorage.setItem("sparvi_lang", "en");
  localStorage.setItem("sparvi_lang_default_migrated", "true");
} else if (!migratedDefaultLanguage) {
  localStorage.setItem("sparvi_lang_default_migrated", "true");
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
