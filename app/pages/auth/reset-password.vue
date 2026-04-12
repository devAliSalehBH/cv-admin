<script setup lang="ts">
import { ref, reactive } from 'vue'

definePageMeta({
  layout: 'auth'
})

const localePath = useLocalePath()
const { rules } = useValidationRules()
const { locale: currentLocale } = useI18n()

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordUpdated = ref(false)

const form = reactive({
  password: '',
  confirmPassword: ''
})

const globalStore = useGlobalStore()

const resetPassword = async () => {
  if (!form.password || form.password !== form.confirmPassword) return
  loading.value = true
  
  const formData = new FormData()
  formData.append('password', form.password)
  formData.append('password_confirmation', form.confirmPassword)

  useApi()
    .post("auth/reset-password", {}, { formData })
    .then((res: any) => {
      globalStore.setAlertData(res)
      loading.value = false
      if (res.success) {
        passwordUpdated.value = true
      }
    })
}
</script>

<template>
  <div class="w-100 d-flex justify-center position-relative">
    <v-card class="auth-card pa-8 pa-sm-12 mx-auto" width="640" max-width="100%" elevation="0">
      <div class="d-flex flex-column align-center justify-center mb-6">
        <div class="d-flex align-center justify-center mb-6">
          <img src="/logo.svg" alt="CV Bot Logo" height="40" />
        </div>
        <h2 class="text-h5 font-weight-bold text-secondary mb-3">
          {{ $t('auth.createNewPassword') }}
        </h2>
        <p class="text-center text-body-2 text-medium-emphasis">
          {{ $t('auth.createNewPasswordDescription') }}
        </p>
      </div>

      <v-form @submit.prevent="resetPassword">
        <div class="mb-1 text-subtitle-2 text-medium-emphasis">
          {{ $t('auth.password') }}
        </div>
        <v-text-field
          v-model="form.password"
          color="primary"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter your new password"
          variant="outlined"
          density="comfortable"
          bg-color="white"
          class="mb-4 rounded-lg-input"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :rules="[rules.required, rules.min8Char({ label: $t('auth.password'), locale: currentLocale })]"
          @click:append-inner="showPassword = !showPassword"
        />

        <div class="mb-1 text-subtitle-2 text-medium-emphasis">
          {{ $t('auth.confirmPassword') }}
        </div>
        <v-text-field
          v-model="form.confirmPassword"
          color="primary"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="Re-enter your new password"
          variant="outlined"
          density="comfortable"
          bg-color="white"
          class="mb-8 rounded-lg-input"
          :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :rules="[
            rules.required,
            rules.matchPassword({ label: form.password })
          ]"
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
        />

        <v-btn
          type="submit"
          block
          color="secondary"
          height="50"
          class="rounded-lg text-body-1 font-weight-bold text-none"
          :loading="loading"
          elevation="0"
        >
          {{ $t('auth.resetPassword') }}
        </v-btn>
      </v-form>
    </v-card>

    <!-- Success Modal Overlay -->
    <v-dialog v-model="passwordUpdated" persistent max-width="500">
      <v-card class="auth-modal text-center pa-8 pa-sm-10" elevation="0" rounded="xl">
        <h3 class="text-h6 font-weight-bold text-secondary mb-4 mt-2">
          {{ $t('auth.passwordUpdatedSuccess') }}
        </h3>
        
        <p class="text-body-2 text-medium-emphasis mb-8">
          {{ $t('auth.passwordUpdatedDesc') }}
        </p>

        <v-btn
          block
          color="secondary"
          height="48"
          class="rounded-lg text-body-1 font-weight-medium text-none"
          elevation="0"
          :to="localePath('/auth/login')"
        >
          {{ $t('auth.goToLogin') }}
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.auth-card {
  background-color: #FCFCFC !important;
  border: 1px solid #E5E7EB !important;
  border-radius: 40px !important;
  box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.05) !important;
}

.auth-modal {
  background-color: #FFFFFF !important;
  border: 1px solid #E5E7EB !important;
  border-radius: 32px !important;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-field) {
  border-radius: 8px;
}
:deep(.v-field--focused) {
  border-color: var(--v-theme-primary);
}
</style>
