import { get } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { status } = useAuth()
  const { user } = useIrisSessions()
  const notAllowed = ['code', 'terminal']

  //  a little negative, but steer any visitors away ... 
  if (notAllowed.includes(to.name!.toString())) {
      if (!get(user)?.enabled || !get(user)?.scope?.length || get(user).scope[0] == 'guest' || get(user).scope[0] == 'user')
        return navigateTo('/sorry')
  }
})
