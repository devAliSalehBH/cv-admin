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
      script: [],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
        // Same fonts as the main CV Bot app: Cairo for Arabic, Outfit for English
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&family=Inter:wght@500&display=swap",
        },
      ],
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
