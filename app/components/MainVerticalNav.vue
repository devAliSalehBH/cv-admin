<script setup>
import { ref } from 'vue';

const localePath = useLocalePath();
const drawer = ref(true);
const links = [
  { name: 'admins', icon: 'mdi-account-outline', to: '/admins' },
  { name: 'clients', icon: 'mdi-account-circle-outline', to: '/clients' },
  { name: 'subscriptions', icon: 'mdi-sync', to: '/subscriptions' },
  { name: 'coupons', icon: 'mdi-ticket-percent-outline', to: '/coupons' },
  { name: 'settings', icon: 'mdi-cog-outline', to: '/settings' },
];
</script>
<template>
  <v-navigation-drawer v-model="drawer" permanent class="nav-drawer" elevation="0" width="280">
    <div class="logo-container">
      <div class="d-flex align-center gap-2">
         <v-icon color="#2E87FE" size="36">mdi-message-text</v-icon>
         <span style="font-size: 20px; font-weight: 700; color: #111827" class="ml-2">CV Bot</span>
      </div>
    </div>
    
    <v-list class="nav-list" density="compact" nav>
      <v-list-item
        v-for="link in links"
        :key="link.name"
        :to="localePath(link.to)"
        class="nav-item"
      >
        <template v-slot:prepend>
          <v-icon size="20" class="nav-icon">{{ link.icon }}</v-icon>
        </template>
        <v-list-item-title class="nav-item-title">
          {{ $t('nav.' + link.name) }}
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="user-profile">
        <div class="d-flex align-center">
          <v-avatar color="#F3F4F6" size="40" class="mr-3">
            <v-icon color="#6B7280">mdi-account-outline</v-icon>
          </v-avatar>
          <div>
            <div class="user-name">Alaa Mohamed</div>
            <div class="user-role">Super Admin</div>
          </div>
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.nav-drawer {
  background-color: #FCFCFC !important;
  border-right: 1px solid #CBD5E1 !important;
}

.logo-container {
  padding: 32px 24px;
}

.nav-list {
  padding: 0 16px;
}

.nav-item {
  border-radius: 8px !important;
  margin-bottom: 4px !important;
  min-height: 48px !important;
  color: #64748B !important;
}

.nav-item .nav-icon {
  color: #64748B;
  opacity: 1;
}

.nav-item-title {
  font-size: 16px !important;
  font-weight: 500 !important;
}

.nav-item.v-list-item--active {
  background-color: #ECF4FF !important;
  color: #2E87FE !important;
}

.nav-item.v-list-item--active .nav-icon {
  color: #2E87FE !important;
}

.nav-item.v-list-item--active .nav-item-title {
  color: #2E87FE !important;
}

.user-profile {
  padding: 24px;
  border-top: 1px solid #CBD5E1;
}

.user-name {
  color: #64748B;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
}

.user-role {
  color: #64748B;
  font-size: 14px;
  font-weight: 300;
  margin-top: 2px;
}
</style>
