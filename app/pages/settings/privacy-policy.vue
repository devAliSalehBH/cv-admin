<script setup>
import { useGlobalStore } from '~/stores/global';

const globalStore = useGlobalStore();
const { t } = useI18n();
const localePath = useLocalePath();

useHead({ title: () => t('settings.privacy.title') });

const loading = ref(true);
const saving = ref(false);
const isConfirmModalOpen = ref(false);
const contentEn = ref('');
const contentAr = ref('');
const activeLang = ref('en');

const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, '').trim();
// At least one language must have content
const toolbar = [['bold', 'italic', 'underline'], [{ header: 1 }, { header: 2 }], [{ list: 'ordered' }, { list: 'bullet' }], [{ align: [] }], ['link'], ['clean']];
const isEmpty = computed(() => !stripHtml(contentEn.value) && !stripHtml(contentAr.value));

const fetchPrivacy = async () => {
  loading.value = true;
  const res = await useApi().get('admins/settings/privacy');
  if (res?.success && res.data) {
    contentEn.value = res.data.content_en ?? '';
    contentAr.value = res.data.content_ar ?? '';
  } else if (res) {
    globalStore.setAlertData(res);
  }
  loading.value = false;
};

onMounted(fetchPrivacy);

const askToSave = () => {
  if (isEmpty.value) {
    globalStore.showError(t('settings.privacy.emptyError'));
    return;
  }
  isConfirmModalOpen.value = true;
};

const saveChanges = async () => {
  saving.value = true;
  const formData = new FormData();
  formData.append('_method', 'patch');
  // Quill leaves '<p><br></p>' for an empty editor; send those as empty
  formData.append('content_en', stripHtml(contentEn.value) ? contentEn.value : '');
  formData.append('content_ar', stripHtml(contentAr.value) ? contentAr.value : '');

  const res = await useApi().post('admins/settings/privacy', {}, { formData });
  saving.value = false;

  if (res?.success) {
    isConfirmModalOpen.value = false;
    globalStore.showSuccess(t('settings.privacy.updated'));
  } else {
    globalStore.setAlertData(res);
  }
};
</script>

<template>
  <div class="d-flex flex-column" style="min-height: calc(100vh - 80px)">
    <div class="d-flex justify-space-between align-start flex-wrap mb-8" style="gap: 16px">
      <div class="page-header mb-0">
        <h1 class="page-header__title">{{ $t('settings.privacy.title') }}</h1>
        <nav class="cv-breadcrumb" :aria-label="$t('settings.breadcrumb')">
          <NuxtLink :to="localePath('/settings')">{{ $t('settings.title') }}</NuxtLink>
          <CvIcon name="chevron-right" :size="18" :stroke-width="2" class="flip-rtl" />
          <span aria-current="page">{{ $t('settings.privacy.title') }}</span>
        </nav>
      </div>

      <v-btn class="cv-btn cv-btn--blue px-6" variant="flat" height="48" :disabled="loading" @click="askToSave">
        <CvIcon name="save" :size="20" class="me-2" />
        {{ $t('common.saveChanges') }}
      </v-btn>
    </div>

    <label class="cv-label mb-3">{{ $t('settings.privacy.contentLabel') }}</label>
    <v-tabs v-model="activeLang" color="primary" class="mb-3">
      <v-tab value="en">{{ $t('settings.langEn') }}</v-tab>
      <v-tab value="ar">{{ $t('settings.langAr') }}</v-tab>
    </v-tabs>
    <div class="editor-card flex-grow-1">
      <v-progress-linear v-if="loading" indeterminate color="#2C85FE" height="2" />
      <ClientOnly>
        <template v-if="!loading">
          <div v-show="activeLang === 'en'" class="editor-pane">
            <QuillEditor
              v-model:content="contentEn"
              content-type="html"
              :toolbar="toolbar"
              class="editor-container"
              dir="ltr"
              :placeholder="$t('settings.privacy.placeholder')"
            />
          </div>
          <div v-show="activeLang === 'ar'" class="editor-pane">
            <QuillEditor
              v-model:content="contentAr"
              content-type="html"
              :toolbar="toolbar"
              class="editor-container editor-rtl"
              dir="rtl"
              :placeholder="$t('settings.privacy.placeholder')"
            />
          </div>
        </template>
        <template #fallback>
          <div class="d-flex justify-center align-center pa-8" style="color: var(--color-text-sec)">
            {{ $t('common.loading') }}
          </div>
        </template>
      </ClientOnly>
    </div>

    <CvConfirmModal
      v-model="isConfirmModalOpen"
      :title="$t('settings.privacy.confirmTitle')"
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

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
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

[dir='rtl'] .editor-card :deep(.ql-editor),
.editor-rtl :deep(.ql-editor) {
  text-align: right;
}
</style>
