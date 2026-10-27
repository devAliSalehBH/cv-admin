<script setup>
import { useGlobalStore } from '~/stores/global';

const globalStore = useGlobalStore();
const { t, locale } = useI18n();
const localePath = useLocalePath();
const { rules } = useValidationRules();

useHead({ title: () => t('plans.title') });

const loading = ref(true);
const plans = ref([]);

const fetchPlans = async () => {
  loading.value = true;
  const res = await useApi().get('admins/settings/plans');
  if (res?.success) {
    plans.value = Array.isArray(res.data) ? res.data : [];
  } else if (res) {
    globalStore.setAlertData(res);
  }
  loading.value = false;
};

onMounted(fetchPlans);

// ─── Display helpers ──────────────────────────────────────────────────────────
const planName = (plan) => (locale.value === 'ar' ? plan.name_ar || plan.name_en : plan.name_en || plan.name_ar);

const currencySymbol = (currency) => ({ USD: '$', EUR: '€' })[currency] ?? null;

const formatPrice = (plan) => {
  const amount = Number(plan.price);
  const value = Number.isInteger(amount) ? amount : amount.toFixed(2);
  const symbol = currencySymbol(plan.currency);
  return symbol ? `${symbol}${value}` : `${value} ${plan.currency || ''}`.trim();
};

const periodLabel = (plan) => (plan.billing_type === 'yearly' ? t('plans.perYear') : t('plans.perMonth'));

const planRows = (plan) => [
  { label: t('plans.fields.id'), value: plan.id },
  { label: t('plans.fields.type'), value: plan.is_popular ? t('plans.mostPopular') : t('plans.normal') },
  { label: t('plans.fields.name'), value: planName(plan) },
  { label: t('plans.fields.trialDays'), value: plan.trial_days > 0 ? plan.trial_days : t('plans.na') },
  { label: t('plans.fields.billing'), value: t(`plans.billing.${plan.billing_type}`) },
];

// ─── Update drawer ────────────────────────────────────────────────────────────
const billingOptions = computed(() => [
  { title: t('plans.billing.monthly'), value: 'monthly' },
  { title: t('plans.billing.yearly'), value: 'yearly' },
]);

const isDrawerOpen = ref(false);
const saving = ref(false);
const formRef = ref(null);
const selectedPlan = ref(null);
const form = reactive({
  name_en: '',
  name_ar: '',
  price: '',
  billing_type: 'monthly',
  trial_days: '',
  is_popular: false,
});

const openEdit = (plan) => {
  selectedPlan.value = plan;
  form.name_en = plan.name_en ?? '';
  form.name_ar = plan.name_ar ?? '';
  form.price = plan.price !== null && plan.price !== undefined ? String(Number(plan.price)) : '';
  form.billing_type = plan.billing_type || 'monthly';
  form.trial_days = plan.trial_days > 0 ? String(plan.trial_days) : '';
  form.is_popular = !!plan.is_popular;
  isDrawerOpen.value = true;
};

const numberRule = (v) => v === '' || v === null || (!Number.isNaN(Number(v)) && Number(v) >= 0) || t('v.must_be_number');
const integerRule = (v) => v === '' || v === null || /^\d+$/.test(String(v)) || t('v.must_be_number');

const savePlan = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  const formData = new FormData();
  formData.append('_method', 'patch');
  formData.append('name_en', form.name_en.trim());
  formData.append('name_ar', form.name_ar.trim());
  formData.append('price', form.price);
  formData.append('billing_type', form.billing_type);
  formData.append('trial_days', form.trial_days === '' ? '0' : form.trial_days);
  formData.append('is_popular', form.is_popular ? '1' : '0');

  const res = await useApi().post(`admins/settings/plans/${selectedPlan.value.id}`, {}, { formData });
  saving.value = false;

  if (res?.success) {
    isDrawerOpen.value = false;
    globalStore.showSuccess(t('plans.updated', { name: planName(res.data ?? selectedPlan.value) }));
    fetchPlans();
  } else {
    globalStore.setAlertData(res);
  }
};

// ─── Activate / Deactivate ────────────────────────────────────────────────────
const toggleModal = reactive({ open: false, plan: null, action: 'activate' });
const toggling = ref(false);

const openToggle = (plan) => {
  toggleModal.plan = plan;
  toggleModal.action = plan.is_active ? 'deactivate' : 'activate';
  toggleModal.open = true;
};

const confirmToggle = async () => {
  toggling.value = true;
  const formData = new FormData();
  formData.append('_method', 'patch');
  const res = await useApi().post(
    `admins/settings/plans/${toggleModal.plan.id}/${toggleModal.action}`,
    {},
    { formData },
  );
  toggling.value = false;

  if (res?.success) {
    toggleModal.open = false;
    globalStore.showSuccess(
      t(toggleModal.action === 'activate' ? 'plans.activated' : 'plans.deactivated', {
        name: planName(toggleModal.plan),
      }),
    );
    fetchPlans();
  } else {
    globalStore.setAlertData(res);
  }
};
</script>

<template>
  <div>
    <header class="page-header">
      <h1 class="page-header__title">{{ $t('plans.title') }}</h1>
      <nav class="cv-breadcrumb" :aria-label="$t('settings.breadcrumb')">
        <NuxtLink :to="localePath('/settings')">{{ $t('settings.title') }}</NuxtLink>
        <CvIcon name="chevron-right" :size="18" :stroke-width="2" class="flip-rtl" />
        <span aria-current="page">{{ $t('plans.title') }}</span>
      </nav>
    </header>

    <!-- Loading skeleton -->
    <div v-if="loading" class="plan-list">
      <v-skeleton-loader v-for="n in 2" :key="n" type="article, actions" class="plan-card" />
    </div>

    <div v-else-if="!plans.length" class="plan-empty">
      {{ $t('plans.empty') }}
    </div>

    <div v-else class="plan-list">
      <article v-for="plan in plans" :key="plan.id" class="plan-card">
        <header class="plan-card__head">
          <h2 class="plan-card__name">{{ planName(plan) }}</h2>
          <span class="status-badge" :class="plan.is_active ? 'status-badge--active' : 'status-badge--inactive'">
            {{ plan.is_active ? $t('common.active') : $t('common.inactive') }}
          </span>
          <button
            type="button"
            class="icon-btn ms-auto"
            :aria-label="$t('plans.editAria', { name: planName(plan) })"
            @click="openEdit(plan)"
          >
            <CvIcon name="edit" :size="24" color="#111111" />
          </button>
        </header>

        <div class="plan-card__body">
          <dl class="plan-card__fields">
            <div v-for="row in planRows(plan)" :key="row.label" class="plan-card__field">
              <dt>{{ row.label }}</dt>
              <dd>{{ row.value }}</dd>
            </div>
          </dl>

          <div class="plan-card__side">
            <div class="price-chip" dir="ltr">
              <span class="price-chip__value">{{ formatPrice(plan) }}</span>
              <span class="price-chip__unit">/{{ periodLabel(plan) }}</span>
            </div>

            <v-btn
              variant="outlined"
              class="toggle-btn"
              :class="plan.is_active ? 'toggle-btn--red' : 'toggle-btn--green'"
              @click="openToggle(plan)"
            >
              <CvIcon :name="plan.is_active ? 'stop-circle' : 'play-circle'" :size="20" class="me-2" />
              {{ plan.is_active ? $t('plans.deactivate') : $t('plans.activate') }}
            </v-btn>
          </div>
        </div>
      </article>
    </div>

    <!-- Update plan drawer -->
    <CvDrawer
      v-model="isDrawerOpen"
      :title="selectedPlan ? $t('plans.updateTitle', { name: planName(selectedPlan) }) : ''"
    >
      <v-form ref="formRef" class="d-flex flex-column" style="gap: 16px" @submit.prevent="savePlan">
        <div>
          <label class="cv-label" for="plan-name-en">{{ $t('plans.form.nameEn') }}</label>
          <v-text-field
            id="plan-name-en"
            v-model="form.name_en"
            :rules="[rules.required, (v) => (v || '').length <= 50 || $t('v.max_50_char')]"
            dir="ltr"
            variant="outlined"
            density="compact"
            class="cv-input"
          />
        </div>
        <div>
          <label class="cv-label" for="plan-name-ar">{{ $t('plans.form.nameAr') }}</label>
          <v-text-field
            id="plan-name-ar"
            v-model="form.name_ar"
            :rules="[rules.required, (v) => (v || '').length <= 50 || $t('v.max_50_char')]"
            dir="rtl"
            variant="outlined"
            density="compact"
            class="cv-input"
          />
        </div>
        <div>
          <label class="cv-label" for="plan-price">{{ $t('plans.form.price') }}</label>
          <v-text-field
            id="plan-price"
            v-model="form.price"
            :rules="[rules.required, numberRule]"
            inputmode="decimal"
            variant="outlined"
            density="compact"
            class="cv-input"
          >
            <template #append-inner>
              <span class="cv-input-suffix">{{ selectedPlan?.currency || 'SAR' }}</span>
            </template>
          </v-text-field>
        </div>
        <div>
          <label class="cv-label" for="plan-billing">{{ $t('plans.form.billing') }}</label>
          <v-select
            id="plan-billing"
            v-model="form.billing_type"
            :items="billingOptions"
            :rules="[rules.required]"
            variant="outlined"
            density="compact"
            class="cv-input"
            menu-icon="mdi-chevron-down"
          />
        </div>
        <div>
          <label class="cv-label" for="plan-trial">{{ $t('plans.form.trialDays') }}</label>
          <v-text-field
            id="plan-trial"
            v-model="form.trial_days"
            :rules="[integerRule]"
            :placeholder="$t('plans.form.trialPlaceholder')"
            inputmode="numeric"
            variant="outlined"
            density="compact"
            class="cv-input"
          />
        </div>
        <v-checkbox
          v-model="form.is_popular"
          :label="$t('plans.form.isPopular')"
          color="#2C85FE"
          density="compact"
          hide-details
          class="popular-check"
        />
      </v-form>

      <template #actions>
        <v-btn class="cv-btn cv-btn--outline-dark" variant="flat" :disabled="saving" @click="isDrawerOpen = false">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn class="cv-btn cv-btn--blue" variant="flat" :loading="saving" @click="savePlan">
          <CvIcon name="save" :size="20" class="me-2" />
          {{ $t('common.saveChanges') }}
        </v-btn>
      </template>
    </CvDrawer>

    <!-- Activate / deactivate confirmation -->
    <CvConfirmModal
      v-model="toggleModal.open"
      :width="toggleModal.action === 'activate' ? 581 : 603"
      :title="
        toggleModal.plan
          ? $t(toggleModal.action === 'activate' ? 'plans.activateTitle' : 'plans.deactivateTitle', {
              name: planName(toggleModal.plan),
            })
          : ''
      "
      :confirm-text="toggleModal.action === 'activate' ? $t('plans.activatePlan') : $t('plans.deactivatePlan')"
      :confirm-icon="toggleModal.action === 'activate' ? 'play-circle' : 'stop-circle'"
      :loading="toggling"
      @confirm="confirmToggle"
    >
      {{ toggleModal.action === 'activate' ? $t('plans.activateDesc') : $t('plans.deactivateDesc') }}
      <br />
      {{ $t('plans.continueQuestion') }}
    </CvConfirmModal>
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

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.plan-empty {
  padding: 48px;
  text-align: center;
  color: var(--color-text-sec);
  border: 1px dashed var(--color-input-stroke);
  border-radius: var(--radius-16);
}

.plan-card {
  background: var(--color-bg);
  border: 1px solid var(--color-input-stroke);
  border-radius: var(--radius-8);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
}

.plan-card__head {
  height: 52px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  background: var(--color-gray-bg);
  border-bottom: 0.89px solid var(--color-stroke);
}

.plan-card__name {
  font-size: 20px;
  line-height: 1;
  font-weight: 500;
  color: var(--color-text-pri);
  margin: 0;
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.icon-btn:hover {
  background: #eef0f3;
}

.icon-btn:focus-visible {
  outline: 2px solid var(--color-icon-blue);
}

.plan-card__body {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 24px 16px 24px;
}

.plan-card__fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding-top: 4px;
}

.plan-card__field {
  display: flex;
  align-items: center;
}

.plan-card__field dt {
  width: 200px;
  flex-shrink: 0;
  font-size: 18px;
  line-height: 24px;
  color: var(--color-text-sec);
}

.plan-card__field dd {
  font-size: 14px;
  line-height: 24px;
  color: var(--color-text-gray);
  margin: 0;
}

.plan-card__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.price-chip {
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 16px 12px;
  background: var(--color-gray-bg);
  border-radius: var(--radius-8);
  color: var(--color-text-header);
}

.price-chip__value {
  font-size: 40px;
  line-height: 1;
  font-weight: 500;
}

.price-chip__unit {
  font-size: 20px;
  line-height: 1;
  font-weight: 500;
  color: var(--color-text-sec);
}

.toggle-btn {
  min-width: 198px;
  height: 60px !important;
  border-radius: var(--radius-16) !important;
  background: #ffffff !important;
  font-size: 16px !important;
  line-height: 20px;
  font-weight: 500 !important;
  padding: 14px 30px !important;
}

.toggle-btn--red {
  border: 1px solid var(--color-error) !important;
  color: var(--color-error) !important;
}

.toggle-btn--green {
  border: 1px solid var(--color-status-green-text) !important;
  color: var(--color-status-green-text) !important;
}

.popular-check :deep(.v-label) {
  font-size: 16px;
  color: var(--color-input-label);
  opacity: 1;
}

@media (max-width: 900px) {
  .plan-card__body {
    flex-direction: column;
  }
  .plan-card__side {
    align-items: stretch;
  }
  .plan-card__field dt {
    width: 150px;
  }
}
</style>
