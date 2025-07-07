<template>
  <USelect
    :items="items"
    class="w-28"
  />
</template>

<script setup lang="ts">
const { Instances } = useIrisSessions()
const items = ref(Instances)
</script>
