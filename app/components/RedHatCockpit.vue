<template>
  <div v-if="os == 'rhel'">
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
  os: string
  label?: string
  to?: string
}>()
</script>
