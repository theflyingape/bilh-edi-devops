<template>
<h1>HELP</h1>
<p>{{ data }}</p>
<p>{{ status }}</p>
<p>{{ lastRefreshedAt }}</p>
</template>
<script setup lang="ts">
definePageMeta({ auth: false })
const { data, status, lastRefreshedAt } = useAuth()
</script>
