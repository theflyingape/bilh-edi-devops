<template>
    <USlideover title="Health Connect Integration Team"
    description="BILH IT Technology & Innovation service line" :close="{
        color: 'action',
        variant: 'outline',
        class: 'rounded-full'
    }">
    <template #body>
        <div v-if="status !== 'unauthenticated'" class="flex flex-row justify-items-center gap-8">
            <div v-if="data">
                <b>{{ data.name }}</b> <UBadge color="neutral" variant="soft">{{ data.scope[0] }}</UBadge><br>
                {{ data.comment }}
            </div>
            <div>
                <SubmitButton variant="soft" @click="logout">Logout</SubmitButton>
            </div>
        </div>
        <div v-else>
            <!--UButton  to="/login">Login</UButton-->
            <UCard class="w-full">
            <UForm :state="credentials" @submit.prevent="signIn(credentials)">
                <div class="flex flex-col items-center justify-center gap-4">
                    <UFormField label="Username" name="username"><UInput v-model="credentials.username" type="string" placeholder="jsmith" /></UFormField>
                    <UFormField label="Password" name="password"><UInput v-model="credentials.password" type="password" /></UFormField>
                </div>
                <div class="flex-col items-end justify-items-end gap-y-8">
                    <div>&nbsp;</div>
                    <div><SubmitButton>Login</SubmitButton></div>
                </div>
            </UForm>
            </UCard>
        </div>
    </template>
    <template #footer>
        <div class="grid-flow-col grid-rows-3 w-full">
            <div class="justify-items-center">
                <div><h1 class="font-bold text-2xl text-(--ui-primary)">Nuxt UI v3</h1></div>
                <div><UButton label="Documentation" icon="i-lucide-square-play" to="https://ui3.nuxt.dev/getting-started/installation/nuxt" target="_blank" /></div>
            </div>
            <div class="justify-items-center">
                <div><img src="~/assets/images/footer.png" class="filter drop-shadow-lg" /></div>
            </div>
            <div class="justify-items-end">
                <div class="pr-16"><em>value-add by Robert Hurst</em></div>
                <div class="pr-18"><UButton color="neutral" variant="link" icon="i-simple-icons-github" to="https://github.com/theflyingape" target="_blank">GitHub</UButton></div>
            </div>
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
