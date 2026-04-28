<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard v-model="portal" variant="subtle">
    <template #header>
      Visits
    </template>
    <template #default>
      <div class="grid grid-cols-4">
        <UTooltip v-for="(id, index) in portal.logins" :key="index" :text="ago(portal.logins[index]) || 'not known'" arrow :content="{ side: 'right', sideOffset: 2 }">
          <UBadge class="m-1" color="neutral" variant="subtle">
            {{ portal.online[index] }}
          </UBadge>
        </UTooltip>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const { ago } = useDevOps()
const { portal, who } = useDevOps()

onMounted(() => {
  who()
})
</script>
