<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard>
    <template #default>
      <div class="flex justify-center font-bold font-sans">
        {{ hcie }}
      </div>
      <UButton
        class="flex justify-center m-2"
        color="info"
        variant="subtle"
        :icon="icon(hcie)"
        :label="host(hcie).split('.')[0]" target="_blank" :to="`https://${host(hcie)}/linux/files#/?path=%252Ffiles`"
      />
      {{ fastFetch }}
      <RedHatCockpit
        v-for="vm in hosts(hcie)" :key="vm"
        class="flex m-1"
        :label="vm.split('.')[0]" target="_blank" :to="`https://${vm}/linux/files#/?path=%252Ffiles`"
      />
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { set } from '@vueuse/core'
import type { fastfetch } from '~/composables/useIrisSessions'

const props = defineProps<{
  hcie: HCIE
}>()

// const { ago } = useDevOps()
const { endpoint, host, hosts, icon } = useIrisSessions()
const fastFetch: Ref<fastfetch[]> = ref([])

async function FastFetch() {
  await endpoint(props.hcie, 'fastfetch').then((status) => {
    if (status) {
      set(fastFetch, status)
    }
  })
}

onMounted(async () => {
  await FastFetch()
})
</script>
