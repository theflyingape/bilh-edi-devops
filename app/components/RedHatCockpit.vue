<template>
  <div class="flex">
    <UButton
      color="neutral"
      variant="outline"
      :avatar="{ src: '/redhat.svg', loading: 'lazy' } "
      :label="label"
      :target="target"
      :to="to"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  target?: string
  to?: string
}>()

const { endpoint } = useIrisSessions()
const ff = ref(endpoint<fastfetch>(hcie, 'fastfetch').then((res) => {
  return res
}))
</script>
