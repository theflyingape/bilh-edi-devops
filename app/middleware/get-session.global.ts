import { get } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { refresh, signOut, status } = useAuth()
  const { user, endSession } = useIrisSessions()
  
  if (get(status) !== 'unauthenticated') {
    await refresh().then((result) => {
    /*
      console.log('get-session result:', result)
      getSession().then((result) => {
      console.log('get-session result:', result)
      })
    */
    }).catch(async (err) => {
      console.error('get-session error:', err)
      await endSession("Dev").then(async () => {
        user.value.enabled = false
        user.value.scope = []
        await signOut({ callbackUrl: 'logout', external: false })
      })
    })
  }
})
