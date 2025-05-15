<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard v-model="mirrorSet[props.hcie]" variant="subtle">
    <template #default>
      <div class="font-bold font-sans underline">{{ mirrorSet[props.hcie]?.systemMode }}</div>
      <div v-for="mirror in mirrorSet[props.hcie]?.mirrorStatus" :key="mirror.currentRole" class="text-sm font-mono">
        <div v-if="mirror.currentRole == 'Primary'" class="font-semibold text-success">
          {{ mirror.memberName }} {{ mirror.currentRole }}
        </div>
        <div v-else>
          {{ mirror.memberName }} {{ mirror.currentRole }} {{ mirror.journalTimeLatency }} {{ mirror.databaseLatency }}
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
import { get, formatTimeAgo, set } from '@vueuse/core'

const props = defineProps<{
  hcie: 'Live' | 'Test' | 'Dev' //  instance identifier
}>()

const { ICON, mirrorSet, endpoint } = useIrisSessions()
let archiveAgo: string = 'unknown'
let backupAgo: string = 'unknown'

async function status() {
  await endpoint(props.hcie, 'status').then((status) => {
    if (status) {
      mirrorSet.value[props.hcie] = <mirrorset>status
      archiveAgo = formatTimeAgo(new Date(mirrorSet.value[props.hcie]!.lastArchive)) || "unclear"
      backupAgo = formatTimeAgo(new Date(mirrorSet.value[props.hcie]!.lastBackup)) || "unclear"
    }
  })
}

onMounted(async () => {
  await status()
})
</script>
