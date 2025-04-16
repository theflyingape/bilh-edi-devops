import { get } from '@vueuse/core'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { refresh, signOut, status } = useAuth()

  if (get(status) !== 'unauthenticated') {
    await refresh().then((result) => {
    /*
      console.log('get-session result:', result)
      getSession().then((result) => {
      console.log('get-session result:', result)
      })
    */
    }).catch((err) => {
      console.error('get-session error:', err)
      signOut({callbackUrl: 'logout', external: false})
    })
  }
})
