<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard variant="subtle">
    <template #header>
      <div class="flex flex-nowrap justify-between items-center">
        <div class="text-lg text-fuchsia-900 text-start text-nowrap font-mono font-bold">
          IRIS: BILH Delegated Accounts &nbsp;
        </div>
        <div class="justify-end">
          <UIcon :name="icon(instance!)" class="align-middle size-8" />
          <IrisSelect
            v-model="instance"
            @change.prevent="loadAccounts()"
          />
        </div>
      </div>
    </template>
    <template #default>
      <UTable
        ref="table"
        sticky
        :data="data"
        :columns="columns"
        class="flex-1 max-h-[calc(72vh)]"
        :ui="{
          th: 'p-1',
          tr: 'even:bg-olive-50 odd:bg-taupe',
          td: 'p-2'
        }"
        @hover="onRowSelect"
      >
        <template #id-cell="{ row }">
          <p class="font-mono text-lg">
            {{ row.original.id }}
          </p>
        </template>
        <template #name-cell="{ row }">
          <p class="font-medium text-highlighted">
            {{ row.original.name }}
          </p>
          <p>{{ row.original.comment }}</p>
        </template>
        <template #lastlogin-cell="{ row }">
          <p class="text-highlighted">
            {{ ago(row.original.lastlogin) || 'never' }}
          </p>
        </template>
        <template #action-cell="{ row }">
          <UDropdownMenu :disabled="row.original.id !== rowSelection?.id" :items="getDropdownActions()">
            <UButton
              class="disabled:bg-neutral-200 disabled:text-neutral-600"
              icon="i-lucide-ellipsis-vertical"
              color="action"
              variant="soft"
              aria-label="Actions"
            />
          </UDropdownMenu>
        </template>
      </UTable>
    </template>
    <template #footer>
      <div class="flex font-mono text-stone-600 text-sm text-start text-nowrap justify-end">
        {{ now.toString().split(' ')[0] }} {{ now.toLocaleString() }}
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow, DropdownMenuItem } from '@nuxt/ui'
import { get, set } from '@vueuse/core'
import type { account, hcieResponse } from '~/composables/useIrisSessions'
import IrisAccountEdit from './IrisAccountEdit.vue'

const props = defineProps<{
  hcie: HCIE
}>()
const { ago, queryModal, response } = useDevOps()
const { icon, endpoint } = useIrisSessions()
const instance = defineModel<HCIE>('instance', { required: false })
const table = useTemplateRef('table')
const data = ref<account[]>([])
const columns: TableColumn<account>[] = [
  {
    accessorKey: 'id',
    header: 'id',
    cell: ({ row }) => `${row.getValue('id')}`
  },
  {
    header: 'name',
    cell: ({ row }) => `${row.getValue('name')}`
  },
  {
    accessorKey: 'lastlogin',
    header: 'last login',
    cell: ({ row }) => `${ago(row.getValue('lastlogin'))}`
  },
  {
    header: 'action'
  }
]
const rowSelection = ref<account>()
const now = useNow()

function getDropdownActions(): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-lucide-user-pen',
        async onSelect(_e) {
          await accountModal()
          await loadAccounts()
        }
      },
      {
        label: 'Delete',
        icon: 'i-lucide-trash',
        color: 'error',
        async onSelect(_e) {
          await queryModal(`OK to delete ${get(rowSelection)?.id} from ${get(instance)}?`, `Edit to remove any ACTIVE roles first, as this drops the IRIS user's cached storage only. Dropping the account is useful for trouble-shooting an issue and for security hygiene.`)
          if (get(response)) {
            await endpoint(get(instance)!, `account/${get(rowSelection)?.id}`, 'DELETE')
            await loadAccounts()
          }
        }
      }
    ]
  ]
}

function onRowSelect(e: Event, row: TableRow<account> | null) {
  try {
    table.value?.tableApi.resetRowSelection(false)
    if (row) {
      set(rowSelection, row.original)
      row.toggleSelected(true)
    }
  } catch (err) {
    console.error(err)
  }
}

async function accountModal() {
  await useOverlay().create(IrisAccountEdit, {
    props: {
      instance: get(instance)!,
      account: get(rowSelection)!,
      title: `${get(instance)} :: BILH Delegated Account`,
      description: `User id: ${get(rowSelection)?.id}`
    },
    destroyOnClose: true
  }).open()
}

async function loadAccounts() {
  if (useDevOps().dev) {
    const items = ['DEV', 'GUEST', 'OPS']
    set(data, [{ id: 'dev', groups: ['wheel', 'user'], irisdev: true, irisadm: false, sysadm: true, access: [{ hs: 'BIDMC', value: 'GUEST', items: items }, { hs: 'BILH', value: 'DEV', items: items }, { hs: 'DFCI', value: '', items: items }, { hs: 'LAHEY', value: '', items: items }, { hs: 'SFTP', value: '', items: items }, { hs: 'WORKDAY', value: '', items: items }], namespace: '%SYS', name: 'Devlin Opster', comment: 'Master Inventor', enabled: true, lastlogin: new Date().toDateString() + ' ' + new Date().toLocaleTimeString() }, { id: 'ops', groups: ['user'], irisdev: true, irisadm: true, sysadm: false, access: [{ hs: 'BIDMC', value: 'GUEST', items: items }, { hs: 'BILH', value: 'DEV', items: items }], namespace: 'BILHPN', name: 'Cruella Deville', comment: 'Original Gangster', enabled: true, lastlogin: '' }])
  } else {
    const hcie = get(instance)!
    await endpoint<hcieResponse<account>>(hcie, 'account/@').then((res) => {
      if (res && res.status == 'OK') {
        set(data, Object.values(res.data))
      }
    })
  }
}

onMounted(async () => {
  set(instance, props.hcie)
  await loadAccounts()
})
</script>
