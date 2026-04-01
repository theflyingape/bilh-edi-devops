<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="flex flex-wrap">
    <UCard v-model="portal" variant="subtle">
      <template #header>
        <UUser description="Online" />
      </template>
      <template #default>
        <UBadge v-for="id in portal" :key="id" class="m-1" color="neutral" variant="outline">
          {{ id }}
        </UBadge>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { portal, who } = useDevOps()

onMounted(() => {
  who()
})
</script>
