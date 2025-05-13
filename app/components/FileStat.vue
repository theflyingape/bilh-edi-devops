<template>
  <UCard v-model="fileStat[props.hcie]" variant="subtle">
    <template #default>
      <div class="text-sm font-mono">
        <div>{{ fileStat[props.hcie]?.owner }} : {{ fileStat[props.hcie]?.group }}</div>
        <div>{{ fileStat[props.hcie]?.size }} : {{ new Date(fileStat[props.hcie]!.modified).toLocaleString('en-US', { dateStyle:'medium', timeStyle:'short' }) }}</div>
      </div>
    </template>
    <template #footer>
      <div class="flex font-mono justify-end italic text-sm">
        <UIcon name="i-lucide-file-text" class="align-middle size-5" />Filename: {{ props.fileName }}
      </div>
    </template>
  </UCard>
</template>
<script setup lang="ts">
const props = defineProps<{
  hcie: 'localhost'|'Dev'|'Test'|'Live'  // instance identifier
  fileName?: string
}>()

const { endpoint, fileStat } = useIrisSessions()

await stat()

async function stat() {
  await endpoint(props.hcie, 'filestat', 'POST', { fileName: props.fileName }).then((result:filestat) => {
    fileStat.value[props.hcie] = result
  })
}
</script>
