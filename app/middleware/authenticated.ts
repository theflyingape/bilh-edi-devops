export default defineNuxtRouteMiddleware(() => {
    // redirect the user to the login screen if they're not authenticated
    definePageMeta({
      auth: {
        unauthenticatedOnly: false,
        navigateAuthenticatedTo: '/login'
      }
    })
  })
  