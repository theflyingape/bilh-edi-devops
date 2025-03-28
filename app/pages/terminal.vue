<template>
  <div ref="monitor" class="flex items-stretch justify-center max-h-dvh">
    <!-- monitor with a thin bezel -->
    <div class="aspect-4/3 bg-zinc-800 p-3 rounded-md flex flex-row items-stretch min-w-7/12">
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
const wsUrl = `${config.public.websocket}://${location.host}${config.app.baseURL}/api/node-pty`
const { ws, status, data, send, open, close } = useWebSocket(wsUrl, { autoConnect: false })
const { sessionList, connect, attach } = useTerminalSocket()
const items = ref(['Development', 'Test', 'LIVE'])
const value = ref('Development')

//const monitor = ref<HTMLElement | null>(null)
//const monitorRef = useTemplateRef<HTMLElement>('monitor')

watch(ws, async (n, o) => {
  console.log(ws.value)
  console.log('ws now:', n, 'from:', o)
})

watch(status, async (n, o) => {
  console.log(ws.value)
  console.log('status now:', n, 'from:', o)
})

function terminal() {
  const session = sessionList[value.value]
  console.log('connect', value.value)
  const xterm = session?.xterm
  console.log('xterm', xterm)
  xterm?.writeln(`Connecting to ${session?.url} ... `)
  $fetch('/api/terminal', { method: 'POST', body: {
    profile: value.value
  }}).then((result) => {
    console.log('terminal post:', result)
    if (session) {
      if (session.ws) session.ws.close(1000, 'closing to prepare for a new session')
      session.ws = connect(value.value)
      xterm?.writeln(`Attaching to ${ws.value} ... `)
      attach(value.value)
      /*
      session.ws?.addEventListener('open', (event) => {
        console.log('ws open', event)
      })

      session.ws?.addEventListener('message', (event) => {
        console.log('ws message', event)
      })

      session.ws?.addEventListener('close', (event) => {
        console.log('ws close', event)
      })
      */
    }
  })
  //testSocket = <WebSocket>ws.value
}
</script>
