<template>
  <UTable :data="processList[props.hcie]" class="flex-1" />
</template>
<script setup lang="ts">
const props = defineProps<{
  hcie: 'Live'|'Test'|'Dev'     //  instance identifier
}>()

import type { processes } from '~/composables/useIrisSessions'
const { processList, endpoint } = useIrisSessions()
await processes()

async function processes() {
  await endpoint(props.hcie, 'processes').then((results) => {
    processList.value[props.hcie] = results?.productions || [{}]
  })
}
</script>
