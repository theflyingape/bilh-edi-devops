import { get, set, useFetch } from '@vueuse/core'
const { user } = useIrisSessions()
const online = ref(computed(() => get(useAuth().status) !== 'unauthenticated'))
const sideMenu = ref(false)
const stale = ref(false)

export default function usePortal() {

  function isStale(version:string) {
    console.log('check version', version)
    useFetch('/api/version', { immediate: true, timeout: 5678 })
    .onFetchResponse(async (response) => {
      await response.json().then((value) => {
        console.log('version response:', JSON.stringify(value))
        set(stale, (version !== value.version))
      })
    })
  }

  function reload() {
    console.log('app reload')
    user.value.enabled = false
    user.value.scope = []
    reloadNuxtApp({force:true, path:'/'})
  }

  function toggleSideMenu() {
    set(sideMenu, !get(sideMenu))
  }
  return { isStale, online, reload, sideMenu, stale, toggleSideMenu }
}
