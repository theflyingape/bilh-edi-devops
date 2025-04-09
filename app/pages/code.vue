<template>
  <div class="flex flex-col items-center justify-center h-lvh">
    <UCard class="drop-shadow-2xl" variant="subtle">
      <template #header>
        <div class="flex justify-end text-xl">
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
          <div v-if="pin.length">
            <UPinInput v-model="pin" type="number" length="3" disabled />
            <UButton class="text-2xl" icon="i-vscode-icons-file-type-vscode" color="info" variant="soft" target="_blank" :to="url" :label="`Start hacking`" />
          </div>
          <div v-else class="space-y-8">
            <div class=" font-semibold text-2xl  text-sky-600 text-center"><UIcon class="align-middle" name="i-vscode-icons-file-type-vscode" size="48" />&nbsp;Code Server</div>
            <SubmitButton class="text-2xl" color="action" target="_blank" :to="url" :label="`Prepare my session`" @click="execute" />
          </div>
      </div>
      </template>
      <template #footer>
        <div class="text-start text-lg">{{ now }}</div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { get, set, useNow, useFetch } from '@vueuse/core'
const { data } = useAuth()
const now = useNow()
const pin = ref([])
const url = ref('')
const username = get(data)?.id
const { execute, onFetchResponse } = useFetch(`/api/code-server?username=${username}`, { immediate: false} )

onFetchResponse((response) => {
  response.json().then((value) => {
    console.log('code-server response:', JSON.stringify(value))
    if (value?.status == 'OK') {
      set(pin, value?.pin)
      set(url, value?.url)
      //navigateTo(value?.url, { open: { target: '_blank' } })
    }
  })
})
</script>
