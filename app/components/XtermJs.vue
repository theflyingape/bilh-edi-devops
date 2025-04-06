<template>
  <!--UseFullscreen v-slot="{ toggle }"-->
    <div class="h-full w-full" ref="terminalContainer"></div>
  <!--/UseFullscreen-->
</template>

<script setup lang="ts">
const props = defineProps<{
  session: string     //  key identifier
  theme: keyof theme  //  pick a color
  rows?: number       //  25
  cols?: number       //  80
  wsUrl?: string      //  wss://${location.host}/node-pty
}>()

import { type ITerminalOptions, type ITheme } from '@xterm/xterm'
import { Terminal } from '@xterm/xterm'
import { WebglAddon } from '@xterm/addon-webgl'
import useTerminalSocket from '~/composables/useTerminalSocket'

interface theme {
  [key: string]: ITheme
}

const theme: theme = {
  Amber: {
    foreground: "#c1c2c8", background: "#403010", cursor: 'Gold', cursorAccent: 'ForestGreen',
  },
  Green: {
    foreground: "#d0d0d0", background: "#103020", cursor: 'Silver',
    black: "#000000", red: "#c80000", green: "#00c800", yellow: "#c8c000",
    blue: "#4547d8", magenta: "#c800c8", cyan: "#00c8c8", white: "#c8c8c8",
    brightBlack: "#606060", brightRed: "#fa0000", brightGreen: "#00fa00", brightYellow: "#fafa00",
    brightBlue: "#4547ff", brightMagenta: "#fa00fa", brightCyan: "#00fafa", brightWhite: "#ffffff"
  },
  White: {
    foreground: 'LightGray', background: '#102040', cursor: 'PowderBlue',
    black: 'Black', red: 'DarkRed', green: 'ForestGreen', yellow: 'SandyBrown',
    blue: 'MediumBlue', magenta: 'MediumOrchid', cyan: 'DarkCyan', white: 'Silver',
    brightBlack: 'DimGray', brightRed: 'Red', brightGreen: 'LightGreen', brightYellow: 'Gold',
    brightBlue: 'RoyalBlue', brightMagenta: 'Violet', brightCyan: 'Cyan', brightWhite: 'Snow'
  }
}

let startup: ITerminalOptions = {
  allowProposedApi: true, scrollback: 5000, scrollSensitivity: 5, smoothScrollDuration: 250,
  cursorBlink: false, drawBoldTextInBrightColors: true,
  fontFamily: 'Consolas,Lucida Console,monospace', fontSize: 20, fontWeight: 'normal', fontWeightBold: 'bold',
  theme: theme[props.theme],
  wordSeparator: ` .:;?!"'<>[=]`
}

const { sessionList, prepare } = useTerminalSocket()
const terminalContainer = ref<HTMLElement | null>(null)
const term = new Terminal({ ...startup, rows: 32, cols: 96 })

onMounted(() => {
  prepare(props.session, term, props?.wsUrl, props?.rows, props?.cols)

  if (terminalContainer.value) {
    term.open(terminalContainer.value)
    term.loadAddon(new WebglAddon())
  }
})

onBeforeUnmount(() => {
  sessionList[props.session]?.fit?.dispose()
  term.dispose()
})
</script>
