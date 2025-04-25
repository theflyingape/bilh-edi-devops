import { get, set, watchImmediate } from '@vueuse/core'

const sideMenu = ref(false)

export default function usePortal() {

  function toggleSideMenu() {
    set(sideMenu, !get(sideMenu))
  }

  return { sideMenu, toggleSideMenu }
}
