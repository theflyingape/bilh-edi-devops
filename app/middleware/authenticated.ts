export default defineNuxtRouteMiddleware(() => {
    // redirect the user to the home page if they're not authenticated
    definePageMeta({
      auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/help'
      }
    })
  })
  