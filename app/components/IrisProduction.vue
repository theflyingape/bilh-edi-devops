<template>
  <div class="flex nowrap">
    <IrisSelect
      v-model="hcie"
      placeholder="instance"
      :epic="false"
      @change.prevent="loadProductions(hcie)"
    />
    &nbsp;
    <USelect
      v-model="production"
      placeholder="production"
      :items="items"
      class="max-h-fit"
      :ui="{ content: 'min-w-fit' }"
    />
  </div>
</template>

<script setup lang="ts">
import { get, set } from '@vueuse/core'

const props = defineProps<{
  hcie?: HCIE
  production?: string
}>()

const { Productions, loadProductions } = useIrisSessions()
const hcie = ref(props.hcie)
const production = ref(props.production)
const items = ref([])

watch(hcie, async () => {
  await loadItems()
})

async function loadItems() {
  const instance = get(hcie)
  if (instance) {
    await loadProductions(instance).then(() => {
      set(items, Productions.get(instance)!.productions)
      set(production, get(items).length ? get(items)[0] : '')
    })
  }
}

onMounted(async () => {
  await loadItems()
})
</script>
