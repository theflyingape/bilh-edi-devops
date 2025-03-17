<template>
    <div class="flex justify-center">
        <!-- monitor with a thin bezel -->
        <div class="bg-zinc-800 p-3 rounded-md h-full">
            <XtermJs v-show="value == 'Development'" @vue:mounted="" />
            <XtermJs v-show="value == 'Test'" />
            <XtermJs v-show="value == 'LIVE'" />
            <!-- monitor controls -->
            <div class="flex flex-cols gap-3 justify-end">
                <USelect v-model="value" :items="items" class="w-36" />
                <UButton color="action">Connect</UButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ auth:true, middleware: ["get-session"]})
const { status, data } = useAuth()
const items = ref(['Development', 'Test', 'LIVE'])
const value = ref('Test')
</script>
