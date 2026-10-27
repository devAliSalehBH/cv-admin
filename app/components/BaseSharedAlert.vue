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
    :timeout="3000"
    variant="flat"
    location="top end"
    color="transparent"
    class="cv-toast"
    content-class="cv-toast__content"
  >
    <div
      class="cv-toast__body"
      :class="alert.success ? 'cv-toast__body--success' : 'cv-toast__body--error'"
      role="status"
    >
      <CvIcon :name="alert.success ? 'check' : 'alert'" :size="16" :stroke-width="2.5" />
      <span>{{ alert.message }}</span>
    </div>
  </v-snackbar>
</template>

<style scoped>
.cv-toast :deep(.v-snackbar__wrapper) {
  margin: 52px 0 0 0 !important;
  min-width: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
}

.cv-toast :deep(.v-snackbar__content) {
  padding: 0 !important;
}

.cv-toast__body {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 60px;
  padding: 0 14px 0 24px;
  font-family: var(--font-toast);
  font-size: 15px;
  line-height: 28px;
  font-weight: 500;
  border-inline-start: 10px solid;
  box-shadow: 0 4px 12px rgb(16 24 40 / 0.06);
}

.cv-toast__body--success {
  background: var(--color-success-bg);
  border-color: var(--color-success);
  color: var(--color-success);
}

.cv-toast__body--error {
  background: #fef3f2;
  border-color: var(--color-error);
  color: #b42318;
}
</style>
