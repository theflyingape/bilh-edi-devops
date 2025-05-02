<template>
  <UPageHero
    title="EDI DevOps"
    description="The Team's single point of access to the essential suite of apps, tools, and documentation for efficiency, effectiveness, and success!"
    orientation="horizontal"
    headline="Beth Israel Lahey Health"
    :links="links"
  >
    <img src="~/assets/images/HCIE.jpg" alt="App screenshot"
      class="rounded-lg shadow-2xl ring ring-(--ui-border)"
    />
  </UPageHero>
</template>

<script setup lang="ts">
definePageMeta({ auth:false })
reloadNuxtApp()

const links = ref([
  {
    label: 'Get started',
    to: '/home',
    icon: 'i-lucide-square-play'
  },
  {
    label: 'Learn more',
    to: 'https://bilh.sharepoint.com/:b:/s/BIDMC-TechnologyOffice/EY3XzMlMufhJlEyV8IvU0sABgRaS0E3KguczgJFZmZ0fiQ?e=EpwRAj',
    target: '_blank',
    color: 'neutral',
    variant: 'subtle',
    trailingIcon: 'i-lucide-arrow-right'
  }
])
</script>
