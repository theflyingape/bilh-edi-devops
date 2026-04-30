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
        <div class="flex justify-between">
          <UFormField class="w-7/12" label="Fingerprint">
            <UBadge class="w-full" :label="gpg.fingerprint" icon="i-lucide-fingerprint-pattern" color="neutral" variant="soft" />
          </UFormField>
          <UFormField class="w-2/5" label="Comment" help="hint: best used as a unique mnemonic in CAPS to identify this key">
            <UInput v-model="gpg.comment" class="w-full" placeholder="shorter text identifier" icon="i-lucide-id-card" />
          </UFormField>
        </div>
        <div class="flex justify-between">
          <UFormField class="w-1/2" label="Name" help="minimum of 5 characters" required>
            <UInput v-model="gpg.name" class="w-full" placeholder="free text identifier" icon="i-lucide-building-2" minlength="5" />
          </UFormField>
          <UFormField class="w-11/24" label="Email" help="optional, but must be valid">
            <UInput v-model="gpg.email" type="email" class="w-full" placeholder="valid business contact" icon="i-lucide-at-sign" />
          </UFormField>
        </div>
        <div class="self-center">
          <UTextarea v-model="gpg.pubkey" class="font-mono" color="neutral" autoresize :cols="65" :rows="10" :maxrows="20" placeholder="… supply PGP public key block here, else a new keypair generates …" />
        </div>
        <div class="flex gap-x-2 justify-end">
          <div>
            <UButton :label="`${props.gpg.fingerprint ? 'UPDATE' : 'ADD'}`" color="action" size="lg" variant="subtle" loading-auto icon="i-lucide-shield-plus" @click.prevent="() => {
              endpoint<hcieResponse<gpg[]>>(hcie, gpg.fingerprint ? `gpg/${gpg.fingerprint}` : 'gpg', gpg.fingerprint ? 'UPDATE' : 'POST', gpg).then((res) => {
                if (res && res.status == 'ERR') {
                  console.error('gpg key failure:', res.error)
                }
              }).finally(() => {
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
