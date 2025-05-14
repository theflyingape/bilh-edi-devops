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
      <div class="flex font-mono justify-start italic text-sm">
        <UTextarea v-model="fileStat[props.hcie]!.fileName" disabled autoresize color="neutral" icon="i-lucide-file-text" placeholder="highlight file..." :rows="1" size="sm" variant="subtle" />
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
