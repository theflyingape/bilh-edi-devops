<template>
  <USelect
    v-model="Production"
    :items="items"
    class="w-48"
  />
</template>

<script setup lang="ts">
import { set } from '@vueuse/core'
import type { INSTANCE, production } from '~/composables/useIrisSessions'

const props = defineProps<{
  hcie: INSTANCE //  key identifier
}>()

const { instance, productions, endpoint } = useIrisSessions()
const items = ref([])
const Production = ref('')

watch(instance, async (n, o) => {
  await load()
})

async function load() {
  await endpoint(props.hcie, 'productions').then((status) => {
    Object.assign(productions.value[props.hcie]!, <production>status)
    set(items, productions.value[props.hcie]?.productions)
    set(Production, '')
  })
}

onMounted(async () => {
  await load()
})
</script>
