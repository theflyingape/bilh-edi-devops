<template>
  <div ref="Terminal" class="bg-zinc-200 min-h-auto h-[calc(100vh-50px)] max-h-[calc(100vh-50px)] min-w-full w-full overflow-hidden">
    <div class="flex flex-nowrap justify-center h-full w-full">
      <!-- monitor with a thin bezel -->
      <div ref="crt" class="bg-zinc-800 p-2 pb-10 rounded-md min-h-1/2 min-w-1/2 h-full w-full max-h-auto max-w-auto overflow-hidden resize resizer">
        <XtermJs v-show="Instance == 'Dev'" session="Dev" theme="White" :wsUrl="`${wsUrl}`" :fontSize=save.fontSize />
        <XtermJs v-show="Instance == 'Test'" session="Test" theme="Green" :wsUrl="`${wsUrl}`" :fontSize=save.fontSize />
        <XtermJs v-show="Instance == 'Live'" session="Live" theme="Amber" :wsUrl="`${wsUrl}`" :fontSize=save.fontSize />
        <XtermJs v-show="Instance == 'Epic POC'" session="Epic POC" theme="White" :wsUrl="`${wsUrl}`" :fontSize=save.fontSize />
        <!-- bottom control panel -->
        <div class="flex flex-nowrap justify-between items-center">
          <!-- session controls -->
          <div v-if="isConnected" class="flex flex-nowrap space-x-2">
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="capture Terminal"><UButton size="sm" icon="i-lucide-camera" color="neutral" variant="subtle" @click.prevent="snap" /></UTooltip>
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="btop: resource monitors"><UButton size="sm" icon="i-heroicons-rectangle-group" color="neutral" variant="subtle" @click="btop" /></UTooltip>
            <div>
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="launch Midnight Commander"><UButton size="sm" icon="i-vscode-icons-file-type-purescript" color="neutral" variant="subtle" @click="mc" /></UTooltip>
            </div>
          </div>
          <div v-else>
            &nbsp;
          </div>
          <!-- center controls -->
          <div class="flex flex-nowrap space-x-2">
            <div v-if="tmux" class="space-x-2">
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="Ctrl/B shortcuts"><UButton class="rounded-full disabled:bg-slate-200 bg-amber-100 hover:bg-amber-300" :disabled="!isConnected" color="neutral" size="sm" variant="link" icon="i-lucide-badge-help" @click="tmuxHelp" /></UTooltip>
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="split window"><UButton class="rounded  disabled:bg-slate-200 bg-gray-100 hover:bg-gray-300" :disabled="!isConnected" color="neutral" size="sm" variant="link" icon="i-ic-twotone-add-to-queue" @click="tmuxSplit" /></UTooltip>
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="switch to previous"><UButton class="rounded disabled:bg-slate-200 bg-sky-100 hover:bg-sky-300" :disabled="!isConnected" color="neutral" size="sm" variant="link" icon="i-ic-twotone-swipe-vertical" @click="tmuxSwitch" /></UTooltip>
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="enter Copy Mode & search"><UButton class="rounded-full disabled:bg-slate-200 bg-violet-100 hover:bg-violet-300" :disabled="!isConnected" color="neutral" size="sm" variant="link" icon="i-vscode-icons-file-type-search-result" @click="tmuxSearch" /></UTooltip>
              
            </div>
            <UForm v-else :state=searchInput @submit.prevent="search(true)">
              <UInput ref="input" v-model="searchInput.entry" color="info" icon="i-vscode-icons-file-type-search-result" size="sm" variant="subtle" placeholder="Search..." :ui="{ trailing: 'pe-1' }">
              <template v-if="searchInput.entry?.length" #trailing>
                <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x" @click="{ searchInput.entry = ''; search(false); }" />
              </template>
              </UInput>
            </UForm>
          </div>
          <!-- right terminal controls -->
          <div class="flex flex-nowrap font-mono space-x-1 text-gray-400 text-lg">
            <USeparator v-if="title.length" orientation="vertical" class="h-6" />
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="click to copy current path"><UButton size="sm" color="info" variant="link" :label="titleLabel" @click="titleClick" /></UTooltip>
            <div>
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" :text="selectionLabel ? `clear last selection: ${selectionLabel}` : ''"><UButton size="sm" icon="i-lucide-clipboard-x" color="neutral" variant="subtle" @click="clear" /></UTooltip>
            </div>
            <div v-if="tmux">
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="screensaver"><UButton size="sm" icon="i-lucide-lock-keyhole" color="neutral" variant="subtle" @click="reset" /></UTooltip>
            </div>
            <div v-else>
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="reset terminal"><UButton size="sm" icon="i-lucide-trash-2" color="neutral" variant="subtle" @click="reset" /></UTooltip>
            </div>
            <USeparator orientation="vertical" class="h-6 pt-1 pr-1" />{{rows}}x{{cols}}
          </div>
        </div>
      </div>
      <!-- side-right action controls -->
      <div class="grid justify-between ml-1 mt-3 min-w-9/50 max-w-9/50">
        <!-- top -->
        <div>
          <div class="flex space-x-1">
            <IrisSelect v-model="Instance" />
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="decrease font size"><UButton icon="i-lucide-a-arrow-down" color="neutral" variant="subtle" @click="fontSize(-2)" /></UTooltip>
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="increase font size"><UButton icon="i-lucide-a-arrow-up" color="neutral" variant="subtle" @click="fontSize(2)" /></UTooltip>
          </div>
          <div v-if="isConnected" class="m-1 pl-1">
            <UChip color="success">
              <UButton color="action" size="lg" variant="soft" @click="terminate">Disconnect</UButton>
            </UChip>
          </div>
          <div v-else>
            <div class="flex m-1 space-x-2">
            <UButton size="lg" color="neutral" variant="subtle" trailing-icon="i-vscode-icons-file-type-shell" @click="terminal">Connect</UButton>
            <USwitch v-model="tmux" @click="tmuxToggle" class="m-2" :color="tmux ? 'primary' : 'neutral'" size="xl" unchecked-icon="i-lucide-square-terminal" checked-icon="i-lucide-note" :label="termType" />
            </div>
            <div v-if="tmux">
              <UCard variant="subtle">
                <template #header>
                  <UIcon name="i-lucide-lightbulb" /> NOTE: <b>tmux</b> connect <i>can <b>resume</b> your running session after a <b>disconnect</b> and provides for additional screen functions</i>
                </template>
                <template #default>
                  <ul class="list-disc space-y-1.5 text-sm">
                    <li>use <UKbd value="meta" /><UKbd value="b" /> to prefix <b>tmux</b> commands</li>
                    <li>hold <UKbd value="SHIFT" /> with mouse <UKbd class="font-bold rounded-full" value="btn" variant="subtle" /> to highlight text selection into the copy buffer</li>
                    <li>use mouse <UKbd class="font-bold rounded-full" value="wheel" variant="subtle" /> <i>or</i>
                    press <UKbd value="meta" /><UKbd value="b" /> then <UKbd value="PgUp" />/<UKbd value="PgDn" />
                    for scroll history</li>
                    <li>exit scrolling using <UKbd value="esc" /> <i>or</i> <UKbd value="q" /></li>
                  </ul>
                </template>
              </UCard>
            </div>
          </div>
        </div>
        <!-- middle -->
        <div v-if="isConnected && isFiles">
          <USeparator class="h-6" color="secondary" orientation="horizontal" type="dotted" />
          <UInput class="w-full" ref="filesInput" icon="i-lucide-upload" color="neutral" variant="subtle" type="file" @input="handleFileInput" multiple />
          <div class="flex justify-end m-1 pb-3"><SubmitButton :disabled="!files.length" @click.prevent="uploadFiles">Upload</SubmitButton></div>
          <FileStat v-model="fileCandidate" :hcie="Instance as HCIE" :tmux="tmux!" />
          <div class="flex justify-end m-1"><SubmitButton :disabled="!fileCandidate.length || fileStat[Instance]?.type !== 'regular file'" @click.prevent="downloadFile">Download</SubmitButton></div>
          <USeparator class="h-6" color="secondary" orientation="horizontal" type="dotted" />
        </div>
        <div v-else class="self-start">
          <UCard color="info" variant="subtle">
            <template #default>
              <UIcon name="i-lucide-lightbulb" /> NOTE: <b><span style="background-color: lightgrey; font-family: monospace;">&nbsp;cd /files&nbsp;</span></b> first to enable any data file transfers.
            </template>
          </UCard>
        </div>
        <!-- bottom -->
        <div v-if="clipBoard.items" class="max-h-fit pb-1 pr-1 self-end">
          <UCollapsible v-if="clipBoard.items.value.length" v-model:open="history" :unmount-on-hide="false" trailing-icon="i-lucide-chevron-down">
            <UButton
              class="group"
              icon="i-heroicons-clipboard"
              :label="`Shell clipboard history (${clipBoard.items.value.length})`"
              color="neutral"
              variant="subtle"
              trailing-icon="i-lucide-chevron-down"
              :ui="{
                trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
              }"
              block
            />
            <template #content>
              <ClipboardHistory :title=false />
            </template>
          </UCollapsible>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { get, set, useResizeObserver, useStorage } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import * as htmlToImage from 'html-to-image'

const clipBoard = useClipboardHistory()
const config = useRuntimeConfig()
const id = useDevOps().dev ? 'theflyingape' : get(useAuth().data)?.id
// BROKEN: const wsUrl = `${config.public.websocket}://${location.host}${config.app.baseURL}/node-pty?id=${id}`
const wsUrl = `${config.public.websocket}://${location.host}/api/node-pty?id=${id}`
const { fileStat, stat } = useIrisSessions()
const { sessionList, cols, rows, selection, title, connect, attach, detach, connected, isConnected, resize } = useTerminalSocket()
const Instance = ref('Test' as HCIE)

const selectionLabel = ref(computed(() => get(selection).includes('\n') ? get(selection).split('\n').length+'-line(s) copied' : get(selection).length < 40 ? get(selection) : get(selection).substring(0,31)+'…'+get(selection).slice(-8)))
const fileCandidate = ref('')
const titleLabel = ref(computed(() => get(title).length < 20 ? get(title) : get(title)[0]+'…/'+get(title).split('/').at(-1)))

//  allows for component to execute its Clear All items, but also
//  reset UI here for new selections
watch(clipBoard.items, (value, _oldValue) => {
  set(history, get(isConnected) && get(value)!.length > 1)
  if (!get(value)?.length)
    clear()
})

watch(selection, () => {
  clipBoard.copy(get(selection))
  //  expand auto-detection
  const sessionId = get(Instance) as HCIE
  set(fileCandidate, '')
  fileStat.value[sessionId] = <filestat>{}
  if (isFiles && get(selection).length && !get(selection).includes('\n')) {
    let filename = get(selection)
    if (filename[0] == "'" && filename.lastIndexOf("'") == filename.length - 1) {
      const trim = (str:string, chars:string) => str.split(chars).filter(Boolean).join(chars)
      filename = trim(filename, "'")
    }
    filename = `${get(title)}/${filename}`
    stat(sessionId, filename).finally(() => {
      if (get(fileStat)[sessionId]?.fileName) {
        set(fileCandidate, get(fileStat)[sessionId]?.fileName)
        clipBoard.copy(get(fileCandidate))
      }
    })
  }
})

function titleClick() {
  set(selection, get(title))
  navigator.clipboard.writeText(get(title))
  clipBoard.copy(get(title))
}

const isFiles = ref(computed(() => get(title) == '/files' || get(title).startsWith('/files/')))

watch(Instance, async (n, o) => {
  connected(n, true)
})

const { handleFileInput, files } = useFileStorage({ clearOldFiles: true })
const filesRef = useTemplateRef('filesInput')

const TerminalRef = useTemplateRef('Terminal')
const crtRef = useTemplateRef('crt')
useResizeObserver(crtRef, (entries) => {
  const sessionId = get(Instance)
/*
  for (let entry of entries) {
    const cr = entry.contentRect
    const currentHeight = cr.height
    const lh = 27

    // Calculate nearest snapped height
    const snappedHeight = Math.round(currentHeight / lh) * lh + 31
    
    // Apply snapped height if it differs from current, preventing infinite loops
    if (Math.abs(currentHeight - snappedHeight) > 2) {
      get(crtRef)!.style.height = `${snappedHeight}px`
    }
  }
*/
  resize(sessionId)
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
const history = ref(false)

function fontSize(delta:number) {
  prefs.fontSize = xterm().options.fontSize! + delta
  localStorage.setItem('prefs-local-storage', JSON.stringify(prefs))
  save.value.fontSize = prefs.fontSize
  for(const session in sessionList) {
    xterm(<HCIE>session).options.fontSize = prefs.fontSize
    resize(<HCIE>session)
  }
}

function tmuxHelp() {
  send('\x02')
  xterm()?.focus()
  setTimeout(() => {
    send('?')
  }, 50)
}

function tmuxSearch() {
  send('\x02[')
  xterm()?.focus()
  setTimeout(() => {
    send('\x12')
  }, 50)
}

function tmuxSplit() {
  send('\x02')
  xterm()?.focus()
  setTimeout(() => {
    send('"')
  }, 50)
}

function tmuxSwitch() {
  send('\x02')
  xterm()?.focus()
  setTimeout(() => {
    send(';')
  }, 50)
}

function tmuxToggle() {
  prefs.tmux = !prefs.tmux
  set(tmux, prefs.tmux)
  set(termType, prefs.tmux ? 'tmux' : 'ssh')
  localStorage.setItem('prefs-local-storage', JSON.stringify(prefs))
  save.value.tmux = prefs.tmux
}

function send(text: string) {
  sessionList[get(Instance)]?.ws?.value?.send(text)
}

function terminal() {
  const sessionId = get(Instance)
  //  establish WebSocket pipe for client <-> shell
  connect(sessionId, get(tmux))
  attach(sessionId)
  xterm()?.writeln(`\r\n\x1B[2mConnecting to a \x1B[0;1m${sessionId}\x1B[0;2m shell session ${prefs.tmux ? 'with tmux' : 'just ssh'} as \x1B[m${id} ... \n`)
}

function terminate() {
  const sessionId = get(Instance)
  xterm()?.writeln(`\r\n\x1B[2mDisconnecting \x1B[0;1m${sessionId}\x1B[0;2m shell session`)
  set(titleLabel, '')
  detach(sessionId)
}

function xterm(sessionId = get(Instance)) {
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
  xterm()?.focus()
  if (get(termType) == 'tmux') {
    //  show time to hide content
    send('\x02')
    setTimeout(() => {
      send('t')
    }, 50)
  }
  else {
    //  emulator reset
    xterm()?.write('\x1bc')
    setTimeout(() => {
      send('\r')
    }, 50)
  }
}

//  btop: resource monitors
function btop() {
  send('fastfetch && btop\r')
  xterm()?.focus()
}

//  Midnight Commander
function mc() {
  send('\x0f')
  send(`pgrep -au ${id} mc && echo 'use Ctrl-O for Midnight Commander' || mc ${get(tmux) ? '-x ' : ' '}/files /files\r`)
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
    sessionList[get(Instance)]?.search?.findPrevious(get(searchInput).entry)
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

function snap() {
  htmlToImage.toJpeg(get(crtRef)!, { quality: 0.833 }).then((dataUrl:string) => {
    const link = document.createElement('a')
    link.download = `${get(Instance)}-crt-snap.jpg`
    link.href = dataUrl
    link.click()
  })
}

async function downloadFile() {
  if (!get(isConnected)) {
    useToast().add({ title: 'Not connected', description: 'Connect to host and switch directory into /files' })
    return
  }

  const sessionId = get(Instance)
  let ask = get(fileCandidate)
  if (ask[0] == "'" && ask.lastIndexOf("'") == ask.length - 1) {
    const trim = (str:string, chars:string) => str.split(chars).filter(Boolean).join(chars)
    ask = trim(ask, "'")
  }
  await useFetch('/api/download', {
    method: 'POST', body: {
      user: id!, host: sessionId, file: ask
    },
    onResponse({ request, response, options }) {
      const downloaded = <Blob>response._data
      const file = ask.split('/').at(-1)!
      //  invoke browser download chooser action
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(downloaded)
      link.download = file
      link.click()
      useToast().add({ title: file, description: `size: ${downloaded.size}` })
    }
  })
}

const uploadFiles = async () => {
  const sessionId = get(Instance)
  const response = await $fetch('/api/upload', {
    method: 'POST', body: {
      files: get(files),
      user: id!, host: sessionId, folder: get(title)
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
