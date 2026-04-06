import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { ar, da, en } from "vuetify/locale";
import "@/assets/scss/settings.scss";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    defaults: {
      VBtn: {
        rounded: "lg",
        variant: "flat",
      },
      VCard: {
        rounded: "lg",
        variant: "flat",
      },
    },
    locale: {
      locale: "ar",
      fallback: "ar",
      messages: { ar, en },
    },
    icons: {
      defaultSet: "mdi",
      aliases,
      sets: { mdi },
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#2E87FE',
            secondary: '#101828',
            background: '#F9FAFB',
          },
        },
        dark: {
          colors: {
            primary: '#2E87FE',
            secondary: '#101828',
          },
        },
      },
    },
    components,
    directives
  });

  nuxtApp.vueApp.use(vuetify);
});
