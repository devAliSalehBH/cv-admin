<script setup>
import { useGlobalStore } from '~/stores/global';

const globalStore = useGlobalStore();
const { t } = useI18n();
const localePath = useLocalePath();

useHead({ title: () => t('settings.terms.title') });

const loading = ref(true);
const saving = ref(false);
const isConfirmModalOpen = ref(false);
const content = ref('');

const isEmpty = computed(() => !content.value || !content.value.replace(/<[^>]*>/g, '').trim());

const fetchTerms = async () => {
  loading.value = true;
  const res = await useApi().get('admins/settings/terms');
  if (res?.success && res.data) {
    content.value = res.data.content ?? '';
  } else if (res) {
    globalStore.setAlertData(res);
  }
  loading.value = false;
};

onMounted(fetchTerms);

const askToSave = () => {
  if (isEmpty.value) {
    globalStore.showError(t('settings.terms.emptyError'));
    return;
  }
  isConfirmModalOpen.value = true;
};

const saveChanges = async () => {
  saving.value = true;
  const formData = new FormData();
  formData.append('_method', 'patch');
  formData.append('content', content.value);

  const res = await useApi().post('admins/settings/terms', {}, { formData });
  saving.value = false;

  if (res?.success) {
    isConfirmModalOpen.value = false;
    globalStore.showSuccess(t('settings.terms.updated'));
  } else {
    globalStore.setAlertData(res);
  }
};
</script>

<template>
  <div class="d-flex flex-column" style="min-height: calc(100vh - 80px)">
    <div class="d-flex justify-space-between align-start flex-wrap mb-8" style="gap: 16px">
      <div class="page-header mb-0">
        <h1 class="page-header__title">{{ $t('settings.terms.title') }}</h1>
        <nav class="cv-breadcrumb" :aria-label="$t('settings.breadcrumb')">
          <NuxtLink :to="localePath('/settings')">{{ $t('settings.title') }}</NuxtLink>
          <CvIcon name="chevron-right" :size="18" :stroke-width="2" class="flip-rtl" />
          <span aria-current="page">{{ $t('settings.terms.title') }}</span>
        </nav>
      </div>

      <v-btn class="cv-btn cv-btn--blue px-6" variant="flat" height="48" :disabled="loading" @click="askToSave">
        <CvIcon name="save" :size="20" class="me-2" />
        {{ $t('common.saveChanges') }}
      </v-btn>
    </div>

    <label class="cv-label mb-3">{{ $t('settings.terms.contentLabel') }}</label>
    <div class="editor-card flex-grow-1">
      <v-progress-linear v-if="loading" indeterminate color="#2C85FE" height="2" />
      <ClientOnly>
        <QuillEditor
          v-if="!loading"
          v-model:content="content"
          content-type="html"
          :toolbar="[['bold', 'italic', 'underline'], [{ header: 1 }, { header: 2 }], [{ list: 'ordered' }, { list: 'bullet' }], [{ align: [] }], ['link'], ['clean']]"
          class="editor-container"
          :placeholder="$t('settings.terms.placeholder')"
        />
        <template #fallback>
          <div class="d-flex justify-center align-center pa-8" style="color: var(--color-text-sec)">
            {{ $t('common.loading') }}
          </div>
        </template>
      </ClientOnly>
    </div>

    <CvConfirmModal
      v-model="isConfirmModalOpen"
      :title="$t('settings.terms.confirmTitle')"
      :message="$t('settings.confirmDesc')"
      :confirm-text="$t('settings.saveAndUpdate')"
      confirm-icon="save"
      :loading="saving"
      @confirm="saveChanges"
    />
  </div>
</template>

<style scoped>
.cv-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  line-height: 24px;
  color: var(--color-text-pri);
}

.cv-breadcrumb a {
  color: inherit;
  text-decoration: none;
}

.cv-breadcrumb a:hover {
  text-decoration: underline;
}

.editor-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  border: 1px solid var(--color-input-stroke);
  border-radius: var(--radius-16);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
  min-height: 480px;
}

.editor-container {
  flex: 1;
}

.editor-card :deep(.ql-toolbar) {
  border: none !important;
  border-bottom: 1px solid var(--color-stroke) !important;
  padding: 12px 16px !important;
  background: var(--color-gray-bg);
}

.editor-card :deep(.ql-container) {
  border: none !important;
  font-family: inherit !important;
  font-size: 16px;
  min-height: 420px;
}

.editor-card :deep(.ql-editor) {
  padding: 24px;
  line-height: 1.7;
  color: var(--color-text-header);
}

.editor-card :deep(.ql-editor.ql-blank::before) {
  color: var(--color-text-gray);
  font-style: normal;
}

[dir='rtl'] .editor-card :deep(.ql-editor) {
  text-align: right;
}
</style>
