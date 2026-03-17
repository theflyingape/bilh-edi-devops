import { get, formatTimeAgo, set, useFetch } from '@vueuse/core'
import ConfirmationDialog from '~/components/ConfirmationDialog.vue'

//  runtime mode: npm run [dev|build]
const dev = process.env.NODE_ENV == 'development'
const isAdmin = ref(computed(() => get(user)?.scope?.includes('admin') || get(user)?.scope?.includes('systems')))
const online = ref(computed(() => get(useAuth().status) !== 'unauthenticated'))
const overlay = useOverlay()
const response = ref(false)
const sideMenu = ref(false)
const stale = ref(false)
const { user } = useIrisSessions()

export default function usePortal() {
  function ago(value: string): string {
    try {
      return formatTimeAgo(new Date(value))
    } catch (err) {
      return <string>err
    }
  }

  function isStale(version: string) {
    console.log('check version', version)
    useFetch('/api/version', { immediate: true, timeout: 5678 })
      .onFetchResponse(async (response) => {
        await response.json().then((value) => {
          console.log('version response:', JSON.stringify(value))
          set(stale, (version !== value.version))
        })
      })
  }

  async function queryModal(question = 'Are you sure?', note?: string, title = 'Please confirm', description?: string) {
    set(response, false)
    await overlay.create(ConfirmationDialog, {
      props: {
        title: title,
        description: description,
        note: note,
        query: question
      },
      destroyOnClose: true
    }).open()
  }

  function reload() {
    console.log('app reload')
    user.value.enabled = false
    user.value.scope = []
    reloadNuxtApp({ force: true, path: '/' })
  }

  function toggleSideMenu() {
    set(sideMenu, !get(sideMenu))
  }

  return {
    ago,
    dev,
    isAdmin,
    isStale,
    online,
    queryModal,
    reload,
    response,
    sideMenu,
    stale,
    toggleSideMenu
  }
}
