<template>
    <div class="flex justify-center flex-row w-full">
        <div class="aspect-4/3 bg-zinc-800 p-4 rounded-md w-7/12">
            <XtermJs />
            <div class="flex justify-end flex-row w-full">
                <UButton color="action">Connect</UButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ auth:true, middleware: ["get-session"]})
const { status, data } = useAuth()
</script>
