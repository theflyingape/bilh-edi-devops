<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/singleline-html-element-content-newline -->
<template>
  <div v-if="online" class="m-1">
    <div class="grid grid-cols-2 gap-8">
      <div class="grid auto-rows-auto gap-4">
        <div class="font-bold text-center">LIVE</div>
        <div class="flex justify-center gap-2">
          <IrisProcesses hcie="Live" />
        </div>
      </div>
      <div class="grid auto-rows-auto gap-4">
        <div class="font-bold text-center">TEST</div>
        <div class="flex justify-center gap-2">
          <IrisProcesses hcie="Test" />
        </div>
      </div>
    </div>
    <div v-if="isAdmin" class="m-1">
      <USeparator class="h-4" color="action" orientation="horizontal" type="dotted" />
      <div class="grid grid-cols-2">
        <div class="space-y-4">
          <div class="flex justify-center">
            <IrisMirrorStatus v-if="!pending.Live" hcie="Live" />
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex justify-center">
            <IrisMirrorStatus v-if="!pending.Test" hcie="Test" />
          </div>
          <div class="flex justify-center">
            <IrisMirrorStatus hcie="Dev" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col items-center justify-center h-lvh -mt-48">
    <UCard class="drop-shadow-2xl" variant="subtle">
      <template #header>
        <div class="flex justify-end text-xl">
          <i>"Welcome{{ scope ? (', ' + scope) : '. Click top-right ellipsis to identify yourself' }}."</i>
          <UIcon name="i-vscode-icons-file-type-robots" class="align-middle size-12" />
        </div>
      </template>
      <template #default>
        <div class="flex justify-center">
          <UButton class="text-2xl" icon="i-vscode-icons-file-type-devcontainer" color="neutral" variant="soft" :label="`You are ${status}`" @click="toggleSideMenu" />
        </div>
      </template>
      <template #footer>
        <div class="text-start text-nowrap font-mono">{{ now }}</div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { get, useNow } from '@vueuse/core'

definePageMeta({
  auth: false
  // pageTransition: { name: 'rotate', mode: 'out-in' }
})

const { status } = useAuth()
const isAdmin = ref(computed(() => get(user)?.scope?.includes('admin') || get(user)?.scope?.includes('systems')))
const scope = ref(computed(() => get(user)?.scope?.length ? get(user)?.scope[0] : ''))

const now = useNow()
const { online, toggleSideMenu } = useDevOps()
const { pending, user } = useIrisSessions()

for (const hcie in get(pending))
  pending.value[hcie]!++
</script>
