<template>
  <!--UseFullscreen v-slot="{ toggle }"-->
    <div ref="terminalContainer"></div>
  <!--/UseFullscreen-->
</template>

<script setup lang="ts">
const props = defineProps<{
  session: string     //  key identifier
  theme: keyof theme  //  pick a color
  rows?: number       //  25
  cols?: number       //  80
  wsUrl?: string      //  ws://${location.host}/devops/api/node-pty
}>()

  import { Terminal, type ITerminalOptions, type ITheme } from '@xterm/xterm'
  import { FitAddon } from '@xterm/addon-fit'
  import { Unicode11Addon } from '@xterm/addon-unicode11'
  import { WebglAddon } from '@xterm/addon-webgl'
  import { ClipboardAddon } from '@xterm/addon-clipboard'
  import useTerminalSocket from '~/composables/useTerminalSocket'

  interface client extends ITerminalOptions {
    title?: string
    bgColor?: string
    keymap?: [{
      key: string
      shiftKey: boolean
      mapCode: number
    }]
  }

  interface theme {
    [key: string]: ITheme
  }

  const theme: theme = {
    default: {
      foreground: "#c1c2c8", background: "#010204"
    },
    CCC: {
      foreground: "#d0d0d0", background: "#008080",
      black: "#000000", red: "#c00000", green: "#00c000", yellow: "#c8c000",
      blue: "#0000c0", magenta: "#c000c0", cyan: "#00c0c0", white: "#c8c8c8",
      brightBlack: "#606060", brightRed: "#fa0000", brightGreen: "#00fa00", brightYellow: "#fafa00",
      brightBlue: "#0000fa", brightMagenta: "#fa00fa", brightCyan: "#00fafa", brightWhite: "#fafafa"
    },
    Snow: {
      foreground: 'Silver', background: 'Black', cursor: 'PowderBlue',
      black: 'Black', red: 'DarkRed', green: 'ForestGreen', yellow: 'SandyBrown',
      blue: 'MediumBlue', magenta: 'MediumOrchid', cyan: 'DarkCyan', white: 'Silver',
      brightBlack: 'DimGray', brightRed: 'Red', brightGreen: 'LightGreen', brightYellow: 'Gold',
      brightBlue: 'RoyalBlue', brightMagenta: 'Violet', brightCyan: 'Cyan', brightWhite: 'Snow'
    }
  }

  let startup: client = {
    allowProposedApi: true, cursorBlink: true, drawBoldTextInBrightColors: true,
    scrollback: 4000, theme: theme[props.theme],
    fontFamily: 'Consolas,Lucida Console,monospace', fontSize: 22, fontWeight: 'normal', fontWeightBold: 'bold',
    wordSeparator: ` .:;?!"'<>(/)[=]`
  }

  const { sessionList, prepare } = useTerminalSocket()

  const terminalContainer = ref<HTMLElement | null>(null)
  const term = new Terminal({ ...startup, rows:27, cols:84 })

  const fit = new FitAddon()
  term.loadAddon(new Unicode11Addon())
  term.loadAddon(new ClipboardAddon())
  term.loadAddon(fit)
  term.unicode.activeVersion = '11'

  prepare(props.session, term, props?.wsUrl, props?.rows, props?.cols)

  onMounted(() => {
    console.log('onMounted')
    if (terminalContainer.value) {
      term.open(terminalContainer.value)
      term.loadAddon(new WebglAddon())
      resize()
      //window.addEventListener('resize', resize)
/*
      term.onData((data) => {
          props?.socket!.send(data)
      })
*/
    }
  })

  onBeforeUnmount(() => {
    fit.dispose()
    term.dispose()
  })

  function resize() {
    fit.fit()
    let xy = fit.proposeDimensions()
    term.write(`\r\nresize: ${xy!.rows}x${xy!.cols} \r\n`)
    term.resize(xy!.cols > 80 ? xy!.cols : 100, xy!.rows > 25 ? xy!.rows : 25)
  }
</script>

<style scoped>
</style>
