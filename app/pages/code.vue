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

const response = await useFetch(`/api/code-server?username=${get(data)?.id}`)
console.log('code-server:', response)
</script>
