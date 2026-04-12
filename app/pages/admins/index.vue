<script setup>
import { ref, computed } from 'vue';
import { useGlobalStore } from '~/stores/global';

const globalStore = useGlobalStore();
const { t } = useI18n();

const search = ref('');
const isAddEditDrawerOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditing = ref(false);
const selectedAdmin = ref(null);
const showPassword = ref(false);

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
});

const admins = ref([
  { id: 1, name: 'Mohamed Ahmed', first_name: 'Mohamed', last_name: 'Ahmed', date: 'Jan 15, 2024', email: 'mohamed@cvbot.app' },
  { id: 2, name: 'Mohamed Ahmed', first_name: 'Mohamed', last_name: 'Ahmed', date: 'Jan 15, 2024', email: 'mohamed@cvbot.app' },
  { id: 3, name: 'Mohamed Ahmed', first_name: 'Mohamed', last_name: 'Ahmed', date: 'Jan 15, 2024', email: 'mohamed@cvbot.app' },
  { id: 4, name: 'Mohamed Ahmed', first_name: 'Mohamed', last_name: 'Ahmed', date: 'Jan 15, 2024', email: 'mohamed@cvbot.app' },
]);

const headers = computed(() => [
  { title: t('admins.table.name'), key: 'name', sortable: false, align: 'start' },
  { title: t('admins.table.addedDate'), key: 'date', sortable: false, align: 'start' },
  { title: t('admins.table.email'), key: 'email', sortable: false, align: 'start' },
  { title: t('common.actions'), key: 'actions', sortable: false, align: 'end' },
]);

const openDrawer = (admin = null) => {
  showPassword.value = false;
  if (admin) {
    isEditing.value = true;
    selectedAdmin.value = admin;
    form.value = {
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      password: '••••••••',
    };
  } else {
    isEditing.value = false;
    selectedAdmin.value = null;
    form.value = { first_name: '', last_name: '', email: '', password: '' };
  }
  isAddEditDrawerOpen.value = true;
};

const saveAdmin = () => {
  isAddEditDrawerOpen.value = false;
  if (isEditing.value) {
    globalStore.showSuccess('Admin details have been updated successfully');
  } else {
    globalStore.showSuccess('New admin has been added Successfully');
  }
};

const confirmDelete = (admin) => {
  selectedAdmin.value = admin;
  isDeleteModalOpen.value = true;
};

const deleteAdmin = () => {
  isDeleteModalOpen.value = false;
  globalStore.showSuccess('Admin has been deleted Successfully');
};
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="page-title">{{ $t('admins.title') }}</h1>
      <p class="page-description mt-2">{{ $t('admins.description') }}</p>
    </div>

    <!-- Toolbar -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div class="d-flex align-center w-50">
        <v-text-field
          v-model="search"
          :placeholder="$t('admins.search')"
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
         {{ $t('admins.addAdmin') }}
      </v-btn>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <v-data-table
        :headers="headers"
        :items="admins"
        class="custom-table"
        hide-default-footer
      >
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end pr-4">
            <v-btn icon variant="text" size="small" class="mr-1" @click="openDrawer(item)">
              <v-icon color="#64748B" size="20">mdi-square-edit-outline</v-icon>
            </v-btn>
            <v-btn icon variant="text" size="small" @click="confirmDelete(item)">
              <v-icon color="#F04438" size="20">mdi-trash-can-outline</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>
    
    <div class="mt-4 text-caption" style="color: #64748B;">
      {{ $t('admins.showing', { count: admins.length, total: admins.length }) }}
    </div>

    <!-- Add/Edit Drawer -->
    <v-navigation-drawer
      v-model="isAddEditDrawerOpen"
      location="end"
      width="450"
      temporary
      class="drawer-wrapper"
      elevation="2"
    >
      <div class="drawer-header px-6 pt-6 pb-2 d-flex justify-space-between align-center">
        <h2 class="drawer-title">{{ isEditing ? $t('admins.editAdmin') : $t('admins.addAdmin') }}</h2>
        <v-btn icon variant="text" width="27" height="27" @click="isAddEditDrawerOpen = false">
          <v-icon color="#64748B" size="27">mdi-close-circle-outline</v-icon>
        </v-btn>
      </div>
      <p v-if="isEditing" class="drawer-desc px-6 mb-4" style="color: #64748B; font-size: 14px;">{{ $t('admins.drawerDesc') }}</p>

      <div class="drawer-content px-6 pt-4">
        <v-row class="mb-4">
          <v-col cols="6">
            <div class="form-label mb-2">{{ $t('users.firstName') }}</div>
            <v-text-field v-model="form.first_name" variant="outlined" density="compact" class="custom-input" hide-details></v-text-field>
          </v-col>
          <v-col cols="6">
            <div class="form-label mb-2">{{ $t('users.lastName') }}</div>
            <v-text-field v-model="form.last_name" variant="outlined" density="compact" class="custom-input" hide-details></v-text-field>
          </v-col>
        </v-row>
        
        <div class="mb-4">
          <div class="form-label mb-2">{{ $t('auth.email') }}</div>
          <v-text-field v-model="form.email" variant="outlined" density="compact" class="custom-input" hide-details></v-text-field>
        </div>

        <div class="mb-4">
          <div class="form-label mb-2">{{ $t('auth.password') }}</div>
          <v-text-field v-model="form.password" variant="outlined" density="compact" :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'" @click:append-inner="showPassword = !showPassword" class="custom-input" hide-details></v-text-field>
        </div>
      </div>

      <div class="drawer-footer d-flex px-6 pt-8 gap-3" style="margin-top: auto; position: absolute; bottom: 24px; width: 100%;">
        <v-btn variant="outlined" class="drawer-cancel-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="isAddEditDrawerOpen = false">{{ $t('common.cancel') }}</v-btn>
        <v-btn class="drawer-action-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-plus'" @click="saveAdmin">
          {{ isEditing ? $t('common.save') : $t('admins.addAdmin') }}
        </v-btn>
      </div>
    </v-navigation-drawer>

    <!-- Delete Modal -->
    <v-dialog v-model="isDeleteModalOpen" max-width="795">
      <v-card class="delete-modal-card pa-8 text-center" style="border-radius: 20px;">
        <v-btn icon variant="text" width="27" height="27" class="position-absolute" style="top: 16px; right: 16px;" @click="isDeleteModalOpen = false">
          <v-icon color="#64748B" size="27">mdi-close-circle-outline</v-icon>
        </v-btn>
        <v-card-text class="pt-4 px-0 pb-0">
          <h3 class="delete-modal-title mb-4">{{ $t('admins.deleteTitle') }}</h3>
          <p class="delete-modal-desc mb-8">{{ $t('admins.deleteDesc') }}<br><br>{{ $t('admins.deleteConfirm') }}</p>
          <div class="d-flex justify-center gap-3 w-100 mt-6">
            <v-btn variant="outlined" class="delete-cancel-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="isDeleteModalOpen = false">{{ $t('common.cancel') }}</v-btn>
            <v-btn class="delete-confirm-btn text-none flex-grow-1" height="60" style="flex-basis: 0;" elevation="0" @click="deleteAdmin">{{ $t('admins.deleteBtn') }}</v-btn>
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

/* Delete Modal */
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
