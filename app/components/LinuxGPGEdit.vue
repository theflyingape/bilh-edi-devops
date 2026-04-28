<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UModal :dismissible="true" :close="true">
    <template #header>
      {{ title }}
    </template>
    <template #body>
      <UTextarea v-model="pubKey" class="font-mono w-5/6" color="neutral" autoresize :cols="80" :rows="5" :maxrows="32" placeholder="exported public key …" />
      <div class="flex justify-end items-center space-x-1">
        <div>
          <UButton label="OK" color="neutral" size="lg" variant="solid" @click="() => {
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
  title: string
  pubkey: string
}>()
const emit = defineEmits<{ close: [boolean] }>()
const pubKey = ref(props.pubkey)
</script>
