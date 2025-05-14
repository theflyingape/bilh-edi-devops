<template>
  <UCard v-model="fileStat[props.hcie]" variant="subtle">
    <template #default>
      <div class="text-sm font-mono">
        <div>{{ fileStat[props.hcie]?.owner ?? 'owner' }}:{{ fileStat[props.hcie]?.group ?? 'group' }}</div>
        <div>{{ fileStat[props.hcie]?.size }} bytes</div>
        <div>{{ new Date(fileStat[props.hcie]!.modified).toLocaleString('en-US', { dateStyle:'medium', timeStyle:'short' }) }}</div>
      </div>
      <div class="flex font-mono justify-start italic text-sm">
        <UTextarea v-if="fileStat[props.hcie]?.type == 'regular file'" v-model="fileStat[props.hcie]!.fileName" disabled autoresize color="neutral" icon="i-lucide-file-text" placeholder="highlight file..." :rows="1" size="sm" variant="subtle" />
        <div v-else>{{ fileStat[props.hcie]?.type }}</div>
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
