// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@nuxtjs/i18n"],
  css: ["~/assets/scss/main.scss", "@mdi/font/css/materialdesignicons.min.css"],

  app: {
    head: {
      titleTemplate: "%s - cvbot-admin",
      title: "cvbot-admin",
      htmlAttrs: {
        lang: "ar",
        dir: "rtl",
      },
      script: [],
      link: [{ rel: "icon", type: "image/png", href: "/icon.svg" }],
    },
  },
  plugins: ["~/plugins/vuetify.ts"],
  build: {
    transpile: ["vuetify"],
  },
  runtimeConfig: {
    public: {
      apiBaseURL: process.env.BASE_URL,
    },
  },

  i18n: {
    langDir: "locales",
    defaultLocale: "ar",
    locales: [
      {
        code: "ar",
        file: "ar.json",
        name: "العربية",
        dir: "rtl",
      },
      {
        code: "en",
        file: "en.json",
        name: "English",
        dir: "ltr",
      },
    ],
    strategy: "prefix_except_default",
  },
  imports: {
    dirs: ["stores"],
  },
});
