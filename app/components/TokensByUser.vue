<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="flex flex-wrap">
    <UCard v-model="portal" variant="subtle">
      <template #header>
        <UUser description="Online" />
      </template>
      <template #default>
        <UTooltip :text="login">
          <UBadge v-for="id in portal" :key="id" class="m-1" color="neutral" variant="outline">
            {{ id }}
          </UBadge>
        </UTooltip>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { get } from '@vueuse/core'

const { ago } = useDevOps()
const auth = useAuth()
const login = ref(computed(() => ago(get(auth.data).login) || 'not known'))
const { portal, who } = useDevOps()

onMounted(() => {
  who()
})
</script>
