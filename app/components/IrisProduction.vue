<template>
  <USelect
    v-model="Production"
    :items="items"
    class="w-48"
  />
</template>

<script setup lang="ts">
import { get, set } from '@vueuse/core'
import type { INSTANCE, production } from '~/composables/useIrisSessions'

const props = defineProps<{
  hcie: Ref<INSTANCE> //  key identifier
}>()

const { Productions, endpoint } = useIrisSessions()
const Production = ref('')
const items = ref([])

watch(props.hcie, async (n, o) => {
  await load()
})

async function load() {
  const hcie = get(props.hcie)
  if (! Productions.get(hcie)) {
    await endpoint(get(props.hcie), 'productions').then((status) => {
      Productions.set(hcie, <production>status)
      set(items, Productions.get(hcie)?.productions)
      set(Production, '')
    })
  }
}

onMounted(async () => {
  await load()
})
</script>
