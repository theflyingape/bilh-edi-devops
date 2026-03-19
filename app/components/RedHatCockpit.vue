<template>
  <div>
    <UButton
      class="flex flex-grow"
      color="neutral"
      target="_blank"
      variant="outline"
      :avatar="{ src: '/redhat.svg', loading: 'lazy' }"
      :label="label"
      :to="to"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  to?: string
}>()
</script>
