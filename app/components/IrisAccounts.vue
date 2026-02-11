<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard v-model="Accounts[props.hcie]" variant="subtle">
    <template #default>
      <div class="flex justify-end space-x-2">
        <UIcon :name="ICON[instance!]" class="align-middle size-8" />
        <IrisSelect
          v-model="instance"
          @change.prevent="loadAccounts(instance)"
        />
      </div>
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
      <div class="text-start text-nowrap font-mono">
        {{ now }}
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui';
import { get, set } from '@vueuse/core'
import type { Account } from '~/composables/useIrisSessions';

const props = defineProps<{
  hcie: "Live" | "Test" | "Dev" //  instance identifier
}>()
const { ICON, endpoint, Accounts } = useIrisSessions()
const instance = defineModel<INSTANCE>('instance', { required: false })
const data = ref([])
const columns: TableColumn<Account>[] = [
  {
    accessorKey: 'id', header: 'id',
    cell: ({ row }) => `${row.getValue('id')}`
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
const now = useNow()

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
  await endpoint(hcie, 'account/@').then((status) => {
    if (status) {
      Accounts.value[hcie] = <Account>status
      set(data, Object.values(Accounts.value[hcie]!))
    }
  })
}

onMounted(async () => {
  set(instance, props.hcie)
  await loadAccounts()
})
</script>
