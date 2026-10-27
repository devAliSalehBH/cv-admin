<script setup>
const localePath = useLocalePath();
const route = useRoute();
const { t } = useI18n();
const globalStore = useGlobalStore();

const links = [
  { name: 'admins', icon: 'users', to: '/admins' },
  { name: 'clients', icon: 'user-square', to: '/clients' },
  { name: 'subscriptions', icon: 'repeat', to: '/subscriptions' },
  { name: 'coupons', icon: 'ticket', to: '/coupons' },
  { name: 'settings', icon: 'settings', to: '/settings' },
];

// A section stays selected on its sub pages too (e.g. /settings/pricing-plans)
const isActive = (link) => {
  const base = localePath(link.to);
  return route.path === base || route.path.startsWith(`${base}/`);
};

const profileCookie = useCookie('profile');
const profile = computed(() => profileCookie.value || globalStore.profile || {});
const userName = computed(() => profile.value?.name || profile.value?.email || '—');
const userRole = computed(() =>
  profile.value?.is_super_admin === false ? t('nav.admin', 'Admin') : t('nav.superAdmin', 'Super Admin'),
);

const loggingOut = ref(false);
const logout = async () => {
  loggingOut.value = true;
  const formData = new FormData();
  await useApi().post('admins/auth/logout', {}, { formData });
  useCookie('token').value = null;
  profileCookie.value = null;
  refreshCookie('token');
  refreshCookie('profile');
  globalStore.authToken = null;
  globalStore.profile = null;
  loggingOut.value = false;
  navigateTo(localePath('/auth/login'));
};
</script>

<template>
  <v-navigation-drawer permanent class="cv-sidebar" elevation="0" width="300" :border="0">
    <div class="cv-sidebar__inner">
      <!-- Logo -->
      <NuxtLink :to="localePath('/')" class="cv-sidebar__logo" aria-label="CV Bot">
        <svg width="45" height="36" viewBox="0 0 45 36" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="cvBubble" x1="0" y1="0" x2="45" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#5EC8F2" />
              <stop offset="1" stop-color="#2C85FE" />
            </linearGradient>
          </defs>
          <path
            d="M10 0h25c5.5 0 10 4.5 10 10v8c0 5.5-4.5 10-10 10H11.5L5 34.2c-.9.8-2.3.2-2.3-1V27C1.1 25.3 0 22.3 0 18v-8C0 4.5 4.5 0 10 0Z"
            fill="url(#cvBubble)"
          />
          <circle cx="16" cy="13.5" r="4" fill="#fff" />
          <circle cx="29" cy="13.5" r="4" fill="#fff" />
        </svg>
        <span class="cv-sidebar__logo-text">CV Bot</span>
      </NuxtLink>

      <!-- Navigation -->
      <nav class="cv-sidebar__nav" :aria-label="t('nav.main', 'Main navigation')">
        <NuxtLink
          v-for="link in links"
          :key="link.name"
          :to="localePath(link.to)"
          class="cv-nav-item"
          :class="{ 'cv-nav-item--selected': isActive(link) }"
          :aria-current="isActive(link) ? 'page' : undefined"
        >
          <CvIcon :name="link.icon" :size="20" />
          <span>{{ t('nav.' + link.name) }}</span>
        </NuxtLink>
      </nav>

      <!-- User -->
      <div class="cv-sidebar__footer">
        <CvIcon name="user" :size="20" color="#64748B" />
        <div class="cv-sidebar__user">
          <div class="cv-sidebar__user-name">{{ userName }}</div>
          <div class="cv-sidebar__user-role">{{ userRole }}</div>
        </div>
        <v-tooltip :text="t('nav.logout')" location="top">
          <template #activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="cv-sidebar__logout"
              :aria-label="t('nav.logout')"
              :disabled="loggingOut"
              @click="logout"
            >
              <CvIcon name="logout" :size="18" />
            </button>
          </template>
        </v-tooltip>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.cv-sidebar {
  background-color: var(--color-bg) !important;
  border-inline-end: 0.89px solid var(--color-sec-stroke) !important;
}

.cv-sidebar__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cv-sidebar__logo {
  height: 85px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid var(--color-stroke);
  text-decoration: none;
  flex-shrink: 0;
}

.cv-sidebar__logo-text {
  font-family: var(--font-en);
  font-size: 22.54px;
  line-height: 31.56px;
  font-weight: 700;
  color: var(--color-text-header);
}

.cv-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
}

.cv-nav-item {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-inline-start: 16px;
  border-radius: var(--radius-10);
  color: var(--color-icon-sec);
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.cv-nav-item:hover {
  background-color: var(--color-gray-bg);
}

.cv-nav-item--selected,
.cv-nav-item--selected:hover {
  background-color: var(--color-icon-blue-bg);
  color: var(--color-text-blue);
}

.cv-nav-item--selected :deep(.cv-icon) {
  stroke: var(--color-icon-blue);
}

.cv-nav-item:focus-visible {
  outline: 2px solid var(--color-icon-blue);
  outline-offset: 2px;
}

.cv-sidebar__footer {
  margin-top: auto;
  min-height: 92px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-inline: 32px 24px;
  border-top: 1px solid var(--color-sec-stroke);
}

.cv-sidebar__user {
  flex: 1;
  min-width: 0;
}

.cv-sidebar__user-name {
  font-size: 16px;
  line-height: 22px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-sidebar__user-role {
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: var(--color-text-sec);
}

.cv-sidebar__logout {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 0;
  background: transparent;
  color: var(--color-icon-sec);
  cursor: pointer;
}

.cv-sidebar__logout:hover {
  background: var(--color-gray-bg);
  color: var(--color-error);
}

[dir='rtl'] .cv-sidebar__logout :deep(.cv-icon) {
  transform: scaleX(-1);
}
</style>
