<template>
    <!--Placeholder class="h-full" /-->
    <div id="monitor" style="align-items: center; background: #3f3933; border-radius: 1rem; height: 100%; margin: 12px auto; overflow: hidden; padding: 12px; width: 1000px">
        <div id="terminal" style="position:relative;"></div>
    </div>
</template>

<script setup lang="ts">
const { status, data } = useAuth()

import { onMounted } from 'vue';
import { Terminal } from '@xterm/xterm';
//import 'xterm/css/xterm.css';

onMounted(() => {
    const term = new Terminal()
    term.open(document.getElementById('terminal')!)
    term.write('Hello from xterm.js in Nuxt 3! \r\n')
})

</script>

<style scoped>
#terminal {
    width: 100%;
    height: 400px;
    background-color: black;
    color: white;
}
</style>
