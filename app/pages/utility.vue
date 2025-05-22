<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="flex flex-col items-center justify-center">
    <UCard class="m-2" variant="subtle">
      <template #default>
        <div class="flex flex-row justify-center">
          <div class="w-1/4"><b>Base64</b> (<i>also known as tetrasexagesimal</i>) is a group of binary-to-text encoding schemes that transforms binary data into a sequence of printable characters.</div>
          <div><UButton class="h-10 m-4" @click="open64">Choose file</UButton></div>
          <div class="ml-2 w-1/4">
            <UTextarea v-model="ascii" class="font-mono w-full" color="neutral" autoresize :maxrows="4" placeholder="Plaintext ..."/>
          </div>
          <div class="flex flex-col justify-start">
            <UButton size="sm" icon="i-lucide-clipboard-x" color="neutral" variant="link" @click="ascii=''" />
            <UButton :color="cAscii ? 'success' : 'neutral'" :icon="cAscii ? 'i-lucide-copy-check' : 'i-lucide-copy'" variant="link" size="sm" @click="copy(ascii, 'ascii')" />
          </div>
          <div class="ml-6 w-1/3">
            <UTextarea v-model="b64" class="font-mono w-full" color="info" autoresize :maxrows="4" placeholder="base64 encoded ..." disabled />
          </div>
          <div class="flex flex-col justify-start">
            <UButton size="sm" icon="i-lucide-clipboard-x" color="neutral" variant="link" @click="ascii=''" />
            <UButton :color="cB64 ? 'success' : 'neutral'" :icon="cB64 ? 'i-lucide-copy-check' : 'i-lucide-copy'" variant="link" size="sm" @click="copy(b64, 'b64')" />
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { set, useFileSystemAccess } from '@vueuse/core'

definePageMeta({
  auth: false,
  pageTransition: { name: 'page', mode: 'out-in' }
})

const file = useFileSystemAccess({ excludeAcceptAllOption: false })

const ascii = ref()
const cAscii = ref(false)
const { base64: b64 } = useBase64(ascii)
const cB64 = ref(false)

function copy(text: string, clip: string) {
  navigator.clipboard.writeText(text)
  const copied = clip == 'ascii' ? cAscii : clip == 'b64' ? cB64 : undefined
  set(copied!, true)

  setTimeout(() => {
    set(copied!, false)
  }, 2000)
}

async function open64() {
  await file.open()
  set(ascii, file.data.value)
}
</script>
