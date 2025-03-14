<template>
    <slot />
    {{ data }}
</template>

<script setup lang="ts">
const { status, data } = useAuth()
</script>

<style scoped></style>
