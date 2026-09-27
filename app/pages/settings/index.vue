<template>
  <div class="page-container h-100 d-flex flex-column">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2 script-color">{{ $t('settings.title', 'Settings') }}</h1>
        <p class="text-body-1" style="color: #64748B;">{{ $t('settings.subtitle', 'Configure application settings and preferences.') }}</p>
      </div>
    </div>

    <!-- Content: List of cards -->
    <div class="d-flex flex-column gap-4">
      <!-- Privacy Policy Card -->
      <NuxtLink :to="localePath('/settings/privacy-policy')" class="text-decoration-none">
        <v-card variant="outlined" class="settings-card rounded-lg" style="border-color: #E2E8F0; cursor: pointer;" hover>
          <div class="d-flex justify-space-between align-center px-4 py-5">
            <div>
              <div class="text-h6 font-weight-medium mb-1 script-color">{{ $t('settings.privacy.title', 'Privacy Policy') }}</div>
              <div class="text-caption" style="color: #64748B;">{{ $t('settings.privacy.desc', 'Manage your privacy policy content') }}</div>
            </div>
            <v-icon color="#64748B">mdi-square-edit-outline</v-icon>
          </div>
        </v-card>
      </NuxtLink>

      <!-- Contact Us Card -->
      <v-card variant="outlined" class="settings-card rounded-lg" style="border-color: #E2E8F0; cursor: pointer;" hover @click="openContactDrawer">
        <div class="d-flex justify-space-between align-center px-4 py-5">
          <div>
            <div class="text-h6 font-weight-medium mb-1 script-color">{{ $t('settings.contact.title', 'Contact Us') }}</div>
            <div class="text-caption" style="color: #64748B;">{{ $t('settings.contact.desc', 'Update contact information for support') }}</div>
          </div>
          <v-icon color="#64748B">mdi-square-edit-outline</v-icon>
        </div>
      </v-card>
    </div>

    <!-- Contact Us Side Drawer -->
    <ClientOnly>
      <v-navigation-drawer v-model="isContactDrawerOpen" location="end" width="450" temporary class="drawer-wrapper" elevation="2">
      <div class="drawer-header px-6 pt-6 pb-2 d-flex justify-space-between align-center">
        <h2 class="drawer-title">{{ $t('settings.contact.title', 'Contact Us') }}</h2>
        <v-btn icon variant="text" width="27" height="27" @click="isContactDrawerOpen = false">
          <v-icon color="#64748B" size="27">mdi-close-circle-outline</v-icon>
        </v-btn>
      </div>
      <p class="drawer-desc px-6 mb-4" style="color: #64748B; font-size: 14px;">
        {{ $t('settings.contact.instructions', 'This contact information will be visible to users on the website. Please make sure all details are accurate before saving.') }}
      </p>
      <div class="drawer-content px-6 pt-4">
        <!-- Email -->
        <div class="mb-4">
          <div class="form-label mb-2">{{ $t('settings.contact.email', 'Email') }}</div>
          <v-text-field v-model="contactForm.email" placeholder="Enter Company Email" variant="outlined" density="compact" class="custom-input" hide-details></v-text-field>
        </div>
        <!-- Address -->
        <div class="mb-4">
          <div class="form-label mb-2">{{ $t('settings.contact.address', 'Address') }}</div>
          <v-text-field v-model="contactForm.address" placeholder="Enter Company Address" variant="outlined" density="compact" class="custom-input" hide-details></v-text-field>
        </div>
        <!-- Phone number -->
        <div class="mb-4">
          <div class="form-label mb-2">{{ $t('settings.contact.phone', 'Phone number') }}</div>
          <v-text-field v-model="contactForm.phone" placeholder="SA ˅ +966 (555) 000-0000" variant="outlined" density="compact" class="custom-input" hide-details></v-text-field>
        </div>
      </div>
      <div class="drawer-footer d-flex px-6 pt-8 gap-3" style="margin-top: auto; position: absolute; bottom: 24px; width: 100%;">
        <v-btn variant="outlined" class="drawer-cancel-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="isContactDrawerOpen = false">{{ $t('common.cancel', 'Cancel') }}</v-btn>
        <v-btn class="drawer-action-btn text-none flex-grow-1" prepend-icon="mdi-content-save" height="60" style="flex-basis: 0;" elevation="0" @click="confirmModal.open('contact')">
          {{ $t('common.saveChanges', 'Save Changes') }}
        </v-btn>
      </div>
    </v-navigation-drawer>
    </ClientOnly>

    <!-- Confirmation Modal -->
    <ClientOnly>
      <v-dialog v-model="confirmModal.isOpen" max-width="795">
      <v-card class="delete-modal-card pa-8 text-center" style="border-radius: 20px;">
        <v-btn icon variant="text" width="27" height="27" class="position-absolute" style="top: 16px; right: 16px; z-index: 2;" @click="confirmModal.isOpen = false">
          <v-icon color="#64748B" size="27">mdi-close-circle-outline</v-icon>
        </v-btn>
        <v-card-text class="pt-4 px-0 pb-0">
          <div class="text-h6 font-weight-bold script-color mb-4">
          Save Changes on Contact Us?
        </div>
          <p class="delete-modal-desc mb-8">Saving these changes will update the website immediately.</p>
          <div class="d-flex justify-center gap-3 w-100 mt-6">
            <v-btn variant="outlined" class="delete-cancel-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="confirmModal.isOpen = false">Cancel</v-btn>
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

// Drawers State
const isContactDrawerOpen = ref(false);

// Forms
const contactForm = reactive({
  email: '',
  address: '',
  phone: '',
  countryCode: 'SA'
});

// Confirm Modal
const confirmModal = reactive({
  isOpen: false,
  type: '' // 'contact' or 'privacy'
});

confirmModal.open = (type) => {
  confirmModal.type = type;
  confirmModal.isOpen = true;
};

// Fetch Settings Data
const fetchSettings = async () => {
  // TODO: Implement API integration for fetching settings
  // Example dummy data for now
  contactForm.email = 'contact@example.com';
  contactForm.address = 'Riyadh, Saudi Arabia';
  contactForm.phone = '5550000000';
};

onMounted(() => {
  fetchSettings();
});

// Actions
const openContactDrawer = () => {
  isContactDrawerOpen.value = true;
};

const saveChanges = async () => {
  loading.value = true;
  
  if (confirmModal.type === 'contact') {
    // TODO: Send contact form to API
    // const payload = { ...contactForm };
    // const res = await useApi().post('/api/v1/admins/settings/contact', payload);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    globalStore.showSuccess('Contact details updated successfully');
    isContactDrawerOpen.value = false;
  }

  loading.value = false;
  confirmModal.isOpen = false;
};
</script>

<style scoped>
.page-container {
  width: 100%;
}

.script-color {
  color: #101828;
}

.settings-card {
  transition: all 0.2s ease;
  background-color: #FFFFFF;
}

.settings-card:hover {
  background-color: #F8FAFC;
  border-color: #CBD5E1 !important;
}

/* Custom Input Styling */
.form-label {
  font-size: 16px;
  font-weight: 400;
  color: #414651;
}

.custom-input :deep(.v-field) {
  background-color: #FCFCFC !important;
  border-radius: 8px !important;
  border: 1px solid #D5D7DA;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
}

.custom-input :deep(.v-field__outline) {
  display: none;
}

/* Drawer Styling */
.drawer-wrapper {
  background-color: #FCFCFC !important;
}

.drawer-title {
  font-size: 32px;
  font-weight: 500;
  color: #111827;
}

.drawer-desc {
  line-height: 1.5;
}

.drawer-cancel-btn {
  background-color: #FFFFFF !important;
  border: 1px solid #101828 !important;
  color: #101828 !important;
  font-size: 16px;
  font-weight: 400;
  border-radius: 16px !important;
}

.drawer-action-btn {
  background-color: #2C85FE !important;
  color: #FEFEFE !important;
  font-size: 16px;
  font-weight: 400;
  border-radius: 16px !important;
}

/* Delete Modal Styling */
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

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

</style>
