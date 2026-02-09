import { get } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to, from) => {
  try {
    const { refresh, signOut } = useAuth()
    const { online } = useDevOps()
    const { user, endSession } = useIrisSessions()

    if (from.path == '/' && to.path !== '/') {
      //  sanity check if user moved off of a stale landing page
      const { stale } = useDevOps()
      if (get(stale)) {
        await navigateTo('/', { external: true })
        return
      }
    }

    if (get(online)) {
      await refresh().then((_result) => {
      /*
        console.log('get-session result:', _result)
        getSession().then((_result) => {
          console.log('get-session result:', _result)
        })
      */
      }).catch(async (err) => {
        console.error('get-session error:', err)
        await endSession('Dev').finally(async () => {
          user.value.enabled = false
          user.value.scope = []
          await signOut({ callbackUrl: '/logout', external: true })
        })
      })
    }
  } catch (err) {
    console.error(err)
  }
})
