<template>
  <USelect
    :items="items"
    placeholder="business host"
    class="w-28"
  />
</template>

<script setup lang="ts">
import { get, set } from '@vueuse/core'

const { Productions, loadBusinesHosts } = useIrisSessions()
const instance = defineModel<INSTANCE>('instance', { required: true })
const production = defineModel<string>('production', { required: true })
const items = ref([])

watch(instance, async () => {
  await loadItems()
})

async function loadItems() {
  await loadBusinessHosts(get(instance), get(production), criteria).then(() => {
    set(items, Productions.get(instance.value)!.productions)
    set(production, get(items).length ? get(items)[0] : '')
  })
}

onMounted(async () => {
  await loadItems()
})
</script>
