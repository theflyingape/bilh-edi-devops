<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div v-if="online" class="m-1">
    <div class="grid auto-rows-auto gap-4">
      <div class="flex justify-center gap-2">
        <IrisAccounts hcie="Dev" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IrisAccounts from '~/components/IrisAccounts.vue'

definePageMeta({
  pageTransition: { name: 'page', mode: 'out-in' }
})
const { online } = useDevOps()
</script>
