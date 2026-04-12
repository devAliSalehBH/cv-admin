<script setup>
import { ref, computed } from 'vue';
import { useGlobalStore } from '~/stores/global';
import { useI18n } from 'vue-i18n';

const globalStore = useGlobalStore();
const { t } = useI18n();

const search = ref('');
const isDrawerOpen = ref(false);
const isEditing = ref(false);
const isDatePickerOpen = ref(false);

const actionModalState = ref({
  isOpen: false,
  type: '', // 'activate', 'deactivate', 'delete'
});

const selectedCoupon = ref(null);

const form = ref({
  code: '',
  expireDate: '',
  discountType: null,
});

const discountTypes = ['Percentage (%)', 'Fixed Amount (SAR)'];

const coupons = ref([
  { id: 1, code: 'SUMMER2024', type: '10 SAR', expiryDate: 'N/A', usageLimit: '12/1000', status: 'Active' },
  { id: 2, code: 'WELCOME50', type: '20%', expiryDate: 'Jan 15, 2025', usageLimit: 'N/A', status: 'Active' },
  { id: 3, code: 'NEWYEAR2024', type: '20%', expiryDate: 'Jan 15, 2025', usageLimit: '12/1000', status: 'Inactive' },
  { id: 4, code: 'FLASH10', type: '10 SAR', expiryDate: 'N/A', usageLimit: '500/500', status: 'Ended' },
]);

const headers = computed(() => [
  { title: t('coupons.table.code'), key: 'code', sortable: false, align: 'start' },
  { title: t('coupons.table.type'), key: 'type', sortable: false, align: 'start' },
  { title: t('coupons.table.expiryDate'), key: 'expiryDate', sortable: false, align: 'start' },
  { title: t('coupons.table.usageLimit'), key: 'usageLimit', sortable: false, align: 'start' },
  { title: t('coupons.table.status'), key: 'status', sortable: false, align: 'start' },
  { title: t('common.actions'), key: 'actions', sortable: false, align: 'end' },
]);

const getStatusColor = (status) => {
  if (status === 'Active') return '#ECFDF3'; 
  if (status === 'Inactive') return '#FEF3F2'; 
  if (status === 'Ended') return '#F2F4F7'; 
  return '#F2F4F7';
};

const getStatusTextColor = (status) => {
  if (status === 'Active') return '#027A48'; 
  if (status === 'Inactive') return '#B42318'; 
  if (status === 'Ended') return '#344054'; 
  return '#344054';
};

const copyCode = (code) => {
  navigator.clipboard.writeText(code);
  globalStore.showSuccess('Coupon code copied to clipboard');
};

const openDrawer = (coupon = null) => {
  if (coupon) {
    isEditing.value = true;
    selectedCoupon.value = coupon;
    form.value = {
      code: coupon.code,
      expireDate: coupon.expiryDate !== 'N/A' ? coupon.expiryDate : '',
      discountType: coupon.type.includes('%') ? 'Percentage (%)' : 'Fixed Amount (SAR)',
    };
  } else {
    isEditing.value = false;
    selectedCoupon.value = null;
    form.value = { code: '', expireDate: '', discountType: null };
  }
  isDrawerOpen.value = true;
};

const updateDate = (val) => {
  if (!val) return;
  const date = new Date(val);
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear().toString().slice(-2);
  form.value.expireDate = `${d}/${m}/${y}`;
  isDatePickerOpen.value = false;
};

const clearDate = () => {
  form.value.expireDate = '';
};

const openActionModal = (coupon, type) => {
  selectedCoupon.value = coupon;
  actionModalState.value = { isOpen: true, type };
};

const confirmAction = () => {
  actionModalState.value.isOpen = false;
  if (actionModalState.value.type === 'activate') {
    globalStore.showSuccess('Coupon activated successfully');
  } else if (actionModalState.value.type === 'deactivate') {
    globalStore.showSuccess('Coupon deactivated successfully');
  } else if (actionModalState.value.type === 'delete') {
    globalStore.showSuccess('Coupon deleted successfully');
  }
};

const saveCoupon = () => {
  isDrawerOpen.value = false;
  if (isEditing.value) {
    globalStore.showSuccess('Coupon updated successfully');
  } else {
    globalStore.showSuccess('Coupon created successfully');
  }
};
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="page-title">{{ $t('coupons.title') }}</h1>
      <p class="page-description mt-2">{{ $t('coupons.description') }}</p>
    </div>

    <!-- Toolbar -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div class="d-flex align-center w-50">
        <v-text-field
          v-model="search"
          :placeholder="$t('coupons.search')"
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
      <v-btn class="add-btn text-none" height="44" rounded="lg" prepend-icon="mdi-plus" elevation="0" @click="openDrawer()">
         {{ $t('coupons.addCoupon') }}
      </v-btn>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <v-data-table
        :headers="headers"
        :items="coupons"
        class="custom-table"
        hide-default-footer
      >
        <template v-slot:item.code="{ item }">
          <div class="d-flex align-center">
             <span class="font-weight-medium" style="color: #101828;">{{ item.code }}</span>
             <v-btn icon variant="text" size="small" class="ms-1" @click="copyCode(item.code)">
               <v-icon color="#64748B" size="16">mdi-content-copy</v-icon>
             </v-btn>
          </div>
        </template>
        <template v-slot:item.type="{ item }">
          <span style="color: #64748B">{{ item.type }}</span>
        </template>
        <template v-slot:item.expiryDate="{ item }">
          <span style="color: #64748B">{{ item.expiryDate }}</span>
        </template>
        <template v-slot:item.usageLimit="{ item }">
          <span style="color: #64748B">{{ item.usageLimit }}</span>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip size="small" :style="{ backgroundColor: getStatusColor(item.status) + ' !important', color: getStatusTextColor(item.status) + ' !important' }" class="font-weight-medium px-3" border="0" variant="flat">
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end align-center pr-4">
            <v-btn v-if="item.status !== 'Ended'" icon variant="text" size="small" class="mx-1" @click="openDrawer(item)">
              <v-icon color="#64748B" size="20">mdi-square-edit-outline</v-icon>
            </v-btn>
            <v-btn v-if="item.status === 'Active'" icon variant="text" size="small" @click="openActionModal(item, 'deactivate')">
              <v-icon color="#F04438" size="20">mdi-stop-circle-outline</v-icon>
            </v-btn>
            <v-btn v-if="item.status === 'Inactive'" icon variant="text" size="small" @click="openActionModal(item, 'activate')">
              <v-icon color="#12B76A" size="20">mdi-play-circle-outline</v-icon>
            </v-btn>
            <v-btn v-if="item.status === 'Ended'" icon variant="text" size="small" class="ms-1" @click="openActionModal(item, 'delete')">
              <v-icon color="#F04438" size="20">mdi-trash-can-outline</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>
    
    <div class="mt-4 text-caption" style="color: #64748B;">
      {{ $t('coupons.showing', { count: coupons.length, total: coupons.length }) }}
    </div>

    <!-- Add/Edit Drawer -->
    <v-navigation-drawer
      v-model="isDrawerOpen"
      location="end"
      width="450"
      temporary
      class="drawer-wrapper"
      elevation="2"
    >
      <div class="drawer-header px-6 pt-6 pb-2 d-flex justify-space-between align-center">
        <h2 class="drawer-title">{{ isEditing ? $t('coupons.editCoupon') : $t('coupons.addCoupon') }}</h2>
        <v-btn icon variant="text" width="27" height="27" @click="isDrawerOpen = false">
          <v-icon color="#64748B" size="27">mdi-close-circle-outline</v-icon>
        </v-btn>
      </div>
      <p class="drawer-desc px-6 mb-4" style="color: #64748B; font-size: 14px;">
        {{ isEditing ? $t('coupons.editDrawerDesc') : $t('coupons.addDrawerDesc') }}
      </p>

      <div class="drawer-content px-6 pt-4">
        <div class="mb-4">
          <div class="form-label mb-2">{{ $t('coupons.form.code') }}<span style="color: #F04438">*</span></div>
          <v-text-field v-model="form.code" :placeholder="$t('coupons.form.enterCode')" variant="outlined" density="compact" class="custom-input" hide-details></v-text-field>
        </div>

        <div class="mb-4">
          <div class="form-label mb-2">{{ $t('coupons.form.expireDate') }}</div>
          <v-menu v-model="isDatePickerOpen" :close-on-content-click="false" transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-text-field 
                :model-value="form.expireDate || 'N/A'" 
                variant="outlined" 
                density="compact" 
                readonly 
                v-bind="props" 
                class="custom-input" 
                hide-details
              >
                <template v-slot:append-inner>
                   <v-icon v-if="form.expireDate" size="20" color="#64748B" class="me-2 text-cursor-pointer" @click.stop="clearDate">mdi-close</v-icon>
                </template>
              </v-text-field>
            </template>
            <v-date-picker color="#2E87FE" @update:model-value="updateDate" show-adjacent-months hide-header></v-date-picker>
          </v-menu>
          <div class="mt-1" style="font-size: 12px; color: #64748B;">{{ $t('coupons.form.expireDefault') }}</div>
        </div>

        <div class="mb-4 mt-6">
          <div class="form-label mb-2">{{ $t('coupons.form.discountType') }}</div>
          <v-select v-model="form.discountType" :items="discountTypes" :placeholder="$t('coupons.form.selectType')" variant="outlined" density="compact" class="custom-input" hide-details></v-select>
        </div>
      </div>

      <div class="drawer-footer d-flex px-6 pt-8 gap-3" style="margin-top: auto; position: absolute; bottom: 24px; width: 100%;">
        <v-btn variant="outlined" class="drawer-cancel-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="isDrawerOpen = false">{{ $t('common.cancel') }}</v-btn>
        <v-btn class="drawer-action-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="saveCoupon">
          {{ isEditing ? $t('common.save') : $t('coupons.addCoupon') }}
        </v-btn>
      </div>
    </v-navigation-drawer>

    <!-- Action Modal -->
    <v-dialog v-model="actionModalState.isOpen" max-width="600">
      <v-card class="action-modal-card pa-8 text-center" style="border-radius: 20px;">
        <v-btn icon variant="text" width="27" height="27" class="position-absolute" style="top: 16px; right: 16px; z-index: 2;" @click="actionModalState.isOpen = false">
          <v-icon color="#64748B" size="27">mdi-close-circle-outline</v-icon>
        </v-btn>
        <v-card-text class="pt-4 px-0 pb-0">
          <h3 class="action-modal-title mb-4">{{ $t(`coupons.${actionModalState.type}Modal.title`, { code: selectedCoupon?.code }) }}</h3>
          <p class="action-modal-desc mb-8">{{ $t(`coupons.${actionModalState.type}Modal.desc`) }}</p>
          <div class="d-flex justify-center gap-3 w-100 mt-6">
            <v-btn variant="outlined" class="action-cancel-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="actionModalState.isOpen = false">{{ $t('common.cancel') }}</v-btn>
            <v-btn class="action-confirm-btn text-none flex-grow-1" :prepend-icon="actionModalState.type === 'activate' ? 'mdi-play-circle-outline' : (actionModalState.type === 'deactivate' ? 'mdi-stop-circle-outline' : '')" height="60" style="flex-basis: 0;" elevation="0" @click="confirmAction">
              {{ $t(`coupons.actions.${actionModalState.type}`) }}
            </v-btn>
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

.text-cursor-pointer {
  cursor: pointer;
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

/* Action Modal */
.action-modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #333333;
}

.action-modal-desc {
  font-size: 18px;
  font-weight: 400;
  color: #64748B;
  line-height: 1.4;
}

.action-cancel-btn {
  background-color: #FFFFFF !important;
  border: 1px solid #101828 !important;
  color: #101828 !important;
  font-size: 16px;
  border-radius: 16px !important;
}

.action-confirm-btn {
  background-color: #101828 !important;
  color: #FCFCFC !important;
  font-size: 16px;
  font-weight: 500;
  border-radius: 16px !important;
}

.gap-3 { gap: 12px; }
</style>
