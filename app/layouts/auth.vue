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
  background:rgba(239, 250, 253, 0.267); 
   min-height: 100vh;
}
</style>
