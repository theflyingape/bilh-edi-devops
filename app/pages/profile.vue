<template>
  <TiptapEditor />
</template>

<script setup lang="ts">
import { set } from '@vueuse/core'

definePageMeta({
  auth: true,
  pageTransition: { name: 'page', mode: 'out-in' }
})

onMounted(() => {
  set(useDevOps().sideMenu, false)
})
</script>
