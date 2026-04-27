<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/no-use-v-if-with-v-for -->
<!-- eslint-disable vue/singleline-html-element-content-newline -->
<template>
  <div v-if="online" class="flex m-1 justify-start gap-4">
    <div class="grid gap-2">
      <div>
        <div class="font-bold text-center">LIVE</div>
        <IrisProcesses hcie="Live" />
      </div>
      <div>
        <div class="font-bold text-center">TEST</div>
        <IrisProcesses hcie="Test" />
      </div>
    </div>
    <div class="m-1">
      <span class="ml-12 font-medium text-lg text-info-500">Team</span>
      <USeparator />
      <UTabs v-model="adminTab" orientation="vertical" :items="adminItems" size="xl" color="info" variant="link" class="items-start" :ui="{ list: 'items-start' }">
        <template #edi>
          <div class="flex flex-wrap gap-2 justify-around">
            <div>
              <TokensByUser />
            </div>
          </div>
        </template>
        <template #odba>
          <div class="flex flex-wrap gap-2 justify-around">
            <div v-for="(hcie, index) in infrastructure" :key="index">
              <IrisMirrorStatus v-if="hcie.app == 'Health Connect'" :hcie="index" />
            </div>
          </div>
        </template>
        <template #linux>
          <div class="flex flex-wrap gap-2 justify-around">
            <div v-for="(hcie, index) in infrastructure" :key="index">
              <UCard v-if="hcie.app == 'Health Connect' || isSysOps">
                <template #default>
                  <div class="flex justify-center font-semibold font-sans text-lg">{{ index }}</div>
                  <div class="grid grid-cols-2 justify-items-start mt-4">
                    <div>
                      <UButton
                        class="flex mb-4 pr-8 text-lg"
                        color="info"
                        size="lg"
                        variant="soft"
                        :disabled="!isAdmin && !isDevOps"
                        :icon="hcie.icon"
                        :label="hcie.vip.split('.')[0]" target="_blank" :to="cockpit(hcie.app, hcie.vip)"
                      />
                      <RedHatCockpit
                        v-for="host in hcie.hosts" v-if="isAdmin || isSysOps" :key="host"
                        class="mt-1" :os="hcie.os" :label="host.split('.')[0]" :to="cockpit(hcie.app, host)"
                      />
                    </div>
                    <div v-if="hcie.app == 'Health Connect' && (isSysOps || isAdmin)">
                      <FastFetch :hcie="index" :app="hcie.app" :instance="hcie.instance" :os="hcie.os" :vip="hcie.vip" />
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
          <i>"Welcome. Click top-right ellipsis</i>&nbsp; <UKbd size="lg" value="⋯" /> &nbsp;<i>button to identify yourself."</i> &nbsp;
          <UIcon name="i-vscode-icons-file-type-robots" class="align-middle size-12" />
        </div>
      </template>
      <template #default>
        <div class="flex-1 justify-items-center">
          <div>
            <UButton class="text-2xl" icon="i-vscode-icons-file-type-devcontainer" color="neutral" variant="soft" :label="`You are ${status}`" @click="toggleSideMenu" />
          </div>
          <div class="m-4">
            <em>If you are having problems logging in, please go back to the</em> <u><a href="/">title page</a></u> and<br>
            <em>click its</em> <UKbd value="reload" /> <em>button</em> (especially if it's colored <span class="text-red-600">red</span>) <em>to update last version cached.</em><br>
          </div>
          <div class="mt-4">
            <em>Additionally, you may have to dump your browser's cache stored for this site entirely:</em>
            <div class="ml-8 mt-4">
              <ol class="list-disc space-y-1.5">
                <li>click 'View site information' menu icon located within the URL address bar</li>
                <li>select <UIcon name="i-lucide-cookie" /> <b>Cookies and Site data</b> option</li>
                <li>select <UIcon name="i-lucide-database" /> <b>Manage on-device site data</b> option</li>
                <li>click <UIcon name="i-lucide-trash" /> to <b>delete saved data</b> for this site</li>
                <li>click <UKbd value="done" /> completes the process and prompts to <UKbd value="reload" /> the page</li>
              </ol>
            </div>
          </div>
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
import { useNow } from '@vueuse/core'

definePageMeta({
  // pageTransition: { name: 'rotate', mode: 'out-in' },
  auth: false
})

const { status } = useAuth()
const { isAdmin, isDevOps, isSysOps, online, toggleSideMenu } = useDevOps()
const { infrastructure } = useIrisSessions()

const adminItems = ref<TabsItem[]>([
  {
    label: 'HCIE',
    icon: 'i-flat-color-icons-parallel-tasks',
    slot: 'edi',
    value: 'edi',
    ui: { label: 'hover:bg-emerald-100' }
  },
  {
    label: 'IRIS',
    icon: 'i-flat-color-icons-filing-cabinet',
    slot: 'odba',
    value: 'odba',
    ui: { label: 'hover:bg-amber-100' }
  },
  {
    label: 'SYSTEMS',
    icon: 'i-flat-color-icons-linux',
    slot: 'linux',
    value: 'linux',
    ui: { label: 'hover:bg-red-100' }
  }
])
const adminTab = ref('odba')
const now = useNow()
// const scope = ref(computed(() => get(user)?.scope?.length ? get(user)?.scope[0] : ''))

function cockpit(app: string, vm: string): string {
  return app == 'Health Connect' ? `https://${vm}/linux/files#/?path=%252Ffiles` : `https://${vm}:9090`
}
</script>
