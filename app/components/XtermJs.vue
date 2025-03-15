<template>
    <div class="bezel"><div ref="terminalContainer" class="terminal"></div></div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Terminal } from '@xterm/xterm'
  //import 'xterm/css/xterm.css'

  const terminalContainer = ref<HTMLElement | null>(null)
  let terminal: Terminal | null = null

  onMounted(() => {
    if (terminalContainer.value) {
      terminal = new Terminal()
      terminal.open(terminalContainer.value)
      terminal.write('Hello from xterm.js in Nuxt 3!\r\n')

      terminal.onData((data) => {
        if (data === '\r') {
          terminal?.write('\r\n')
        } else {
          terminal?.write(data)
        }
      })
    }
    console.log('terminal mounted')
  })

  onBeforeUnmount(() => {
    console.log('terminal dispose')
    terminal?.dispose()
  })
</script>

<style scoped>
  .bezel {
      align-items: center;
      background: #3f3933;
      border-radius: 1rem;
      height: 100%;
      margin: 12px auto;
      overflow: hidden;
      padding: 12px;
      width: 100%;
  }
  .terminal {
      width: 100%;
      height: 600px;
      background-color: black;
      color: white;
  }
</style>
