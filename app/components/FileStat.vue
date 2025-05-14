<template>
  <UCard v-model="fileStat[props.hcie]" variant="subtle">
    <template #default>
      <div class="text-sm font-mono">
        <div>{{ fileStat[props.hcie]?.owner ?? 'owner' }}:{{ fileStat[props.hcie]?.group ?? 'group' }}</div>
        <div>{{ fileStat[props.hcie]?.size }} bytes</div>
        <div>{{ fileStat[props.hcie]?.type }} type</div>
        <div>{{ new Date(fileStat[props.hcie]!.modified).toLocaleString('en-US', { dateStyle:'medium', timeStyle:'short' }) }}</div>
      </div>
    </template>
    <template #footer>
      <div class="flex font-mono justify-end italic text-sm">
        <UIcon name="i-lucide-file-text" class="align-middle size-5" />&nbsp;{{ fileStat[props.hcie]?.fileName ?? 'highlight file' }}
      </div>
    </template>
  </UCard>
</template>
<script setup lang="ts">
const props = defineProps<{
  hcie: 'localhost'|'Dev'|'Test'|'Live'  // instance identifier
}>()

const { fileStat } = useIrisSessions()

</script>
