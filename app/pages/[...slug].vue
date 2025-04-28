<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
      :links="page.links"
      :headline="headline"
    />

    <UPageBody>
      <ContentRenderer
        v-if="page"
        :value="page"
      />

      <USeparator v-if="surround?.length" />

      <UContentSurround :surround="surround" />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <UContentToc
        :title="toc?.title"
        :links="page.body?.toc?.links"
      >
        <template
          v-if="toc?.bottom"
          #bottom
        >
          <div
            class="hidden lg:block space-y-6"
            :class="{ '!mt-6': page.body?.toc?.links?.length }"
          >
            <USeparator
              v-if="page.body?.toc?.links?.length"
              type="dashed"
            />

            <UPageLinks
              :title="toc.bottom.title"
              :links="links"
            />
          </div>
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
<script setup lang="ts">
import { get } from '@vueuse/core'
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '#ui-pro/utils/content'

definePageMeta({
  auth:false,
  layout: 'docs'
})

const route = useRoute()
const { toc, seo } = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: page } = await useAsyncData(route.path, () => queryCollection('docs').path(route.path).first())
if (!get(page)) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('docs', route.path, {
    fields: ['description']
  })
})

useSeoMeta({
  title: get(page)?.seo.title,
  ogTitle: `${get(page)?.seo.title} - ${seo?.siteName}`,
  description: get(page)?.seo.description,
  ogDescription: get(page)?.seo.description
})

const headline = computed(() => findPageHeadline(get(navigation), get(page)))
/*
defineOgImageComponent('Docs', {
  title: page.value.title,
  description: page.value.description,
  headline: headline.value
})
*/
const links = computed(() => {
  const links: never[] = []
/*
  if (toc?.bottom?.edit) {
    links.push({
      icon: 'i-lucide-external-link',
      label: 'Edit this page',
      to: `${toc.bottom.edit}/${page?.value?.stem}.${page?.value?.extension}`,
      target: '_blank'
    })
  }
*/
  return [...links, ...(toc?.bottom?.links || [])].filter(Boolean)
})
</script>
