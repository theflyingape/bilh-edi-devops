<template>
    <div class="justify-center justify-items-center w-full h-full">
    <UTabs color="info" size="xl" :items="items" :unmount-on-hide="false" class="w-11/12">
        <template #content="{ item }">
            <XtermJs id="{ item }" />
            <p>This is the {{ item.label }} tab.</p>
        </template>
    </UTabs>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ auth:true, middleware: ["get-session"]})
const { status, data } = useAuth()

const items = ref([
  {
    label: 'Development',
    icon: 'i-vscode-icons-file-type-apib',
  },
  {
    label: 'Test',
    icon: 'i-vscode-icons-file-type-light-todo',
  },
  {
    label: 'LIVE',
    icon: 'i-vscode-icons-file-type-plsql-package',
  }
])
</script>

<style scoped>
.bezel {
    align-items: center;
    background: #3f3933;
    border-radius: 1rem;
    height: 100%;
    margin: 12px auto;
    overflow: hidden;
    padding: 12px;
    width: 100%;
}
.terminal {
    width: 100%;
    height: 800px;
    background-color: black;
    color: white;
}
</style>
