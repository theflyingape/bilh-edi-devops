export default defineNuxtRouteMiddleware((to, from) => {
  const { refresh, signOut, status } = useAuth()

  if (status.value !== 'unauthenticated') {
    refresh().then((result) => {
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
