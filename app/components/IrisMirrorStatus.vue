<template>
  <UCard v-if="mirrorSet[props.hcie]" class="m-2" variant="subtle">
    <template #header>
      {{ mirrorSet[props.hcie]?.instance ?? props.hcie }}
    </template>
    <div class="text-sm font-mono" v-for="status in mirrorSet[props.hcie]?.mirrorStatus">
      {{ status.memberName }} {{ status.currentRole }}
    </div>
    <template #footer>
    </template>
  </UCard>
</template>
<script setup lang="ts">
const props = defineProps<{
  hcie: string     //  instance identifier
}>()

const { mirrorSet, endpoint } = useIrisSessions()

onActivated(() => {
  console.log('activated')
})

onMounted(() => {
  console.log('mounted')
  status()
})

function status() {
  endpoint(props.hcie, 'status').then((status:mirrorset) => {
    mirrorSet.value[props.hcie] = status
  })
}
</script>
