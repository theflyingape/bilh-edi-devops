<template>
</template>

<script setup lang="ts">
definePageMeta({ auth: false })
const { token, refreshToken, data, status, lastRefreshedAt, signOut } = useAuth()
</script>
