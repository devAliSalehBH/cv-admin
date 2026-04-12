<template>
  <div class="d-flex justify-center align-center h-100 w-100 flex-column" style="margin-top: 200px">
    <v-icon color="#2E87FE" size="64" class="mb-4">mdi-credit-card-outline</v-icon>
    <h1 style="font-size: 24px; font-weight: 600; color: #111827">Payment Gateway (Temporary)</h1>
    <p style="color: #64748B; margin-top: 8px;">This is a placeholder page for the payment gateway integration.</p>
    <v-btn class="mt-8 text-none px-8" color="#101828" rounded="lg" height="44" @click="$router.push(localePath('/subscriptions'))">
      Return to Subscriptions
    </v-btn>
  </div>
</template>

<script setup>
import { useLocalePath } from '#i18n';

const localePath = useLocalePath();
</script>
