<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/singleline-html-element-content-newline -->
<template>
  WIP
  <div v-if="online" class="m-1">
    <div class="grid grid-cols-2 gap-8">
      <div class="grid auto-rows-auto gap-4">
        <div class="font-bold text-center">USERS</div>
        <div class="flex justify-center gap-2">
          insert table here
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  pageTransition: { name: 'page', mode: 'out-in' }
})
const { online } = useDevOps()
</script>
