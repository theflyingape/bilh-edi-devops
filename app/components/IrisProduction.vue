<template>
  <IrisSelect
    v-model="instance"
    @change="loadProductions(instance)"
  />
  <USelect
    v-model="production"
    :items="items"
    class="w-48"
  />
  {{ instance }}
  {{ production }}
</template>

<script setup lang="ts">
const { InstanceDefault, Productions, loadProductions } = useIrisSessions()
const instance = defineModel<INSTANCE>('instance', { required: true, default: InstanceDefault })
const production = defineModel<string>('production')
let items = ['']

watch(instance, () => {
  loadProductions(instance.value)
  items = Productions.get(instance.value)!.productions
})
</script>
