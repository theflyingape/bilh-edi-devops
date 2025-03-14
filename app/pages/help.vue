<template>
<h1>HELP</h1>
<p>{{ status }}</p>
<p>{{ lastRefreshedAt }}</p>
</template>
<script setup lang="ts">
definePageMeta({ auth:false, middleware: ["get-session"]})
const { data, status, lastRefreshedAt } = useAuth()
</script>
