<template>
  <IrisSelect
    v-model="instance"
    @change.prevent="loadProductions(instance)"
  />
  <USelect
    v-model="production"
    placeholder="select production"
    :items="items"
    class="max-h-fit w-48"
  />
</template>

<script setup lang="ts">
import { get, set } from '@vueuse/core'

const { Productions, loadProductions } = useIrisSessions()
const instance = defineModel<INSTANCE>('instance', { required: true })
const production = defineModel<string>('production')
const items = ref([])

watch(instance, async () => {
  await loadItems()
})

async function loadItems() {
  await loadProductions(instance.value).then(() => {
    set(items, Productions.get(instance.value)!.productions)
    set(production, get(items).length ? get(items)[0] : '')
  })
}

onMounted(async () => {
  await loadItems()
})
</script>
