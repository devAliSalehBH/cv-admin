<script setup>
import { useGlobalStore } from '~/stores/global';

const globalStore = useGlobalStore();
const { t } = useI18n();
const localePath = useLocalePath();
const { rules } = useValidationRules();
const NuxtLinkComponent = resolveComponent('NuxtLink');

useHead({ title: () => t('settings.title') });

const rows = computed(() => [
  {
    key: 'privacy',
    title: t('settings.privacy.title'),
    desc: t('settings.privacy.desc'),
    icon: 'edit',
    to: localePath('/settings/privacy-policy'),
  },
  {
    key: 'contact',
    title: t('settings.contact.title'),
    desc: t('settings.contact.desc'),
    icon: 'edit',
  },
  {
    key: 'plans',
    title: t('settings.plans.title'),
    desc: t('settings.plans.desc'),
    icon: 'chevron-right',
    to: localePath('/settings/pricing-plans'),
  },
]);

// ─── Contact Us ───────────────────────────────────────────────────────────────
const isContactDrawerOpen = ref(false);
const isConfirmOpen = ref(false);
const contactLoading = ref(false);
const saving = ref(false);
const contactFormRef = ref(null);
const contactForm = reactive({
  email: '',
  address: '',
  phone_number: '',
});

const fetchContact = async () => {
  contactLoading.value = true;
  const res = await useApi().get('admins/settings/contact');
  if (res?.success && res.data) {
    contactForm.email = res.data.email ?? '';
    contactForm.address = res.data.address ?? '';
    contactForm.phone_number = res.data.phone_number ?? '';
  }
  contactLoading.value = false;
};

const openRow = (row) => {
  if (row.key === 'contact') {
    isContactDrawerOpen.value = true;
    fetchContact();
  }
};

const askToSaveContact = async () => {
  const { valid } = await contactFormRef.value.validate();
  if (valid) isConfirmOpen.value = true;
};

const saveContact = async () => {
  saving.value = true;
  const formData = new FormData();
  formData.append('_method', 'patch');
  formData.append('email', contactForm.email.trim());
  formData.append('address', contactForm.address.trim());
  formData.append('phone_number', contactForm.phone_number.trim());

  const res = await useApi().post('admins/settings/contact', {}, { formData });
  saving.value = false;

  if (res?.success) {
    isConfirmOpen.value = false;
    isContactDrawerOpen.value = false;
    globalStore.showSuccess(t('settings.contact.updated'));
  } else {
    globalStore.setAlertData(res);
  }
};
</script>

<template>
  <div>
    <header class="page-header">
      <h1 class="page-header__title">{{ $t('settings.title') }}</h1>
      <p class="page-header__subtitle">{{ $t('settings.subtitle') }}</p>
    </header>

    <div class="settings-list">
      <component
        :is="row.to ? NuxtLinkComponent : 'button'"
        v-for="row in rows"
        :key="row.key"
        :to="row.to"
        :type="row.to ? undefined : 'button'"
        class="settings-row"
        @click="!row.to && openRow(row)"
      >
        <span class="settings-row__text">
          <span class="settings-row__title">{{ row.title }}</span>
          <span class="settings-row__desc">{{ row.desc }}</span>
        </span>
        <CvIcon
          :name="row.icon"
          :size="row.icon === 'chevron-right' ? 22 : 24"
          :stroke-width="row.icon === 'chevron-right' ? 2 : 1.5"
          color="#111111"
          :class="{ 'flip-rtl': row.icon === 'chevron-right' }"
        />
      </component>
    </div>

    <!-- Contact Us drawer -->
    <CvDrawer
      v-model="isContactDrawerOpen"
      :title="$t('settings.contact.title')"
      :description="$t('settings.contact.instructions')"
    >
      <v-form ref="contactFormRef" :disabled="contactLoading" class="d-flex flex-column" style="gap: 16px">
        <div>
          <label class="cv-label" for="contact-email">{{ $t('settings.contact.email') }}</label>
          <v-text-field
            id="contact-email"
            v-model="contactForm.email"
            :placeholder="$t('settings.contact.emailPlaceholder')"
            :rules="[rules.required, rules.invalidEmail]"
            :loading="contactLoading"
            type="email"
            dir="ltr"
            variant="outlined"
            density="compact"
            class="cv-input"
          />
        </div>
        <div>
          <label class="cv-label" for="contact-address">{{ $t('settings.contact.address') }}</label>
          <v-text-field
            id="contact-address"
            v-model="contactForm.address"
            :placeholder="$t('settings.contact.addressPlaceholder')"
            :rules="[rules.required]"
            variant="outlined"
            density="compact"
            class="cv-input"
          />
        </div>
        <div>
          <label class="cv-label" for="contact-phone">{{ $t('settings.contact.phone') }}</label>
          <v-text-field
            id="contact-phone"
            v-model="contactForm.phone_number"
            placeholder="+966 (555) 000-0000"
            :rules="[rules.required]"
            type="tel"
            dir="ltr"
            variant="outlined"
            density="compact"
            class="cv-input"
          />
        </div>
      </v-form>

      <template #actions>
        <v-btn class="cv-btn cv-btn--outline-dark" variant="flat" @click="isContactDrawerOpen = false">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn class="cv-btn cv-btn--blue" variant="flat" :disabled="contactLoading" @click="askToSaveContact">
          <CvIcon name="save" :size="20" class="me-2" />
          {{ $t('common.saveChanges') }}
        </v-btn>
      </template>
    </CvDrawer>

    <CvConfirmModal
      v-model="isConfirmOpen"
      :title="$t('settings.contact.confirmTitle')"
      :message="$t('settings.confirmDesc')"
      :confirm-text="$t('settings.saveAndUpdate')"
      confirm-icon="save"
      :loading="saving"
      @confirm="saveContact"
    />
  </div>
</template>

<style scoped>
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-row {
  width: 100%;
  min-height: 105px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  background: var(--color-gray-bg);
  border: 0.89px solid var(--color-sec-stroke);
  border-radius: var(--radius-16);
  text-align: start;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  font: inherit;
}

.settings-row:hover {
  background: #f3f5f8;
}

.settings-row:focus-visible {
  outline: 2px solid var(--color-icon-blue);
  outline-offset: 2px;
}

.settings-row__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-row__title {
  font-size: 22px;
  line-height: 30px;
  font-weight: 400;
  color: var(--color-text-header);
}

.settings-row__desc {
  font-size: 14px;
  line-height: 1.4;
  font-weight: 300;
  color: var(--color-text-settings-desc);
}
</style>
