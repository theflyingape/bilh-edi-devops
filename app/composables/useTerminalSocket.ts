/**
 * used for any instance of an <XtermJs> component that may
 * require a WebSocket connection
 **/
import { get, set, useDevicesList } from '@vueuse/core'
import { Terminal, type ITerminalOptions } from '@xterm/xterm'
import { WebglAddon } from '@xterm/addon-webgl'
import { Unicode11Addon } from '@xterm/addon-unicode11'
import { FitAddon } from '@xterm/addon-fit'
import { SearchAddon } from '@xterm/addon-search'
import { AttachAddon } from '~/lib/addon-attach.client'
import useMultiMedia from './useMultiMedia'
const { audio, BELL_SOUND, CONNECT_SOUND, DISCONNECT_SOUND } = useMultiMedia()

interface TS {
  [key: string]: {
    xterm: Terminal
    options?: ITerminalOptions
    fit?: FitAddon
    rows?: number
    cols?: number
    url?: string
    ws?: Ref<WebSocket|undefined>
    status?: string
    attach?: AttachAddon
    search?: SearchAddon
  }
}

//  XtermJs instance(s)
let sessionList = <TS>{}
const cols = ref(80)
const rows = ref(25)
const selection = ref('')

export default function useTerminalSocket() {
  function prepare(sessionId: string, term: Terminal, url?: string, rows?: number, cols?: number) {
    term.loadAddon(new WebglAddon())
    term.loadAddon(new Unicode11Addon())
    term.unicode.activeVersion = '11'

    let prep = <TS>{}
    prep[sessionId] = { xterm: term }
    prep[sessionId].rows = rows || get(rows)
    prep[sessionId].cols = cols || get(cols)
    if (url) prep[sessionId].url = url + `&profile=${sessionId}`
    prep[sessionId].status = 'CLOSED'
    sessionList = Object.assign(sessionList, prep)
    const session = sessionList[sessionId]!
    session.fit = new FitAddon()
    session.xterm.loadAddon(session.fit)
    session.search = new SearchAddon()
    term.loadAddon(session.search)
  }

  function connect(sessionId: string, tmux = false) {
    const session = sessionList[sessionId]!

    const { ws, status } = useWebSocket(session.url! + (tmux ? '&tmux=true' : ''))
    session.ws = ws
    session.status = get(status)

    watch(status, async (n, o) => {
      session.status = get(status)
      console.info(session, 'websocket status now:', n, 'from:', o)
      connected(sessionId)
      if (n == 'OPEN') {
        resize(sessionId)
        audio.src = CONNECT_SOUND
        audio.play()
      }
      else {
        session.attach?.dispose()
        session.xterm.options.cursorBlink = false
        useToast().add({ title: `${sessionId} terminal disconnected`, description: `${new Date().toTimeString()}` })
        audio.src = DISCONNECT_SOUND
        audio.play()
      }
    })
  }

  function attach(sessionId: string) {
    const session = sessionList[sessionId]!
    if (session.ws?.value) {
      session.attach = new AttachAddon(session.ws.value)
      session.xterm.loadAddon(session.attach)
      session.xterm.options.cursorBlink = true
      session.xterm.onBell(() => {
        audio.src = BELL_SOUND
        audio.play()
      })
      session.xterm.onSelectionChange(() => {
        const text = session.xterm.getSelection()
        if (text.length) {
          set(selection,text)
          navigator.clipboard.writeText(get(selection))
        }
      })
    }
  }

  function detach(sessionId: string) {
    const session = sessionList[sessionId]!
    if (session.ws?.value) session.ws?.value.close()
  }

  function connected(sessionId: string) {
    const session = sessionList[sessionId]!
    set(isConnected, session.attach?.checkOpenSocket() || false)
    resize(sessionId)
  }

  const isConnected = ref(false)

  function resize(sessionId: string) {
    const session = sessionList[sessionId]!

    if (session.fit) {
      session.fit.fit()
      let xy = session.fit.proposeDimensions()
      //  sanity checks
      if (xy?.rows && xy?.cols) {
        if (Number.isNaN(xy.rows) == false && xy.rows >= 12)
          set(rows, xy.rows)
        if (Number.isNaN(xy.cols) == false && xy.cols >= 40)
          set(cols, xy.cols)
        console.log(get(cols), 'x', get(rows), '<-', session.xterm.cols,':',session.xterm.rows)
        session.xterm.resize(get(cols), get(rows))
      }
      session.xterm.focus()
    }

    const event = { resize: { rows: get(rows), cols: get(cols) } }
    session.attach?.sendData('♥' + JSON.stringify(event))
  }

  return { sessionList, cols, rows, selection, prepare, connect, attach, detach, connected, isConnected, resize }
}
