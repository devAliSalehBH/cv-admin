<template>
  <div class="d-flex flex-wrap justify-space-between align-center mt-4 px-4 pb-4">
    <!-- Showing details -->
    <div class="d-flex align-center mb-2 mb-sm-0">
      <span class="text-caption" style="color: #64748B;">
        {{ $t('table.display', 'Displaying') }} {{ from || 0 }} - {{ to || 0 }} {{ $t('table.of', 'of') }} {{ total || 0 }} {{ $t('table.results', 'results') }}
      </span>
    </div>

    <!-- Pagination -->
    <div class="d-flex justify-center flex-grow-1 mb-2 mb-sm-0">
      <v-pagination
        :model-value="page"
        @update:model-value="$emit('update:page', $event)"
        :length="lastPage"
        :total-visible="5"
        density="compact"
        color="#101828"
      ></v-pagination>
    </div>

    <!-- Items per page -->
    <div class="d-flex align-center">
      <span class="text-caption me-3" style="color: #64748B;">{{ $t('table.results_per_page', 'Results per page') }}</span>
      <v-select
        :model-value="perPage"
        @update:model-value="$emit('update:perPage', $event)"
        :items="[10, 20, 50, 100]"
        variant="outlined"
        density="compact"
        hide-details
        class="per-page-select"
      ></v-select>
    </div>
  </div>
</template>

<script setup>
defineProps({
  page: { type: Number, default: 1 },
  perPage: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
  lastPage: { type: Number, default: 1 },
  from: { type: Number, default: 0 },
  to: { type: Number, default: 0 },
});

defineEmits(['update:page', 'update:perPage']);
</script>

<style scoped>
.per-page-select {
  width: 100px;
}
.per-page-select :deep(.v-field) {
  background-color: #FCFCFC !important;
  border-radius: 8px !important;
  border: 1px solid #D5D7DA;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
}
.per-page-select :deep(.v-field__outline) {
  display: none;
}
</style>
