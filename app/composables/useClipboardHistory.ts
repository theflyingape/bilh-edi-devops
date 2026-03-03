/**
 * used for any instance of a <ClipboardHistory> component to keep
 * a running local list of clipboard copy values
 **/
import { get, set, useStorage } from '@vueuse/core'

const CLIPBOARD = 'clipboard-local-storage'

let saved: string[]
try {
  saved = JSON.parse(localStorage.getItem(CLIPBOARD) ?? '[]')
} catch {
  saved = []
}

const items = useStorage(CLIPBOARD, saved, localStorage, { mergeDefaults: true })
const clipMax = 25

export default function useClipboardHistory() {
  function clear() {
    set(items, [])
    store()
  }

  function copy(value: string) {
    if (value.length) {
      if (!items.value.find(item => item === value)) {
        items.value.push(value)
        set(items, items.value.splice(-clipMax))
        store()
      }
    }
  }

  function store() {
    localStorage.setItem(CLIPBOARD, JSON.stringify(get(items)))
  }

  return { items, clear, copy, store }
}
