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
          <UButton class="text-2xl" icon="i-vscode-icons-file-type-vscode" color="info" variant="soft" to="." :label="`Start hacking`" />
        </div>
      </template>
      <template #footer>
        <div class="text-start text-lg">{{ now }}</div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { get, set, useNow } from '@vueuse/core'
const { data } = useAuth()
const now = useNow()
const pin = ref([])
const username = get(data)?.id

onMounted(() => {
  const result = useFetch(`/api/code-server?username=${username}`).then((response) => {
    console.log('code-server:', response)
    navigateTo(`https://hciedev.laheyhealth.org/code-server/6501/?workspace=/home/${username}/.local/share/code-server/User/Workspace/${username}-devops.code-workspace`, {
  open: { target: '_blank' } })
  })
  console.log('code-server result:', result)
})
</script>
