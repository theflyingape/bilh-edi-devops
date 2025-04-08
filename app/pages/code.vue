<template>
  <div class="flex flex-col items-center justify-center h-lvh">
    <UCard class="drop-shadow-2xl" variant="subtle">
      <template #header>
        <div class="flex justify-end text-xl">
          <i>"Use this PIN when prompted for PASSWORD."</i>
          <UIcon name="i-vscode-icons-file-type-robots" class="align-middle size-12" />
        </div>
      </template>
      <template #default>
        <div class="flex flex-col gap-4 items-center">
          <UPinInput v-model="pin" type="number" length="3" disabled />
          <UButton class="text-2xl" icon="i-vscode-icons-file-type-vscode" color="info" variant="soft" :to="url" :label="`Start hacking`" />
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

onMounted(() => {
  const { data } = useFetch(`/api/code-server?username=${username}`).get().json()
  console.log('code-server data:', JSON.stringify(get(data)))
  if (get(data)?.status == 'OK') {
    set(pin, get(data)?.pin)
    set(url, get(data)?.url)
    //navigateTo(get(url), { open: { target: '_blank' } })
  }
})
</script>
