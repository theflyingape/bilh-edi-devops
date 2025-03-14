<template>
</template>

<script setup lang="ts">
definePageMeta({ auth:false, middleware: ["get-session"]})
const { token, refreshToken, data, status, lastRefreshedAt, signOut } = useAuth()
</script>
