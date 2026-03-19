<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div>
    <UCard variant="subtle">
      <template #default>
        <div class="text-nowrap text-sm">
          <div>{{ OS }}</div>
          <hr>
          <div>{{ CPU }} cores</div>
          <div>{{ RAM }} ({{ FREE }} avail)</div>
          <div>&nbsp;</div>
          <div>rebooted: {{ BOOT }}</div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { get, set } from '@vueuse/core'

const props = defineProps<{
  hcie: HCIE
}>()

const { ago } = useDevOps()
const { endpoint } = useIrisSessions()

interface response {
  status: string
  instance: string
  systemMode: string
  content: fastfetch[]
}
const FastFetch: Ref<fastfetch[]> = ref([])

async function sysinfo() {
  await endpoint<response>(props.hcie, 'fastfetch').then((res) => {
    set(FastFetch, res?.content || [])
  })
}

const OS = ref(computed(() => String(get(FastFetch).find(sys => sys.type == 'OS')?.result?.id ?? 'OS').toUpperCase() + ' ' + get(FastFetch).find(sys => sys.type == 'OS')?.result?.version))
const CPU = ref(computed(() => get(FastFetch).find(sys => sys.type == 'CPU')?.result?.cores.online))
const RAM = ref(computed(() => (
  (get(FastFetch).find(sys => sys.type == 'Memory')?.result?.total || 0)
  / Math.pow(1024, 3)).toFixed(1) + 'gb'))
const FREE = ref(computed(() => (
  ((get(FastFetch).find(sys => sys.type == 'Memory')?.result?.total || 0) - (get(FastFetch).find(sys => sys.type == 'Memory')?.result?.used || 0))
  / Math.pow(1024, 3)).toFixed(1) + 'gb'))
const BOOT = ref(computed(() => ago(get(FastFetch).find(sys => sys.type == 'Uptime')?.result?.bootTime) || 'not known'))

onMounted(async () => {
  await sysinfo()
})
</script>
