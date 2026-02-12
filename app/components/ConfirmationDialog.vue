<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UModal :dismissible="false" :title="props.title" :description="props.description" :close="false">
    <template #body>
      <div class="italic ml-4 mr-4">
        {{ props.note }}
      </div>
      <div class="font-medium mt-4 mb-4 text-center text-highlighted">
        {{ props.query || 'Are you sure?' }}
      </div>
      <div class="flex justify-end items-center space-x-1">
        <div>
          <UButton class="pl-4 pr-4" label="Yes" color="action" size="lg" variant="subtle" @click="() => {
            response = true
            emit('close', true)
          }"
          />
        </div>
        <div>
          <UButton label="No" color="neutral" size="lg" variant="solid" @click="() => {
            response = false
            emit('close', true)
          }"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
  note?: string
  query?: string
}>()
const emit = defineEmits<{ close: [boolean] }>()
const { response } = useDevOps()
</script>
