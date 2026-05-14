<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard variant="subtle">
    <template #default>
      <div class="flex flex-col gap-4 items-start">
        <div class="flex items-end nowrap">
          <UButton label="Create" icon="i-lucide-import" color="action" @click.prevent="editKey(true)" />
          <USeparator class="h-16 ml-4 mr-2" color="neutral" orientation="vertical" size="lg" />
          <div class="max-w-3/5">
            <b>SSH</b> (Secure Shell) generates and manages authentication keys. It creates a pair of cryptographic
            keys: a private key (<i>stored on the client-side</i>) and a public key (<i>placed on the server for the client to access</i>).<br>
            This panel provides additional operations and lifecycle management tasks.
          </div>
        </div>
        <UTable ref="table" :loading="loading" loading-color="error" loading-animation="swing" sticky :data="data" :columns="columns" class="flex-1 max-h-[calc(72vh)]" :ui="{
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
              {{ row.original.comment || 'empty' }}
            </p>
          </template>
          <template #reviewby-cell="{ row }">
            <UChip :color="row.original._expiry">
              <UBadge :color="row.original._expiry" :variant="row.original._expiry == 'primary' ? 'ghost' : 'soft'">
                <span class="font-medium text-highlighted">{{ row.original.reviewby ? formatTimeAgo(new Date(row.original.reviewby)) : 'never' }}</span>
              </UBadge>
            </UChip>
            <p class="font-mono text-xs">
              {{ row.original.created }}
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
import { formatTimeAgo, get, set, useNow, useDateFormat } from '@vueuse/core'
import type { ssh, hcieResponse } from '~/composables/useIrisSessions'

const { queryModal, response } = useDevOps()
const { endpoint, user } = useIrisSessions()
const toast = useToast()

const instance = 'Dev'
const loading = ref(false)
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
    accessorKey: 'reviewby',
    header: 'review by'
  },
  {
    header: 'action'
  }
]
const rowSelection = ref<ssh>()

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
        label: 'Copy fields',
        icon: 'i-heroicons-clipboard',
        color: 'primary',
        async onSelect(_e) {
          let account = ''
          if (get(rowSelection)!.account)
            account += ` for account: ${get(rowSelection)!.account}`

          let contact = ''
          if (get(rowSelection)!.admin)
            contact += get(rowSelection)!.admin
          if (get(rowSelection)!.contact)
            contact += ' ' + get(rowSelection)!.contact
          if (contact)
            contact = `Contact info: ${contact}`

          let header = `SSH key: ${get(rowSelection)!.name}.pub${account}\n\nFingerprint: ${get(rowSelection)!.fingerprint}\n\n${contact}`
          //  text/plain
          const plainString = `${header}Public key:\n${get(rowSelection)!.pubkey}\n`

          account = ''
          if (get(rowSelection)!.account)
            account += ` <b>for account</b>: <code>${get(rowSelection)!.account}</code>`

          contact = ''
          if (get(rowSelection)!.admin)
            contact += `<b>${get(rowSelection)!.admin}</b>`
          if (get(rowSelection)!.contact)
            contact += ' ' + get(rowSelection)!.contact
          if (contact)
            contact = `Contact info: ${contact}`

          header = `<p><b>SSH key</b>: <code>${get(rowSelection)!.name}.pub</code>${account}</p><p><b>Fingerprint</b>: <code>${get(rowSelection)!.fingerprint}</code></p><p>${contact}</p>`
          //  text/html
          const htmlString = `${header}<p><b>Public key</b>:<br><code>${get(rowSelection)!.pubkey}</code></p>`

          // Create blobs for both rich and plain versions
          const blobHtml = new Blob([htmlString], { type: "text/html" })
          const blobText = new Blob([plainString], { type: "text/plain" })
          // Create the ClipboardItem
          const data = [
            new ClipboardItem({
              ['text/html']: blobHtml, ['text/plain']: blobText
            })
          ]
          navigator.clipboard.write(data)
          toast.add({ title: `Public key copied`, description: `with supporting fields` })
        }
      },
      {
        label: 'Retire',
        icon: 'i-lucide-git-pull-request-closed',
        color: 'error',
        async onSelect(_e) {
          await queryModal(`OK to retire ${get(rowSelection)?.name} (${get(rowSelection)?.comment}) from SSH keys?`, `The keypair is moved into retired if a recall is required.`)
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

function expiry(ds: string | undefined): 'neutral' | 'primary' | 'warning' | 'error' {
  if (ds) {
    const when = new Date(ds).valueOf()
    const days = Math.round((when - get(useNow()).valueOf()) / 86400000)
    if (days < 31) return 'error'
    if (days < 62) return 'warning'
    return 'primary'
  }
  return 'neutral'
}

async function loadKeys() {
  set(loading, true)
  set(data, [])
  if (useDevOps().dev) {
    set(data, [{ production: 'BILHWORKDAY', name: 'GoAnywhere.rsa', fingerprint: 'SHA256:hXxNzwhEE5OL/HXEcPUxwM5aupKm9A9ZjwheNlA2W2Y', account: 'BILH-Healthconnect', asset: 'sftp.bilh.org', admin: 'BILH IT', contact: 'nobody@mail.com', comment: 'key comment', created: '2026-06-18', reviewby: '2031-07-31', interfaces: ['bsGoAExeterTimecardPickupSftp', 'boGoATimecardDropoffSftp'], comments: ['comment 1', 'comment 2'], pubkey: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDq58x03c52w90UGjnjQ35OU65W14XBoLEC407ShqqKqttAib8nnNP1ZC9hp64+9b354/dN0GCe2hFVc4qKyfIlm1s1ZYq2DXKvtu4ug98q4nvMf9koD7ioOsYuC7Zc69bCZu4OsLX/HjB7H/PXmvKdyHUQ43Q9Gja+XmNEkG4MoqabudN7XB3BVW+05wA+s4LQqakQFMjG1BWb9rGhF2NJkYq0FwlP7AnX3q8exqkzKibqR07YcxtFy/oSJEXmBM5fLfCD5xVQeff5wgwb4vpjC+FX9ebMcYWoT+lRCPx26awECwhfdB3HfhciT0NeHF6rqCYmK+qooWc8fSm9emF0Ys2zTdywqM8UGELeBMWxaMLn5QmP0ZWKLdeWCHxQyMTEqwVy0NP7OsasIzMQMRAha5QYL4weTFhc4fP7LjfrXux80APtuIhkGdEfwaAPnSUL3J7xLG9Y6IATmSvDipC2pbcWZcGVn8VQ5SfGvQFQqd9TIj9Y0sShgkaq1B32qiyxKPLr6xb8m2xl7Wei39a1k1lWFinrMpfGFBPfvvD7cI3YcSrPxG6wsDK/m/loIxtr8RltqT/ruO9p5C0+hiCshTHuTYME9cdMkbTtJmFCo9n997/nB2ODVX1mtuicve/zpaNAgAD1TeWW3JruPS8EYpB68A1LAWWtYze35nDanQ== theflyingape@beelink' }, { production: 'BILHSFTP', name: 'BILH-TDBank.rsa', fingerprint: 'SHA256:hXxNzwhEE5OL/HXEcPUxwM5aupKm9A9ZjwheNlA2W2Z', account: 'BILH-Healthconnect', asset: 'sftp.bilh.org', admin: 'BILH IT', contact: 'nobody@mail.com', comment: 'another key comment', created: '2026-01-03', reviewby: '2026-06-18' }])
  } else {
    await endpoint<hcieResponse<ssh[]>>(instance, 'ssh').then((res) => {
      if (res && res.status == 'OK') {
        set(data, Object.values(res.data))
      }
    })
  }
  set(loading, false)
  //  add any expiry decoration
  set(data, get(data).map(key => ({
    ...key,
    _expiry: expiry(key.reviewby)
  })))
  data.value.sort((a, b) => {
    return (
      a.production?.localeCompare(b.production || '')
      || a.name?.localeCompare(b.name || '')
    )
  })
}

async function editKey(generate = false) {
  let key: ssh = {
    production: '',
    name: '',
    fingerprint: '',
    account: '',
    asset: '',
    admin: '',
    contact: '',
    comment: '',
    who: get(user).id,
    created: get(useDateFormat(useNow(), 'YYYY-MM-DD')),
    reviewby: get(useDateFormat(useNow().value.valueOf() + 365 * 86400000, 'YYYY-MM-DD')),
    pubkey: '',
    interfaces: [],
    comments: []
  }
  if (!generate) key = {
    production: get(rowSelection)?.production || '',
    name: get(rowSelection)?.name || '',
    fingerprint: get(rowSelection)?.fingerprint || '',
    account: get(rowSelection)?.account || '',
    asset: get(rowSelection)?.asset || '',
    admin: get(rowSelection)?.admin || '',
    contact: get(rowSelection)?.contact || '',
    comment: get(rowSelection)?.comment || '',
    created: get(rowSelection)?.created || '',
    who: get(rowSelection)?.who || get(user).id,
    reviewby: get(rowSelection)?.reviewby || '',
    pubkey: get(rowSelection)?.pubkey || '',
    interfaces: get(rowSelection)?.interfaces || [],
    comments: get(rowSelection)?.comments || []
  }

  await useOverlay().create(LinuxSSHEdit, {
    props: {
      title: `SSH key`,
      description: (key.name || 'create new key') + ` per ${key.who}`,
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
