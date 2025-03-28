<template>
  <div ref="monitor" class="flex items-stretch justify-center max-h-dvh">
    <!-- monitor with a thin bezel -->
    <div class="aspect-4/3 bg-zinc-800 p-3 rounded-md flex flex-row items-stretch min-w-7/12">
      <XtermJs class="row-end-1 w-full" v-show="value == 'localhost'" @vue:mounted="" session="localhost"
        :wsUrl="`${wsUrl}`" />
      <XtermJs class="row-end-1 w-full" v-show="value == 'Development'" @vue:mounted="" session="Development"
        :wsUrl="`${wsUrl}`" />
      <XtermJs class="w-full" v-show="value == 'Test'" @vue:mounted="" session="Test" :wsUrl="`${wsUrl}`" />
      <XtermJs class="w-full" v-show="value == 'LIVE'" @vue:mounted="" session="LIVE" :wsUrl="`${wsUrl}`" />
      <!-- side action controls -->
      <div class="flex flex-col justify-start gap-4 pl-3">
        <UButton color="action" @click="terminal">Connect</UButton>
        <USelect v-model="value" :items="items" class="w-36" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useTerminalSocket from '~/composables/useTerminalSocket'

const config = useRuntimeConfig()
const id = process.env.NODE_ENV == 'development' ? 'theflyingape' : useAuth().data?.value?.id
const wsUrl = `${config.public.websocket}://${location.host}${config.app.baseURL}/api/node-pty?id=${id}`
//const { ws, status, data, send, open, close } = useWebSocket(wsUrl, { autoConnect: false })
const { sessionList, connect, attach } = useTerminalSocket()
const items = ref([process.env.NODE_ENV == 'development' ? 'localhost' : 'Development', 'Test', 'LIVE'])
const value = ref(process.env.NODE_ENV == 'development' ? 'localhost' : 'Development')

//const monitor = ref<HTMLElement | null>(null)
//const monitorRef = useTemplateRef<HTMLElement>('monitor')

function terminal() {
  const sessionId = value.value
  const session = sessionList[sessionId]
  const xterm = session?.xterm

  if (session && xterm) {
    xterm.write(`\n\x1B[2mConnecting to a new \x1B[0;1m${sessionId}\x1B[0;2m shell session as \x1B[m${id} ... `)
    //  establish WebSocket pipe for client <-> shell
    connect(value.value)
    attach(sessionId)
  }
}
</script>
