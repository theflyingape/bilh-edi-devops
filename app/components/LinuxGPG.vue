<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard variant="subtle">
    <template #default>
      <div class="flex flex-col gap-2 items-start">
        <div class="w-5/6">
          <b>GPG</b> (GNU Privacy Guard) is a free, open-source cryptographic tool used to encrypt and sign data and communications. It is an implementation of the OpenPGP standard and serves as a compatible alternative to Symantec’s proprietary PGP software.
        </div>
        <div class="flex nowrap">
          <UIcon :name="icon(instance!)" class="align-middle size-8" />
          <IrisSelect v-model="instance" :epic="false" @change.prevent="loadKeys()" />
        </div>
        <UTable ref="table" sticky :data="data" :columns="columns" class="flex-1 max-h-[calc(72vh)]" :ui="{
          th: 'p-1',
          tr: 'even:bg-olive-50 odd:bg-taupe',
          td: 'p-2'
        }" @hover="onRowSelect">
          <template #id-cell="{ row }">
            <p class="font-mono">
              {{ row.original.id }}
            </p>
          </template>
          <template #name-cell="{ row }">
            <p class="font-medium text-highlighted">
              {{ row.original.name }}
            </p>
          </template>
          <template #trust-cell="{ row }">
            <p class="text-highlighted">
              {{ row.original.trust }}
            </p>
          </template>
          <template #action-cell="{ row }">
            <UDropdownMenu :disabled="row.original.id !== rowSelection?.id" :items="getDropdownActions()">
              <UButton class="disabled:bg-neutral-200 disabled:text-neutral-600" icon="i-lucide-ellipsis-vertical" color="action" variant="soft" aria-label="Actions" />
            </UDropdownMenu>
          </template>
        </UTable>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow, DropdownMenuItem } from '@nuxt/ui'
import { get, set } from '@vueuse/core'
import type { gpg, hcieResponse } from '~/composables/useIrisSessions'

const props = defineProps<{
  hcie: HCIE
}>()
const { ago, queryModal, response } = useDevOps()
const { icon, endpoint } = useIrisSessions()
const instance = defineModel<HCIE>('instance', { required: false })
const table = useTemplateRef('table')
const data = ref<gpg[]>([])
const columns: TableColumn<gpg>[] = [
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
    accessorKey: 'trust',
    header: 'trust',
    cell: ({ row }) => `${ago(row.getValue('lastlogin'))}`
  },
  {
    header: 'action'
  }
]
const rowSelection = ref<gpg>()

function getDropdownActions(): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-lucide-user-pen',
        async onSelect(_e) {
          await loadKeys()
        }
      },
      {
        label: 'Delete',
        icon: 'i-lucide-trash',
        color: 'error',
        async onSelect(_e) {
          await queryModal(`OK to delete ${get(rowSelection)?.id} from ${get(instance)}?`, `Edit to remove any ACTIVE roles first, as this drops the IRIS user's cached storage only. Dropping the account is useful for trouble-shooting an issue and for security hygiene.`)
          if (get(response)) {
            await endpoint(get(instance)!, `gpg/${get(rowSelection)?.id}`, 'DELETE')
            await loadKeys()
          }
        }
      }
    ]
  ]
}

function onRowSelect(e: Event, row: TableRow<gpg> | null) {
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

async function loadKeys() {
  if (useDevOps().dev) {
    set(data, [{ id: 'FFEEDDCC00112233', name: 'BILH IT (HCIETEST)', trust: 'u' }])
  } else {
    const hcie = get(instance)!
    await endpoint<hcieResponse<gpg[]>>(hcie, 'gpg').then((res) => {
      if (res && res.status == 'OK') {
        set(data, Object.values(res.data))
      }
    })
  }
}

onMounted(async () => {
  set(instance, props.hcie)
  await loadKeys()
})
</script>
