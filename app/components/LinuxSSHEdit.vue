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
          <UFormField class="w-3/4" label="Name" help="please use a simple name based off its use" required>
            <UInput v-model="ssh.name" class="w-full" placeholder="SSH key filename.rsa" icon="i-lucide-building-2" minlength="7" disabled />
          </UFormField>
          <UFormField class="w-1/6" label="Created">
            <UPopover>
              <UButton class="w-full" color="neutral" icon="i-lucide-calendar" variant="subtle">
                {{ created.toDate(getLocalTimeZone()).toLocaleDateString() }}
              </UButton>
              <template #content>
                <UCalendar v-model="created" disabled />
              </template>
            </UPopover>
          </UFormField>
        </div>
        <div class="flex justify-between">
          <UFormField class="w-3/4" label="Fingerprint">
            <UTextarea v-model="ssh.fingerprint" class="font-mono" icon="i-lucide-fingerprint-pattern" disabled color="neutral" variant="soft" autoresize :cols="80" :rows="2" :maxrows="6" />
          </UFormField>
          <UFormField class="w-1/6" label="Review by">
            <UPopover>
              <UButton class="w-full" color="neutral" icon="i-lucide-calendar" variant="subtle">
                {{ reviewby.toDate(getLocalTimeZone()).toLocaleDateString() || 'Select a date' }}
              </UButton>
              <template #content>
                <UCalendar v-model="reviewby" />
              </template>
            </UPopover>
          </UFormField>
        </div>
        <div class="flex justify-between">
          <UFormField class="w-3/4" label="Comment" help="the free text appended to the public key">
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
          <UTextarea v-model="ssh.pubkey" class="font-mono" color="neutral" icon="i-lucide-file-key" autoresize :cols="96" :rows="6" :maxrows="12" placeholder="… SSH Public key to use as Authorization into remote server …" />
        </div>
        <div class="flex gap-x-2 justify-end">
          <div>
            <UButton
              class="disabled:bg-neutral-400 disabled:text-neutral-600"
              :disabled="ssh.name!.length < 7 || !ssh.name!.endsWith('.rsa')"
              :label="`${props.ssh.fingerprint ? 'UPDATE' : 'ADD'}`"
              color="action" variant="subtle" loading-auto
              leading-icon="i-lucide-shield-plus" size="lg"
              @click.prevent="() => {
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
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import { get, set } from '@vueuse/core'

const props = defineProps<{
  title?: string
  description?: string
  hcie: HCIE
  ssh: ssh
}>()

defineShortcuts({
  escape: () => emit('close', false)
})

const emit = defineEmits<{ close: [boolean] }>()
const { endpoint } = useIrisSessions()
const ssh = ref(props.ssh)

let ds = (get(ssh).created || today(getLocalTimeZone()).toString()).split('-')
const created = shallowRef(new CalendarDate(parseInt(ds[0]), parseInt(ds[1]), parseInt(ds[2])))
ds = (get(ssh).reviewby || today(getLocalTimeZone()).toString()).split('-')
const reviewby = shallowRef(new CalendarDate(parseInt(ds[0]), parseInt(ds[1]), parseInt(ds[2])))
</script>
