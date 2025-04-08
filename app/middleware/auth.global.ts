import { get } from '@vueuse/core'

export default defineNuxtRouteMiddleware((to) => {
  const { status, data } = useAuth()
  const notAllowed = ['code', 'code-server', 'terminal']

  if (get(status) !== 'unauthenticated') {
      if (get(data)?.scope[0] == 'user' && notAllowed.indexOf(to.name!.toString()) != -1)
        return navigateTo('/sorry')
  }
})
