<template>
  <div ref="monitor" class="bg-zinc-200 min-h-dvh h-dvh min-w-full w-full">
    <div class="flex flex-nowrap h-dvh w-full justify-center">
      <!-- action controls -->
      <div class="justify-items-start m-1 space-y-1">
        <USelect v-model="value" :items="items" class="w-36" />
      </div>
      <!-- monitor with a thin bezel -->
      <div ref="crt" class="bg-zinc-800 m-2 p-2 pb-14 rounded-md min-w-1/2 w-3/4 max-w-5/6 min-h-1/2 h-11/12 max-h-11/12 overflow-auto resize resizer">
        <XtermJs v-show="value == 'localhost'" @vue:mounted="" session="localhost" theme="Snow" resize='monitor' :wsUrl="`${wsUrl}&profile=${value}`" />
        <XtermJs v-show="value == 'Development'" @vue:mounted="" session="Development" theme="Snow" :wsUrl="`${wsUrl}&profile=${value}`" />
        <XtermJs v-show="value == 'Test'" @vue:mounted="" session="Test" theme="DJT" :wsUrl="`${wsUrl}&profile=${value}`" />
        <XtermJs v-show="value == 'LIVE'" @vue:mounted="" session="LIVE" theme="Amber" :wsUrl="`${wsUrl}&profile=${value}`" />
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

const { sessionList, connect, attach, detach, connected, isConnected, resize } = useTerminalSocket()
const items = ref([process.env.NODE_ENV == 'development' ? 'localhost' : 'Development', 'Test', 'LIVE'])
const value = ref(process.env.NODE_ENV == 'development' ? 'localhost' : 'Test')

//  monitor-crt-terminal
//const monitorRef = useTemplateRef('monitor')
const crtRef = useTemplateRef('crt')
/*
useResizeObserver(monitorRef, (entries) => {
  //const [entry] = entries
  //const { width, height } = <DOMRectReadOnly>entry?.contentRect
  //console.log('crt resize:',width,'x',height)
  //items.value.forEach((item) => { resize(item) })
  resize(value.value)
})
*/
useResizeObserver(crtRef, (entries) => {
  resize(value.value)
})

watch(value, async (n, o) => {
  connected(value.value)
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
</script>

<style lang="css" scoped>
.resize {
  position: relative;
  background: #445 url("data:image/svg+xml,%3Csvg height='18' viewBox='0 0 10 10' width='18' stroke='RoyalBlue' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 0v4l1.5-1.5 1.5 1.5 1-1-1.5-1.5 1.5-1.5zm5 4-1 1 1.5 1.5-1.5 1.5h4v-4l-1.5 1.5z'/%3E%3C/svg%3E") 100% 100% no-repeat;
}
</style>
