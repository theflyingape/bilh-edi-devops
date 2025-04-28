<template>
  <div v-if="online && isAdmin" class="flex flex-col items-center justify-center">
    <IrisMirrorStatus hcie="Dev" />
    <IrisMirrorStatus hcie="Test" />
    <IrisMirrorStatus hcie="Live" />
  </div>
  <div v-else class="flex flex-col items-center justify-center h-lvh">
    <UCard class="drop-shadow-2xl" variant="subtle">
      <template #header>
        <div class="flex justify-end text-xl">
          <i>"Welcome. Click top-right ellipsis to identify yourself."</i>
          <UIcon name="i-vscode-icons-file-type-robots" class="align-middle size-12" />
        </div>
      </template>
      <template #default>
        <div class="flex justify-center">
          <UButton class="text-2xl" icon="i-vscode-icons-file-type-devcontainer" color="neutral" variant="soft" @click="toggleSideMenu"
            :label="`You are currently ${status}`" />
        </div>
      </template>
      <template #footer>
        <div class="text-start text-nowrap font-mono">{{ now }}</div>
      </template>
    </UCard>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ auth:false })

const { status } = useAuth()
const online = ref(computed(() => get(status) !== 'unauthenticated'))

//  does this help?
//reloadNuxtApp({ ttl: 100000 })

import { get, useNow } from '@vueuse/core'

const now = useNow()
const { toggleSideMenu } = useDevOps()
const { user } = useIrisSessions()
const isAdmin = get(user)?.scope?.includes('admin') || get(user)?.scope?.includes('systems')

</script>
