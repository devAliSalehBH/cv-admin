<script setup>
// Right-side drawer from the design (533px, padding 40, buttons pinned to the bottom).
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  width: { type: [Number, String], default: 533 },
});
const emit = defineEmits(['update:modelValue']);

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});
const titleId = `cv-drawer-${Math.random().toString(36).slice(2, 8)}`;
</script>

<template>
  <ClientOnly>
    <v-navigation-drawer
      v-model="open"
      location="end"
      temporary
      :width="width"
      class="cv-drawer"
      scrim="rgba(17,17,17,0.5)"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div class="cv-drawer__inner">
        <div class="cv-drawer__top">
          <div class="cv-drawer__head">
            <h2 :id="titleId" class="cv-drawer__title">{{ title }}</h2>
            <button type="button" class="cv-close-btn" :aria-label="$t('common.close')" @click="open = false">
              <CvIcon name="x" :size="12" :stroke-width="2" />
            </button>
          </div>
          <p v-if="description" class="cv-drawer__desc">{{ description }}</p>
          <div class="cv-drawer__body">
            <slot />
          </div>
        </div>
        <div class="cv-drawer__actions">
          <slot name="actions" />
        </div>
      </div>
    </v-navigation-drawer>
  </ClientOnly>
</template>

<style scoped>
.cv-drawer {
  background-color: var(--color-bg) !important;
  border-top: 1.16px solid var(--color-stroke) !important;
  box-shadow: var(--shadow-container) !important;
}

.cv-drawer__inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  gap: 24px;
}

.cv-drawer__top {
  min-height: 0;
  overflow-y: auto;
}

.cv-drawer__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.cv-drawer__title {
  font-size: 32px;
  line-height: 40px;
  font-weight: 500;
  color: var(--color-text-header);
  margin: 0;
}

.cv-drawer__desc {
  font-size: 18px;
  line-height: 24px;
  color: var(--color-text-subtitle);
  margin: 4px 0 0;
}

.cv-drawer__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.cv-drawer__actions {
  display: flex;
  gap: 16px;
}

.cv-drawer__actions > :deep(*) {
  flex: 1 1 0;
}
</style>
