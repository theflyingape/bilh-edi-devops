<template>
  <UPage v-if="page">
    <UPageHeader
      title="FAQ"
      description="Frequently asked questions about our technology."
    />
    <UPageBody>
      <ContentRenderer
        v-if="page"
        :value="page"
      />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <UContentToc
        :title="toc?.title"
        :links="page.body?.toc?.links"
      />
    </template>
  </UPage>
</template>

<script setup lang="ts">
import { get } from '@vueuse/core'

definePageMeta({
  auth: false,
  layout: 'docs'
})

const route = useRoute()
const { toc, seo } = useAppConfig()

const { data: page } = await useAsyncData(route.path, () => queryCollection('faq').path(route.path).first())
if (!get(page)) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: get(page)?.seo.title,
  ogTitle: `${get(page)?.seo.title} - ${seo?.siteName}`,
  description: get(page)?.seo.description,
  ogDescription: get(page)?.seo.description
})
</script>
