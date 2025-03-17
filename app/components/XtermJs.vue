<template>
  <div ref="terminalContainer"></div>
</template>

<script setup lang="ts">
  import { Terminal, type ITerminalOptions } from '@xterm/xterm'
  import { FitAddon } from '@xterm/addon-fit'
  import { Unicode11Addon } from '@xterm/addon-unicode11'
  import { WebglAddon } from '@xterm/addon-webgl'
  import { ClipboardAddon } from '@xterm/addon-clipboard'

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
    fontFamily: 'Consolas,Lucida Console,monospace', fontSize: 20, fontWeight: 'normal', fontWeightBold: 'bold',
  }
  const terminalContainer = ref<HTMLElement | null>(null)
  //let terminal: Terminal | null = null

  const term = new Terminal({ ...startup, rows:30, cols:100 })
  const fit = new FitAddon()
  term.loadAddon(new Unicode11Addon())
  term.loadAddon(new ClipboardAddon())
  term.loadAddon(fit)
  term.unicode.activeVersion = '11'

  onMounted(() => {
    console.log('onMounted')
    if (terminalContainer.value) {
      term.open(terminalContainer.value)
      term.loadAddon(new WebglAddon())
      fit.fit()
      let xy = fit.proposeDimensions()
      term.resize(xy!.cols > 80 ? xy!.cols : 80, xy!.rows > 25 ? xy!.rows : 25)

      term.write('Hello from xterm.js in Nuxt 3!\r\n')

      term.onData((data) => {
        if (data === '\r') {
          term.write('\r\n')
        } else {
          term.write(data)
        }
      })
    }
  })

  onBeforeUnmount(() => {
    fit.dispose()
    term.dispose()
  })

  function resize() {
    fit.fit()
    let xy = fit.proposeDimensions()
    term.resize(100, xy!.rows)
}

</script>

<style scoped>
</style>
