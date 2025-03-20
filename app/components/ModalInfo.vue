<script setup lang="ts">
defineProps<{
  title: string
}>()

const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }" :title="`${title}`">
    <template #footer>
      <div class="flex gap-2">
        <UButton color="action" label="Dismiss" @click="emit('close', false)" />
      </div>
    </template>
  </UModal>
</template>