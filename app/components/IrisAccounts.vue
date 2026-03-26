<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard v-model="Accounts[hcie]" variant="subtle">
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
      <UTable ref="table" :data="data" :columns="columns" :rows="Accounts" class="flex-1" @hover="onRowSelect">
        <template #name-cell="{ row }">
          <p class="font-medium text-highlighted">
            {{ row.original.name }}
          </p>
          <p>{{ row.original.comment }}</p>
        </template>
        <template #action-cell="{ row }">
          <UDropdownMenu v-if="row.original.id == rowSelection?.id" :items="getDropdownActions()">
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="action"
              variant="subtle"
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
import type { account, hcieAccount } from '~/composables/useIrisSessions'
import IrisAccountEdit from './IrisAccountEdit.vue'

const props = defineProps<{
  hcie: HCIE
}>()
const { ago, queryModal, response } = useDevOps()
const { icon, endpoint, Accounts } = useIrisSessions()
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
const interops = ref<interops[]>([])
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
        }
      },
      {
        label: 'Delete',
        icon: 'i-lucide-trash',
        color: 'error',
        async onSelect(e) {
          await queryModal(`OK to delete ${get(rowSelection)?.id}?`, `Edit to remove any active roles first, as this drops the IRIS user's cached storage only. Dropping the account is useful for trouble-shooting an issue and for security hygiene.`)
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
  }
  catch(err) {
    console.error(err)
  }
}

async function accountModal() {
  await useOverlay().create(IrisAccountEdit, {
    props: {
      instance: get(instance)!,
      interops: interops,
      account: get(rowSelection)!,
      title: 'BILH Delegated Account',
      description: get(rowSelection)?.id
    },
    destroyOnClose: true
  }).open()
}

async function loadAccounts() {
  if (useDevOps().dev) {
    set(data, [{ id: 'dev', groups: ['wheel', 'user'], access: [], name: 'Devlin Opster', comment: 'Master Inventor', enabled: true, lastlogin: 'now', namespace: '%SYS', irisdev: true, irisadm: false, sysadm: true }, { id: 'ops', groups: [], access: [], name: 'Cruella Deville', comment: 'Original Gangster', enabled: true, lastlogin: 'never', namespace: 'BILHPN', irisdev: true, irisadm: true, sysadm: false }])
  } else {
    const hcie = get(instance)!
    await endpoint<hcieAccount>(hcie, 'account/@').then((res) => {
      if (res && res.status == 'OK' && res.data) {
        set(interops, res?.interops)
        Accounts.value[hcie] = [...res.data]
        set(data, Object.values(Accounts.value[hcie]!))
      }
    })
  }
}

onMounted(async () => {
  set(instance, props.hcie)
  await loadAccounts()
})
</script>
