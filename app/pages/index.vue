<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/singleline-html-element-content-newline -->
<template>
  <UPageHero
    :ui="{ root: '-mt-24' }"
    title="EDI DevOps"
    description="The Team's single point of access to the essential suite of apps, tools, and documentation for efficiency, effectiveness, and success!"
    orientation="horizontal"
    headline="Beth Israel Lahey Health"
    :links="links"
  >
    <div class="flex-nowrap justify-items-center p-2 text-slate-500 text-sm">
      <img src="~/assets/images/HCIE.jpg" alt="App screenshot" class="rounded-lg shadow-2xl ring ring-(--ui-border)" />
      <UButton class="m-1 align-middle" :color="stale ? 'error' : 'neutral'" leading-icon="i-lucide-refresh-cw" size="sm" variant="subtle" @click.prevent="reload">reload</UButton>
      &nbsp;<em>v<b>{{ v }}</b> built {{ ts }}</em>
    </div>
  </UPageHero>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false,
  pageTransition: { name: 'page', mode: 'out-in' }
})

const { buildDate, version } = useAppConfig()
const { isStale, reload, stale } = useDevOps()
const links = ref([
  {
    label: 'Get started',
    to: '/home',
    icon: 'i-lucide-square-play'
  },
  {
    label: 'Learn more',
    to: 'https://bilh.sharepoint.com/:b:/s/BIDMC-TechnologyOffice/EY3XzMlMufhJlEyV8IvU0sABsVEdDGcEn1mXCfk-HhjuGg?e=PJI7cs',
    icon: 'i-vscode-icons-file-type-pdf2',
    target: '_blank',
    color: 'neutral',
    variant: 'outline',
    trailingIcon: 'i-lucide-arrow-right'
  }
])
const ts = ref(buildDate)
const v = ref(version)

isStale(version)
</script>
