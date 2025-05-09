<template>
  <div class="flex flex-col items-center justify-center h-lvh">
    <UCard class="drop-shadow-2xl" variant="subtle">
      <template #header>
        <div class="flex justify-end text-xl">
          <i>"Good-bye!"</i>
          <UIcon name="i-vscode-icons-file-type-robots" class="align-middle size-12" />
        </div>
      </template>
      <template #default>
        <div class="flex justify-center">
          <UButton class="text-2xl" icon="i-vscode-icons-file-type-devcontainer" color="neutral" variant="soft" to="." label="Your session has been logged out" />
        </div>
      </template>
      <template #footer>
        <div class="text-start text-lg">{{new Date().toDateString()}}<br>{{new Date().toTimeString()}}</div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ auth:false })
//reloadNuxtApp()
</script>
