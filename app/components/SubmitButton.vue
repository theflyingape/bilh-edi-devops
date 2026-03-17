<template>
  <UButton
    class="disabled:bg-neutral-400 disabled:text-neutral-600"
    color="action"
    :disabled="disabled"
    loading-auto
    trailing-icon="i-heroicons-arrow-right-start-on-rectangle-16-solid"
    type="submit"
  >
    <slot />
  </UButton>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()
</script>
