<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/singleline-html-element-content-newline -->
<template>
  <div v-if="online" class="m-1">
    <div class="grid grid-cols-2 gap-8">
      <div class="grid auto-rows-auto gap-4">
        <div class="font-bold text-center">LIVE</div>
        <div class="flex justify-center gap-2">
          <IrisProcesses hcie="Live" />
        </div>
      </div>
      <div class="grid auto-rows-auto gap-4">
        <div class="font-bold text-center">TEST</div>
        <div class="flex justify-center gap-2">
          <IrisProcesses hcie="Test" />
        </div>
      </div>
    </div>
    <div v-if="isAdmin" class="m-1">
      <USeparator class="h-4" color="action" orientation="horizontal" type="dotted" />
      <UTabs v-model="adminTab" orientation="vertical" :items="adminItems" size="xl" variant="link" class="items-start" :ui="{ list: 'items-start' }">
        <template #edi>
          WIP
        </template>
        <template #odba>
          <div class="flex flex-wrap gap-2 justify-around">
            <div v-for="(hcie, index) in infrastructure" :key="index">
              <IrisMirrorStatus :hcie="index" />
            </div>
          </div>
        </template>
        <template #linux>
          <div class="flex flex-wrap gap-2 justify-around">
            <div v-for="(hcie, index) in infrastructure" :key="index">
              <UCard>
                <template #default>
                  <div class="flex justify-center font-semibold font-sans text-lg">{{ index }}</div>
                  <div class="grid grid-cols-2 justify-items-start mt-4">
                    <div>
                      <UButton
                        class="flex flex-grow mb-4 text-lg"
                        color="info"
                        size="lg"
                        variant="soft"
                        :icon="hcie.icon"
                        :label="hcie.vip.split('.')[0]" target="_blank" :to="`https://${hcie.vip}/linux/files#/?path=%252Ffiles`"
                      />
                      <RedHatCockpit
                        v-for="host in hcie.hosts" :key="host"
                        class="mt-1" :label="host.split('.')[0]" :to="`https://${host}/linux/files#/?path=%252Ffiles`"
                      />
                    </div>
                    <div>
                      <FastFetch :hcie="index" />
                    </div>
                  </div>
                </template>
              </UCard>
            </div>
          </div>
        </template>
      </UTabs>
    </div>
  </div>
  <div v-else class="flex flex-col items-center justify-center h-lvh -mt-48">
    <UCard class="drop-shadow-2xl" variant="subtle">
      <template #header>
        <div class="flex justify-end text-xl">
          <i>"Welcome{{ scope ? (', ' + scope) : '. Click top-right ellipsis to identify yourself' }}."</i>
          <UIcon name="i-vscode-icons-file-type-robots" class="align-middle size-12" />
        </div>
      </template>
      <template #default>
        <div class="flex justify-center">
          <UButton class="text-2xl" icon="i-vscode-icons-file-type-devcontainer" color="neutral" variant="soft" :label="`You are ${status}`" @click="toggleSideMenu" />
        </div>
      </template>
      <template #footer>
        <div class="text-start text-nowrap font-mono">{{ now }}</div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { get, useNow } from '@vueuse/core'

definePageMeta({
  // pageTransition: { name: 'rotate', mode: 'out-in' },
  auth: false
})

const { status } = useAuth()
const { isAdmin, online, toggleSideMenu } = useDevOps()
const { infrastructure, user } = useIrisSessions()

const adminItems = ref<TabsItem[]>([
  {
    label: 'HCIE',
    icon: 'i-flat-color-icons-parallel-tasks',
    slot: 'edi',
    value: 'edi'
  },
  {
    label: 'IRIS',
    icon: 'i-flat-color-icons-filing-cabinet',
    slot: 'odba',
    value: 'odba'
  },
  {
    label: 'SYSTEMS',
    icon: 'i-flat-color-icons-linux',
    slot: 'linux',
    value: 'linux'
  }
])
const adminTab = ref('odba')
const now = useNow()
const scope = ref(computed(() => get(user)?.scope?.length ? get(user)?.scope[0] : ''))
</script>
