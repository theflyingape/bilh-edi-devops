<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UModal :dismissible="false" :title="props.title" :description="props.description">
    <template #body>
      <UForm :state="account" @submit.prevent="submit">
        <div class="flex flex-col items-start justify-center gap-2">
          <UFormField label="Name" name="name">
            <UInput v-model="account.name" :readonly="true" type="string" placeholder="BILH account" />
          </UFormField>
          <UFormField label="Comment" name="comment">
            <UInput v-model="account.comment" :readonly="true" type="string" placeholder="BILH description" />
          </UFormField>
          <UFormField label="Last login" name="lastlogin">
            <UInput v-model="account.lastlogin" :readonly="true" type="string" placeholder="Last login date/time" />
          </UFormField>
          <UFormField label="Startup Production" name="namespace">
            <USelect
              v-model="account.namespace"
              placeholder="select production"
              :items="items"
              class="max-h-fit w-48"
            />
          </UFormField>
        </div>
        <div class="grid grid-flow-col pt-2">
          <UFormField label="Analyst role" name="analyst">
            <USwitch v-model="account.analyst" />
          </UFormField>
          <UFormField label="Admin role" name="admin">
            <USwitch v-model="account.admin" />
          </UFormField>
          <UFormField label="Systems role" name="sysadm">
            <USwitch v-model="account.sysadm" />
          </UFormField>
          <UTooltip :content="{ side: 'top' }" :delay-duration="0" text="requires account group member in local irisdev or AD grp-os-shell-access">
            <UFormField label="Shell access" name="shell">
              <USwitch v-model="account.shell" />
            </UFormField>
          </UTooltip>
        </div>
        <div class="flex justify-end pt-8">
          <SubmitButton>Submit</SubmitButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { set } from '@vueuse/core'

const props = defineProps<{
  instance: INSTANCE
  account: Account
  title?: string
  description?: string
}>()
const { Productions, loadProductions } = useIrisSessions()
const account = ref(props.account)
const emit = defineEmits<{ close: [boolean] }>()
const hcie = props.instance
const items = ref([])

async function submit() {
  emit('close', true)
}

onMounted(async () => {
  await loadProductions(hcie).then(() => {
    set(items, Productions.get(hcie)!.productions)
  })
})
</script>
