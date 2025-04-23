<template>
<div class="flex flex-col items-center justify-center">
  <UCard v-if="isAdmin && mirrorSet.Dev" class="m-2" variant="subtle">
    <template #header>
      {{ mirrorSet.Dev.instance }}
    </template>
    {{ mirrorSet.Dev.mirrorStatus[0]?.memberName }} {{ mirrorSet.Dev.mirrorStatus[0]?.currentRole }}
    {{ mirrorSet.Dev.mirrorStatus[1]?.memberName }} {{ mirrorSet.Dev.mirrorStatus[1]?.currentRole }}
    <template #footer>
      <Placeholder class="h-8" />
    </template>
  </UCard>
</div>
</template>
<script setup lang="ts">
definePageMeta({ auth:false })

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

import type { RefSymbol } from '@vue/reactivity'
import { get } from '@vueuse/core'
import useIrisTokens from '~~/server/routes/api/iris-sessions'

const { status, data } = useAuth()
const isAdmin = (get(data)?.scope[0] == 'admin' || get(data)?.scope[0] == 'systems') ? true : false
const { HCIE, endpoint } = useIrisTokens()
const mirrorSet = ref({ Dev:<mirrorset>{}, Test:<mirrorset>{}, Live:<mirrorset>{} })
mirror(HCIE.Dev, mirrorSet.value.Dev)
//mirror(HCIE.Test, mirrorSet.value.Test)
//mirror(HCIE.Live, mirrorSet.value.Live)

function mirror(hcie:string, mirror:mirrorset) {
  const user = get(data)?.id
  if (user) {
    endpoint(hcie, user, 'status').then((status) => {
      Object.assign(mirror, status)
    })
  }
}
</script>
