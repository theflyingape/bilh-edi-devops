<template>
  <USelect
    v-model="instance"
    :items="items"
    class="w-28"
  />
</template>

<script setup lang="ts">
const { instance } = useIrisSessions()
const items = ref([process.env.NODE_ENV == 'development' ? 'localhost' : 'Dev', 'Test', 'Live'])
</script>
