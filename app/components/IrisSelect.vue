<template>
  <USelect
    v-model="Instance"
    :items="items"
    class="w-28"
  />
</template>

<script setup lang="ts">
const { Instances } = useIrisSessions()

const items = ref(Instances)
const Instance = ref(process.env.NODE_ENV == 'development' ? 'localhost' : 'Test')
</script>
