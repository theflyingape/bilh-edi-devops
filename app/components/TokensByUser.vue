<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard v-model="portal" variant="subtle">
    <template #default>
      <div class="grid grid-cols-6 gap-3">
        <div v-for="(ts, index) in portal.logins" :key="index" class="col-span-2">
          <UTooltip :text="ago(new Date(ts).toLocaleString()) || 'not known'" arrow :content="{ side: 'right', sideOffset: 2 }">
            <UChip class="w-full" :color="aging[index]" inset size="xs">
              <UBadge class="p-2 rounded-full justify-center text-neutral min-w-[120px] w-full" :color="aging[index]" variant="soft">
                {{ portal.online[index] }}
              </UBadge>
            </UChip>
          </UTooltip>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="justify-self-end text-sm"><i>Visitors over the past 3 months</i></div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { get, set } from '@vueuse/core'

const { ago, portal, who } = useDevOps()
const aging = shallowRef(<Array<'primary' | 'secondary' | 'neutral'>>[])

onMounted(() => {
  who()
  set(aging, get(portal).logins.map(val => (Date.now() - val) < (6 * 60 * 60 * 1000) ? 'primary' : (Date.now() - val) < (12 * 60 * 60 * 1000) ? 'secondary' : 'neutral'))
})
</script>
