<template>
  <v-app class="cv-app">
    <MainVerticalNav />
    <v-main class="cv-main">
      <div class="page-wrapper">
        <slot />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.cv-app {
  background: var(--page-bg) !important;
  min-height: 100vh;
}

.cv-main {
  background: transparent;
}

.page-wrapper {
  padding: 40px;
}
</style>
