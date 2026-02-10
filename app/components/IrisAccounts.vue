<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <UCard v-model="Accounts[props.hcie]" variant="subtle">
    <template #default>
      <div class="font-bold font-sans underline">Users</div>
      <div v-for="user in Accounts[props.hcie]" :key="user.name" class="text-sm font-mono">
        <div v-if="user.enabled" class="font-semibold text-success">
          {{ user.name }} {{ user.comment }}
        </div>
        <div v-else>
          {{ user.name }} {{ user.comment }}
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex font-mono justify-end italic text-sm">
        <UIcon :name="ICON[props.hcie]!" class="align-middle size-5" />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { get, set } from '@vueuse/core'
import type { Account } from '~/composables/useIrisSessions';

const props = defineProps<{
  hcie: 'Live' | 'Test' | 'Dev' //  instance identifier
}>()

const { ICON, endpoint, Accounts } = useIrisSessions()

async function accounts() {
  await endpoint(props.hcie, 'account/@').then((status) => {
    if (status) {
      Accounts.value[props.hcie] = <Account>status
    }
  })
}

onMounted(async () => {
  await accounts()
})
</script>
