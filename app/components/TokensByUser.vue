<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="grid auto-cols-max grid-flow-col">
    <UCard v-model="portal" variant="subtle">
      <template #header>
        <UUser description="Logins" />
      </template>
      <template #default>
        <UTooltip v-for="(id, index) in portal.logins" :key="index" :text="ago(portal.logins[index]) || 'not known'">
          <UBadge class="m-1" color="neutral" variant="outline">
            {{ portal.online[index] }}
          </UBadge>
        </UTooltip>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { ago } = useDevOps()
const { portal, who } = useDevOps()

onMounted(() => {
  who()
})
</script>
