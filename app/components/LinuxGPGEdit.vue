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
      <div class="flex flex-col gap-y-4">
        <div class="flex gap-x-4">
          <UFormField label="Fingerprint">
            <UInput v-model="gpg.fingerprint" class="w-94" disabled icon="i-lucide-fingerprint-pattern" variant="soft" />
          </UFormField>
          <UFormField label="Alias" help="hint: best used as a unique mnemonic in CAPS to identify this key">
            <UInput v-model="gpg.alias" class="w-72" placeholder="shorter text identifier" icon="i-lucide-id-card" />
          </UFormField>
        </div>
        <div class="flex gap-x-4">
          <UFormField label="Name">
            <UInput v-model="gpg.name" class="w-120" placeholder="free text identifier" icon="i-lucide-building-2" />
          </UFormField>
          <UFormField label="Email">
            <UInput v-model="gpg.email" class="w-88" placeholder="business contact" icon="i-lucide-at-sign" />
          </UFormField>
        </div>
        <div class="self-center">
          <UTextarea v-model="gpg.pubkey" class="font-mono" color="neutral" autoresize :cols="80" :rows="10" :maxrows="20" placeholder="… supply PGP public key block here, else a new keypair generates …" />
        </div>
        <div class="flex gap-x-2 justify-end">
          <div>
            <UButton :label="`${gpg.fingerprint ? 'UPDATE' : 'ADD'}`" color="action" size="lg" variant="subtle" loading-auto @click.prevent="async () => {
              await endpoint<hcieResponse<gpg[]>>(hcie, gpg.fingerprint ? `gpg/${gpg.fingerprint}` : 'gpg', gpg.fingerprint ? 'UPDATE' : 'POST', gpg).then((res) => {
                if (res && res.status == 'ERR') {
                  console.error('gpg key failure:', res.error)
                }
                emit('close', true)
              })
            }"
            />
          </div>
          <div>
            <UButton label="Cancel" color="neutral" size="lg" variant="subtle" @click="() => {
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
  hcie: HCIE
  gpg: gpg
}>()
const emit = defineEmits<{ close: [boolean] }>()
const { endpoint } = useIrisSessions()
const gpg = ref(props.gpg)
</script>
