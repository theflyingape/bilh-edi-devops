<!-- eslint-disable vue/first-attribute-linebreak -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UApp :toaster="{ duration: 3000, position: 'top-left' }">
    <NuxtLoadingIndicator />
    <!-- UBanner color="tertiary" icon="i-lucide-construction" title="Under construction -- check back for updates" close
      close-icon="i-lucide-x-circle" id="wip" / -->
    <!-- UBanner color="success" icon="i-lucide-wand" title="Feat! Terminal allows you to connect into all remote sessions" close
      close-icon="i-lucide-x-circle" id="feat1" / -->
    <!-- UBanner color="success" icon="i-lucide-wand" title="Feat! built-in managed session into your Code workspace" close
      close-icon="i-lucide-x-circle" id="feat2" / -->
    <UHeader>
      <template #title>
        <Logo class="h-10 w-auto" />
      </template>
      <UNavigationMenu :items="items" content-orientation="horizontal" />
      <template #right>
        <div class="flex flex-cols gap-2">
          <div class="m-auto">
            <UTooltip arrow :content="{ align: 'end', side: 'left', sideOffset: 1 }" text="click to toggle fullscreen">
              <USwitch v-model="isFullscreen" color="secondary" unchecked-icon="i-heroicons-tv" checked-icon="i-lucide-scaling" size="xl" @click="toggle" />
            </UTooltip>
          </div>
          <div class="m-auto">
            <UChip class="mt-2" :color="chip" inset>
              <UTooltip arrow :content="{ align: 'center', side: 'left', sideOffset: 8 }"
                        :text="`${get(user)?.id || 'click to login'}`"
              >
                <UButton class="mb-2 pl-4 pr-4" color="neutral" variant="ghost"
                         icon="i-heroicons-ellipsis-horizontal-16-solid" @click="toggleSideMenu"
                />
              </UTooltip>
            </UChip>
          </div>
          <div class="m-auto">
            <UBadge :color="chip" variant="outline">
              {{ who }}
            </UBadge>
          </div>
          <SideMenu v-model:open="sideMenu" />
        </div>
      </template>
      <template #body />
    </UHeader>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <!-- AppFooter / -->
    <!-- ClientOnly>
      <LazyUContentSearch :files="files" :navigation="navigation" />
    </ClientOnly -->
  </UApp>
</template>

<script setup lang="ts">
import { get } from '@vueuse/core'

const { seo } = useAppConfig()
/*
const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('landing'))
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('landing'), {
  server: false
})
*/
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: { lang: 'en' }
})

useSeoMeta({
  titleTemplate: `${seo?.siteName}`,
  ogSiteName: seo?.siteName,
  twitterCard: 'summary_large_image'
})

const { online, sideMenu, toggleSideMenu } = useDevOps()
const { ICON, user } = useIrisSessions()
const { status, signOut } = useAuth()
const { isFullscreen, toggle } = useFullscreen()
const chip = ref(computed(() => get(online) ? 'success' : 'action'))
const who = ref(computed(() => get(status) == 'unauthenticated' ? 'Guest' : get(user).scope?.length ? get(user).scope[0] : 'Associate'))

// sanity check for a broken app/page but had a lingering browser session token
if (get(who) == 'Associate') {
  user.value.enabled = false
  user.value.scope = []
  await signOut({ callbackUrl: '/logout', external: true })
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
          target: '_blank'
        },
        {
          label: 'Interoperability production adapters',
          icon: 'i-vscode-icons-file-type-rake',
          description: 'The built-in business services and operations with adapters',
          to: 'https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls?KEY=PAGE_interop_protocols',
          target: '_blank'
        },
        {
          label: 'Healthcare Data Formats',
          icon: 'i-vscode-icons-file-type-funding',
          description: 'Ingest and transform healthcare data in your application using built-in standard-compliant tools',
          to: 'https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls?KEY=PAGE_healthcare',
          target: '_blank'
        },
        {
          label: 'Using ObjectScript',
          icon: 'i-vscode-icons-file-type-script',
          description: 'When there is need to write code to extend a built-in component or to create a component from scratch',
          to: 'https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls?KEY=GCOS',
          target: '_blank'
        },
        {
          label: 'Introducing Productions',
          description: 'Production basics, settings, and message flow',
          icon: 'i-lucide-house',
          to: 'https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls?KEY=EGIN_intro',
          target: '_blank'
        },
        {
          label: 'Production Best Practices',
          description: 'Project goals, delivery and documentation',
          icon: 'i-lucide-cloud-download',
          to: 'https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls?KEY=EGBP_development_overview',
          target: '_blank'
        }
      ]
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
        }
      ]
    },
    {
      label: 'Productions',
      icon: 'i-lucide-database',
      children: [
        {
          label: 'LIVE',
          icon: ICON.Live,
          description: 'Production environment',
          to: 'https://hcieprd.laheyhealth.org/csp/sys/UtilHome.csp',
          target: '_blank'
        },
        {
          label: 'Test',
          icon: ICON.Test,
          description: 'Testing & Staging environment',
          to: 'https://hcietst.laheyhealth.org/csp/sys/UtilHome.csp',
          target: '_blank'
        },
        {
          label: 'Development',
          icon: ICON.Dev,
          description: 'Prototyping & Training environment',
          to: 'https://hciedev.laheyhealth.org/csp/sys/UtilHome.csp',
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
        }
      ]
    }
  ],
  [
    {
      label: 'Mission',
      icon: 'i-lucide-target',
      to: '/mission',
      disabled: false
    }
  ]
])
</script>

<style>
.page-enter-active, .page-leave-active {
  transition: all 0.4s;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

.rotate-enter-active, .rotate-leave-active {
  transition: all 0.5s;
}
.rotate-enter-from, .rotate-leave-to {
  opacity: 0;
  transform: rotate3d(1, 1, 1, -100deg);
}
</style>
