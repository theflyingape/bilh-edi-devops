import { get, set } from '@vueuse/core'

const online = ref(computed(() => get(useAuth().status) !== 'unauthenticated'))
const sideMenu = ref(false)

export default function usePortal() {
  function toggleSideMenu() {
    set(sideMenu, !get(sideMenu))
  }
  return { online, sideMenu, toggleSideMenu }
}
