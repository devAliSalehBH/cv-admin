<script setup>
import { useGlobalStore } from '~/stores/global';

const globalStore = useGlobalStore();
const { t, locale } = useI18n();
const { rules } = useValidationRules();

useHead({ title: () => t('subscriptions.title') });

const PENDING_ORDER_KEY = 'admin_pending_order_id';

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = ref({ total: 0, active: 0, canceled: 0, mrr: 0, currency: 'SAR' });
const statsLoading = ref(true);

const fetchStats = async () => {
  statsLoading.value = true;
  const res = await useApi().get('admins/manage-subscriptions/statistics');
  if (res?.success && res.data) stats.value = { ...stats.value, ...res.data };
  statsLoading.value = false;
};

const numberFormat = computed(() => new Intl.NumberFormat(locale.value === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US'));
const fmt = (n) => numberFormat.value.format(Number(n) || 0);

const statCards = computed(() => [
  { key: 'total', label: t('subscriptions.stats.total'), value: fmt(stats.value.total), icon: 'repeat', tile: 'blue' },
  { key: 'active', label: t('subscriptions.stats.active'), value: fmt(stats.value.active), icon: 'repeat', tile: 'green' },
  {
    key: 'mrr',
    label: t('subscriptions.stats.mrr'),
    value: `${fmt(Math.round(stats.value.mrr))} ${stats.value.currency || 'SAR'}`,
    icon: 'banknote',
    tile: 'blue',
  },
  {
    key: 'canceled',
    label: t('subscriptions.stats.canceled'),
    value: fmt(stats.value.canceled),
    icon: 'repeat',
    tile: 'gray',
    info: t('subscriptions.stats.canceledInfo'),
  },
]);

// ─── Table ────────────────────────────────────────────────────────────────────
const filters = reactive({ page: 1, per_page: 10, search: '', status: '' });
const subscriptions = ref([]);
const tableLoading = ref(true);
const tableMeta = ref({ total: 0, last_page: 1, from: 0, to: 0 });

const statusOptions = computed(() => [
  { title: t('subscriptions.filters.all'), value: '' },
  { title: t('subscriptions.status.active'), value: 'active' },
  { title: t('subscriptions.status.overdue'), value: 'overdue' },
  { title: t('subscriptions.status.cancelled'), value: 'cancelled' },
]);

const headers = computed(() => [
  { title: t('subscriptions.table.clientName'), key: 'client_name', sortable: false },
  { title: t('subscriptions.table.subType'), key: 'plan_name', sortable: false },
  { title: t('subscriptions.table.startDate'), key: 'start_date', sortable: false },
  { title: t('subscriptions.table.paymentCycle'), key: 'payment_cycle', sortable: false },
  { title: t('subscriptions.table.status'), key: 'status', sortable: false },
  { title: t('common.actions'), key: 'actions', sortable: false, width: 140 },
]);

const fetchSubscriptions = async () => {
  tableLoading.value = true;
  const res = await useApi().get('admins/manage-subscriptions', filters);
  if (res?.success) {
    const payload = res.data || {};
    const meta = payload.meta || payload;
    subscriptions.value = payload.data || [];
    tableMeta.value = {
      total: meta.total || 0,
      last_page: meta.last_page || 1,
      from: meta.from || 0,
      to: meta.to || 0,
    };
  } else if (res) {
    globalStore.setAlertData(res);
  }
  tableLoading.value = false;
};

const refreshAll = () => {
  fetchStats();
  fetchSubscriptions();
};

onMounted(refreshAll);

let searchTimeout = null;
watch(
  () => filters.search,
  () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filters.page = 1;
      fetchSubscriptions();
    }, 600);
  },
);
watch(() => filters.status, () => {
  filters.page = 1;
  fetchSubscriptions();
});
watch(() => filters.page, fetchSubscriptions);
watch(() => filters.per_page, () => {
  filters.page = 1;
  fetchSubscriptions();
});

const planName = (item) =>
  locale.value === 'ar' ? item.plan_name_ar || item.plan_name_en : item.plan_name_en || item.plan_name_ar;
const cycleLabel = (cycle) => (cycle ? t(`plans.billing.${cycle}`) : '—');
const statusLabel = (status) => t(`subscriptions.status.${status}`);
const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
};

// ─── Shared lists for the drawer ──────────────────────────────────────────────
const plans = ref([]);
const fetchPlans = async () => {
  const res = await useApi().get('admins/settings/plans');
  if (res?.success) plans.value = (res.data || []).filter((p) => p.is_active);
};
const planOptions = computed(() =>
  plans.value.map((p) => ({
    value: p.id,
    title: `${locale.value === 'ar' ? p.name_ar : p.name_en} — ${Number(p.price)} ${p.currency} / ${cycleLabel(p.billing_type)}`,
  })),
);

const clients = ref([]);
const clientsLoading = ref(false);
const clientSearch = ref('');
let clientTimeout = null;
const fetchClients = async (search = '') => {
  clientsLoading.value = true;
  const res = await useApi().get('admins/manage-users', { page: 1, per_page: 20, search });
  if (res?.success) clients.value = res.data?.data || [];
  clientsLoading.value = false;
};
watch(clientSearch, (value) => {
  clearTimeout(clientTimeout);
  clientTimeout = setTimeout(() => fetchClients(value || ''), 400);
});

// ─── Create (pay on behalf of a client) ───────────────────────────────────────
const isCreateOpen = ref(false);
const createFormRef = ref(null);
const isDatePickerOpen = ref(false);
const paying = ref(false);
const createForm = reactive({ user_id: null, plan_id: null, starts_at: null });

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const toApiDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const toDisplayDate = (d) =>
  d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}` : '';

const openCreate = () => {
  createForm.user_id = null;
  createForm.plan_id = null;
  createForm.starts_at = null;
  isCreateOpen.value = true;
  if (!plans.value.length) fetchPlans();
  if (!clients.value.length) fetchClients();
};

const pickDate = (value) => {
  if (!value) return;
  createForm.starts_at = new Date(value);
  isDatePickerOpen.value = false;
};

// Same flow as the main app: create the order, then hand the browser to the
// AlinmaPay hosted page. The gateway comes back to /subscriptions/payment.
const startCheckout = async (payload) => {
  paying.value = true;
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') formData.append(key, value);
  });
  formData.append('locale', locale.value);

  const res = await useApi().post('admins/manage-subscriptions/checkout', {}, { formData });

  if (!res?.success) {
    paying.value = false;
    globalStore.setAlertData(res);
    return false;
  }

  const url = res.data?.payment_url;
  if (!url || !/^https:\/\//i.test(url)) {
    paying.value = false;
    globalStore.showError(t('subscriptions.payment.invalidUrl'));
    return false;
  }

  try {
    localStorage.setItem(PENDING_ORDER_KEY, res.data.order_id);
  } catch {}

  window.location.href = url;
  return true;
};

const continueToPayment = async () => {
  const { valid } = await createFormRef.value.validate();
  if (!valid) return;
  await startCheckout({
    user_id: createForm.user_id,
    plan_id: createForm.plan_id,
    starts_at: createForm.starts_at ? toApiDate(createForm.starts_at) : null,
  });
};

// Back button from the gateway restores this page from bfcache — unlock it.
onMounted(() => {
  window.addEventListener('pageshow', onPageShow);
});
onBeforeUnmount(() => {
  window.removeEventListener('pageshow', onPageShow);
});
function onPageShow(e) {
  if (e.persisted) paying.value = false;
}

// ─── Renew ────────────────────────────────────────────────────────────────────
const renewModal = reactive({ open: false, item: null });
const openRenew = (item) => {
  renewModal.item = item;
  renewModal.open = true;
};
const confirmRenew = () =>
  startCheckout({ user_id: renewModal.item.user_id, plan_id: renewModal.item.plan_id });

// ─── Edit ─────────────────────────────────────────────────────────────────────
const isEditOpen = ref(false);
const editFormRef = ref(null);
const editSaving = ref(false);
const isEndPickerOpen = ref(false);
const editItem = ref(null);
const editForm = reactive({ status: 'active', ends_at: null });
const editStatusOptions = computed(() => [
  { title: t('subscriptions.status.active'), value: 'active' },
  { title: t('subscriptions.status.cancelled'), value: 'canceled' },
]);

const openEdit = (item) => {
  editItem.value = item;
  editForm.status = item.raw_status === 'canceled' ? 'canceled' : 'active';
  editForm.ends_at = item.ends_at ? new Date(item.ends_at) : null;
  isEditOpen.value = true;
};

const pickEndDate = (value) => {
  if (!value) return;
  editForm.ends_at = new Date(value);
  isEndPickerOpen.value = false;
};

const saveEdit = async () => {
  const { valid } = await editFormRef.value.validate();
  if (!valid) return;
  editSaving.value = true;
  const formData = new FormData();
  formData.append('_method', 'patch');
  formData.append('status', editForm.status);
  if (editForm.ends_at) formData.append('ends_at', toApiDate(editForm.ends_at));
  const res = await useApi().post(`admins/manage-subscriptions/${editItem.value.id}`, {}, { formData });
  editSaving.value = false;
  globalStore.setAlertData(res);
  if (res?.success) {
    isEditOpen.value = false;
    refreshAll();
  }
};
</script>

<template>
  <div>
    <header class="page-header">
      <h1 class="page-header__title">{{ $t('subscriptions.title') }}</h1>
      <p class="page-header__subtitle">{{ $t('subscriptions.description') }}</p>
    </header>

    <!-- Stats -->
    <section class="stats-grid" :aria-label="$t('subscriptions.statsLabel')">
      <div v-for="card in statCards" :key="card.key" class="stat-card">
        <div class="stat-card__tile" :class="`stat-card__tile--${card.tile}`">
          <CvIcon :name="card.icon" :size="24" />
        </div>
        <v-tooltip v-if="card.info" :text="card.info" location="top" max-width="260">
          <template #activator="{ props }">
            <button v-bind="props" type="button" class="stat-card__info" :aria-label="card.info">
              <CvIcon name="info" :size="17" color="#929292" />
            </button>
          </template>
        </v-tooltip>
        <div class="stat-card__text">
          <span class="stat-card__label">{{ card.label }}</span>
          <v-skeleton-loader v-if="statsLoading" type="text" width="90" class="bg-transparent pa-0" />
          <span v-else class="stat-card__value" dir="ltr">{{ card.value }}</span>
        </div>
      </div>
    </section>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar__left">
        <div class="search-box">
          <CvIcon name="search" :size="20" color="#64748B" />
          <input
            v-model="filters.search"
            type="search"
            :placeholder="$t('subscriptions.search')"
            :aria-label="$t('subscriptions.search')"
          />
        </div>

        <v-menu location="bottom start">
          <template #activator="{ props }">
            <button v-bind="props" type="button" class="filter-btn" :class="{ 'filter-btn--on': !!filters.status }">
              <CvIcon name="filter" :size="20" />
              <span>{{ $t('common.filter') }}</span>
              <span v-if="filters.status" class="filter-btn__dot" />
            </button>
          </template>
          <v-list density="compact" class="py-1" min-width="180">
            <v-list-item
              v-for="opt in statusOptions"
              :key="opt.value"
              :active="filters.status === opt.value"
              color="primary"
              @click="filters.status = opt.value"
            >
              <v-list-item-title>{{ opt.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <v-btn class="create-btn" variant="flat" @click="openCreate">
        <CvIcon name="plus" :size="20" class="me-2" />
        {{ $t('subscriptions.addSubscription') }}
      </v-btn>
    </div>

    <!-- Table -->
    <div class="table-container">
      <v-data-table-server
        :headers="headers"
        :items="subscriptions"
        :items-length="tableMeta.total"
        :loading="tableLoading"
        :items-per-page="filters.per_page"
        class="cv-table"
        hide-default-footer
        :no-data-text="$t('subscriptions.empty')"
        :loading-text="$t('common.loading')"
      >
        <template #item.client_name="{ item }">
          <span class="cell-strong">{{ item.client_name || '—' }}</span>
        </template>
        <template #item.plan_name="{ item }">{{ planName(item) }}</template>
        <template #item.start_date="{ item }">{{ formatDate(item.starts_at) }}</template>
        <template #item.payment_cycle="{ item }">{{ cycleLabel(item.payment_cycle) }}</template>
        <template #item.status="{ item }">
          <span class="status-badge" :class="`status-badge--${item.status}`">{{ statusLabel(item.status) }}</span>
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex align-center" style="gap: 6px">
            <v-tooltip :text="$t('common.edit')" location="top">
              <template #activator="{ props }">
                <button v-bind="props" type="button" class="row-action" :aria-label="$t('common.edit')" @click="openEdit(item)">
                  <CvIcon name="edit" :size="20" color="#111111" />
                </button>
              </template>
            </v-tooltip>
            <v-tooltip v-if="item.status !== 'active'" :text="$t('subscriptions.actions.renew')" location="top">
              <template #activator="{ props }">
                <button
                  v-bind="props"
                  type="button"
                  class="row-action"
                  :aria-label="$t('subscriptions.actions.renew')"
                  @click="openRenew(item)"
                >
                  <CvIcon name="repeat" :size="20" color="#065F46" />
                </button>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table-server>
    </div>

    <TablePagination
      v-if="tableMeta.last_page > 1"
      v-model:page="filters.page"
      v-model:per-page="filters.per_page"
      :total="tableMeta.total"
      :last-page="tableMeta.last_page"
      :from="tableMeta.from"
      :to="tableMeta.to"
    />
    <p v-else class="table-footnote">
      {{ $t('subscriptions.showing', { count: subscriptions.length, total: tableMeta.total }) }}
    </p>

    <!-- Create subscription drawer -->
    <CvDrawer
      v-model="isCreateOpen"
      :title="$t('subscriptions.addSubscription')"
      :description="$t('subscriptions.addDrawerDesc')"
    >
      <v-form ref="createFormRef" class="d-flex flex-column" style="gap: 16px" :disabled="paying">
        <div>
          <label class="cv-label" for="sub-client">{{ $t('subscriptions.form.beneficiary') }}</label>
          <v-autocomplete
            id="sub-client"
            v-model="createForm.user_id"
            v-model:search="clientSearch"
            :items="clients"
            item-title="name"
            item-value="id"
            :loading="clientsLoading"
            :placeholder="$t('subscriptions.form.selectClient')"
            :rules="[rules.required]"
            :no-data-text="$t('subscriptions.form.noClients')"
            no-filter
            variant="outlined"
            density="compact"
            class="cv-input"
            menu-icon="mdi-chevron-down"
          >
            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps" :subtitle="item.raw.email" />
            </template>
          </v-autocomplete>
        </div>

        <div>
          <label class="cv-label" for="sub-plan">{{ $t('subscriptions.form.plan') }}</label>
          <v-select
            id="sub-plan"
            v-model="createForm.plan_id"
            :items="planOptions"
            :placeholder="$t('subscriptions.form.selectPlan')"
            :rules="[rules.required]"
            variant="outlined"
            density="compact"
            class="cv-input"
            menu-icon="mdi-chevron-down"
          />
        </div>

        <div>
          <label class="cv-label" for="sub-start">{{ $t('subscriptions.form.startDate') }}</label>
          <v-menu v-model="isDatePickerOpen" :close-on-content-click="false" location="bottom">
            <template #activator="{ props }">
              <v-text-field
                id="sub-start"
                v-bind="props"
                :model-value="toDisplayDate(createForm.starts_at)"
                placeholder="DD/MM/YY"
                readonly
                clearable
                variant="outlined"
                density="compact"
                class="cv-input"
                @click:clear="createForm.starts_at = null"
              >
                <template #append-inner>
                  <CvIcon name="calendar" :size="16" color="#383838" />
                </template>
              </v-text-field>
            </template>
            <v-date-picker
              :model-value="createForm.starts_at"
              :min="today()"
              color="#2C85FE"
              show-adjacent-months
              @update:model-value="pickDate"
            />
          </v-menu>
          <p class="field-hint">{{ $t('subscriptions.form.startDateHint') }}</p>
        </div>
      </v-form>

      <template #actions>
        <v-btn class="cv-btn cv-btn--outline-dark" variant="flat" :disabled="paying" @click="isCreateOpen = false">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn class="cv-btn cv-btn--blue" variant="flat" :loading="paying" @click="continueToPayment">
          {{ $t('subscriptions.actions.continueToPayment') }}
        </v-btn>
      </template>
    </CvDrawer>

    <!-- Edit subscription drawer -->
    <CvDrawer
      v-model="isEditOpen"
      :title="$t('subscriptions.editSubscription')"
      :description="editItem ? `${editItem.client_name} · ${planName(editItem)}` : ''"
    >
      <v-form ref="editFormRef" class="d-flex flex-column" style="gap: 16px">
        <div>
          <label class="cv-label" for="sub-status">{{ $t('subscriptions.table.status') }}</label>
          <v-select
            id="sub-status"
            v-model="editForm.status"
            :items="editStatusOptions"
            :rules="[rules.required]"
            variant="outlined"
            density="compact"
            class="cv-input"
            menu-icon="mdi-chevron-down"
          />
        </div>
        <div>
          <label class="cv-label" for="sub-end">{{ $t('subscriptions.form.endDate') }}</label>
          <v-menu v-model="isEndPickerOpen" :close-on-content-click="false" location="bottom">
            <template #activator="{ props }">
              <v-text-field
                id="sub-end"
                v-bind="props"
                :model-value="toDisplayDate(editForm.ends_at)"
                placeholder="DD/MM/YY"
                readonly
                variant="outlined"
                density="compact"
                class="cv-input"
              >
                <template #append-inner>
                  <CvIcon name="calendar" :size="16" color="#383838" />
                </template>
              </v-text-field>
            </template>
            <v-date-picker
              :model-value="editForm.ends_at"
              color="#2C85FE"
              show-adjacent-months
              @update:model-value="pickEndDate"
            />
          </v-menu>
        </div>
      </v-form>

      <template #actions>
        <v-btn class="cv-btn cv-btn--outline-dark" variant="flat" :disabled="editSaving" @click="isEditOpen = false">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn class="cv-btn cv-btn--blue" variant="flat" :loading="editSaving" @click="saveEdit">
          <CvIcon name="save" :size="20" class="me-2" />
          {{ $t('common.saveChanges') }}
        </v-btn>
      </template>
    </CvDrawer>

    <!-- Renew confirmation -->
    <CvConfirmModal
      v-model="renewModal.open"
      :title="
        renewModal.item
          ? $t('subscriptions.renewModal.title', { cycle: cycleLabel(renewModal.item.payment_cycle) })
          : ''
      "
      :confirm-text="$t('subscriptions.actions.renewNow')"
      confirm-icon="repeat"
      :loading="paying"
      @confirm="confirmRenew"
    >
      {{
        renewModal.item
          ? $t('subscriptions.renewModal.desc', { name: renewModal.item.client_name, plan: planName(renewModal.item) })
          : ''
      }}
    </CvConfirmModal>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 48px;
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 169px;
  padding: 16px;
  background: var(--color-white-bg);
  border: 0.89px solid var(--color-stroke);
  border-radius: var(--radius-16);
}

.stat-card__tile {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-12);
}

.stat-card__tile--blue {
  background: var(--color-icon-blue-bg);
  color: var(--color-icon-blue);
}

.stat-card__tile--green {
  background: var(--color-status-green-bg);
  color: var(--color-status-green-text);
}

.stat-card__tile--gray {
  background: var(--color-status-black-bg);
  color: var(--color-icon-black);
}

.stat-card__info {
  position: absolute;
  top: 16px;
  inset-inline-end: 16px;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: help;
  line-height: 0;
}

.stat-card__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: auto;
}

.stat-card__label {
  font-size: 16px;
  line-height: 1.2;
  color: var(--color-text-sec);
}

.stat-card__value {
  font-size: 32px;
  line-height: 40px;
  font-weight: 500;
  color: var(--color-text-header);
  align-self: flex-start;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.toolbar__left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.search-box {
  width: 498px;
  max-width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--color-bg);
  border: 0.89px solid var(--color-sec-stroke);
  border-radius: var(--radius-10);
}

.search-box:focus-within {
  border-color: var(--color-icon-blue);
  box-shadow: 0 0 0 2px rgb(44 133 254 / 0.15);
}

.search-box input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 16px;
  color: var(--color-text-header);
}

.search-box input::placeholder {
  color: var(--color-text-sec);
}

.filter-btn {
  position: relative;
  height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
  background: var(--color-bg);
  border: 0.89px solid var(--color-sec-stroke);
  border-radius: var(--radius-10);
  color: var(--color-text-sec);
  font: inherit;
  font-size: 16px;
  line-height: 20px;
  cursor: pointer;
}

.filter-btn:hover,
.filter-btn--on {
  border-color: var(--color-icon-blue);
  color: var(--color-icon-blue);
}

.filter-btn__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-icon-blue);
}

.create-btn {
  height: 48px !important;
  padding: 6px 22px !important;
  border-radius: var(--radius-10) !important;
  background: var(--color-button-bg) !important;
  color: var(--color-button-text) !important;
  font-size: 16px !important;
  font-weight: 400 !important;
}

.table-container {
  border: 0.89px solid var(--color-stroke);
  border-radius: var(--radius-16);
  background: var(--color-bg);
  overflow: hidden;
}

.cv-table {
  background: transparent !important;
}

.cv-table :deep(thead th) {
  height: 53.44px !important;
  background: var(--color-gray-bg) !important;
  border-bottom: 0.89px solid var(--color-sec-stroke) !important;
  color: var(--color-text-sec) !important;
  font-size: 14px !important;
  line-height: 21px;
  font-weight: 500 !important;
}

.cv-table :deep(tbody td) {
  height: 70px !important;
  font-size: 16px !important;
  line-height: 24px;
  color: var(--color-text-sec);
  border-bottom: 1px solid var(--color-stroke) !important;
}

.cv-table :deep(thead th:first-child),
.cv-table :deep(tbody td:first-child) {
  padding-inline-start: 24px !important;
}

.cv-table :deep(tbody tr:last-child td) {
  border-bottom: 0 !important;
}

.cv-table :deep(tbody tr:hover td) {
  background: #f8fafc;
}

.cell-strong {
  color: var(--color-text-header);
}

.row-action {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.row-action:hover {
  background: #eef0f3;
}

.row-action:focus-visible {
  outline: 2px solid var(--color-icon-blue);
}

.table-footnote {
  margin-top: 16px;
  font-size: 14px;
  line-height: 21px;
  color: var(--color-text-sec);
}

.field-hint {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--color-text-gray);
}

@media (max-width: 1279px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
}
</style>
