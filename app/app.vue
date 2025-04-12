<template>
  <UApp :toaster="{ duration: 3583, position: 'top-left' }">
    <NuxtLoadingIndicator />
    <NuxtPwaManifest />
    <!--UBanner color="tertiary" icon="i-lucide-construction" title="Under construction -- check back for updates" close
      close-icon="i-lucide-x-circle" id="wip" /-->
    <!--UBanner color="success" icon="i-lucide-wand" title="Feat! Terminal allows you to connect into all remote sessions" close
      close-icon="i-lucide-x-circle" id="feat1" /-->
    <UBanner color="success" icon="i-lucide-wand" title="Feat! built-in managed session into your Code workspace" close
      close-icon="i-lucide-x-circle" id="feat2" />
    <UHeader>
      <template #title>
        <Logo class="h-10 w-auto" />
      </template>
      <UNavigationMenu :items="items" content-orientation="vertical" />
      <template #right>
        <div class="flex flex-cols gap-2">
          <div class="m-auto">
            <UTooltip arrow :content="{ align: 'end', side: 'left', sideOffset: 1 }" text="click to toggle fullscreen">
              <USwitch color="secondary" unchecked-icon="i-heroicons-window" checked-icon="i-heroicons-tv" size="xl"
                v-model="isFullscreen" @click="toggle" />
            </UTooltip>
          </div>
          <div class="m-auto">
            <UChip class="mt-2" :color="online" inset>
              <UTooltip arrow :content="{ align: 'center', side: 'left', sideOffset: 8 }"
                :text="`${get(data)?.id || 'click to login'}`">
                <UButton class="mb-2 pl-4 pr-4" color="neutral" variant="ghost"
                  icon="i-heroicons-ellipsis-horizontal-16-solid" @click="toggleSideMenu" />
              </UTooltip>
            </UChip>
          </div>
          <div class="m-auto">
            <UTooltip arrow :content="{ align: 'center', side: 'right', sideOffset: 8 }"
              :text="`${get(data)?.id || 'not logged in'}`">
              <UBadge :color="online" variant="outline">{{ scope }}</UBadge>
            </UTooltip>
          </div>
          <SideMenu v-model:open="sideMenu" />
        </div>
      </template>
      <template #body>
      </template>
    </UHeader>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <!--AppFooter /-->
    <!--ClientOnly>
      <LazyUContentSearch :files="files" :navigation="navigation" />
    </ClientOnly-->
  </UApp>
</template>

<script setup lang="ts">
const { seo } = useAppConfig()
/*
const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('landing'))
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('landing'), {
  server: false
})
*/
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  titleTemplate: `${seo?.siteName}`,
  ogSiteName: seo?.siteName,
  twitterCard: 'summary_large_image'
})

//const { $api } = useNuxtApp()
import { get, set, watchImmediate } from '@vueuse/core'

const { status, data } = useAuth()
const { isFullscreen, toggle } = useFullscreen()
const online = computed(() => get(status) == 'unauthenticated' ? 'action' : 'success')
const scope = ref('Guest')
const sideMenu = ref(false)

watchImmediate(data, (updated) => {
  set(scope, get(status) == 'unauthenticated' ? 'Guest' : get(data)?.scope[0] || 'Associate')
})

function toggleSideMenu() {
  set(sideMenu, !get(sideMenu))
}

const items = ref([
  [
    {
      label: 'Home',
      icon: 'i-lucide-house',
      to: '/home'
    },
    {
      label: 'Guides',
      icon: 'i-lucide-book-open',
      to: 'https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls',
      target: '_blank',
      children: [
        {
          label: 'Class Reference',
          icon: 'i-vscode-icons-file-type-manifest',
          description: 'The Documatic rendered pages off our class definitions',
          to: 'https://hciedev.laheyhealth.org/csp/documatic/%25CSP.Documatic.cls?LIBRARY=HSCUSTOM',
          target: '_blank',
        },
        {
          label: 'Interoperability production adapters',
          icon: 'i-vscode-icons-file-type-rake',
          description: 'The built-in business services and operations with adapters',
          to: 'https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls?KEY=PAGE_interop_protocols',
          target: '_blank',
        },
        {
          label: 'Healthcare Data Formats',
          icon: 'i-vscode-icons-file-type-funding',
          description: 'Ingest and transform healthcare data in your application using built-in standard-compliant tools',
          to: 'https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls?KEY=PAGE_healthcare',
          target: '_blank',
        },
        {
          label: 'Introducing Productions',
          description: 'Production basics, settings, and message flow',
          icon: 'i-lucide-house',
          to: 'https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls?KEY=EGIN_intro',
          target: '_blank',
        },
        {
          label: 'Production Best Practices',
          description: 'Project goals, delivery and documentation',
          icon: 'i-lucide-cloud-download',
          to: 'https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls?KEY=EGBP_development_overview',
          target: '_blank',
        },
      ],
    },
    {
      label: 'Dasboards',
      icon: 'i-lucide-chart-bar-stacked',
      children: [
        {
          label: 'Activity Monitor',
          icon: 'i-lucide-chart-no-axes-column',
          description: 'Trend counts and delivery service levels: by any Message Type and aggregated by an elapsed Time Period: minute to yearly',
          to: 'https://hcieprd.laheyhealth.org/csp/healthshare/hscustom/EDI.ActivityVolumeAndDuration.zen',
          target: '_blank'
        },
        {
          label: 'Enterprise Monitor',
          icon: 'i-lucide-building-2',
          description: 'Displays the overall status of all running productions.',
          to: 'https://hciedev.laheyhealth.org/csp/healthshare/hscustom/Ens.Enterprise.Portal.MonitorStatus.zen',
          target: '_blank'
        },
        {
          label: 'Workday Payroll Ops',
          icon: 'i-lucide-list-collapse',
          description: 'The Workday interfaces showing the Prior and Current payroll cycles for SLA trending and comparison',
          to: 'https://hcieprd.laheyhealth.org/csp/healthshare/hscustom/EDI.WorkdayDashboard.zen',
          target: '_blank'
        },
      ]
    },
    {
      label: 'Productions',
      icon: 'i-lucide-database',
      children: [
        {
          label: 'Development',
          icon: 'i-vscode-icons-file-type-apib',
          description: 'Prototyping & Training environment',
          to: 'https://hciedev.laheyhealth.org/csp/sys/UtilHome.csp',
          target: '_blank'
        },
        {
          label: 'Test',
          icon: 'i-vscode-icons-file-type-light-todo',
          description: 'Testing & Staging environment',
          to: 'https://hcietst.laheyhealth.org/csp/sys/UtilHome.csp',
          target: '_blank'
        },
        {
          label: 'LIVE',
          icon: 'i-vscode-icons-file-type-plsql-package',
          description: 'Production environment',
          to: 'https://hcieprd.laheyhealth.org/csp/sys/UtilHome.csp',
          target: '_blank'
        }
      ]
    },
    {
      label: 'Tools',
      icon: 'i-lucide-box',
      children: [
        {
          label: 'Terminal',
          icon: 'i-vscode-icons-file-type-shell',
          description: 'Secure CLI access into these hosts',
          to: '/terminal'
        },
        {
          label: 'Visual Studio Code',
          icon: 'i-vscode-icons-file-type-vscode',
          description: 'The IDE standard for IRIS ObjectScript, scripting, and data file manipulation',
          to: '/code'
        },
        {
          label: 'Utility',
          icon: 'vscode-icons:file-type-config',
          description: 'A variety of useful tools to assist you with mundane tasks',
          to: '/utility'
        },
        {
          label: 'Worldwide Response Center',
          icon: 'i-heroicons-globe-americas-solid',
          description: 'InterSystems Application Catalog for end user portal access to their software and support. Or call: (617) 621-0700',
          to: 'https://login.intersystems.com/login/SSO.UI.User.Catalog.cls',
          target: '_blank'
        },
      ]
    }
  ],
  [
    {
      label: 'Mission',
      icon: 'i-lucide-target',
      to: '/mission',
      disabled: false
    },
  ]
])
</script>
