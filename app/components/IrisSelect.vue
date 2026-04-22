<template>
  <USelect
    :items="items"
    placeholder="instance"
    class="max-h-fit w-28"
  />
</template>

<script setup lang="ts">
interface Props {
  epic?: boolean
  hcie?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  epic: true,
  hcie: true
})

const { infrastructure, Instances } = useIrisSessions()
const items = ref(Instances)

Object.entries(infrastructure).forEach(([key, value]) => {
  console.log(key, value)
  if (value.app == 'Epic' && !props.epic) items.value = items.value.filter(i => i !== key)
  if (value.app == 'Health Connect' && !props.hcie) items.value = items.value.filter(i => i !== key)
})
</script>
