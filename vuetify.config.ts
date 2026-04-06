import { defineVuetifyConfiguration } from 'vuetify-nuxt-module/custom-configuration'

export default defineVuetifyConfiguration({
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
})
