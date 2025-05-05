<template>
  <div ref="monitor" class="bg-zinc-200 min-h-dvh h-dvh min-w-full w-full">
    <div class="flex flex-nowrap h-full w-full justify-center pt-2">
      <!-- monitor with a thin bezel -->
      <div ref="crt" class="bg-zinc-800 p-3 pb-8 rounded-md min-w-5/12 w-5/6 max-w-11/12 min-h-1/2 h-11/12 max-h-11/12 overflow-hidden resize resizer">
        <ClientOnly>
          <DevOnly><XtermJs v-show="value == 'localhost'" @vue:mounted="console.log('mounted!')" session="localhost" theme="White" :wsUrl="`${wsUrl}`" :fontSize=save.fontSize /></DevOnly>
          <XtermJs v-show="value == 'Development'" @vue:mounted="" session="Development" theme="White" :wsUrl="`${wsUrl}`" :fontSize=save.fontSize />
          <XtermJs v-show="value == 'Test'" @vue:mounted="" session="Test" theme="Green" :wsUrl="`${wsUrl}`" :fontSize=save.fontSize />
          <XtermJs v-show="value == 'LIVE'" @vue:mounted="" session="LIVE" theme="Amber" :wsUrl="`${wsUrl}`" :fontSize=save.fontSize />
        </ClientOnly>
        <!-- bottom control panel -->
        <div class="flex flex-nowrap justify-between ml-5 mr-5">
          <!-- session controls -->
          <div v-if="isConnected" class="flex flex-nowrap space-x-2">
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="btop: resource monitors"><UButton size="sm" icon="i-heroicons-rectangle-group" color="neutral" variant="subtle" @click="btop" /></UTooltip>
            <div v-if="mcRef">
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="press Ctrl-O anywhere">
                <UButton color="neutral" @click="mc"><UKbd size="sm" value="ctrl" variant="subtle" /><UKbd size="sm" value="o" variant="subtle" /></UButton>
              </UTooltip>
            </div>
            <div v-else>
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="launch Midnight Commander"><UButton size="sm" icon="i-vscode-icons-file-type-purescript" color="neutral" variant="subtle" @click="mc" /></UTooltip>
            </div>
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="curl builder"><UButton size="sm" icon="i-lucide-biceps-flexed" color="neutral" variant="subtle" @click="isCurl = true" /></UTooltip>
          </div>
          <div v-else>
            &nbsp;
          </div>
          <!-- center controls -->
          <div class="flex flex-nowrap space-x-2">
            <div v-if="tmux" class="space-x-2">
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="help"><UButton class="rounded-full bg-amber-100 hover:bg-amber-300" color="neutral" size="sm" variant="link" icon="i-lucide-badge-help" @click="tmuxHelp" /></UTooltip>
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="enter Copy Mode & search"><UButton class="rounded-full bg-violet-100 hover:bg-violet-300" color="neutral" size="sm" variant="link" icon="i-vscode-icons-file-type-search-result" @click="tmuxSearch" /></UTooltip>
            </div>
            <UForm v-else :state=searchInput @submit.prevent="search(true)">
              <UInput v-model="searchInput.entry" ref="input" color="info" icon="i-vscode-icons-file-type-search-result" size="sm" variant="subtle" placeholder="Search..." :ui="{ trailing: 'pe-1' }">
              <template v-if="searchInput.entry?.length" #trailing>
                <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x" @click="{ searchInput.entry = ''; search(false); }" />
              </template>
              </UInput>
            </UForm>
          </div>
          <!-- right terminal controls -->
          <div class="flex flex-nowrap font-mono space-x-2 text-gray-400 text-lg">
            <USeparator v-if="selection.length" orientation="vertical" class="h-6" /> <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" :text="title"><UButton size="sm" color="info" variant="link" :label="titleLabel" @click="titleClick" /></UTooltip>
            <USeparator v-if="selection.length" orientation="vertical" class="h-6" /> <UButton size="sm" color="warning" variant="link" :label="selectionLabel" />
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="clear selection"><UButton size="sm" icon="i-lucide-clipboard-x" color="neutral" variant="subtle" @click="clear" /></UTooltip>
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="reset terminal"><UButton size="sm" icon="i-lucide-trash-2" color="neutral" variant="subtle" @click="reset" /></UTooltip>
            <USeparator orientation="vertical" class="h-6" />&nbsp;{{rows}}x{{cols}}
          </div>
        </div>
      </div>
      <!-- top-right action controls -->
      <div class="flex-nowrap justify-items-start m-1 space-x-1 space-y-1">
        <USelect v-model="value" :items="items" class="p-2 w-36" />
        <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="decrease font size"><UButton icon="i-lucide-a-arrow-down" color="neutral" variant="subtle" @click="fontSize(-2)" /></UTooltip>
        <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="increase font size"><UButton icon="i-lucide-a-arrow-up" color="neutral" variant="subtle" @click="fontSize(2)" /></UTooltip>
        <div v-if="isConnected" class="m-1 pl-4">
          <UChip color="success">
            <UButton color="action" variant="soft" @click="terminate">Disconnect</UButton>
          </UChip>
        </div>
        <div v-else class="flex m-2 p-2 space-x-2">
          <UChip color="neutral">
            <UButton color="secondary" size="xl" trailing-icon="i-vscode-icons-file-type-shell" @click="terminal">Connect</UButton>
          </UChip>
          <USwitch v-model="tmux" @click="tmuxToggle" class="m-2" color="secondary" size="xl" unchecked-icon="i-lucide-square-terminal" checked-icon="i-lucide-lock-keyhole" :label="termType" />
        </div>
        <div v-if="isConnected">
          <USeparator class="h-6" color="secondary" orientation="horizontal" type="dotted" />
          <UInput ref="filesInput" icon="i-lucide-upload" color="neutral" variant="subtle" type="file" @input="handleFileInput" multiple />
          <div class="flex justify-end"><SubmitButton :disabled="!files.length" @click.prevent="uploadFiles">Upload</SubmitButton></div>
        </div>
      </div>
    </div>
  </div>

  <UDrawer v-model:open="isCurl" title="Curl Builder (wip)" description="fill out form below" :ui="{ container: 'max-w-xl mx-auto' }">
    <Placeholder class="h-48" />
    <template #body>
      <UForm :state="curl" @submit.prevent="sendCurl">
        <UFormField label="URL" name="url">
          <UInput v-model="curl.url" type="string" placeholder="https://server.com/path/to/endpoint" autofocus />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="justify-end space-x-2">
        <SubmitButton label="Submit" />
        <UButton label="Cancel" color="neutral" variant="outline" @click="isCurl = false" />
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { get, set, useResizeObserver, useStorage } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const config = useRuntimeConfig()
const id = process.env.NODE_ENV == 'development' ? 'theflyingape' : get(useAuth().data)?.id
// BROKEN: const wsUrl = `${config.public.websocket}://${location.host}${config.app.baseURL}/node-pty?id=${id}`
const wsUrl = `${config.public.websocket}://${location.host}/api/node-pty?id=${id}`

const { sessionList, cols, rows, selection, title, connect, attach, detach, connected, isConnected, resize } = useTerminalSocket()

const selectionLabel = ref(computed(() => get(selection).includes('\n') ? get(selection).split('\n').length+'-line(s) copied' : get(selection).length < 30 ? get(selection) : get(selection).substring(0,26)+'…'+get(selection).slice(-3)))

const titleLabel = ref(computed(() => get(title).length < 20 ? get(title) : get(title)[0]+'…/'+get(title).split('/').at(-1)))

function titleClick() {
  set(selection, get(title))
  navigator.clipboard.writeText(get(title))
}

const items = ref([process.env.NODE_ENV == 'development' ? 'localhost' : 'Development', 'Test', 'LIVE'])
const value = ref(process.env.NODE_ENV == 'development' ? 'localhost' : 'Test')

watch(value, async (n, o) => {
  connected(n)
})

const { handleFileInput, files } = useFileStorage({ clearOldFiles: true })
const filesRef = useTemplateRef('filesInput')

const crtRef = useTemplateRef('crt')
useResizeObserver(crtRef, (entries) => {
  resize(get(value))
})

const curl = ref({
  url: '',
  insecure: false,
})

//  some sticky preferences for the terminal session
interface prefs {
  fontSize?: number
  tmux?: boolean
}
let prefs: prefs = {}
try {
  prefs = JSON.parse(localStorage.getItem('prefs-local-storage') ?? '{ "fontSize":20, "tmux":true }')
}
catch(err) {
  prefs = { fontSize:20, tmux:true }
}
const save = useStorage('prefs-local-storage', prefs, localStorage, { mergeDefaults: true })
const termType = ref(prefs.tmux ? 'tmux' : 'ssh')
const tmux = ref(prefs.tmux)

function fontSize(delta:number) {
  prefs.fontSize = xterm()!.options.fontSize! + delta
  localStorage.setItem('prefs-local-storage', JSON.stringify(prefs))
  save.value.fontSize = prefs.fontSize
  for(const session in sessionList) {
    xterm(session)!.options.fontSize = prefs.fontSize
    resize(session)
  }
}

function tmuxHelp() {
  send('\x02')
  xterm()?.focus()
  setTimeout(() => {
    send('?')
  }, 100)
}

function tmuxSearch() {
  send('\x02[')
  xterm()?.focus()
  setTimeout(() => {
    send('\x12')
  }, 100)
}

function tmuxToggle() {
  prefs.tmux = !prefs.tmux
  set(tmux, prefs.tmux)
  set(termType, prefs.tmux ? 'tmux' : 'ssh')
  localStorage.setItem('prefs-local-storage', JSON.stringify(prefs))
  save.value.tmux = prefs.tmux
}

function send(text: string) {
  sessionList[get(value)]?.ws?.value?.send(text)
}

function terminal() {
  const sessionId = get(value)
  //  establish WebSocket pipe for client <-> shell
  connect(sessionId, get(tmux))
  attach(sessionId)
  set(mcRef, false)
  xterm()?.writeln(`\r\n\x1B[2mConnecting to a \x1B[0;1m${sessionId}\x1B[0;2m shell session ${prefs.tmux ? 'with tmux' : 'just ssh'} as \x1B[m${id} ... \n`)
}

function terminate() {
  const sessionId = get(value)
  xterm()?.writeln(`\r\n\x1B[2mDisconnecting \x1B[0;1m${sessionId}\x1B[0;2m shell session`)
  detach(sessionId)
}

function xterm(sessionId = get(value)) {
  const session = sessionList[sessionId]
  return session?.xterm
}

function clear() {
  set(selection, '')
  navigator.clipboard.writeText(get(selection))
  xterm()?.clearSelection()
  xterm()?.focus()
}

function reset() {
  xterm()?.reset()
  xterm()?.focus()
  send('\r')
}

//  btop: resource monitors
function btop() {
  send('btop\r')
  xterm()?.focus()
}

//  Midnight Commander
const mcRef = ref(false)

function mc() {
  if (get(mcRef)) {
    send('\x0f')
  }
  else {
    send('mc /files /files\r')
    set(mcRef, true)
  }
  xterm()?.focus()
}

defineShortcuts({
  ctrl_o: mc
})

//  curl
const isCurl = ref(false)

//  Search
const input = useTemplateRef('input')
const searchInput = ref({ entry: '' })

function search(query:boolean) {
  let keepFocus = true
  if (get(searchInput).entry) {
    sessionList[get(value)]?.search?.findPrevious(get(searchInput).entry)
  }
  else {
    set(selection, '')
    xterm()?.clearSelection()
    xterm()?.scrollToBottom()
    if (query) keepFocus = false
  }
  if (keepFocus) {
    setTimeout(() => {
      get(input)?.inputRef?.focus()
      get(input)?.inputRef?.select()
    }, 100)
  }
  else
    xterm()?.focus()
}

function sendCurl() {
  set(isCurl, false)
  send(`curl ${curl.value.insecure ? '-k' : ''} ${curl.value.url}`)
}

const uploadFiles = async () => {
  const response = await $fetch('/api/files', {
    method: 'POST',
    body: {
      files: get(files)
    }
  })
  filesRef.value!.inputRef!.value = ''
  set(files, [])
  useToast().add({ title: `File upload complete`, description: `${response}` })
}
</script>

<style lang="css" scoped>
.resize {
  position: relative;
  background: #445 url("data:image/svg+xml,%3Csvg height='18' viewBox='0 0 10 10' width='18' stroke='RoyalBlue' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 0v4l1.5-1.5 1.5 1.5 1-1-1.5-1.5 1.5-1.5zm5 4-1 1 1.5 1.5-1.5 1.5h4v-4l-1.5 1.5z'/%3E%3C/svg%3E") 100% 100% no-repeat;
}
</style>
