<template>
    <USlideover title="Health Connect Integration Team"
    description="BILH IT Technology & Innovation service line" :close="{
        color: 'neutral',
        variant: 'outline',
        class: 'rounded-full'
    }">
    <template #body>
        <div v-if="status !== 'unauthenticated'">
            <UButton color="error" variant="soft" @click="logout">Logout</UButton> {{ data?.name }} <UBadge color="neutral" variant="soft">{{ data?.scope[0] }}</UBadge>
        </div>
        <div v-else-if="data">
            Member: {{ data.name }} <UBadge color="neutral" variant="soft">{{ data.scope[0] }}</UBadge><br>
            {{ data.comment }}
        </div>
        <div v-else class="flex flex-col items-center justify-center gap-4">
            <!--UButton  to="/login">Login</UButton-->
            <UCard>
            <UForm :state="credentials" @submit.prevent="signIn(credentials)">
                <UFormField label="Username" name="username"><UInput v-model="credentials.username" type="string" placeholder="jsmith" /></UFormField>
                <UFormField label="Password" name="password"><UInput v-model="credentials.password" type="password" /></UFormField>
                <UButton type="submit">Login</UButton>
            </UForm>
            </UCard>
        </div>
    </template>
    <template #footer>
        <div class="flex-col justify-items-center w-full">
            <div><h1 class="font-bold text-2xl text-(--ui-primary)">Nuxt UI v3</h1></div>
            <div><UButton label="Documentation" icon="i-lucide-square-play" to="https://ui3.nuxt.dev/getting-started/installation/nuxt" target="_blank" /></div>
        </div>
        <div class="flex-col justify-items-end w-full">
            <div><em>provided by Robert Hurst</em></div>
            <div><UButton color="neutral" variant="outline" icon="i-simple-icons-github" to="https://github.com/theflyingape" target="_blank">GitHub</UButton></div>
        </div>
    </template>
    </USlideover>
</template>

<script setup lang="ts">
const { status, data, signIn, signOut } = useAuth()
const toast = useToast()

const credentials = ref({
    username: '',
    password: '',
})

function logout() {
    signOut()
    toast.add({ title: 'Good-bye!', description: `logged off at ${new Date().toTimeString()} on ${new Date().toDateString()}`})
}
</script>
