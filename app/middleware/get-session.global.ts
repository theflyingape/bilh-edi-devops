import { get, useFetch } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to, from) => {
  
  try {
    const { refresh, signOut } = useAuth()
    const { online } = useDevOps()
    const { user, endSession } = useIrisSessions()

    if (from.path == '/') {
      const { buildDate, version } = useAppConfig()
      console.log(buildDate, 'check version', version)
      const { onFetchResponse } = useFetch(`/api/version`, { immediate: true, timeout: 5678 } )
      onFetchResponse((response) => {
        response.json().then((value) => {
          console.log('version response:', JSON.stringify(value))
          if (version !== value.version)
            navigateTo('/logout', { external: true })
        }).catch((ex) => {
          console.error('version', ex)
        })
      })
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
