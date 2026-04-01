<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div>
    <UCard v-model="mirrorSet[hcie]" variant="subtle">
      <template #default>
        <div class="font-bold font-sans underline">{{ mirrorSet[hcie]?.systemMode || `(${hcie})` }}</div>
        <div v-if="mirrorSet[hcie]?.mirrorStatus" class="font-mono overflow-hidden text-ellipsis text-nowrap">
          <div v-for="mirror in mirrorSet[hcie]?.mirrorStatus" :key="mirror.currentRole">
            <div v-if="mirror.currentRole == 'Primary'" class="font-semibold text-success">
              {{ mirror.memberName }} {{ mirror.currentRole }}
            </div>
            <div v-else class="overflow-hidden text-ellipsis text-nowrap text-sm">
              {{ mirror.memberName }} {{ mirror.currentRole }} {{ mirror.journalTimeLatency }} {{ mirror.databaseLatency }}
            </div>
          </div>
        </div>
        <div v-else class="overflow-hidden text-ellipsis text-nowrap text-sm">
          {{ host(hcie) }} did not return any Mirror status
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end italic text-sm text-nowrap space-x-4">
          <div>
            <UIcon :name="icon(hcie)" class="align-middle size-5" />
            last archive: {{ archiveAgo }}
          </div>
          <div>
            <UIcon name="i-lucide-database" class="align-middle size-5" />
            last backup: {{ backupAgo }}
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  hcie: HCIE
}>()

const { ago } = useDevOps()
const { host, icon, mirrorSet, endpoint } = useIrisSessions()
const archiveAgo = ref(computed(() => ago(mirrorSet.value[props.hcie]!.lastArchive) || 'not known'))
const backupAgo = ref(computed(() => ago(mirrorSet.value[props.hcie]!.lastBackup) || 'not known'))

async function status() {
  await endpoint(props.hcie, 'status').then((status) => {
    if (status) {
      mirrorSet.value[props.hcie] = <mirrorset>status
    }
  })
}

onMounted(async () => {
  await status()
})
</script>
