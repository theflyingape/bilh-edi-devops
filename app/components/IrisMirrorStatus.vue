<template>
  <UCard v-if="mirrorSet[props.hcie]" class="m-1" variant="subtle">
    <div class="font-bold font-sans underline">{{ mirrorSet[props.hcie]?.systemMode }}</div>
    <div class="text-sm font-mono" v-for="status in mirrorSet[props.hcie]?.mirrorStatus">
      <div v-if="status.currentRole == 'Primary'" class="font-semibold text-success">
        {{ status.memberName }} {{ status.currentRole }}
      </div>
      <div v-else>
        {{ status.memberName }} {{ status.currentRole }} {{ status.journalTimeLatency }} {{ status.databaseLatency }}
      </div>
    </div>
    <div class="text-sm font-mono italic">Last backup: {{ mirrorSet[props.hcie]?.lastBackup }}</div>
  </UCard>
</template>
<script setup lang="ts">
const props = defineProps<{
  hcie: string     //  instance identifier
}>()

const { mirrorSet, endpoint } = useIrisSessions()

onMounted(() => {
  status()
})

async function status() {
  await endpoint(props.hcie, 'status').then((status:mirrorset) => {
    mirrorSet.value[props.hcie] = status
  })
}
</script>
