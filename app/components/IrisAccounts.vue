<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <IrisSelect
    v-model="instance"
    @change.prevent="loadAccounts(instance)"
  />
  <UCard v-model="Accounts[props.hcie]" variant="subtle">
    <template #default>
      <div class="font-bold font-sans underline">User Accounts</div>
      <UTable :data="data" :columns="columns" class="flex-1 h-full">
        <template #name-cell="{ row }">
          <div>
            <p class="font-medium text-highlighted">
              {{ row.original.name }}
            </p>
            <p>
              {{ row.original.comment }}
            </p>
          </div>
        </template>
        <template #action-cell="{ row }">
          <UDropdownMenu :items="getDropdownActions()">
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
      <div class="flex font-mono justify-end italic text-sm">
        {{ instance }} <UIcon :name="ICON[props.hcie]!" class="align-middle size-5" />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui';
import { get, set } from '@vueuse/core'
import type { Account } from '~/composables/useIrisSessions';

const props = defineProps<{
  hcie: 'Live' | 'Test' | 'Dev' //  instance identifier
}>()
const { ICON, endpoint, Accounts } = useIrisSessions()
const instance = defineModel<INSTANCE>('instance', { required: true })
const data = ref([])
const columns: TableColumn<Account>[] = [
  {
    accessorKey: 'id', header: 'id',
    cell: ({ row }) => `${row.getValue('name')}`
  },
  {
    accessorKey: 'name', header: 'name',
    cell: ({ row }) => `${row.getValue('name')}`
  },
  {
    accessorKey: 'lastlogin', header: 'last login',
    cell: ({ row }) => `${row.getValue('lastlogin')}`
  },
  {
    id: 'action'
  }
]

function getDropdownActions(): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-lucide-user-pen'
      },
      {
        label: 'Delete',
        icon: 'i-lucide-trash',
        color: 'error'
      }
    ]
  ]
}

async function loadAccounts(hcie: INSTANCE = props.hcie) {
  await endpoint(props.hcie, 'account/@').then((status) => {
    if (status) {
      Accounts.value[props.hcie] = <Account>status
      set(data, Object.values(Accounts.value[props.hcie]!))
    }
  })
}

onMounted(async () => {
  await loadAccounts()
})
</script>
