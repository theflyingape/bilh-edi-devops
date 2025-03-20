export default defineNuxtRouteMiddleware((to, from) => {
  //console.log(from, '->', to)
  const { getSession, refresh } = useAuth()
  refresh().then((result) => {
    //console.log('refresh result:', result)
    //getSession().then((result) => {
    //  console.log('get-session result:', result)
    //})
  })
})
