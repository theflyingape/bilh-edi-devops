<template>
    <div ref="monitor" class="flex items-stretch justify-center max-h-dvh">
        <!-- monitor with a thin bezel -->
        <div class="aspect-4/3 bg-zinc-800 p-3 rounded-md flex flex-row items-stretch min-w-7/12">
            <XtermJs class="row-end-1 w-full" v-show="value == 'Development'" @vue:mounted=""
                session="Development"
                wsUrl="ws://hciedev.laheyhealth.org/devops/api/node-pty"
            />
            <XtermJs class="w-full" v-show="value == 'Test'" @vue:mounted=""
                session="Test"
                wsUrl="ws://hcietst.laheyhealth.org/devops/api/node-pty"
            />
            <XtermJs class="w-full" v-show="value == 'LIVE'" @vue:mounted=""
                session="LIVE"
                wsUrl="ws://hcieprd.laheyhealth.org/devops/api/node-pty"
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
import useTerminalSocket from '~/composables/useTerminalSocket'

definePageMeta({ auth:true, middleware: ["get-session"]})

//const { status, data } = useAuth()
const { ws, status, data, send, open, close } = useWebSocket(`ws://${location.host}/devops/api/node-pty`, { autoConnect: false })
const { sessionList } = useTerminalSocket()
const items = ref(['Development', 'Test', 'LIVE'])
const value = ref('Development')

//const monitor = ref<HTMLElement | null>(null)
//const monitorRef = useTemplateRef<HTMLElement>('monitor')

watch(status, async (n, o) => {
    //console.log('status', n, o)
})

watch(ws, async (n, o) => {
    //console.log('watch', n, o)
})

function connect() {
    console.log('connect', sessionList.value)
    const session = sessionList.value[value.value]
    const xterm = session?.xterm
    xterm?.writeln(`Connecting to ${session?.url} ... `)
    const ws = sessionList.value[value.value]?.ws
    //testSocket = <WebSocket>ws.value
}

</script>
