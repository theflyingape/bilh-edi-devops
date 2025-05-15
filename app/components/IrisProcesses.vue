<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UTable class="flex-1" :data="processList[props.hcie]" />
</template>

<script setup lang="ts">
import type { processes } from '~/composables/useIrisSessions'

const props = defineProps<{
  hcie: 'Live' | 'Test' | 'Dev' //  instance identifier
}>()

const { pending, processList, endpoint } = useIrisSessions()

await processes()

async function processes() {
  await endpoint(props.hcie, 'processes').then((results) => {
    processList.value[props.hcie] = results?.productions || [{}]
    pending.value[props.hcie] = 1
  })
}
</script>
