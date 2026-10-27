<script setup>
// Redirect in a route middleware instead of an awaited navigateTo in setup,
// which can leave client-side navigation hanging.
definePageMeta({
  middleware: () => navigateTo(useLocalePath()('/admins'), { replace: true }),
});
</script>

<template>
  <div />
</template>
