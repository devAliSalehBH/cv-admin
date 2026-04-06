<template>
  <v-app>
    <v-main>
      <div class="auth-bg w-100 h-100 d-flex flex-column justify-center align-center pa-4">
        <slot />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.auth-bg {
  background: linear-gradient(0deg, var(--color-white-solid, #FFFFFF), var(--color-white-solid, #FFFFFF)),
    radial-gradient(68.72% 68.72% at 85.16% 58.61%, #F2F2FF 0%, rgba(233, 252, 249, 0) 96.92%),
    radial-gradient(141.42% 141.42% at 0% 0%, #F9FEFF 0%, rgba(241, 245, 254, 0) 50%);
  min-height: 100vh;
}
</style>
