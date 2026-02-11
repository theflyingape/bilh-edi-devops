<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <IrisSelect
    v-model="instance"
    @change.prevent="loadAccounts(instance)"
  />
  <UCard v-model="Accounts[props.hcie]" variant="subtle">
    <template #default>
      <div class="font-bold font-sans underline">User Accounts</div>
      <UTable :data="data" :columns="columns" class="flex-1 h-80" />
    </template>
    <template #footer>
      <div class="flex font-mono justify-end italic text-sm">
        {{ instance }} <UIcon :name="ICON[props.hcie]!" class="align-middle size-5" />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
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
    accessorKey: 'name', header: '#',
    cell: ({ row }) => `#${row.getValue('name')}`
  },
  {
    accessorKey: 'comment', header: '#',
    cell: ({ row }) => `#${row.getValue('comment')}`
  }
]

async function loadAccounts(hcie: INSTANCE = props.hcie) {
  await endpoint(props.hcie, 'account/@').then((status) => {
    if (status) {
      Accounts.value[props.hcie] = <Account>status
      set(data, Object.keys(Accounts.value[props.hcie]!))
    }
  })
}

onMounted(async () => {
  await loadAccounts()
})
</script>
