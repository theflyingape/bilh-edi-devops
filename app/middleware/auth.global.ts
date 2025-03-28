export default defineNuxtRouteMiddleware((to) => {
    const { status, data } = useAuth()
    const notAllowed = ['code', 'terminal']
  
    if (status.value !== 'unauthenticated') {
        if (data.value?.scope[0] == 'user' && notAllowed.indexOf(<string>to.name) != -1)
          return navigateTo('/sorry')
    }
  })
  