<template>
  <UTable :data="processList[props.hcie]" class="flex-1" />
</template>
<script setup lang="ts">
const props = defineProps<{
  hcie: string     //  instance identifier
}>()

import type { processes } from '~/composables/useIrisSessions'
const { processList, endpoint } = useIrisSessions()
processes()

function processes() {
  endpoint(props.hcie, 'processes').then((results:processes) => {
    processList.value[props.hcie] = results || [
      { Production:'HSCUSTOM', File:2, Net:0, Queue:6 },
      { Production:'Training', File:1, Net:2, Queue:3, Misc:4 }
    ]
  })
}
</script>
