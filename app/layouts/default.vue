<template>
  <v-app class="app-background">
    <BaseSharedAlert />
    <div class="d-flex w-100">
      <MainVerticalNav />
      <v-main class="flex-grow-1">
        <div class="page-wrapper">
          <slot />
        </div>
      </v-main>
    </div>
  </v-app>
</template>

<style scoped>
.app-background {
  background:rgba(239, 250, 253, 0.267);
  min-height: 100vh;
}

.page-wrapper {
  padding: 40px;
}
</style>
