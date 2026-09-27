<template>
  <div class="page-container h-100 d-flex flex-column" style="margin-left: -24px; margin-right: -24px; margin-top: -24px; max-width: none;">
    <div class="bg-white h-100 d-flex flex-column pt-4">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center px-6 py-4 mb-2" style="border-bottom: 1px solid #EAECF0;">
        <div>
          <div class="text-h5 font-weight-bold mb-1 script-color">{{ $t('settings.privacy.title', 'Privacy Policy') }}</div>
          <div class="text-caption d-flex align-center gap-1" style="color: #64748B;">
            <NuxtLink :to="localePath('/settings')" class="text-decoration-none" style="color: inherit;">
              {{ $t('settings.title', 'Settings') }}
            </NuxtLink> 
            <v-icon size="16">mdi-chevron-right</v-icon> 
            {{ $t('settings.privacy.title', 'Privacy Policy') }}
          </div>
        </div>
        <div class="d-flex gap-3 align-center">
           <v-btn color="#1570EF" class="text-none" style="border-radius: 8px;" elevation="0" prepend-icon="mdi-content-save-outline" height="40" @click="isConfirmModalOpen = true">
             {{ $t('common.saveChanges', 'Save Changes') }}
           </v-btn>
        </div>
      </div>
      
      <!-- Content -->
      <div class="flex-grow-1 px-8 py-6" style="background-color: #F9FAFB;">
        <div class="text-caption mb-2" style="color: #64748B;">{{ $t('settings.privacy.contentLabel', 'Privacy Policy Content') }}</div>
        <div class="bg-white border rounded-lg overflow-hidden d-flex flex-column" style="height: calc(100vh - 180px); border-color: #EAECF0 !important;">
           <ClientOnly>
             <QuillEditor 
               v-model:content="privacyForm.content" 
               contentType="html" 
               :toolbar="[['bold', 'italic', 'underline'], [{ 'header': 1 }, { 'header': 2 }], [{ 'list': 'ordered'}, { 'list': 'bullet' }]]" 
               class="flex-grow-1 editor-container" 
               placeholder="Enter privacy policy content..." 
             />
             <template #fallback>
               <div class="d-flex justify-center align-center h-100 text-body-2" style="color: #64748B;">
                 Loading editor...
               </div>
             </template>
           </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ClientOnly>
      <v-dialog v-model="isConfirmModalOpen" max-width="795">
        <v-card class="delete-modal-card pa-8 text-center" style="border-radius: 20px;">
          <v-btn icon variant="text" width="27" height="27" class="position-absolute" style="top: 16px; right: 16px; z-index: 2;" @click="isConfirmModalOpen = false">
            <v-icon color="#64748B" size="27">mdi-close-circle-outline</v-icon>
          </v-btn>
          <v-card-text class="pt-4 px-0 pb-0">
            <h3 class="delete-modal-title mb-4">
              Save Changes on Privacy Policy?
            </h3>
            <p class="delete-modal-desc mb-8">Saving these changes will update the website immediately.</p>
            <div class="d-flex justify-center gap-3 w-100 mt-6">
              <v-btn variant="outlined" class="delete-cancel-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="isConfirmModalOpen = false">Cancel</v-btn>
              <v-btn class="delete-confirm-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" :loading="loading" @click="saveChanges">Save & Update</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useGlobalStore } from '~/stores/global';
import { useI18n } from 'vue-i18n';

const globalStore = useGlobalStore();
const { t } = useI18n();
const localePath = useLocalePath();

const loading = ref(false);
const isConfirmModalOpen = ref(false);

const privacyForm = reactive({
  content: ''
});

const fetchSettings = async () => {
  // TODO: Implement API integration for fetching settings
  privacyForm.content = '<h2>Privacy Policy</h2><p>This is a dummy privacy policy...</p>';
};

onMounted(() => {
  fetchSettings();
});

const saveChanges = async () => {
  loading.value = true;
  
  // TODO: Send privacy form to API
  // const payload = { content: privacyForm.content };
  // const res = await useApi().post('/api/v1/admins/settings/privacy', payload);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  globalStore.showSuccess('Privacy policy updated successfully');
  isConfirmModalOpen.value = false;
  loading.value = false;
};
</script>

<style scoped>
.page-container {
  width: 100%;
}

.script-color {
  color: #101828;
}

/* Delete Modal Styling (Reused for Save Confirm) */
.delete-modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #333333;
}

.delete-modal-desc {
  font-size: 22px;
  font-weight: 400;
  color: #64748B;
  line-height: 1.4;
}

.delete-cancel-btn {
  background-color: #FFFFFF !important;
  border: 1px solid #101828 !important;
  color: #101828 !important;
  font-size: 16px;
  border-radius: 16px !important;
}

.delete-confirm-btn {
  background-color: #101828 !important;
  color: #FCFCFC !important;
  font-size: 16px;
  font-weight: 500;
  border-radius: 16px !important;
}

.gap-3 { gap: 12px; }

/* Quill Editor Styling adjustments to match Vuetify */
.editor-container :deep(.ql-toolbar) {
  border: none !important;
  border-bottom: 1px solid #EAECF0 !important;
  padding: 12px 16px !important;
  background-color: #FFFFFF;
}
.editor-container :deep(.ql-container) {
  border: none !important;
  font-family: inherit !important;
  font-size: 14px;
  background-color: #FFFFFF;
}
.editor-container :deep(.ql-editor) {
  padding: 24px;
}
</style>
