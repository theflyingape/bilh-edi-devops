import { get, useFetch } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to, from) => {
  
  try {
    const { refresh, signOut } = useAuth()
    const { online } = useDevOps()
    const { user, endSession } = useIrisSessions()

    if (from.path == '/') {
      //  a sanity check if user moved off of stale landing page
      const { stale } = useDevOps()
      if (get(stale))
        await navigateTo('/', { external: true })
        return
    }

    if (get(online)) {
      await refresh().then((result) => {
      /*
        console.log('get-session result:', result)
        getSession().then((result) => {
          console.log('get-session result:', result)
        })
      */
      }).catch(async (err) => {
        console.error('get-session error:', err)
        await endSession("Dev").finally(async () => {
          user.value.enabled = false
          user.value.scope = []
          await signOut({ callbackUrl: '/logout', external: true })
        })
      })
    }
  }
  catch(err) {
    console.error(err)
  }
})
