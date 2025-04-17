<template>
<div class="flex flex-col items-center justify-center">
  <UCard v-if="isAdmin" class="m-2" variant="subtle">
    <template #default>
      <div class="flex flex-row justify-center">
        Mirror Status
      </div>
    </template>
  </UCard>
</div>
</template>
<script setup lang="ts">
definePageMeta({ auth:false })

interface mirrorset {
  [key: string]: {
    status: string
    instance: string
    memberStatus: string[]
    otherStatus: string[]
    mirrorStatus: [{
      memberName: string
      currentRole: string
      currentStatus: string
      journalLatency: string
      databaseLatency: string
      displayType: string
      displayStatus: string
    }]
  }
}

import { get, useFetch } from '@vueuse/core'

const { status, data } = useAuth()
const isAdmin = (get(data)?.scope[0] == 'admin' || get(data)?.scope[0] == 'systems') ? true : false

const mirrorStatus = ref({ dev:<mirrorset>{}, tst:<mirrorset>{}, prd:<mirrorset>{} })
const getMirrorDev = mirror('hciedev')
const getMirrorTest = mirror('hcietst')
const getMirrorLive = mirror('hcieprd')

function mirror(host:string) {
  const { execute, onFetchResponse } = useFetch(`https://${host}.laheyhealth.org/api/hcie/status/`, { immediate: false, timeout: 12345 } )

  onFetchResponse((response) => {
    response.json().then((value) => {
      console.log('code-server response:', JSON.stringify(value))
      if (value?.status == 'OK') {
        //set(message, `${value.status}: PID #${value.pid} started on PORT #${value.port}`)
        //set(pin, value?.pin)
        //set(url, value?.url)
      }
      else {
        //set(message, `${value.status}`)
        //set(pin, [])
        //set(url, '')
      }
    }).catch((ex) => {
      //set(message, `${ex}`)
    })
  })

  return execute
}
</script>
