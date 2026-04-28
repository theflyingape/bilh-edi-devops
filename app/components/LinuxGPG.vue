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
          &nbsp;
          <UButton label="Import" icon="i-lucide-import" color="action" />
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
              {{ row.original.name }} ({{ row.original.alias || '- missing -' }})
            </p>
            <p class="font-mono">
              {{ row.original.email || '- missing -' }}
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
import { LinuxGPGEdit } from '#components'
import type { TableColumn, TableRow, DropdownMenuItem } from '@nuxt/ui'
import { get, set } from '@vueuse/core'
import type { gpg, hcieResponse } from '~/composables/useIrisSessions'

const props = defineProps<{
  hcie: HCIE
}>()

const { queryModal, response } = useDevOps()
const { icon, endpoint } = useIrisSessions()
const instance = defineModel<HCIE>('instance', { required: false })
const toast = useToast()

const table = useTemplateRef('table')
const data = ref<gpg[]>([])
const columns: TableColumn<gpg>[] = [
  {
    accessorKey: 'id',
    header: 'key id'
  },
  {
    accessorKey: 'name',
    header: 'name (alias) / email'
  },
  {
    accessorKey: 'trust',
    header: 'trust'
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
        icon: 'i-lucide-notebook-pen',
        color: 'secondary',
        async onSelect(_e) {
          await editKey(get(rowSelection)!.id)
        }
      },
      {
        label: 'Export',
        icon: 'i-lucide-file-output',
        color: 'primary',
        async onSelect(_e) {
          navigator.clipboard.writeText(get(rowSelection)!.pubkey || '-no public key-')
          toast.add({ title: `Fingerprint ${get(rowSelection)!.id}`, description: `Public key copied` })
        }
      },
      {
        label: 'Expire',
        icon: 'i-lucide-git-pull-request-closed',
        color: 'neutral',
        async onSelect(_e) {
          await queryModal(`OK to expire ${get(rowSelection)?.name} from ${get(instance)}?`, `The key is not removed -- only marked as expired.`)
          if (get(response)) {
            await endpoint(get(instance)!, `gpg/${get(rowSelection)?.id}`, 'UPDATE')
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
    set(data, [{ id: 'FFEEDDCC00112233', name: 'BILH IT', alias: 'HCIETEST', email: 'nobody@mail.com', trust: 'u' }])
  } else {
    const hcie = get(instance)!
    await endpoint<hcieResponse<gpg[]>>(hcie, 'gpg').then((res) => {
      if (res && res.status == 'OK') {
        set(data, Object.values(res.data))
      }
    })
  }
}

const pubKey = ref('')

async function editKey(id: string) {
  interface getKey {
    id: string
    pubKey: string
  }
  await endpoint<hcieResponse<getKey>>(get(instance)!, `gpg/${id}`).then(async (result) => {
    set(pubKey, result?.data.pubKey || 'got this instead')
    await useOverlay().create(LinuxGPGEdit, {
      props: {
        title: `${get(instance)} :: Public key ${get(rowSelection)?.id}`,
        pubkey: get(pubKey)
      },
      destroyOnClose: true
    }).open()
  })
}

onMounted(async () => {
  set(instance, props.hcie)
  await loadKeys()
})
</script>
