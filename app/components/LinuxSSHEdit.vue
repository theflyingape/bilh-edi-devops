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
        <UFormField class="w-1/2" label="Name" help="please use a simple name based off its use" required>
          <UInput v-model="ssh.name" class="w-full" placeholder="SSH key filename" icon="i-lucide-building-2" minlength="3" />
        </UFormField>
        <UFormField class="w-full" label="Fingerprint">
          <UTextarea v-model="ssh.fingerprint" class="font-mono" icon="i-lucide-fingerprint-pattern" color="neutral" variant="soft" autoresize :cols="80" :rows="2" :maxrows="6" />
        </UFormField>
        <div class="flex justify-between">
          <UFormField class="w-4/5" label="Comment" help="the free text appended to the public key">
            <UInput v-model="ssh.comment" class="w-full" placeholder="public key comment" icon="i-lucide-id-card" />
          </UFormField>
        </div>
        <div class="flex justify-between">
          <UFormField class="w-11/24" label="Admin">
            <UInput v-model="ssh.admin" type="email" class="w-full" placeholder="name" icon="i-lucide-shield-user" />
          </UFormField>
          <UFormField class="w-11/24" label="Contact">
            <UInput v-model="ssh.contact" type="email" class="w-full" placeholder="contact" icon="i-lucide-at-sign" />
          </UFormField>
        </div>
        <div class="self-center">
          <UTextarea v-model="ssh.pubkey" class="font-mono" color="neutral" autoresize :cols="80" :rows="4" :maxrows="12" placeholder="… SSH Public key to use as Authorization into remote server …" />
        </div>
        <div class="flex gap-x-2 justify-end">
          <div>
            <UButton :label="`${props.ssh.fingerprint ? 'UPDATE' : 'ADD'}`" color="action" size="lg" variant="subtle" loading-auto icon="i-lucide-shield-plus" @click.prevent="() => {
              endpoint<hcieResponse<ssh[]>>(hcie, ssh.fingerprint ? `ssh/${ssh.fingerprint}` : 'ssh', ssh.fingerprint ? 'UPDATE' : 'POST', ssh).then((res) => {
                if (res && res.status == 'ERR') {
                  console.error('ssh key failure:', res.error)
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
  ssh: ssh
}>()
const emit = defineEmits<{ close: [boolean] }>()
const { endpoint } = useIrisSessions()
const ssh = ref(props.ssh)
</script>
