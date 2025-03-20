<template>
  <div class="flex flex-col items-center justify-center gap-4 h-screen">
    <UCard class="drop-shadow-2xl h-2/12" variant="subtle">
      <template #header>
        <b>Good-bye!</b>
      </template>
      <template #default>
        <div class="flex justify-center">
          <UButton class="text-lg" icon="i-lucide-x-circle" color="neutral" variant="soft" to="." label="You have been logged out" />
        </div>
      </template>
      <template #footer>
        <div class="text-end text-sm">{{new Date().toDateString()}} {{new Date().toTimeString()}}</div>
      </template>
      </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ auth:false })
</script>
