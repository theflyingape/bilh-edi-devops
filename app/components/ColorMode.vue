<script setup lang="ts">
import { useColorMode } from '@vueuse/core'

const { system, store } = useColorMode()
const myColorMode = computed(() => store.value === 'auto' ? system.value : store.value)
const { state, next } = useCycleList(['auto', 'light', 'dark'] as const, { initialValue: myColorMode })

function cycle() {
  next()
  store.value = state.value
}
</script>

<template>
  <UButton v-model="state" color="neutral" variant="subtle" @click="cycle()">
    <span class="capitalize">{{ state }}</span>
    <UIcon v-if="state === 'auto'" name="i-lucide-laptop" />
    <UIcon v-if="state === 'dark'" name="i-lucide-moon" />
    <UIcon v-if="state === 'light'" name="i-lucide-sun" />
  </UButton>
</template>
