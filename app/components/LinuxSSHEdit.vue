<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UModal class="max-w-fit" :title="title" :description="description" :dismissible="false" :close="{
    icon: 'i-lucide-x',
    color: 'neutral',
    variant: 'outline',
    class: 'rounded-full'
  }">
    <template #body>
      <UForm @submit.prevent="async () => {
        ssh.production = get(production)
        await endpoint<hcieResponse<ssh[]>>(hcie, `ssh/${ssh.name}`, ssh.fingerprint ? 'UPDATE' : 'POST', ssh).then((res) => {
          if (res && res.status == 'ERR') {
            console.error('ssh key failure:', res.error)
          }
        }).finally(() => {
          emit('close', true)
        })
      }"
      >
        <div class="flex flex-col gap-y-4">
          <div class="flex justify-between">
            <UFormField label="Used in Production" required>
              <USelect v-model="production" placeholder="production" class="max-h-fit" :ui="{ content: 'min-w-fit' }" :items="items" @change.prevent="loadHosts('Test', production)" />
            </UFormField>
            <UTooltip text="Business Hosts using this key in TEST" :content="{ side: 'top', sideOffset: 2 }">
              <UCard v-if="ssh.interfaces?.length" variant="subtle">
                <template #default>
                  <div class="grid grid-cols-2">
                    <UTooltip v-for="(name, index) in ssh.interfaces" :key="index" arrow :text="ssh.comments[index] || 'no comment'" :content="{ side: 'bottom', sideOffset: 2 }">
                      <UBadge class="m-1" color="neutral" variant="subtle">
                        {{ name }}
                      </UBadge>
                    </UTooltip>
                  </div>
                </template>
              </UCard>
            </UTooltip>
          </div>
          <div class="flex justify-between">
            <UFormField class="w-3/4" label="Name" help="keep name (.rsa only) simple off its targeted use" required>
              <UInput v-model="ssh.name" class="w-full" placeholder="SSH key filename.rsa" icon="i-lucide-building-2" minlength="6" pattern="^.+\.rsa$" :disabled="Boolean(ssh.fingerprint?.length)" />
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
            <UFormField class="w-3/4" label="Comment">
              <UInput v-model="ssh.comment" class="w-full" placeholder="public key comment" icon="i-lucide-id-card" />
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
            <UFormField class="w-3/4" label="Fingerprint">
              <UTextarea v-model="ssh.fingerprint" class="font-mono" icon="i-lucide-fingerprint-pattern" disabled color="neutral" variant="soft" autoresize :cols="80" :rows="2" :maxrows="6" />
            </UFormField>
          </div>
          <div class="flex justify-between">
            <UFormField class="w-2/5" label="Account">
              <UInput v-model="ssh.account" class="w-full" placeholder="login account name" icon="i-lucide-user" />
            </UFormField>
            <UFormField label="@" />
            <UFormField class="w-2/5" label="Asset">
              <UInput v-model="ssh.asset" class="w-full" placeholder="remote endpoint" icon="i-lucide-arrow-big-right-dash" />
            </UFormField>
          </div>
          <div class="flex justify-between">
            <UFormField class="w-11/24" label="Admin">
              <UInput v-model="ssh.admin" class="w-full" placeholder="name" icon="i-lucide-shield-user" />
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
              <UButton class="disabled:bg-neutral-400 disabled:text-neutral-600" :label="`${props.ssh.fingerprint ? 'UPDATE' : 'ADD'}`" color="action" size="lg" variant="subtle" leading-icon="i-lucide-shield-plus" loading-auto type="submit" :disabled="disabled" />
            </div>
            <div>
              <UButton label="Cancel" color="neutral" size="lg" variant="subtle" @click="() => {
                emit('close', true)
              }"
              />
            </div>
          </div>
        </div>
      </UForm>
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

const production = ref('')
const items = ref([])
const emit = defineEmits<{ close: [boolean] }>()
const { endpoint, loadProductions, Productions } = useIrisSessions()
const ssh = ref(props.ssh)
const disabled = ref(computed(() => Boolean(!get(production) || get(ssh).name!.length < 6 || !get(ssh).name!.endsWith('.rsa'))))

let ds = (get(ssh).created || today(getLocalTimeZone()).toString()).split('-')
const created = shallowRef(new CalendarDate(parseInt(ds[0]!), parseInt(ds[1]!), parseInt(ds[2]!)))

ds = (get(ssh).reviewby || today(getLocalTimeZone()).toString()).split('-')
const reviewby = shallowRef(new CalendarDate(parseInt(ds[0]!), parseInt(ds[1]!), parseInt(ds[2]!)))

async function loadItems() {
  const instance = 'Test'
  if (instance) {
    await loadProductions(instance).then(async () => {
      set(items, Productions.get(instance)!.productions)
      set(production, get(ssh).production || '')
    })
  }
}

async function loadHosts(instance: HCIE, production: string) {
  await endpoint<hcieResponse<sshprod>>(instance, `ssh/${ssh.value.name}?${production}`).then((res) => {
    if (res && res.status == 'ERR') {
      console.error(`ssh key lookup in ${production}:`, res.error)
    } else {
      ssh.value.interfaces = res?.data.interfaces
      ssh.value.comments = res?.data.comments
    }
  })
}

onMounted(async () => {
  await loadItems()
})
</script>
