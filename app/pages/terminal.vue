<template>
  <div ref="Terminal" class="bg-zinc-200 min-h-dvh h-dvh min-w-full w-full">
    <div class="flex flex-nowrap h-full w-full justify-center pt-2">
      <!-- monitor with a thin bezel -->
      <div ref="crt" class="bg-zinc-800 p-3 pb-8 rounded-md min-w-5/12 w-5/6 max-w-11/12 min-h-1/2 h-11/12 max-h-11/12 overflow-hidden resize resizer">
        <DevOnly><XtermJs v-show="Instance == 'localhost'" @vue:mounted="console.log('mounted!')" session="localhost" theme="White" :wsUrl="`${wsUrl}`" :fontSize=save.fontSize /></DevOnly>
        <XtermJs v-show="Instance == 'Dev'" @vue:mounted="" session="Dev" theme="White" :wsUrl="`${wsUrl}`" :fontSize=save.fontSize />
        <XtermJs v-show="Instance == 'Test'" @vue:mounted="" session="Test" theme="Green" :wsUrl="`${wsUrl}`" :fontSize=save.fontSize />
        <XtermJs v-show="Instance == 'Live'" @vue:mounted="" session="Live" theme="Amber" :wsUrl="`${wsUrl}`" :fontSize=save.fontSize />
        <!-- bottom control panel -->
        <div class="flex flex-nowrap justify-between ml-5 mr-5">
          <!-- session controls -->
          <div v-if="isConnected" class="flex flex-nowrap space-x-2">
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="capture Terminal"><UButton size="sm" icon="i-lucide-camera" color="neutral" variant="subtle" @click.prevent="snap" /></UTooltip>
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
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="Ctrl/B shortcuts"><UButton class="rounded-full bg-amber-100 hover:bg-amber-300" :disabled="!isConnected" color="neutral" size="sm" variant="link" icon="i-lucide-badge-help" @click="tmuxHelp" /></UTooltip>
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="split window"><UButton class="rounded bg-gray-100 hover:bg-gray-300" :disabled="!isConnected" color="neutral" size="sm" variant="link" icon="i-ic-twotone-add-to-queue" @click="tmuxSplit" /></UTooltip>
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="switch to previous"><UButton class="rounded bg-sky-100 hover:bg-sky-300" :disabled="!isConnected" color="neutral" size="sm" variant="link" icon="i-ic-twotone-swipe-vertical" @click="tmuxSwitch" /></UTooltip>
              <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="enter Copy Mode & search"><UButton class="rounded-full bg-violet-100 hover:bg-violet-300" :disabled="!isConnected" color="neutral" size="sm" variant="link" icon="i-vscode-icons-file-type-search-result" @click="tmuxSearch" /></UTooltip>
              
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
          <div class="flex flex-nowrap font-mono space-x-2 text-gray-400 text-lg">
            <USeparator v-if="title.length" orientation="vertical" class="h-6" /> <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="click to copy"><UButton size="sm" color="info" variant="link" :label="titleLabel" @click="titleClick" /></UTooltip>
            <USeparator v-if="selection.length" orientation="vertical" class="h-6" /> <UButton size="sm" color="warning" variant="link" :label="selectionLabel" />
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="clear selection"><UButton size="sm" icon="i-lucide-clipboard-x" color="neutral" variant="subtle" @click="clear" /></UTooltip>
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="reset terminal"><UButton size="sm" icon="i-lucide-trash-2" color="neutral" variant="subtle" @click="reset" /></UTooltip>
            <USeparator orientation="vertical" class="h-6" />&nbsp;{{rows}}x{{cols}}
          </div>
        </div>
      </div>
      <!-- top-right action controls -->
      <div class="flex-nowrap justify-items-start m-1 min-w-1/6 max-w-1/6 space-x-1 space-y-1">
        <IrisSelect v-model="Instance" />
        <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="decrease font size"><UButton icon="i-lucide-a-arrow-down" color="neutral" variant="subtle" @click="fontSize(-2)" /></UTooltip>
        <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="increase font size"><UButton icon="i-lucide-a-arrow-up" color="neutral" variant="subtle" @click="fontSize(2)" /></UTooltip>
        <div v-if="isConnected" class="m-1 pl-2">
          <UChip color="success">
            <UButton color="action" size="lg" variant="soft" @click="terminate">Disconnect</UButton>
          </UChip>
        </div>
        <div v-else class="flex m-1 space-x-2">
          <UChip color="neutral">
            <UButton color="secondary" size="lg" trailing-icon="i-vscode-icons-file-type-shell" @click="terminal">Connect</UButton>
          </UChip>
          <USwitch v-model="tmux" @click="tmuxToggle" class="m-2" color="secondary" size="xl" unchecked-icon="i-lucide-square-terminal" checked-icon="i-lucide-lock-keyhole" :label="termType" />
        </div>
        <div v-if="isConnected">
          <div v-if="isFiles" class="flex-wrap">
            <USeparator class="h-6" color="secondary" orientation="horizontal" type="dotted" />
            <UInput class="w-60" ref="filesInput" icon="i-lucide-upload" color="neutral" variant="subtle" type="file" @input="handleFileInput" multiple />
            <div class="flex justify-end"><SubmitButton :disabled="!files.length" @click.prevent="uploadFiles">Upload</SubmitButton></div>
            <div>
              <USeparator class="h-6" color="secondary" orientation="horizontal" type="dotted" />
              <FileStat v-model="fileCandidate" :hcie="Instance" :tmux="tmux!" />
              <div class="flex justify-end"><SubmitButton :disabled="!fileCandidate.length || fileStat[Instance]?.type !== 'regular file'" @click.prevent="downloadFile">Download</SubmitButton></div>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="tmux" class="space-x-2">
            <USeparator class="h-6" color="secondary" orientation="horizontal" type="dotted" />
            <UCard variant="subtle">
              <template #header>
                <b>tmux</b> connect <i>can <b>resume</b> your running session after a <b>disconnect</b> and provides for additional screen functions</i>
              </template>
              <template #default>
                <ul class="list-disc space-y-1.5 text-sm">
                  <li>use <UKbd value="meta" /><UKbd value="b" /> to prefix commands</li>
                  <li>hold SHIFT <UKbd value="shift" /> with mouse <UKbd class="font-bold rounded-full" value="btn" variant="subtle" /> to select text into copy buffer</li>
                  <li>use mouse <UKbd class="font-bold rounded-full" value="wheel" variant="subtle" /> <i>or</i> press <UKbd value="meta" /><UKbd value="b" /> then <UKbd value="page up" /><UKbd value="page down" /> for scroll history</li>
                  <li>exit scrolling using <UKbd value="esc" /> <i>or</i> <UKbd value="q" /></li>
                </ul>
              </template>
            </UCard>
          </div>
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
// import { saveAs } from 'file-saver'
import * as htmlToImage from 'html-to-image'

const config = useRuntimeConfig()
const id = process.env.NODE_ENV == 'development' ? 'rhurst' : get(useAuth().data)?.id
// BROKEN: const wsUrl = `${config.public.websocket}://${location.host}${config.app.baseURL}/node-pty?id=${id}`
const wsUrl = `${config.public.websocket}://${location.host}/api/node-pty?id=${id}`

const { InstanceDefault, fileStat, stat } = useIrisSessions()
const { sessionList, cols, rows, selection, title, connect, attach, detach, connected, isConnected, resize } = useTerminalSocket()
const Instance = ref(InstanceDefault)

const selectionLabel = ref(computed(() => get(selection).includes('\n') ? get(selection).split('\n').length+'-line(s) copied' : get(selection).length < 30 ? get(selection) : get(selection).substring(0,26)+'…'+get(selection).slice(-3)))
const fileCandidate = ref('')

watch(selection, () => {
  const sessionId = get(Instance)
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
      }
    })
  }
})

const titleLabel = ref(computed(() => get(title).length < 20 ? get(title) : get(title)[0]+'…/'+get(title).split('/').at(-1)))

function titleClick() {
  set(selection, get(title))
  navigator.clipboard.writeText(get(title))
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

function fontSize(delta:number) {
  prefs.fontSize = xterm().options.fontSize! + delta
  localStorage.setItem('prefs-local-storage', JSON.stringify(prefs))
  save.value.fontSize = prefs.fontSize
  for(const session in sessionList) {
    xterm(session).options.fontSize = prefs.fontSize
    resize(session)
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
  set(mcRef, false)
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
  xterm()?.reset()
  xterm()?.focus()
  send('\r')
}

//  btop: resource monitors
function btop() {
  send('fastfetch && btop\r')
  xterm()?.focus()
}

//  Midnight Commander
const mcRef = ref(false)

function mc() {
  if (get(mcRef)) {
    send('\x0f')
  }
  else {
    send(`mc ${get(tmux) ? '-x ' : ' '}/files /files\r`)
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
// html2canvas(<HTMLDivElement>document.getElementById('crt')).then((canvas) => {
//  htmlToImage.toJpeg(<HTMLDivElement>get(crtRef)!.getElementsByClassName('xterm-screen')[0], { quality: 0.9 }).then((dataUrl:string) => {
  htmlToImage.toJpeg(get(TerminalRef)!, { quality: 0.9 }).then((dataUrl:string) => {
    const link = document.createElement('a')
    link.download = `${get(Instance)}-crt-snap.jpg`
    link.href = dataUrl
    link.click()
  })
  /*
  htmlToImage.toBlob(<HTMLDivElement>get(crtRef)!.getElementsByClassName('xterm-screen')[0]).then((blob) => {
    saveAs(<Blob>blob, `${get(value)}-crt-snap.png`)
  })
  */
  /*
  //const canvas = <HTMLCanvasElement>xterm().element?.querySelector('.xterm-screen canvas')
  const canvasList = xterm().element?.querySelectorAll('.xterm-screen canvas')
  if (canvasList) {
    console.log(canvasList)
    const canvas = <HTMLCanvasElement>canvasList[1]
    const context = canvas.getContext('webgl2', { preserveDrawingBuffer: true })
    console.log(context)
    if (context) {
      xterm().refresh(0, xterm().rows)
      const off = <HTMLCanvasElement>context.canvas
      off.toBlob((blob) => {
        console.log(blob)
        const url = URL.createObjectURL(blob!)
        const a = document.createElement('a')
        a.href = url
        a.download = `${get(value)}-snap.jpg`
        a.click()
        canvas.getContext('webgl', { preserveDrawingBuffer: false })
        URL.revokeObjectURL(url)
      }, 'image/jpeg', 0.95)
    }
  }
  */
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
