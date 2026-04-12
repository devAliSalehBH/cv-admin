<script setup>
import { useGlobalStore } from "~/stores/global";
const globalStore = useGlobalStore();
const alert = computed(() => globalStore.alertData);
const showAlert = computed({
  get: () => globalStore.showAlert,
  set: (val) => (globalStore.showAlert = val),
});
</script>

<template>
  <v-snackbar
    v-model="showAlert"
    :timeout="4000"
    variant="flat"
    location="top right"
    max-width="400"
    min-width="300"
    class="custom-snackbar"
    :color="alert.success ? '#ECFDF3' : '#FEF3F2'"
  >
    <div class="d-flex align-center justify-start ga-3 alert-wrapper">
      <div 
        class="side-indicator" 
        :class="alert.success ? 'bg-success-border' : 'bg-error-border'"
      ></div>
      <v-icon v-if="alert.success" color="#027A48" size="24">mdi-check</v-icon>
      <v-icon v-else color="#B42318" size="24">mdi-alert-circle</v-icon>
      <p 
        class="f16 font-weight-medium mb-0"
        :class="alert.success ? 'text-success-text' : 'text-error-text'"
      >
        {{ alert.message }}
      </p>
    </div>
  </v-snackbar>
</template>

<style scoped>
.custom-snackbar :deep(.v-snackbar__content) {
  padding: 0 !important;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.1);
  border: 1px solid #E4E7EC;
}

.alert-wrapper {
  padding: 12px 16px;
  position: relative;
  min-height: 56px;
}

.side-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.bg-success-border {
  background-color: #12B76A;
}

.bg-error-border {
  background-color: #F04438;
}

.text-success-text {
  color: #027A48;
}

.text-error-text {
  color: #B42318;
}

.f16 {
  font-size: 16px;
}
</style>
