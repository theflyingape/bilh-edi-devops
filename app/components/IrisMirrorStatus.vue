<template>
  <UCard v-model="mirrorSet[props.hcie]" variant="subtle">
    <template #default>
      <div class="font-bold font-sans underline">{{ mirrorSet[props.hcie]?.systemMode }}</div>
      <div class="text-sm font-mono" v-for="status in mirrorSet[props.hcie]?.mirrorStatus">
        <div v-if="status.currentRole == 'Primary'" class="font-semibold text-success">
          {{ status.memberName }} {{ status.currentRole }}
        </div>
        <div v-else>
          {{ status.memberName }} {{ status.currentRole }} {{ status.journalTimeLatency }} {{ status.databaseLatency }}
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex font-mono justify-end italic text-sm">
        <UIcon :name="ICON[props.hcie]!" class="align-middle size-5" />Last archive: {{ archiveAgo }}&nbsp;
        <UIcon name="i-lucide-database" class="align-middle size-5" />Last backup: {{ backupAgo }}
      </div>
    </template>
  </UCard>
</template>
<script setup lang="ts">
const props = defineProps<{
  hcie: string     //  instance identifier
}>()

import { formatTimeAgo } from '@vueuse/core'
const { ICON, mirrorSet, endpoint } = useIrisSessions()
let archiveAgo: string = "unknown"
let backupAgo: string = "unknown"
status()

function status() {
  endpoint(props.hcie, 'status').then((status:mirrorset) => {
    mirrorSet.value[props.hcie] = status
    archiveAgo = formatTimeAgo(new Date(status.lastArchive)) || "unclear"
    backupAgo = formatTimeAgo(new Date(status.lastBackup)) || "unclear"
  })
}
</script>
