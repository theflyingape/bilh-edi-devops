<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UModal
    class="max-w-fit" :title="title" :description="description || 'import new key'" :dismissible="false" :close="{
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
            <UBadge class="w-full" :label="gpg.fingerprint" icon="i-lucide-fingerprint-pattern" color="neutral" size="lg" variant="soft" />
          </UFormField>
          <UFormField class="w-2/5" label="Comment(s)">
            <UInput v-model="gpg.comment" class="w-full" placeholder="encoded key comment" icon="i-lucide-shield" :disabled="Boolean(gpg.pubkey?.length)" />
            <UInput v-model="gpg.commentx" class="w-full" placeholder="external kept free text" icon="i-lucide-id-card" />
          </UFormField>
        </div>
        <div class="flex justify-between">
          <UFormField class="w-1/2" label="Name(s)" help="minimum of 5 characters" required>
            <UInput v-model="gpg.name" class="w-full" placeholder="encoded key name" icon="i-lucide-shield" minlength="5" :disabled="Boolean(gpg.pubkey?.length)" />
            <UInput v-model="gpg.namex" class="w-full" placeholder="external kept owner id" icon="i-lucide-building-2" minlength="5" />
          </UFormField>
          <UFormField class="w-11/24" label="Email(s)" help="optional, but must be valid">
            <UInput v-model="gpg.email" type="email" class="w-full" placeholder="encoded key email" icon="i-lucide-shield" :disabled="Boolean(gpg.pubkey?.length)" />
            <UInput v-model="gpg.emailx" type="email" class="w-full" placeholder="external kept contact" icon="i-lucide-at-sign" />
          </UFormField>
        </div>
        <div class="self-center">
          <UTextarea v-model="gpg.pubkey" class="font-mono" color="neutral" autoresize :cols="65" :rows="10" :maxrows="20" placeholder="… supply PGP public key block here, else a new keypair generates …" />
        </div>
        <div class="flex gap-x-2 justify-end">
          <div>
            <UButton class="disabled:bg-neutral-400 disabled:text-neutral-600" :label="`${gpg.fingerprint ? 'UPDATE' : 'ADD'}`" color="action" size="lg" variant="subtle" loading-auto type="submit" leading-icon="i-lucide-shield-plus" :disabled="Boolean(gpg.name!.length < 5)" @click.prevent="() => {
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
