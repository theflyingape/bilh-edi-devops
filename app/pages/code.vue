<template>
  <div class="flex h-dvh">
    <UCard class="m-auto" variant="outline">
      <template #header>
        <div class="flex justify-end text-lg">
          <div v-if="pin.length">
            <i>"Use this PIN as your PASSWORD."</i>
            <UIcon name="i-vscode-icons-file-type-robots" class="align-middle size-12" />
          </div>
          <div v-else>
            <i>"Hello. May I prepare a working session for you?"</i>
            <UIcon name="i-vscode-icons-file-type-robots" class="align-middle size-12" />
          </div>
        </div>
      </template>
      <template #default>
        <div class="flex flex-col gap-4 items-center">
          <div v-if="pin.length" class="space-y-8">
            <UPinInput v-model="pin" type="number" length="3" class="font-semibold text-center text-2xl" disabled />
            <div><UButton class="text-2xl" icon="i-vscode-icons-file-type-vscode" color="info" variant="soft" target="_blank" :to="url" :label="`Start hacking`" /></div>
          </div>
          <div v-else class="space-y-8">
            <div class="font-semibold text-center text-2xl text-sky-600"><UIcon class="align-middle" name="i-vscode-icons-file-type-vscode" size="48" />&nbsp; Code Server</div>
            <SubmitButton class="text-2xl" color="action" target="_blank" :to="url" :label="`Prepare my session`" loading-auto @click="execute" />
          </div>
          <div v-if="message" class="text-center text-sm text-info-600">{{ message }}</div>
          <div v-if="aborted" class="text-center text-error-600">Aborted by timeout!</div>
      </div>
      </template>
      <template #footer>
        <div class="text-start text-nowrap font-mono">{{ now }}</div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { get, set, useNow, useFetch } from '@vueuse/core'
const { data } = useAuth()
const now = useNow()
const message = ref('')
const pin = ref([])
const url = ref('')
const username = get(data)?.id
const { aborted, execute, onFetchResponse } = useFetch(`/api/code-server?username=${username}`, { immediate: false, timeout: 12345 } )

onFetchResponse((response) => {
  response.json().then((value) => {
    console.log('code-server response:', JSON.stringify(value))
    if (value?.status == 'OK') {
      set(message, `${value.status}: PID #${value.pid} started on PORT #${value.port}`)
      set(pin, value?.pin)
      set(url, value?.url)
    }
    else {
      set(message, `${value.status}`)
      set(pin, [])
      set(url, '')
    }
  }).catch((ex) => {
    set(message, `${ex}`)
  })
})

onMounted(() => {
  const style = document.body.style
  style.backgroundImage = "url('/vscode-background.png')"
  style.backgroundPosition = 'center'
  style.backgroundRepeat = 'no-repeat'
  style.backgroundSize = 'contain'
})

onBeforeUnmount(() => {
  const style = document.body.style
  style.backgroundImage = 'none'
  style.backgroundPosition = ''
  style.backgroundRepeat = ''
  style.backgroundSize = ''
})
</script>
