<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UModal class="min-w-fit" :dismissible="false" :title="props.title" :description="props.description">
    <template #body>
      <div class="grid auto-cols-max grid-flow-col gap-8">
        <UForm :state="account" @submit.prevent="submit">
          <div class="flex flex-col items-start gap-4">
            <div>
              <div class="text-lg font-medium">
                {{ account.name }}
              </div>
              <div class="text-sm">
                &nbsp; {{ account.comment }}
              </div>
              <div class="text-sm">
                <span class="italic">last login:</span> <span class="font-mono not-italic">{{ account.lastlogin }}</span>
              </div>
            </div>
            <UFormField label="Home Production" name="namespace">
              <USelect
                v-model="account.namespace"
                class="max-h-fit w-48"
                placeholder="select production"
                :autofocus="true"
                :items="items"
              />
            </UFormField>
          </div>
          <div class="grid grid-flow-col gap-4 pt-4">
            <UFormField label="Analyst role" name="analyst">
              <USwitch v-model="account.analyst" @focus="note='Analyst role manages this account with the local irisdev group, which in turn, allows the essential access to code, data, and files on Linux and in IRIS. Health Connect can further refine its access via User Roles delegated at login.'" @blur="note=''" />
            </UFormField>
            <UFormField label="Admin role" name="admin">
              <USwitch v-model="account.admin" @focus="note='Admin role elevates this account into the local irisadm group, which in turn, provides access to a restrictive list of Linux shell sudo commands and also expanded access within IRIS for Health Connect operations.'" @blur="note=''" />
            </UFormField>
            <UFormField label="Systems role" name="sysadm">
              <USwitch v-model="account.sysadm" @focus="note='Systems role is an elevated AD account for Linux root shell and the IRIS %Manager administration role. Unless assigned, this role alone does not necessarily have to overlap with the DevOps roles.'" @blur="note=''" :disabled="!isSystems" />
            </UFormField>
            <UFormField label="Shell access" name="shell">
              <USwitch v-model="account.shell" @focus="note='This role is a deterministic value only: enabled by the local irisdev group or as a member in AD grp-os-shell-access which allows for a remote Linux login.'" @blur="note=''" />
            </UFormField>
          </div>
          <div class="flex justify-center pt-2">
            <UTextarea v-model="note" class="italic" color="info" variant="subtle" :disabled="true" :cols="54" :rows="4" :maxrows="4" autoresize placeholder="Note ..." />
          </div>
          <div class="flex justify-end pt-8">
            <SubmitButton>Submit</SubmitButton>
          </div>
        </UForm>
        <div>
          <UTextarea v-model="groups" color="info" variant="subtle" :disabled="true" :cols="60" :rows="14" :maxrows="14" autoresize placeholder="AD groups ..." />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { get, set } from '@vueuse/core'
import { ModalInfo } from '#components'

const props = defineProps<{
  instance: INSTANCE
  account: Account
  title?: string
  description?: string
}>()
const { Productions, loadProductions, endpoint, user } = useIrisSessions()
const overlay = useOverlay()
const isSystems = get(user)?.scope?.includes('systems')
const account = ref(props.account)
const emit = defineEmits<{ close: [boolean] }>()
const hcie = props.instance
const groups = ref(props.account.groups?.join(', '))
const items = ref([])
const note = ref('')

async function submit() {
  await endpoint(hcie, `account/${get(account).name}`, 'UPDATE', {
    admin: get(account).admin,
    analyst: get(account).analyst,
    sysadm: get(account).sysadm,
    namespace: get(account).namespace
  }).then(async (result) => {
    if (result) {
      const modal = overlay.create(ModalInfo, { props: { title: `${get(account).name} updated ${result?.status} ${result?.error}` } })
      modal.open()
    }
  }).catch(async (err) => {
    const modal = overlay.create(ModalInfo, { props: { title: `${err.statusCode}: ${err.statusMessage}` } })
    modal.open()
  })
  emit('close', true)
}

onMounted(async () => {
  await loadProductions(hcie).then(() => {
    set(items, Productions.get(hcie)!.productions)
  })
})
</script>
