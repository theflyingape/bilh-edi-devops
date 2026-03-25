<!-- new RBAC delegation enhanced under IRIS control -->
<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UModal class="max-w-fit" :dismissible="false" :title="title" :description="description">
    <template #body>
      <div class="grid auto-cols-max grid-flow-col gap-8">
        <UForm :state="iris" @submit.prevent="submit">
          <div class="flex flex-col items-start gap-4">
            <div>
              <div class="text-lg font-medium">
                {{ iris.name }}
              </div>
              <div class="text-sm">
                &nbsp; {{ iris.comment }}
              </div>
              <div class="text-sm">
                <span class="italic">last login:</span> <span class="font-mono not-italic">{{ iris.lastlogin }}</span>
              </div>
            </div>
            <UFormField label="Start in Production" name="namespace">
              <USelect
                :v-model="iris.namespace"
                class="max-h-fit w-48"
                placeholder="select production"
                :autofocus="true"
                :items="items"
              />
            </UFormField>
          </div>
          <UTable ref="table" :data="data" :columns="columns" :rows="iris.access" class="flex-1">
            <template #hs-cell="{ row }">
              <p class="font-medium text-highlighted">
                {{ row.original.hs }}
              </p>
            </template>
            <template #action-cell="{ row }">
              <USelect
                v-model="row.original.scope"
                :items="interops"
              />
            </template>
          </UTable>
          <div class="grid grid-flow-col justify-items-center pt-4">
            <UFormField label="DevOps" name="irisdev">
              <USwitch v-model:model-value="iris.irisdev" :disabled="isAdm || isSys" @focus="note='Manages core DevOps access using the local irisdev group, which in turn, allows essential access to code, data, and files on Linux and in IRIS. Health Connect can further refine its access via Security User Roles delegated at login.'" @blur="note=''" />
            </UFormField>
            <UFormField label="Admin" name="irisadm">
              <USwitch v-model="iris.irisadm" @focus="note='Admin role elevates this account into the local irisadm group, which in turn, provides access to a restrictive list of Linux shell sudo commands and also expanded access within IRIS for Health Connect operations.'" @blur="note=''" @update:model-value="() => { if (!iris.irisdev) iris.irisdev = isAdm || isSys }" />
            </UFormField>
            <UFormField label="Systems" name="sysadm">
              <USwitch v-model="iris.sysadm" :disabled="!isSystems" color="secondary" @focus="note='Systems role is an elevated AD account for Linux root shell and the IRIS %Manager administration role. Unless assigned, this role alone does not necessarily have to overlap with the DevOps roles.'" @blur="note=''" @update:model-value="() => { if (!iris.irisdev) iris.irisdev = isAdm || isSys }" />
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
          <div class="flex items-center font-medium gap-1 text-sky-800">
            <UIcon name="i-lucide-group" class="text-sky-600" size="24" />
            AD / Linux groups
          </div>
          <UTextarea v-model="groups" color="info" variant="subtle" :disabled="true" :cols="50" :rows="12" :maxrows="20" autoresize placeholder="empty" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { get, set } from '@vueuse/core'
import { ModalInfo } from '#components'

const props = defineProps<{
  instance: HCIE
  interops: interops[]
  account: account
  title?: string
  description?: string
}>()
const { Productions, loadProductions, endpoint, user } = useIrisSessions()
const overlay = useOverlay()
const isSystems = get(user)?.scope?.includes('systems')
const iris = ref(props.account)
const isAdm = ref(computed(() => get(iris).irisadm))
const isSys = ref(computed(() => get(iris).sysadm))
const emit = defineEmits<{ close: [boolean] }>()
const hcie = props.instance
const groups = ref(props.account.groups?.join(', '))
const items = ref([])
const note = ref('')

const table = useTemplateRef('table')
const data = ref([])
const columns: TableColumn<interops>[] = [
  {
    accessorKey: 'hs',
    header: 'Production',
    cell: ({ row }) => `${row.getValue('hs')}`
  },
  {
    accessorKey: 'scope',
    header: 'Scope'
  }
]
// const rowSelection = ref<Account>({})

async function submit() {
  await endpoint<Account>(hcie, `account/${get(iris).id}`, 'UPDATE', {
    access: get(iris).access,
    namespace: get(iris).namespace,
    irisadm: get(iris).irisadm,
    irisdev: get(iris).irisdev,
    sysadm: get(iris).sysadm
  }).then(async (result) => {
    if (result) {
      const modal = overlay.create(ModalInfo, { props: { title: `${get(iris).id} updated ${result?.status} ${result?.error || ''}` } })
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
