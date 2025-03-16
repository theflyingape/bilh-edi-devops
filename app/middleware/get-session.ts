export default defineNuxtRouteMiddleware((to, from) => {
  //console.log(from, '->', to)
  const { getSession } = useAuth()
  getSession().then((result) => {
    //console.log('get-session result:', result)
  })
})
