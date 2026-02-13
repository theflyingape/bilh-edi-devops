<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UModal class="min-w-fit" :dismissible="false" :title="props.title" :description="props.description">
    <template #body>
      <div class="grid auto-cols-max grid-flow-col gap-8">
        <UForm :state="account" @submit.prevent="submit">
          <div class="flex flex-col items-start gap-4">
            <div>
              <div class="font-medium text-highlighted">
                {{ account.name }}
              </div>
              &nbsp; {{ account.comment }}
            </div>
            <UFormField label="Last login" name="lastlogin">
              <UInput v-model="account.lastlogin" color="neutral" variant="ghost" :disabled="true" type="string" placeholder="Last login date/time" />
            </UFormField>
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
              <USwitch v-model="account.analyst" @focus="note='Analyst role manages this account with the local irisdev group, which in turn, first allows essential access to code, data, and files on Linux and in IRIS. Health Connect can further refine its access via User Roles delegated at login.'" @blur="note=''" />
            </UFormField>
            <UFormField label="Admin role" name="admin">
              <USwitch v-model="account.admin" @focus="note='Admin role elevates this account into the local irisadm group, which in turn, provides access to a restrictive list of Linux shell sudo commands and also expanded access within IRIS for Health Connect operations.'" @blur="note=''" />
            </UFormField>
            <UFormField label="Systems role" name="sysadm">
              <USwitch v-model="account.sysadm" :disabled="!isSystems" />
            </UFormField>
            <UTooltip :content="{ side: 'top' }" :delay-duration="0" text="requires account group member in local irisdev or AD grp-os-shell-access">
              <UFormField label="Shell access" name="shell">
                <USwitch v-model="account.shell" :disabled="!isSystems" />
              </UFormField>
            </UTooltip>
          </div>
          <div class="flex justify-end pt-8">
            <SubmitButton>Submit</SubmitButton>
          </div>
        </UForm>
        <UTextarea v-model="note" class="italic" color="info" variant="subtle" :disabled="true" :cols="48" :rows="8" autoresize placeholder="Note ..." />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { get, set } from '@vueuse/core'

const props = defineProps<{
  instance: INSTANCE
  account: Account
  title?: string
  description?: string
}>()
const { user } = useIrisSessions()
const isSystems = get(user)?.scope?.includes('systems')
const { Productions, loadProductions } = useIrisSessions()
const account = ref(props.account)
const emit = defineEmits<{ close: [boolean] }>()
const hcie = props.instance
const items = ref([])
const note = ref('')

async function submit() {
  emit('close', true)
}

onMounted(async () => {
  await loadProductions(hcie).then(() => {
    set(items, Productions.get(hcie)!.productions)
  })
})
</script>
