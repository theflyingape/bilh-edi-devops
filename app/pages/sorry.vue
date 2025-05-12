<template>
  <div class="flex flex-col items-center justify-center h-lvh">
    <UCard class="drop-shadow-2xl" variant="subtle">
      <template #header>
        <div class="flex justify-end text-xl">
          <i>"Sorry, I cannot allow that."</i>
          <UIcon name="i-vscode-icons-file-type-robots" class="align-middle size-12" />
        </div>
      </template>
      <template #default>
        <div class="flex justify-center">
          <UButton class="text-2xl" icon="i-vscode-icons-file-type-devcontainer" color="neutral" variant="soft" to="."
            :label="`${status} as ${scope} is insufficient`" />
        </div>
      </template>
      <template #footer>
        <div class="text-start text-nowrap font-mono">{{ new Date().toDateString() }}<br>{{ new Date().toTimeString() }}
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ auth: false })
import { get } from '@vueuse/core'
const { status } = useAuth()
const { user } = useIrisSessions()
const scope = get(user)?.scope?.length ? get(user)?.scope[0] : 'a guest'
if (!get(user)?.scope?.length) {
  user.value.enabled = false
  setTimeout(() => { useDevOps().reload() }, 1985)
}
</script>
