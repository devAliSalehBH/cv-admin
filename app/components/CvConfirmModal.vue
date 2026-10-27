<script setup>
// Centered confirmation modal from the design (radius 40, padding 40, close at top-start).
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  confirmIcon: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  width: { type: [Number, String], default: 581 },
});
const emit = defineEmits(['update:modelValue', 'confirm']);

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});
const titleId = `cv-modal-${Math.random().toString(36).slice(2, 8)}`;
</script>

<template>
  <ClientOnly>
    <v-dialog
      v-model="open"
      :max-width="width"
      :persistent="loading"
      scrim="rgba(17,17,17,0.5)"
      :aria-labelledby="titleId"
    >
      <div class="cv-modal" role="dialog" aria-modal="true" :aria-labelledby="titleId">
        <button
          type="button"
          class="cv-close-btn cv-modal__close"
          :aria-label="$t('common.close')"
          :disabled="loading"
          @click="open = false"
        >
          <CvIcon name="x" :size="12" :stroke-width="2" />
        </button>

        <h3 :id="titleId" class="cv-modal__title">{{ title }}</h3>
        <p class="cv-modal__message">
          <slot>{{ message }}</slot>
        </p>

        <div class="cv-modal__actions">
          <v-btn class="cv-btn cv-btn--outline-dark" variant="flat" :disabled="loading" @click="open = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn class="cv-btn cv-btn--dark" variant="flat" :loading="loading" @click="emit('confirm')">
            <CvIcon v-if="confirmIcon" :name="confirmIcon" :size="20" class="me-2" />
            {{ confirmText }}
          </v-btn>
        </div>
      </div>
    </v-dialog>
  </ClientOnly>
</template>

<style scoped>
.cv-modal {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px;
  background: var(--color-bg);
  border: 1.16px solid var(--color-stroke);
  border-radius: 39.4px;
  box-shadow: var(--shadow-container);
}

.cv-modal__close {
  position: absolute;
  top: 22px;
  inset-inline-start: 22px;
  width: 28px;
  height: 28px;
}

.cv-modal__title {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  color: var(--color-text-pri);
  text-align: center;
  margin: 0;
}

.cv-modal__message {
  font-size: 22px;
  line-height: 30px;
  font-weight: 400;
  color: var(--color-text-sec);
  text-align: center;
  margin: 0 auto;
  max-width: 523px;
}

.cv-modal__actions {
  display: flex;
  gap: 16px;
}

.cv-modal__actions > * {
  flex: 1 1 0;
}
</style>
