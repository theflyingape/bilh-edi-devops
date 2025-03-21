<template>
    <div ref="monitor" class="flex items-stretch justify-center max-h-dvh">
        <!-- monitor with a thin bezel -->
        <div class="aspect-4/3 bg-zinc-800 p-3 rounded-md flex flex-row items-stretch min-w-7/12">
            <XtermJs class="row-end-1 w-full" v-show="value == 'Development'" @vue:mounted=""
                session="Development"
                :wsUrl="`wsUrl`"
            />
            <XtermJs class="w-full" v-show="value == 'Test'" @vue:mounted=""
                session="Test"
                :wsUrl="`wsUrl`"
            />
            <XtermJs class="w-full" v-show="value == 'LIVE'" @vue:mounted=""
                session="LIVE"
                wsUrl="`wsUrl`"
            />
            <!-- side action controls -->
            <div class="flex flex-col justify-start gap-4 pl-3">
                <UButton color="action" @click="connect()">Connect</UButton>
                <USelect v-model="value" :items="items" class="w-36" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ auth:true, middleware: ["get-session"]})
import useTerminalSocket from '~/composables/useTerminalSocket'

//const { status, data } = useAuth()
const config = useRuntimeConfig()
const wsUrl = `${config.public.websocket}://${location.host}${config.app.baseURL}/api/node-pty`
const { ws, status, data, send, open, close } = useWebSocket(wsUrl, { autoConnect: false })
const { sessionList } = useTerminalSocket()
const items = ref(['Development', 'Test', 'LIVE'])
const value = ref('Development')

//const monitor = ref<HTMLElement | null>(null)
//const monitorRef = useTemplateRef<HTMLElement>('monitor')

watch(status, async (n, o) => {
    console.log(ws.value)
    console.log('status', n, o)
})

watch(ws, async (n, o) => {
    console.log(ws.value)
    console.log('ws', n, o)
})

function connect() {
    console.log('connect', sessionList.value)
    const session = sessionList.value[value.value]
    const xterm = session?.xterm
    xterm?.writeln(`Connecting to ${session?.url} ... `)
    const ws = sessionList.value[value.value]?.ws
    ws?.close(1000, 'preparing for a new connect')
    //testSocket = <WebSocket>ws.value
}

</script>
