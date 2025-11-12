<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard v-model="fileStat[hcie]" variant="subtle">
    <template #default>
      <div class="text-sm font-mono">
        <div v-if="fileStat[hcie]?.size">
          <div>{{ fileStat[hcie]?.owner ?? 'owner' }}:{{ fileStat[hcie]?.group ?? 'group' }}</div>
          <div>{{ fileStat[hcie]?.size.toLocaleString('en-US') }} bytes</div>
          <div>{{ new Date(fileStat[hcie]!.modified).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) }}</div>
        </div>
        <div v-else>
          <b>cd</b> to a subfolder and use<br>
          <UKbd v-show="tmux" value="SHIFT" />{{ tmux ? ' +' : '' }} mouse <UKbd class="font-bold rounded-full" value="btn" variant="subtle" /> to highlight a<br>
          <b>file name</b> for download
        </div>
      </div>
      <div class="flex font-mono justify-start italic text-sm">
        <UTextarea v-if="fileStat[hcie]?.type == 'regular file'" v-model="fileStat[hcie]!.fileName" disabled autoresize color="neutral" icon="i-lucide-file-text" placeholder="highlight file..." :rows="1" size="sm" variant="subtle" />
        <div v-else>
          <b>{{ fileStat[hcie]?.type }}</b>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  hcie: INSTANCE
  tmux: boolean
}>()
const { fileStat } = useIrisSessions()
</script>
