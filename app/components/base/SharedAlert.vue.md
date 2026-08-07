<script setup>
import { computed } from 'vue';

const globalStore = useGlobalStore();
const alert = computed(() => globalStore.alertData);
const showAlert = computed({
  get: () => globalStore.showAlert,
  set: (val) => globalStore.showAlert = val
});
</script>

<template>
  <v-snackbar
    v-model="showAlert"
    :timeout="4000"
    variant="flat"
    location="top"
    max-width="530"
    width="90svw"
    :color="alert?.success ? 'success' : 'error'"
  >
    <div class="d-flex align-center justify-start ga-2">
      <p class="text-white text-body-1 font-weight-medium">{{ alert?.message }}</p>
    </div>
    <template #actions>
      <v-btn
        variant="text"
        icon="mdi-close-circle"
        color="white"
        @click="showAlert = false"
      />
    </template>
  </v-snackbar>
</template>
