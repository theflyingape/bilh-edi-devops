<template>
  <USelect
    :items="items"
    class="p-2 w-28"
  />
</template>

<script setup lang="ts">
import { get, set } from '@vueuse/core'
import type { INSTANCE, production } from '~/composables/useIrisSessions'

const props = defineProps<{
  hcie: INSTANCE //  key identifier
}>()

const { instance, productions, endpoint } = useIrisSessions()
const items = ref([])

async function load() {
  await endpoint(props.hcie, 'productions').then((status) => {
    Object.assign(productions.value[props.hcie]!, <production>status)
    set(items, productions.value[props.hcie]?.productions)
  })
}

onMounted(async () => {
  await load()
})
</script>
