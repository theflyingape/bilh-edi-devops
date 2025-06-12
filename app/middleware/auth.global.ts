import { get } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    const { user } = useIrisSessions()
    const notAdmin = ['admin']
    const notAllowed = ['code', 'terminal']

    //  a little negative, but steer any visitors away ...
    if (notAdmin.includes(to.name!.toString())) {
      if (!get(user)?.enabled || !get(user)?.scope?.length || get(user).scope[0] !== 'admin')
        return navigateTo('/sorry')
    }
    if (notAllowed.includes(to.name!.toString())) {
      if (!get(user)?.enabled || !get(user)?.scope?.length || get(user).scope[0] == 'guest' || get(user).scope[0] == 'user')
        return navigateTo('/sorry')
    }
  } catch (err) {
    console.error(err)
  }
})
