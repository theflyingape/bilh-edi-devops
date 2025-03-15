<script setup lang="ts">
//const { $api } = useNuxtApp()
import { watchImmediate } from '@vueuse/core'

const { status, data } = useAuth()
const online = computed(() => status.value == 'authenticated' ? 'primary' : 'action' )
const scope = ref('Guest')
const sideMenu = ref(false)

function toggleSideMenu() {
    sideMenu.value = !sideMenu.value
}

watchImmediate(data, (updated) => {
  scope.value = status.value == 'authenticated' ? data.value?.scope[0] || 'Member' : 'Guest'
})

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
                    label: 'Console',
                    icon: 'i-vscode-icons-file-type-shell',
                    description: 'Secure shell access into these hosts',
                    to: '/ssh'
                },
                {
                    label: 'Visual Studio Code',
                    icon: 'i-vscode-icons-file-type-vscode',
                    description: 'The IDE standard for IRIS ObjectScript, scripting, and data file manipulation',
                    to: '/code'
                },
            ]
        }
    ],
    [
        {
            label: 'Help',
            icon: 'i-lucide-circle-help',
            to: '/help',
            disabled: false
        },
    ]
])
</script>

<template>
  <UApp>
    <UHeader>
      <template #title>
        <Logo class="h-6 w-auto" />
      </template>

      <UNavigationMenu :items="items" content-orientation="vertical" />
      <SideMenu v-model:open="sideMenu" />

      <template #right>
        <div class="m-auto"><UColorModeButton /></div>
        <UBadge :color="online" variant="outline">{{scope}}</UBadge>
        <div class="m-auto">
            <UChip class="mt-2" :color="online" inset>
                <UButton class="pl-4 pr-4" color="neutral" variant="ghost" icon="i-heroicons-ellipsis-horizontal-16-solid" @click="toggleSideMenu" />
            </UChip>
        </div>
      </template>

      <template #body>
        <!-- UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" / -->
      </template>
    </UHeader>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <UFooter>
        <template #body>
        </template>
    </UFooter>
    </UApp>
</template>
