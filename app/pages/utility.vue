<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/singleline-html-element-content-newline -->
<template>
  <div class="flex justify-center">
    <div class="w-5/6">
      <span class="font-medium text-lg text-info-500">Utility</span>
      <USeparator />
      <UTabs v-model="utilityTab" orientation="vertical" :items="utilityItems" class="items-start" size="xl" color="info" variant="link" :ui="{ list: 'items-start' }">
        <template #base64>
          <UCard class="m-2" variant="subtle">
            <template #default>
              <div class="flex flex-row">
                <div class="w-80">
                  <b>Base64</b> (<i>also known as tetrasexagesimal</i>) is a group of binary-to-text encoding
                  schemes that transforms binary data into a sequence of printable characters.
                </div>
                <div>
                  <UButton class="m-4 h-12 w-24" @click="open64">Choose file …</UButton>
                </div>
                <div class="w-5/6">
                  <div class="flex flex-row justify-start">
                    <div class="w-full">
                      <UTextarea v-model="ascii" class="font-mono w-full" color="neutral" autoresize :rows="5" :maxrows="20" placeholder="… or paste binary/text data …" />
                    </div>
                    <div class="flex flex-col justify-start">
                      <UButton size="sm" icon="i-lucide-clipboard-x" color="neutral" variant="link" @click="ascii=''" />
                      <UButton :color="cAscii ? 'success' : 'neutral'" :icon="cAscii ? 'i-lucide-copy-check' : 'i-lucide-copy'" variant="link" size="sm" @click="copy(ascii, 'ascii')" />
                    </div>
                  </div>
                  <div>&nbsp;</div>
                  <div class="flex flex-row justify-start">
                    <div class="w-full">
                      <UTextarea v-model="b64" class="font-mono w-full" color="info" autoresize :rows="5" :maxrows="20" placeholder="base64 encoded …" disabled />
                    </div>
                    <div class="flex flex-col justify-start">
                      <UButton size="sm" icon="i-lucide-clipboard-x" color="neutral" variant="link" @click="ascii=''" />
                      <UButton :color="cB64 ? 'success' : 'neutral'" :icon="cB64 ? 'i-lucide-copy-check' : 'i-lucide-copy'" variant="link" size="sm" @click="copy(b64, 'b64')" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </UCard>
        </template>
        <template #getent>
          <UCard class="m-2 w-full" variant="subtle">
            <template #default>
              <div class="flex flex-row gap-2 items-start justify-between">
                <UInput v-model="input" class="m-2 w-120" placeholder="hostname or ip address" />
                <div>
                  <UButton class="h-12 w-24" color="info" variant="subtle" icon="i-vscode-icons-file-type-search-result" loading-auto @click.prevent="getent(input)">Lookup</UButton>
                </div>
                <UTextarea v-model="ascii" class="font-mono w-5/6" color="neutral" autoresize :rows="10" :maxrows="25" placeholder="DNS lookup with any port scan results …" />
              </div>
            </template>
          </UCard>
        </template>
        <template #sftp>
          <UCard class="m-2" variant="subtle">
            <template #default>
              <div class="flex flex-row justify-center">
                <div class="w-1/3">
                  <div>
                    <b>SFTP</b> (<i>Secure File Transfer Protocol)</i> is a secure method for transferring files
                    between a local computer and a remote server over a network. It is built on top of the SSH protocol,
                    providing encryption and authentication to <b>protect data during transfer</b>.
                  </div>
                </div>
                <div class="w-full">
                  <UStepper ref="stepper" :items="items">
                    <template #start>
                      <Placeholder class="aspect-video">
                        <div class="flex flex-row justify-center">
                          <IrisProduction v-model:instance="Instance" v-model:production="Production" />
                          <UCard class="grid grid-flow-row auto-rows-max max-w-1/4">
                            <template #header>
                              Client connection requirements
                            </template>
                            <template #default>
                              <UInputMenu v-model="sftpEndpoint" placeholder="enter or pick endpoint" create-item :items="sftpEndpoints" @create="onCreateSftp" />
                              <UInputMenu v-model="sftpUsername" placeholder="username" create-item :items="sftpUsernames" @create="onCreateUsername" />
                              <UInputMenu v-model="sftpPassword" placeholder="password" create-item :items="sftpPasswords" @create="onCreatePassword" />
                              <UInputMenu v-model="sftpKeyfile" placeholder="keyfile" create-item :items="sftpKeyfiles" @create="onCreateKeyfile" />
                            </template>
                          </UCard>
                        </div>
                      </Placeholder>
                    </template>
                    <template #test>
                      <Placeholder class="aspect-video">
                        test
                      </Placeholder>
                    </template>
                    <template #review>
                      <Placeholder class="aspect-video">
                        <URadioGroup v-model="xfer" :items="xfers" />
                      </Placeholder>
                    </template>
                  </UStepper>

                  <div class="flex gap-2 justify-between mt-4">
                    <UButton leading-icon="i-lucide-arrow-left" :disabled="!stepper?.hasPrev" @click="stepper?.prev()">
                      Prev
                    </UButton>
                    <UButton trailing-icon="i-lucide-arrow-right" :disabled="!stepper?.hasNext" @click="stepper?.next()">
                      Next
                    </UButton>
                  </div>
                </div>
              </div>
            </template>
          </UCard>
        </template>
      </UTabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { get, set, useFileSystemAccess } from '@vueuse/core'
import type { InputMenuItem, RadioGroupItem, RadioGroupValue, StepperItem } from '@nuxt/ui'
const { endpoint } = useIrisSessions()


definePageMeta({
  auth: false,
  pageTransition: { name: 'page', mode: 'out-in' }
})

//  UTILITY navigation tabs
const utilityItems = ref<TabsItem[]>([
  {
    label: 'Base64',
    icon: 'i-flat-color-icons:data-protection',
    slot: 'base64',
    value: 'base64',
    ui: { label: 'hover:bg-emerald-100' }
  },
  {
    label: 'DNS',
    icon: 'i-flat-color-icons-broken-link',
    slot: 'getent',
    value: 'getent',
    ui: { label: 'hover:bg-red-100' }
  },
  {
    label: 'SFTP',
    icon: 'i-flat-color-icons-in-transit',
    slot: 'sftp',
    value: 'sftp',
    ui: { label: 'hover:bg-amber-100' }
  },
])

const utilityTab = ref('getent')
const file = useFileSystemAccess({ excludeAcceptAllOption: false })
const input = ref('')

// Base64
const ascii = ref('')
const cAscii = ref(false)
const { base64: b64 } = useBase64(ascii)
const cB64 = ref(false)

function copy(text: string, clip: string) {
  navigator.clipboard.writeText(text)
  const copied = clip == 'ascii' ? cAscii : clip == 'b64' ? cB64 : undefined
  set(copied!, true)

  setTimeout(() => {
    set(copied!, false)
  }, 2000)
}

async function open64() {
  await file.open()
  set(ascii, file.data.value)
}

// DNS
async function getent(net = 'localhost') {
  interface getent {
    ip: string
    hosts: string[]
    nmap: string
  }

  interface response {
    status: string
    hostName: string
    instance: string
    systemMode: string
    result?: getent
    error?: string
  }

  await endpoint<response>('Test', `getent/${net}`).then((res) => {
    let result = res?.status + ': '
    if (res?.error) {
      result += res.error
    }
    else if (res?.result) {
      result += res.result.ip + '\n'
      result += res.result.hosts.toString()
      result += '\n==================\n'
      result += res.result.nmap
    }
    set(ascii, result)
  })
}

// SFTP
const items: StepperItem[] = [
  {
    slot: 'start' as const,
    title: 'SFTP',
    description: 'Start here for essentials'
  }, {
    slot: 'test' as const,
    title: 'Unit-test',
    description: 'Validate access to endpoint'
  }, {
    slot: 'review' as const,
    title: 'Review',
    description: 'Summarize config to build interface'
  }
]

const { InstanceDefault } = useIrisSessions()
const Instance = ref(InstanceDefault)
const Production = ref('')
const sftpEndpoint = ref('')
const sftpEndpoints = ref(<string[]>[])
const sftpUsername = ref('')
const sftpUsernames = ref(<string[]>[])
const sftpPassword = ref('')
const sftpPasswords = ref(<string[]>[])
const sftpKeyfile = ref('')
const sftpKeyfiles = ref(<string[]>[])

const stepper = useTemplateRef('stepper')
const xfers = ref<RadioGroupItem[]>(['Pick-up', 'Drop-off'])
const xfer = ref<RadioGroupValue>('Pick-up')

function onCreateSftp(endpoint: string) {
  get(sftpEndpoints).push(endpoint)
  set(sftpEndpoint, endpoint)
}

function onCreateUsername(username: string) {
  get(sftpUsernames).push(username)
  set(sftpUsername, username)
}

function onCreatePassword(password: string) {
  get(sftpPasswords).push(password)
  set(sftpPassword, password)
}

function onCreateKeyfile(keyfile: string) {
  get(sftpKeyfiles).push(keyfile)
  set(sftpKeyfile, keyfile)
}
</script>
