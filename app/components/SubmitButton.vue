<template>
    <UButton type="submit" color="action" trailing-icon="i-heroicons-arrow-right-start-on-rectangle-16-solid">
        <slot />
        <!--
        <PulseLoader v-if="isLoading" />
        <AppIcon v-else icon="i-heroicons-arrow-right-start-on-rectangle-16-solid" />
        -->
    </UButton>
</template>