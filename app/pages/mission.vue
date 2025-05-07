<template>
  <ContentRenderer
    v-if="page"
    :value="page"
    :prose="false"
  />
</template>
<script setup lang="ts">
definePageMeta({
  auth:false,
  pageTransition: { name: 'page', mode: 'out-in' }
})
import { get } from '@vueuse/core'

const { data: page } = await useAsyncData('index', () => queryCollection('landing').path('/').first())
if (!get(page)) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: get(page)?.seo.title,
  titleTemplate: null,
  ogTitle: get(page)?.seo.title,
  description: get(page)?.seo.description,
  ogDescription: get(page)?.seo.description,
  ogImage: 'https://docs-template.nuxt.dev/social-card.png',
  twitterImage: 'https://docs-template.nuxt.dev/social-card.png'
})
</script>
