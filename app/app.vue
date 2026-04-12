<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <BaseSharedAlert />
  </div>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";

const { locale } = useI18n();
const { current } = useLocale();

useHead({
  htmlAttrs: {
    lang: () => locale.value,
    dir: () => (locale.value === "en" ? "ltr" : "rtl"),
  },
});

watch(locale, (newLocaleValue) => {
  current.value = newLocaleValue;
}, { immediate: true });
</script>
