import { get } from '@vueuse/core'

export default defineNuxtRouteMiddleware((to) => {
  const { status, data } = useAuth()
    const notAllowed = ['code', 'terminal']
  
    if (get(status) !== 'unauthenticated') {
        if (data.value?.scope[0] == 'user' && notAllowed.indexOf(<string>to.name) != -1)
          return navigateTo('/sorry')
    }
  })
  