<script setup>
import { ref, computed } from 'vue';
import { useGlobalStore } from '~/stores/global';
import { useRouter } from 'vue-router';
import { useLocalePath } from '#i18n';

const globalStore = useGlobalStore();
const { t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();

const search = ref('');
const isAddDrawerOpen = ref(false);
const isRenewModalOpen = ref(false);
const selectedSub = ref(null);
const isEditing = ref(false);
const isDatePickerOpen = ref(false);

const updateDate = (val) => {
  if (!val) return;
  const date = new Date(val);
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear().toString().slice(-2);
  form.value.startDate = `${d}/${m}/${y}`;
  isDatePickerOpen.value = false;
};

const form = ref({
  client: null,
  plan: null,
  startDate: '',
});

const clientsList = ['Mohamed Ahmed', 'Ali Saleh', 'Khalid Saad'];
const plansList = ['Premium', 'Basic', 'Enterprise'];

const subscriptions = ref([
  { id: 1, name: 'Mohamed Ahmed', type: 'Premium', date: 'Jan 15, 2024', cycle: 'Monthly', status: 'Active' },
  { id: 2, name: 'Mohamed Ahmed', type: 'Premium', date: 'Jan 15, 2024', cycle: 'Yearly', status: 'Cancelled' },
  { id: 3, name: 'Mohamed Ahmed', type: 'Premium', date: 'Jan 15, 2024', cycle: 'Yearly', status: 'Overdue' },
  { id: 4, name: 'Mohamed Ahmed', type: 'Premium', date: 'Jan 15, 2024', cycle: 'Yearly', status: 'Overdue' },
]);

const headers = computed(() => [
  { title: t('subscriptions.table.clientName'), key: 'name', sortable: false, align: 'start' },
  { title: t('subscriptions.table.subType'), key: 'type', sortable: false, align: 'start' },
  { title: t('subscriptions.table.startDate'), key: 'date', sortable: false, align: 'start' },
  { title: t('subscriptions.table.paymentCycle'), key: 'cycle', sortable: false, align: 'start' },
  { title: t('subscriptions.table.status'), key: 'status', sortable: false, align: 'start' },
  { title: t('common.actions'), key: 'actions', sortable: false, align: 'end' },
]);

const getStatusColor = (status) => {
  if (status === 'Active') return '#ECFDF3'; 
  if (status === 'Cancelled') return '#F2F4F7'; 
  if (status === 'Overdue') return '#FEF3F2'; 
  return '#F2F4F7';
};

const getStatusTextColor = (status) => {
  if (status === 'Active') return '#027A48'; 
  if (status === 'Cancelled') return '#344054'; 
  if (status === 'Overdue') return '#B42318'; 
  return '#344054';
};

const openAddDrawer = (sub = null) => {
  if (sub) {
    isEditing.value = true;
    selectedSub.value = sub;
    form.value = {
      client: sub.name,
      plan: sub.type,
      startDate: sub.date,
    };
  } else {
    isEditing.value = false;
    selectedSub.value = null;
    form.value = { client: null, plan: null, startDate: '' };
  }
  isAddDrawerOpen.value = true;
};

const confirmRenew = (sub) => {
  selectedSub.value = sub;
  isRenewModalOpen.value = true;
};

const renewSubscription = () => {
  isRenewModalOpen.value = false;
  globalStore.showSuccess('The subscription has been renewed successfully');
};

const continueToPayment = () => {
  isAddDrawerOpen.value = false;
  router.push(localePath('/subscriptions/payment'));
};
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="page-title">{{ $t('subscriptions.title') }}</h1>
      <p class="page-description mt-2">{{ $t('subscriptions.description') }}</p>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="3">
        <v-card class="stat-card pa-5 d-flex flex-column h-100" elevation="0">
          <div class="stat-icon-wrapper total-icon mb-4">
            <v-icon color="#2E87FE" size="24">mdi-sync</v-icon>
          </div>
          <div class="stat-title">{{ $t('subscriptions.stats.total') }}</div>
          <div class="stat-value">5968</div>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="stat-card pa-5 d-flex flex-column h-100" elevation="0">
          <div class="stat-icon-wrapper active-icon mb-4">
            <v-icon color="#12B76A" size="24">mdi-sync</v-icon>
          </div>
          <div class="stat-title">{{ $t('subscriptions.stats.active') }}</div>
          <div class="stat-value">596</div>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="stat-card pa-5 d-flex flex-column h-100" elevation="0">
          <div class="stat-icon-wrapper mrr-icon mb-4">
            <v-icon color="#2E87FE" size="24">mdi-cash-multiple</v-icon>
          </div>
          <div class="stat-title">{{ $t('subscriptions.stats.mrr') }}</div>
          <div class="stat-value">8,748 SAR</div>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card class="stat-card pa-5 d-flex flex-column h-100 position-relative" elevation="0">
          <div class="stat-icon-wrapper canceled-icon mb-4">
            <v-icon color="#667085" size="24">mdi-sync-off</v-icon>
          </div>
          <v-icon class="info-icon position-absolute" style="top: 20px; right: 20px; cursor: pointer;" color="#98A2B3" size="20">mdi-information-outline</v-icon>
          <div class="stat-title">{{ $t('subscriptions.stats.canceled') }}</div>
          <div class="stat-value">895</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Toolbar -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div class="d-flex align-center w-50">
        <v-text-field
          v-model="search"
          :placeholder="$t('subscriptions.search')"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="search-field flex-grow-1 me-4"
        ></v-text-field>
        <v-btn variant="outlined" class="filter-btn text-none" height="44" prepend-icon="mdi-filter-variant" elevation="0">
          {{ $t('common.filter') }}
        </v-btn>
      </div>
      <v-btn class="add-btn text-none" height="44" rounded="lg" prepend-icon="mdi-plus" elevation="0" @click="openAddDrawer()">
         {{ $t('subscriptions.addSubscription') }}
      </v-btn>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <v-data-table
        :headers="headers"
        :items="subscriptions"
        class="custom-table"
        hide-default-footer
      >
        <template v-slot:item.status="{ item }">
          <v-chip size="small" :style="{ backgroundColor: getStatusColor(item.status) + ' !important', color: getStatusTextColor(item.status) + ' !important' }" class="font-weight-medium px-3" border="0" variant="flat">
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end pr-4">
            <v-btn icon variant="text" size="small" class="mx-1" @click="openAddDrawer(item)">
              <v-icon color="#64748B" size="20">mdi-square-edit-outline</v-icon>
            </v-btn>
            <v-btn icon variant="text" size="small" @click="confirmRenew(item)">
              <v-icon color="#12B76A" size="20">mdi-sync</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>
    
    <div class="mt-4 text-caption" style="color: #64748B;">
      {{ $t('subscriptions.showing', { count: subscriptions.length, total: subscriptions.length }) }}
    </div>

    <!-- Add Drawer -->
    <v-navigation-drawer
      v-model="isAddDrawerOpen"
      location="end"
      width="450"
      temporary
      class="drawer-wrapper"
      elevation="2"
    >
      <div class="drawer-header px-6 pt-6 pb-2 d-flex justify-space-between align-center">
        <h2 class="drawer-title">{{ $t('subscriptions.addSubscription') }}</h2>
        <v-btn icon variant="text" width="27" height="27" @click="isAddDrawerOpen = false">
          <v-icon color="#64748B" size="27">mdi-close-circle-outline</v-icon>
        </v-btn>
      </div>
      <p class="drawer-desc px-6 mb-4" style="color: #64748B; font-size: 14px;">{{ $t('subscriptions.addDrawerDesc') }}</p>

      <div class="drawer-content px-6 pt-4">
        <div class="mb-4">
          <div class="form-label mb-2">{{ $t('subscriptions.form.beneficiary') }}</div>
          <v-select v-model="form.client" :items="clientsList" :placeholder="$t('subscriptions.form.selectClient')" variant="outlined" density="compact" class="custom-input" hide-details></v-select>
        </div>

        <div class="mb-4">
          <div class="form-label mb-2">{{ $t('subscriptions.form.plan') }}</div>
          <v-select v-model="form.plan" :items="plansList" :placeholder="$t('subscriptions.form.selectPlan')" variant="outlined" density="compact" class="custom-input" hide-details></v-select>
        </div>

        <div class="mb-4">
          <div class="form-label mb-2">{{ $t('subscriptions.form.startDate') }}</div>
          <v-menu v-model="isDatePickerOpen" :close-on-content-click="false" transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-text-field 
                v-model="form.startDate" 
                variant="outlined" 
                density="compact" 
                placeholder="DD/MM/YY" 
                append-inner-icon="mdi-calendar-blank-outline" 
                readonly 
                v-bind="props" 
                class="custom-input" 
                hide-details
              ></v-text-field>
            </template>
            <v-date-picker color="#2E87FE" @update:model-value="updateDate" show-adjacent-months></v-date-picker>
          </v-menu>
        </div>
      </div>

      <div class="drawer-footer d-flex px-6 pt-8 gap-3" style="margin-top: auto; position: absolute; bottom: 24px; width: 100%;">
        <v-btn variant="outlined" class="drawer-cancel-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="isAddDrawerOpen = false">{{ $t('common.cancel') }}</v-btn>
        <v-btn class="drawer-action-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="continueToPayment">
          {{ $t('subscriptions.actions.continueToPayment') }}
        </v-btn>
      </div>
    </v-navigation-drawer>

    <!-- Renew Modal -->
    <v-dialog v-model="isRenewModalOpen" max-width="795">
      <v-card class="renew-modal-card pa-8 text-center" style="border-radius: 20px;">
        <v-btn icon variant="text" width="27" height="27" class="position-absolute" style="top: 16px; right: 16px; z-index: 2;" @click="isRenewModalOpen = false">
          <v-icon color="#64748B" size="27">mdi-close-circle-outline</v-icon>
        </v-btn>
        <v-card-text class="pt-4 px-0 pb-0">
          <h3 class="renew-modal-title mb-4">{{ $t('subscriptions.renewModal.title') }}</h3>
          <p class="renew-modal-desc mb-8">{{ $t('subscriptions.renewModal.desc') }}</p>
          <div class="d-flex justify-center gap-3 w-100 mt-6">
            <v-btn variant="outlined" class="renew-cancel-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="isRenewModalOpen = false">{{ $t('common.cancel') }}</v-btn>
            <v-btn class="renew-confirm-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="renewSubscription">{{ $t('subscriptions.actions.renewNow') }}</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 32px;
  font-weight: 500;
  color: #111827;
}

.page-description {
  font-size: 18px;
  font-weight: 400;
  color: #6B7280;
}

/* Stats Cards */
.stat-card {
  border-radius: 16px !important;
  border: 1px solid #EAECF0 !important;
  background-color: #FFFFFF !important;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.total-icon { background-color: #EFF4FF; }
.active-icon { background-color: #EDFDF8; }
.mrr-icon { background-color: #EEF2F6; }
.canceled-icon { background-color: #F2F4F7; }

.stat-title {
  font-size: 14px;
  font-weight: 400;
  color: #475467;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #101828;
}

.search-field :deep(.v-field__input) {
  font-size: 16px;
  font-weight: 400;
  color: #64748B;
}

.search-field :deep(.v-field) {
  background-color: #FCFCFC !important;
  border-radius: 10px !important;
  border: 1px solid #E5E7EB;
}

.search-field :deep(.v-field__outline) {
  display: none;
}

.filter-btn {
  background-color: #FFFFFF !important;
  border: 1px solid #E5E7EB;
  color: #374151;
  font-size: 14px;
  border-radius: 10px !important;
}

.add-btn {
  background-color: #101828 !important;
  color: #FCFCFC !important;
  font-size: 16px;
  font-weight: 400;
}

.table-container {
  border: 1px solid #CBD5E1;
  border-radius: 16px;
  overflow: hidden;
  background-color: #FFFFFF;
}

.custom-table :deep(.v-table__wrapper > table > thead > tr > th) {
  background-color: #F9FAFB !important;
  color: #475467 !important;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  border-bottom: 1px solid #EAECF0 !important;
}

.custom-table :deep(.v-table__wrapper > table > tbody > tr > td) {
  font-size: 14px;
  color: #101828;
  font-weight: 500;
  border-bottom: 1px solid #EAECF0 !important;
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

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

/* Renew Modal */
.renew-modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #333333;
}

.renew-modal-desc {
  font-size: 18px;
  font-weight: 400;
  color: #64748B;
  line-height: 1.4;
}

.renew-cancel-btn {
  background-color: #FFFFFF !important;
  border: 1px solid #101828 !important;
  color: #101828 !important;
  font-size: 16px;
  border-radius: 16px !important;
}

.renew-confirm-btn {
  background-color: #101828 !important;
  color: #FCFCFC !important;
  font-size: 16px;
  font-weight: 500;
  border-radius: 16px !important;
}

.gap-3 { gap: 12px; }
</style>
