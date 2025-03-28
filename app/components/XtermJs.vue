<template>
    <!--UseFullscreen v-slot="{ toggle }"-->
    <div ref="terminalContainer"></div>
  <!--/UseFullscreen-->
</template>

<script setup lang="ts">
const props = defineProps<{
  session: string   //  key identifier
  wsUrl?: string    //  ws://${location.host}/devops/api/node-pty
  rows?: number     //  25
  cols?: number     //  80
}>()

const emit = defineEmits<{ close: [boolean] }>()

  import { Terminal, type ITerminalOptions } from '@xterm/xterm'
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
  let startup: client = {
    allowProposedApi: true, cursorBlink: true,
    fontFamily: 'Consolas,Lucida Console,monospace', fontSize: 22, fontWeight: 'normal', fontWeightBold: 'bold',
  }

  const { sessionList, prepare } = useTerminalSocket()

  //const terminal = defineModel<Terminal>('terminal')
  const terminalContainer = ref<HTMLElement | null>(null)
  //let terminal: Terminal | null = null

  //terminal.value = new Terminal({ ...startup, rows:27, cols:84 })
  //const term = terminal.value
  const term = new Terminal({ ...startup, rows:27, cols:84 })

  const fit = new FitAddon()
  term.loadAddon(new Unicode11Addon())
  term.loadAddon(new ClipboardAddon())
  term.loadAddon(fit)
  term.unicode.activeVersion = '11'

  prepare(props.session, term, props?.wsUrl, props?.rows, props?.cols)
  console.log(`XtermJs with xterm: ${sessionList[props.session]?.xterm}`)

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
/*
  props.socket!.onmessage = function (ev) {
    term.write(ev.data)
  }

  props.socket!.onopen = (ev) => {
    term.focus()
    term.options.cursorBlink = true
    term.writeln('\x1B[0;2mWebSocket \x1B[22mopen')
  }

  props.socket!.onclose = (ev) => {
    term.options.cursorBlink = false
    term.writeln('\x1B[0;2mWebSocket close\x1B[m')
  }

  props.socket!.onerror = (ev) => {
    term.writeln('\x1B[0;2mWebSocket \x1B[22;1;31merror\x1B[m')
  }
*/
</script>

<style scoped>
</style>
