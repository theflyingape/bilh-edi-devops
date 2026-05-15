<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard v-model="portal" variant="subtle">
    <template #default>
      <div class="grid grid-cols-4">
        <UChip v-for="(ts, index) in portal.logins" :key="index" :color="aging[index]" inset size="xs">
          <UTooltip :text="ago(new Date(ts).toLocaleString()) || 'not known'" arrow :content="{ side: 'right', sideOffset: 2 }">
            <UBadge class="rounded-full text-neutral" :color="aging[index]" variant="soft">
              {{ portal.online[index] }}
            </UBadge>
          </UTooltip>
        </UChip>
      </div>
    </template>
    <template #footer>
      <div class="text-sm"><i>Visitors over the past 3 months</i></div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { get, set } from '@vueuse/core'

const { ago, portal, who } = useDevOps()
const now = useNow()
const aging = shallowRef(<Array<'primary' | 'secondary' | 'neutral'>>[])

onMounted(() => {
  who()
  set(aging, get(portal).logins.map(val => (val - get(now).valueOf()) < (4 * 3600000) ? 'primary' : (val - get(now).valueOf()) < (8 * 3600000) ? 'secondary' : 'neutral'))
})
</script>
