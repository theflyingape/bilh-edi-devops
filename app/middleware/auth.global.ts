import { get } from '@vueuse/core'

export default defineNuxtRouteMiddleware((to) => {
  const { status } = useAuth()
  const { user } = useIrisSessions()
  const notAllowed = ['code', 'terminal']

  //  a little negative, but steer any visitors away ... 
  if (get(status) !== 'unauthenticated' && notAllowed.includes(to.name!.toString())) {
      if (get(user).scope[0] == 'guest' || get(user).scope[0] == 'user')
        return navigateTo('/sorry')
  }
})
