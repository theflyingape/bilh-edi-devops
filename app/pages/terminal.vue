<template>
  <div ref="monitor" class="bg-zinc-200 min-h-dvh h-dvh min-w-full w-full">
    <div class="flex flex-nowrap h-full w-full justify-center pt-2">
      <!-- monitor with a thin bezel -->
      <div ref="crt" class="bg-zinc-800 p-3 pb-8 rounded-md min-w-5/12 w-5/6 max-w-11/12 min-h-1/2 h-11/12 max-h-11/12 overflow-hidden resize resizer">
        <XtermJs v-show="value == 'localhost'" @vue:mounted="" session="localhost" theme="White" resize='monitor' :wsUrl="`${wsUrl}`" />
        <XtermJs v-show="value == 'Development'" @vue:mounted="" session="Development" theme="White" :wsUrl="`${wsUrl}`" />
        <XtermJs v-show="value == 'Test'" @vue:mounted="" session="Test" theme="Green" :wsUrl="`${wsUrl}`" />
        <XtermJs v-show="value == 'LIVE'" @vue:mounted="" session="LIVE" theme="Amber" :wsUrl="`${wsUrl}`" />
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
          </div>
          <div v-else>
            &nbsp;
          </div>
          <!-- center controls -->
          <div class="flex flex-nowrap space-x-2">
            <UForm state="searchInput" @submit.prevent="search(true)">
              <UInput v-model="searchInput.entry" ref="input" color="info" icon="i-vscode-icons-file-type-search-result" size="sm" variant="subtle" placeholder="Search..." :ui="{ trailing: 'pe-1' }">
              <template v-if="searchInput.entry?.length" #trailing>
                <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x" @click="{ searchInput.entry = ''; search(false); }" />
              </template>
              </UInput>
            </UForm>
          </div>
          <!-- right terminal controls -->
          <div class="flex flex-nowrap space-x-2 text-white">
            <USeparator v-if="selection.length" orientation="vertical" class="h-6" /> {{ selection.includes('\n') ? selection.split('\n').length+'-line(s) copied' : selection.length < 30 ? selection : selection.substring(0,26)+'…'+selection.slice(-3) }} &nbsp;
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="clear selection"><UButton size="sm" icon="i-lucide-clipboard-x" color="neutral" variant="subtle" @click="clear" /></UTooltip>
            <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="reset terminal"><UButton size="sm" icon="i-lucide-trash-2" color="neutral" variant="subtle" @click="reset" /></UTooltip>
            <USeparator orientation="vertical" class="h-6" />&nbsp; {{rows}}x{{cols}}
          </div>
        </div>
      </div>
      <!-- top-right action controls -->
      <div class="justify-items-start m-1 space-y-1">
        <div v-if="isConnected">
          <UChip class="mt-2" color="success">
            <UButton color="action" variant="soft" @click="terminate">Disconnect</UButton>
          </UChip>
        </div>
        <div v-else>
          <UChip class="mt-2" color="neutral">
            <UButton color="action" @click="terminal">Connect</UButton>
          </UChip>
        </div>
        <USelect v-model="value" :items="items" class="w-36" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { get, set, useResizeObserver } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const config = useRuntimeConfig()
const id = process.env.NODE_ENV == 'development' ? 'theflyingape' : get(useAuth().data)?.id
// BROKEN: const wsUrl = `${config.public.websocket}://${location.host}${config.app.baseURL}/node-pty?id=${id}`
const wsUrl = `${config.public.websocket}://${location.host}/node-pty?id=${id}`

const { sessionList, cols, rows, selection, connect, attach, detach, connected, isConnected, resize } = useTerminalSocket()
const items = ref([process.env.NODE_ENV == 'development' ? 'localhost' : 'Development', 'Test', 'LIVE'])
const value = ref(process.env.NODE_ENV == 'development' ? 'localhost' : 'Test')

/*
const monitorRef = useTemplateRef('monitor')
useResizeObserver(monitorRef, (entries) => {
  //const [entry] = entries
  //const { width, height } = <DOMRectReadOnly>entry?.contentRect
  //console.log('crt resize:',width,'x',height)
  //items.value.forEach((item) => { resize(item) })
  resize(value.value)
})
*/
const crtRef = useTemplateRef('crt')
useResizeObserver(crtRef, (entries) => {
  resize(get(value))
})

watch(value, async (n, o) => {
  connected(n)
})

function send(text: string) {
  sessionList[get(value)]?.ws?.value?.send(text)
}

function terminal() {
  const sessionId = get(value)
  xterm()?.writeln(`\r\n\x1B[2mConnecting to a \x1B[0;1m${sessionId}\x1B[0;2m shell session as \x1B[m${id} ... \n`)
  //  establish WebSocket pipe for client <-> shell
  connect(sessionId)
  attach(sessionId)
  set(mcRef, false)
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
</script>

<style lang="css" scoped>
.resize {
  position: relative;
  background: #445 url("data:image/svg+xml,%3Csvg height='18' viewBox='0 0 10 10' width='18' stroke='RoyalBlue' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 0v4l1.5-1.5 1.5 1.5 1-1-1.5-1.5 1.5-1.5zm5 4-1 1 1.5 1.5-1.5 1.5h4v-4l-1.5 1.5z'/%3E%3C/svg%3E") 100% 100% no-repeat;
}
</style>
