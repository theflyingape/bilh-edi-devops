<template>
  <div v-if="online" class="flex flex-col items-center justify-center">
    <UCard v-if="isAdmin && mirrorSet.Dev" class="m-2" variant="subtle">
      <template #header>
        {{ mirrorSet.Dev.instance }}
      </template>
      {{ mirrorSet.Dev.mirrorStatus[0]?.memberName }} {{ mirrorSet.Dev.mirrorStatus[0]?.currentRole }}
      {{ mirrorSet.Dev.mirrorStatus[1]?.memberName }} {{ mirrorSet.Dev.mirrorStatus[1]?.currentRole }}
      <template #footer>
      </template>
    </UCard>
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

interface mirrorstatus {
  memberName: string
  currentRole: string
  currentStatus: string
  journalLatency: string
  databaseLatency: string
  displayType: string
  displayStatus: string
}

interface mirrorset {
  status: string
  instance: string
  memberStatus: string[]
  otherStatus: string[]
  mirrorStatus: mirrorstatus[]
}

//  does this help?
//reloadNuxtApp({ ttl: 100000 })

import { get, useNow } from '@vueuse/core'

const now = useNow()
const { toggleSideMenu } = useDevOps()
const { HCIE, user, endpoint } = useIrisSessions()
const isAdmin = get(user)?.scope?.includes('admin') || get(user)?.scope?.includes('systems')
const mirrorSet = ref({ Dev:<mirrorset>{}, Test:<mirrorset>{}, Live:<mirrorset>{} })
//mirror(HCIE.Dev, mirrorSet.value.Dev)
//mirror(HCIE.Test, mirrorSet.value.Test)
//mirror(HCIE.Live, mirrorSet.value.Live)

function mirror(hcie:string, mirror:mirrorset) {
  endpoint(hcie, 'status').then((status) => {
    Object.assign(mirror, status)
  })
}
</script>
