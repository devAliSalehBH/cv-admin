<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'auth'
})

const localePath = useLocalePath()
const { rules } = useValidationRules()

const loading = ref(false)
const email = ref('')
const emailSent = ref(false)
const countdown = ref(60)

const globalStore = useGlobalStore()

const submitEmail = async () => {
  if (!email.value) return
  loading.value = true
  
  const formData = new FormData();
  formData.append('email', email.value);

  useApi()
    .post("auth/forget-password", {}, { formData })
    .then((res: any) => {
      globalStore.setAlertData(res)
      loading.value = false
      if (res.success) {
        emailSent.value = true
        startCountdown()
      }
    })
}

const startCountdown = () => {
  countdown.value = 60
  const interval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(interval)
    }
  }, 1000)
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
          {{ $t('auth.forgotPassword') }}
        </h2>
        <p class="text-center text-body-2 text-medium-emphasis">
          {{ $t('auth.forgetPasswordDescription') }}
        </p>
      </div>

      <v-form @submit.prevent="submitEmail">
        <div class="mb-1 text-subtitle-2 text-medium-emphasis">
          {{ $t('auth.email') }}
        </div>
        <v-text-field
          v-model="email"
          color="primary"
          type="email"
          placeholder="Alaa@cvbotproject.com"
          variant="outlined"
          density="comfortable"
          bg-color="white"
          class="mb-4 rounded-lg-input"
          :rules="[rules.required, rules.invalidEmail]"
        />

        <div class="text-start mb-8 text-body-2 text-medium-emphasis">
          {{ $t('auth.rememberPasswordLabel') }}
          <NuxtLink :to="localePath('/auth/login')" class="text-primary text-decoration-none font-weight-medium">
            {{ $t('auth.login') }}
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
          {{ $t('auth.emailMeBtn') }}
        </v-btn>
      </v-form>
    </v-card>

    <!-- Success Modal Overlay -->
    <v-dialog v-model="emailSent" persistent max-width="500">
      <v-card class="auth-modal text-center pa-8 pa-sm-10" elevation="0" rounded="xl">
        <div class="d-flex justify-end position-absolute" style="top: 16px; right: 16px;">
          <v-btn icon="mdi-close" variant="text" density="comfortable" @click="emailSent = false" />
        </div>
        
        <h3 class="text-h6 font-weight-bold text-secondary mb-4 mt-4">
          {{ $t('auth.emailSentSuccess') }}
        </h3>
        
        <p class="text-body-2 text-medium-emphasis mb-8">
          {{ $t('auth.emailSentDesc') }}
        </p>

        <div class="d-flex align-center justify-space-between mt-4">
          <div class="text-body-2 text-medium-emphasis">
            {{ countdown > 0 ? $t('auth.resentIn', { time: countdown }) : '' }}
          </div>
          <v-btn
            color="secondary"
            height="44"
            class="rounded-lg text-body-2 font-weight-medium text-none px-6"
            elevation="0"
            :to="localePath('/auth/reset-password')"
          >
            {{ $t('auth.returnToLogin') }}
          </v-btn>
        </div>
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
