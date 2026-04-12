<script setup lang="ts">
import { ref, reactive } from 'vue'

definePageMeta({
  layout: 'auth'
})

const localePath = useLocalePath()
const { rules } = useValidationRules()
const globalStore = useGlobalStore()

const showPassword = ref(false)
const loading = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const login = async () => {
  if (!form.email || !form.password) return
  loading.value = true
  const formData = new FormData()
  for (const key in form) {
    formData.append(key, (form as any)[key])
  }
  useApi()
    .post("auth/login", {}, { formData })
    .then((res: any) => {
      globalStore.setAlertData(res)
      loading.value = false
      if (res.success) {
        setTokenValue(res)
        navigateTo(localePath('/'))
      }
    })
}

const setTokenValue = (res: any) => {
  const newToken = res.data.token
  const profile = {
    email: res.data?.email,
    name: res.data?.name,
    permissions: {} as Record<string, boolean>,
  }
  if (res.data?.permissions) {
    for (const group in res.data.permissions) {
      res.data.permissions[group].forEach((item: any) => {
        profile.permissions[item.name] = true
      })
    }
  }
  globalStore.authToken = newToken
  globalStore.profile = profile
  useCookie('token').value = newToken
  useCookie<any>('profile').value = profile
  refreshCookie('token')
  refreshCookie('profile')
}

</script>

<template>
  <v-card class="auth-card pa-8 pa-sm-12 mx-auto" width="640" max-width="100%" elevation="0">
    <div class="d-flex flex-column align-center justify-center mb-8">
      <div class="d-flex align-center justify-center mb-6">
        <img src="/logo.svg" alt="CV Bot Logo" height="40" />
      </div>
      <h2 class="text-h5 font-weight-bold text-secondary">
        {{ $t('auth.login') }}
      </h2>
    </div>

    <v-form @submit.prevent="login">
      <div class="mb-1 text-subtitle-2 text-medium-emphasis">
        {{ $t('auth.email') }}
      </div>
      <v-text-field
        v-model="form.email"
        color="primary"
        type="email"
        placeholder="Alaa@cvbotproject.com"
        variant="outlined"
        density="comfortable"
        bg-color="white"
        class="mb-4 rounded-lg-input"
        :rules="[rules.required, rules.invalidEmail]"
      />

      <div class="mb-1 text-subtitle-2 text-medium-emphasis">
        {{ $t('auth.password') }}
      </div>
      <v-text-field
        v-model="form.password"
        color="primary"
        :type="showPassword ? 'text' : 'password'"
        placeholder="mycv#538"
        variant="outlined"
        density="comfortable"
        bg-color="white"
        class="mb-2 rounded-lg-input"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        :rules="[rules.required]"
        @click:append-inner="showPassword = !showPassword"
      />

      <div class="text-start mb-8">
        <NuxtLink :to="localePath('/auth/forget-password')" class="text-primary text-decoration-none text-body-2 font-weight-medium">
          {{ $t('auth.forgotPassword') }}
        </NuxtLink>
      </div>

      <v-btn
        type="submit"
        block
        color="secondary"
        height="50"
        class="rounded-lg text-body-1 font-weight-bold text-none"
        :loading="loading"
        elevation="0"
      >
        {{ $t('auth.login') }}
      </v-btn>
    </v-form>
  </v-card>
</template>

<style scoped>
.auth-card {
  background-color: #FCFCFC !important;
  border: 1px solid #E5E7EB !important;
  border-radius: 40px !important;
  box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.05) !important;
}

:deep(.v-field) {
  border-radius: 8px;
}
:deep(.v-field--focused) {
  border-color: var(--v-theme-primary);
}
</style>
