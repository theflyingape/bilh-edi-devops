<script setup lang="ts">
const { signOut } = useAuth()
/*
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  }
})
*/
signOut()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 h-screen">
    <UCard>
        <h3>You have been logged out.</h3>
    </UCard>
  </div>
</template>
