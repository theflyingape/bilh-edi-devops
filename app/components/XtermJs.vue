<template>
  <div class="h-full w-full" ref="terminalContainer"></div>
</template>

<script setup lang="ts">
type INSTANCE = 'localhost' | 'Dev' | 'Test' | 'Live'
const props = defineProps<{
  session: INSTANCE     //  key identifier
  theme: keyof theme  //  pick a color
  fontSize?: number   //  20
  rows?: number       //  25
  cols?: number       //  80
  wsUrl?: string      //  wss://${location.host}/node-pty
}>()

import { get } from '@vueuse/core'
import { type ITerminalOptions, type ITheme } from '@xterm/xterm'
import { Terminal } from '@xterm/xterm'

interface theme {
  [key: string]: ITheme
}

const theme: theme = {
  Amber: {
    cursor: 'Gold', cursorAccent: 'DarkRed', foreground: "#c1c2c8", background: "#403010",
    selectionBackground: 'LightYellow', selectionForeground: 'Red',
  },
  Green: {
    cursor: 'Silver', cursorAccent: 'DarkCyan', foreground: "#d0d0d0", background: "#103020",
    selectionBackground: 'LightYellow', selectionForeground: 'ForestGreen',
    black: "#000000", red: "#c80000", green: "#00c800", yellow: "#c8c000",
    blue: "#4547d8", magenta: "#c800c8", cyan: "#00c8c8", white: "#c8c8c8",
    brightBlack: "#606060", brightRed: "#fa0000", brightGreen: "#00fa00", brightYellow: "#fafa00",
    brightBlue: "#4547ff", brightMagenta: "#fa00fa", brightCyan: "#00fafa", brightWhite: "#ffffff"
  },
  White: {
    cursor: 'PowderBlue', cursorAccent: 'Midnight', foreground: 'LightGray', background: '#102040', 
    selectionBackground: 'LightYellow', selectionForeground: 'DarkOrchid',
    black: 'Black', red: 'DarkRed', green: 'ForestGreen', yellow: 'SandyBrown',
    blue: 'MediumBlue', magenta: 'MediumOrchid', cyan: 'DarkCyan', white: 'Silver',
    brightBlack: 'DimGray', brightRed: 'Red', brightGreen: 'LightGreen', brightYellow: 'Gold',
    brightBlue: 'RoyalBlue', brightMagenta: 'Violet', brightCyan: 'Cyan', brightWhite: 'Snow'
  }
}

let startup: ITerminalOptions = {
  allowProposedApi: true, scrollback: 8000, scrollSensitivity: 5, smoothScrollDuration: 250,
  cursorBlink: false, drawBoldTextInBrightColors: true,
  fontFamily: 'Consolas,Lucida Console,monospace', fontSize: props?.fontSize || 20, fontWeight: 'normal', fontWeightBold: 'bold',
  theme: theme[props.theme],
  wordSeparator: ` :;?!"'<>[=]`
}

const { sessionList, prepare } = useTerminalSocket()
const terminalContainer = templateRef('terminalContainer')
const term = new Terminal({ ...startup, rows: props.rows || 25, cols: props.cols || 80 })

onMounted(() => {
  term.open(get(terminalContainer))
  prepare(props.session, term, props.wsUrl, props.rows, props.cols)
})

onBeforeUnmount(() => {
  const { detach } = useTerminalSocket()
  detach(props.session)
  sessionList[props.session]?.fit?.dispose()
  term.dispose()
})
</script>
