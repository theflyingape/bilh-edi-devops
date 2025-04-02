<template>
  <div ref="monitor" class="flex items-stretch justify-center max-h-dvh resizer">
    <!-- monitor with a thin bezel -->
    <div ref="crt" class="aspect-4/3 bg-zinc-800 p-3 rounded-md flex flex-row items-stretch min-w-7/12">
      <XtermJs class="row-end-1 w-full" v-show="value == 'localhost'" @vue:mounted="" session="localhost" theme="default" resize='monitor' :wsUrl="`${wsUrl}&profile=localhost`" />
      <XtermJs class="row-end-1 w-full" v-show="value == 'Development'" @vue:mounted="" session="Development" theme="default" :wsUrl="`${wsUrl}&profile=Development`" />
      <XtermJs class="w-full" v-show="value == 'Test'" @vue:mounted="" session="Test" theme="CCC" :wsUrl="`${wsUrl}&profile=Test`" />
      <XtermJs class="w-full" v-show="value == 'LIVE'" @vue:mounted="" session="LIVE" theme="Snow" :wsUrl="`${wsUrl}&profile=LIVE`" />
      <!-- side action controls -->
      <div class="flex flex-col justify-start gap-4 pl-3">
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
import useTerminalSocket from '~/composables/useTerminalSocket'

const config = useRuntimeConfig()
const id = process.env.NODE_ENV == 'development' ? 'theflyingape' : useAuth().data?.value?.id
//const wsUrl = `${config.public.websocket}://${location.host}${config.app.baseURL}/node-pty?id=${id}`
const wsUrl = `${config.public.websocket}://${location.host}/node-pty?id=${id}`

const { sessionList, connect, attach, detach, connected, isConnected } = useTerminalSocket()
const items = ref([process.env.NODE_ENV == 'development' ? 'localhost' : 'Development', 'Test', 'LIVE'])
const value = ref(process.env.NODE_ENV == 'development' ? 'localhost' : 'Development')

watch(value, async (n, o) => {
  isConnected.value = connected(value.value)
})

function terminal() {
  const sessionId = value.value
  xterm()?.write(`\n\x1B[2mConnecting to a new \x1B[0;1m${sessionId}\x1B[0;2m shell session as \x1B[m${id} ... `)
  //  establish WebSocket pipe for client <-> shell
  connect(sessionId)
  attach(sessionId)
  console.log(sessionList[sessionId]?.status)
}

function terminate() {
  const sessionId = value.value
  xterm()?.writeln(`\r\n\x1B[2mDisconnecting \x1B[0;1m${sessionId}\x1B[0;2m shell session`)
  detach(sessionId)
  console.log(sessionList[sessionId]?.status)
}

function xterm(sessionId = value.value) {
  const session = sessionList[sessionId]
  return session?.xterm
}

const crtRef = useTemplateRef('crt')

useResizeObserver(crtRef, (entries) => {
  const [entry] = entries
  const { width, height } = <DOMRectReadOnly>entry?.contentRect
  console.log('crt resize:',width,'x',height)
  //resize()
})

</script>
