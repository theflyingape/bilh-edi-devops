<template>
    <div class="flex justify-center h-full w-full">
        <!-- monitor with a thin bezel -->
        <div class="bg-zinc-800 p-3 rounded-md aspect-4/3">
            <XtermJs v-show="value == 'Development'" @vue:mounted=""
                session="Development"
                wsUrl="ws://hciedev.laheyhealth.org/devops/api/node-pty"
            />
            <XtermJs v-show="value == 'Test'" @vue:mounted=""
                session="Test"
                wsUrl="ws://hcietst.laheyhealth.org/devops/api/node-pty"
            />
            <XtermJs v-show="value == 'LIVE'" @vue:mounted=""
                session="LIVE"
                wsUrl="ws://hcieprd.laheyhealth.org/devops/api/node-pty"
            />
            <!-- monitor controls -->
            <div class="flex flex-cols gap-3 justify-end">
                <USelect v-model="value" :items="items" class="w-36" />
                <UButton color="action" @click="connect()">Connect</UButton>
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

watch(status, async (n, o) => {
    console.log('status', n, o)
    //terminal.value.writeln(`status = ${n}`)
})

watch(ws, async (n, o) => {
    console.log('watch', n, o)
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
