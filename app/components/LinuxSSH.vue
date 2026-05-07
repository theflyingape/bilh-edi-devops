<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard variant="subtle">
    <template #default>
      <div class="flex flex-col gap-4 items-start">
        <div class="flex items-end nowrap">
          <UButton label="Import" icon="i-lucide-import" color="action" @click.prevent="editKey(true)" />
          <USeparator class="h-16 ml-4 mr-2" color="neutral" orientation="vertical" size="lg" />
          <div class="max-w-1/2">
            <b>SSH</b> (Secure Shell) generates and manages authentication keys. It creates a pair of cryptographic keys: a private key (stored on the client-side) and a public key (placed on the server for the client to access). This panel provides additional operations and lifecycle management tasks.
          </div>
        </div>
        <UTable ref="table" sticky :data="data" :columns="columns" class="flex-1 max-h-[calc(72vh)]" :ui="{
          th: 'p-1',
          tr: 'even:bg-olive-50 odd:bg-taupe',
          td: 'p-2'
        }" @hover="onRowSelect"
        >
          <template #name-cell="{ row }">
            <span class="font-mono">{{ row.original.production }}</span> :: <span class="font-medium text-highlighted">{{ row.original.name }}</span>
            <p class="text-xs">
              {{ row.original.fingerprint || 'legacy' }}
            </p>
          </template>
          <template #admin-cell="{ row }">
            <span class="font-medium text-highlighted">{{ row.original.admin }}</span>: {{ row.original.contact || '- missing -' }}
            <p class="text-xs">
              {{ row.original.comment || '- missing -' }}
            </p>
          </template>
          <template #created-cell="{ row }">
            <p class="font-mono">
              {{ row.original.created }}
            </p>
          </template>
          <template #reviewby-cell="{ row }">
            <p class="font-mono">
              <UChip :color="expiry(row.original.reviewby!)">
                {{ row.original.reviewby ? useTimeAgo(row.original.reviewby) : 'never' }}
              </UChip>
            </p>
          </template>
          <template #action-cell="{ row }">
            <UDropdownMenu :disabled="row.original.name !== rowSelection?.name" :items="getDropdownActions()">
              <UButton class="disabled:bg-neutral-200 disabled:text-neutral-600" icon="i-lucide-ellipsis-vertical" color="action" variant="soft" aria-label="Actions" />
            </UDropdownMenu>
          </template>
        </UTable>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { LinuxSSHEdit } from '#components'
import type { TableColumn, TableRow, DropdownMenuItem } from '@nuxt/ui'
import { get, set } from '@vueuse/core'
import type { ssh, hcieResponse } from '~/composables/useIrisSessions'

const { queryModal, response } = useDevOps()
const { endpoint } = useIrisSessions()
const toast = useToast()

const instance = 'Dev'
const table = useTemplateRef('table')
const data = ref<ssh[]>([])
const columns: TableColumn<ssh>[] = [
  {
    accessorKey: 'name',
    header: 'name / fingerprint'
  },
  {
    accessorKey: 'admin',
    header: 'admin: contact'
  },
  {
    accessorKey: 'created'
  },
  {
    accessorKey: 'reviewby',
    header: 'review by'
  },
  {
    header: 'action'
  }
]
const rowSelection = ref<ssh>()

function expiry(ds: string): 'neutral' | 'primary' | 'secondary' | 'warning' {
  if (ds) {
    const when = new Date(ds).valueOf()
    const days = Math.round((when - get(useNow()).getDate()) / 86400000)
    if (days < 31) return 'warning'
    if (days < 62) return 'secondary'
    return 'primary'
  }
  return 'neutral'
}

function getDropdownActions(): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-lucide-notebook-pen',
        color: 'secondary',
        async onSelect(_e) {
          await editKey()
        }
      },
      {
        label: 'Email',
        icon: 'i-lucide-mail',
        color: 'primary',
        async onSelect(_e) {
          const label = `${get(rowSelection)!.admin} ${get(rowSelection)!.comment ? '(' + get(rowSelection)!.comment + ')' : ''} ${get(rowSelection)!.contact ? '<' + get(rowSelection)!.contact + '>' : ''}`
          navigator.clipboard.writeText(`${label}\n\n` + (get(rowSelection)!.name + '\n'))
          toast.add({ title: `Public key copied`, description: `` })
        }
      },
      {
        label: 'Retire',
        icon: 'i-lucide-git-pull-request-closed',
        color: 'error',
        async onSelect(_e) {
          await queryModal(`OK to retire ${get(rowSelection)?.name} (${get(rowSelection)?.comment}) from ${instance}?`, `The keypair is preserved if a recall is required.`)
          if (get(response)) {
            await endpoint(instance, `ssh/${get(rowSelection)?.name || get(rowSelection)?.name}`, 'DELETE')
            await loadKeys()
          }
        }
      }
    ]
  ]
}

function onRowSelect(e: Event, row: TableRow<ssh> | null) {
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
    set(data, [{ production: 'BILHSFTP', name: 'GoAnywhere', fingerprint: 'SHA256:hXxNzwhEE5OL/HXEcPUxwM5aupKm9A9ZjwheNlA2W2Y', account: 'BILH-Healthconnect', asset: 'sftp.bilh.org', admin: 'BILH IT', contact: 'nobody@mail.com', comment: 'key comment', created: get(useNow()).toLocaleDateString(), reviewby: new Date(get(useNow()).setFullYear(get(useNow()).getFullYear() + 1)).toLocaleDateString() }])
  } else {
    set(data, [])
    await endpoint<hcieResponse<ssh[]>>(instance, 'ssh').then((res) => {
      if (res && res.status == 'OK') {
        set(data, Object.values(res.data))
      }
    })
  }
}

async function editKey(generate = false) {
  let key: ssh = {}
  if (!generate) key = {
    production: get(rowSelection)?.production,
    name: get(rowSelection)?.name,
    account: get(rowSelection)?.account,
    admin: get(rowSelection)?.admin,
    contact: get(rowSelection)?.contact,
    comment: get(rowSelection)?.comment,
    created: get(rowSelection)?.created,
    reviewby: get(rowSelection)?.reviewby
  }

  await useOverlay().create(LinuxSSHEdit, {
    props: {
      title: `SSH key`,
      description: key.name || 'import new key',
      hcie: instance,
      ssh: key
    },
    destroyOnClose: true
  }).open()
  await loadKeys()
}

onMounted(async () => {
  await loadKeys()
})
</script>
