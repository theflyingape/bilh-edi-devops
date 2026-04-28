<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UModal
    class="max-w-fit" :title="title" :description="description" :dismissible="false" :close="{
      icon: 'i-lucide-x',
      color: 'neutral',
      variant: 'outline',
      class: 'rounded-full'
    }"
  >
    <template #body>
      <div class="flex flex-col gap-2">
        <div class="flex nowrap gap-2">
          <UFormField label="Fingerprint">
            <UInput v-model="gpg.fingerprint" icon="i-lucide-fingerprint-pattern" />
          </UFormField>
          <UFormField label="Alias" help="hint: use as a unique mnemonic in CAPS to identify this key">
            <UInput v-model="gpg.alias" placeholder="Enter your email" icon="i-lucide-id-card" />
          </UFormField>
        </div>
        <div class="flex nowrap gap-2">
          <UFormField label="Name">
            <UInput v-model="gpg.name" placeholder="free text identifier" icon="i-lucide-building-2" />
          </UFormField>
          <UFormField label="Email">
            <UInput v-model="gpg.email" icon="i-lucide-at-sign" />
          </UFormField>
        </div>
        <div class="self-center">
          <UTextarea v-model="gpg.pubkey" class="font-mono" color="neutral" autoresize :cols="72" :rows="10" :maxrows="20" placeholder="… PGP public key block …" />
        </div>
        <div class="flex justify-end space-x-2">
          <div>
            <UButton label="OK" color="neutral" size="lg" variant="solid" @click="() => {
              emit('close', true)
            }"
            />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
  gpg: gpg
}>()
const emit = defineEmits<{ close: [boolean] }>()
const gpg = ref(props.gpg)
</script>
