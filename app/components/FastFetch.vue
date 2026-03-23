<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div>
    <UCard variant="subtle">
      <template #default>
        <div class="text-center text-nowrap">
          <div class="text-md">
            {{ OS }}
            <hr>
          </div>
          <div class="text-sm">
            <div class="font-mono font-semibold">
              {{ HOST }}
            </div>
            <div>{{ CPU }} cores, {{ RAM }} mem</div>
            <div>({{ FREE }} avail)</div>
            <div>&nbsp;</div>
            <div class="text-left">
              <div>IRIS: {{ IRIS }} used</div>
              <div>Jrns: {{ JRN }} used</div>
              <div>rebooted: {{ BOOT }}</div>
            </div>
          </div>
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
  hostName: string
  instance: string
  systemMode: string
  content: [fastfetch]
}
const FastFetch: Ref<response> = ref({
  status: '', hostName: 'localhost', instance: '', systemMode: '', content: [{}]
})

async function sysinfo() {
  await endpoint<response>(props.hcie, 'fastfetch').then((res) => {
    set(FastFetch, res)
  })
}

const OS = ref(computed(() => String(get(FastFetch).content.find(sys => sys.type == 'OS')?.result?.id ?? 'OS').toUpperCase() + ' ' + get(FastFetch).content.find(sys => sys.type == 'OS')?.result?.version))
const HOST = ref(computed(() => get(FastFetch).hostName.split('.')[0]))
const CPU = ref(computed(() => get(FastFetch).content.find(sys => sys.type == 'CPU')?.result?.cores.online))
const RAM = ref(computed(() => (
  (get(FastFetch).content.find(sys => sys.type == 'Memory')?.result?.total || 0)
  / Math.pow(1024, 3)).toFixed(0) + 'gb'))
const FREE = ref(computed(() => (
  ((get(FastFetch).content.find(sys => sys.type == 'Memory')?.result?.total || 0) - (get(FastFetch).content.find(sys => sys.type == 'Memory')?.result?.used || 0))
  / Math.pow(1024, 3)).toFixed(1) + 'gb'))
const IRIS = ref(computed(() => (
  (get(FastFetch).content.find(sys => sys.type == 'Disk')?.result?.find((disk: { mountpoint: string }) => String(disk.mountpoint).match(/^\/hc.*-data$/))?.bytes.used || 0)
  / Math.pow(1024, 3)).toFixed(1) + 'gb'))
const JRN = ref(computed(() => (
  (get(FastFetch).content.find(sys => sys.type == 'Disk')?.result?.find((disk: { mountpoint: string }) => String(disk.mountpoint).match(/^\/hc.*-data\/jrn$/))?.bytes.used || 0)
  / Math.pow(1024, 3)).toFixed(0) + 'gb'))
const BOOT = ref(computed(() => ago(get(FastFetch).content.find(sys => sys.type == 'Uptime')?.result?.bootTime) || 'not known'))

onMounted(async () => {
  await sysinfo()
})
</script>
