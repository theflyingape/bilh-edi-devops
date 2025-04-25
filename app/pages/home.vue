<template>
<div class="flex flex-col items-center justify-center">
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

//  does this help?
//reloadNuxtApp({ ttl: 100000 })

import { get } from '@vueuse/core'

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
