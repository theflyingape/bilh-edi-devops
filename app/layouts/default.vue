<template>
    <div class="flex flex-rows justify-items-center">
        <div class="pl-4 w-11/12"><UNavigationMenu orientation="horizontal" content-orientation="vertical" :items="items" /></div>
        <div class="m-auto"><ColorMode /></div>
    </div>
    <SideMenu v-model:open="sideMenu" />
    <slot />
    {{ data }}
</template>

<script setup lang="ts">
import { watchImmediate } from '@vueuse/core'

const { status, data } = useAuth()
const scope = ref('Guest')
const sideMenu = ref(false)

watchImmediate(data, (updated) => {
  scope.value = status.value == 'authenticated' ? data.value?.scope[0] || 'Member' : 'Guest'
})

const items = ref([
    [
        {
            label: 'Home',
            icon: 'i-lucide-house',
            to: '/'
        },
        {
            label: 'Guides',
            icon: 'i-lucide-book-open',
            to: 'https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls',
            target: '_blank',
            children: [
                {
                    label: 'Class Reference',
                    icon: 'i-lucide-cog',
                    description: 'The Documatic rendered pages off our class definitions',
                    to: 'https://hciedev.laheyhealth.org/csp/documatic/%25CSP.Documatic.cls?LIBRARY=HSCUSTOM',
                    target: '_blank',
                },
                {
                    label: 'Interoperability production adapters',
                    icon: 'i-lucide-swatch-book',
                    description: 'The built-in business services and operations with adapters',
                    to: 'https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls?KEY=PAGE_interop_protocols',
                    target: '_blank',
                },
                {
                    label: 'Healthcare Data Formats',
                    icon: 'i-lucide-smile',
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
                    to: 'https://hcieprd.laheyhealth.org/csp/healthshare/hscustom/Ens.Enterprise.Portal.MonitorStatus.zen',
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
                    icon: 'i-lucide-file-text',
                    description: 'Prototyping & Training environment',
                    to: 'https://hciedev.laheyhealth.org/csp/sys/UtilHome.csp',
                    target: '_blank'
                },
                {
                    label: 'Test',
                    icon: 'i-lucide-file-text',
                    description: 'Testing & Staging environment',
                    to: 'https://hcietst.laheyhealth.org/csp/sys/UtilHome.csp',
                    target: '_blank'
                },
                {
                    label: 'LIVE',
                    icon: 'i-lucide-file-text',
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
                    icon: 'i-lucide-file-text',
                    description: 'secure shell into host',
                    to: '/ssh'
                },
                {
                    label: 'Visual Studio Code',
                    icon: 'i-lucide-file-text',
                    description: 'IDE for Files & ObjectScript programming',
                    to: '/code/'
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
        {
            icon: 'i-heroicons-ellipsis-vertical-16-solid',
            badge: scope,
            onSelect: () => {
                toggleSideMenu()
            }
        }
    ]
])

function toggleSideMenu() {
    sideMenu.value = !sideMenu.value
}
</script>

<style scoped></style>
