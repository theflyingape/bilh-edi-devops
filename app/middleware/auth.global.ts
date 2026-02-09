import { get } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to, _from) => {
  try {
    const { isAdmin } = useDevOps()
    const { user } = useIrisSessions()
    const notAdmin = ['admin']
    const notAllowed = ['code', 'profile', 'terminal', 'utility']

    //  a little negative, but steer any visitors away ...
    if (notAdmin.includes(to.name!.toString()) && !isAdmin)
      return navigateTo('/sorry')

    if (notAllowed.includes(to.name!.toString())) {
      if (!get(user)?.enabled || !get(user)?.scope?.length || get(user).scope[0] == 'guest' || get(user).scope[0] == 'user')
        return navigateTo('/sorry')
    }
  } catch (err) {
    console.error(err)
  }
})
