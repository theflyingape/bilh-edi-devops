<template>
  <div ref="monitor" class="bg-zinc-200 min-h-dvh h-dvh min-w-full w-full">
    <div class="flex flex-nowrap h-dvh w-full justify-center pt-2">
      <!-- monitor with a thin bezel -->
      <div ref="crt" class="bg-zinc-800 p-3 pb-8 rounded-md min-w-1/2 w-3/4 max-w-5/6 min-h-1/2 h-11/12 max-h-11/12 overflow-auto resize resizer">
        <XtermJs v-show="value == 'localhost'" @vue:mounted="" session="localhost" theme="White" resize='monitor' :wsUrl="`${wsUrl}`" />
        <XtermJs v-show="value == 'Development'" @vue:mounted="" session="Development" theme="White" :wsUrl="`${wsUrl}`" />
        <XtermJs v-show="value == 'Test'" @vue:mounted="" session="Test" theme="Green" :wsUrl="`${wsUrl}`" />
        <XtermJs v-show="value == 'LIVE'" @vue:mounted="" session="LIVE" theme="Amber" :wsUrl="`${wsUrl}`" />
        <div class="flex justify-end mr-5 space-x-2 text-white">
          {{ selection }} &nbsp;
          <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="clear selection"><UButton size="sm" icon="i-lucide-clipboard-x" color="neutral" variant="subtle" @click="clear" /></UTooltip>
          <UTooltip arrow :content="{ align:'end', side:'top', sideOffset:1 }" text="reset terminal"><UButton size="sm" icon="i-lucide-trash-2" color="neutral" variant="subtle" @click="reset" /></UTooltip>
          <USeparator orientation="vertical" class="h-6" />&nbsp; {{rows}}x{{cols}}
        </div>
      </div>
      <!-- action controls -->
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
import { useResizeObserver } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const config = useRuntimeConfig()
const id = process.env.NODE_ENV == 'development' ? 'theflyingape' : useAuth().data?.value?.id
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
  resize(value.value)
})

watch(value, async (n, o) => {
  connected(n)
})

function terminal() {
  const sessionId = value.value
  xterm()?.writeln(`\r\n\x1B[2mConnecting to a \x1B[0;1m${sessionId}\x1B[0;2m shell session as \x1B[m${id} ... \n`)
  //  establish WebSocket pipe for client <-> shell
  connect(sessionId)
  attach(sessionId)
}

function terminate() {
  const sessionId = value.value
  xterm()?.writeln(`\r\n\x1B[2mDisconnecting \x1B[0;1m${sessionId}\x1B[0;2m shell session`)
  detach(sessionId)
}

function xterm(sessionId = value.value) {
  const session = sessionList[sessionId]
  return session?.xterm
}

function clear() {
  selection.value = ''
  navigator.clipboard.writeText(selection.value)
  xterm()?.clearSelection()
  xterm()?.focus()
}

function reset() {
  xterm()?.reset()
  xterm()?.focus()
  sessionList[value.value]?.ws?.value?.send('\r')
}
</script>

<style lang="css" scoped>
.resize {
  position: relative;
  background: #445 url("data:image/svg+xml,%3Csvg height='18' viewBox='0 0 10 10' width='18' stroke='RoyalBlue' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 0v4l1.5-1.5 1.5 1.5 1-1-1.5-1.5 1.5-1.5zm5 4-1 1 1.5 1.5-1.5 1.5h4v-4l-1.5 1.5z'/%3E%3C/svg%3E") 100% 100% no-repeat;
}
</style>
