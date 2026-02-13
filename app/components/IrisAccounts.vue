<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard v-model="Accounts[props.hcie]" variant="subtle">
    <template #header>
      <div class="flex flex-nowrap justify-between items-center">
        <div class="text-lg text-fuchsia-900 text-start text-nowrap font-mono font-bold">
          IRIS: BILH Delegated Accounts &nbsp;
        </div>
        <div class="justify-end">
          <UIcon :name="ICON[instance!]" class="align-middle size-8" />
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
          <p class="font-medium text-highlighted">{{ row.original.name }}</p>
          <p>{{ row.original.comment }}</p>
        </template>
        <template #action-cell="{ row }">
          <UDropdownMenu v-if="row.original.id == rowSelection.id" :items="getDropdownActions()">
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="ghost"
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
import type { TableColumn, TableRow, DropdownMenuItem } from '@nuxt/ui';
import { get, set } from '@vueuse/core'
import type { Account } from '~/composables/useIrisSessions';
import IrisAccountEdit from './IrisAccountEdit.vue';

const props = defineProps<{
  hcie: "Live" | "Test" | "Dev" //  instance identifier
}>()
const dev = import.meta.dev || false
const { queryModal, response } = useDevOps()
const { ICON, endpoint, Accounts } = useIrisSessions()
const instance = defineModel<INSTANCE>('instance', { required: false })
const table = useTemplateRef('table')
const data = ref([])
const columns: TableColumn<Account>[] = [
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
    cell: ({ row }) => `${row.getValue('lastlogin')}`
  },
  {
    header: 'action'
  }
]
const rowSelection = ref<Account>({})
const now = useNow()

function getDropdownActions(): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-lucide-user-pen',
        async onSelect(e) {
          await accountModal()
        }
      },
      {
        label: 'Delete',
        icon: 'i-lucide-trash',
        color: 'error',
        async onSelect(e) {
          await queryModal(`OK to delete ${get(rowSelection).id}?`, `This drops the IRIS user's cached storage only, which is useful for trouble-shooting an issue and for hygiene.`)
          if(get(response)) {
            await endpoint(get(instance)!, `account/${get(rowSelection).id}`, 'DELETE')
            await loadAccounts()
          }
        }
      }
    ]
  ]
}

function onRowSelect(e: Event, row: TableRow<Account>|null) {
  try {
    table.value?.tableApi.resetRowSelection(false)
    if(row) {
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
      account: get(rowSelection),
      title: 'Delegated Account',
      description: get(rowSelection).id
    },
    destroyOnClose: true
  }).open()
}

async function loadAccounts() {
  if (dev) {
    set(data, [{id:'dev',name:'Devlin Opster',comment:'Master Inventor',lastlogin:'now', namespace:'%SYS', sysadm:1, shell:1},{id:'ops',name:'Cruella Deville',comment:'Original Gangster',lastlogin:'never', namespace:'BILHPN', analyst:1, admin:1}])
  }
  else {
    const hcie = get(instance)!
    await endpoint(hcie, 'account/@').then((status) => {
      if (status) {
        Accounts.value[hcie] = <Account>status
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
