<template>
  <USelect
    :items="items"
    placeholder="instance"
    class="w-28"
  />
</template>

<script setup lang="ts">
const { Instances } = useIrisSessions()
const items = ref(Instances)
</script>
