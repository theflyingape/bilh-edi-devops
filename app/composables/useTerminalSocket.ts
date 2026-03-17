/**
 * used for any instance of an <XtermJs> component that may
 * require a WebSocket connection
 **/
import { get, set } from '@vueuse/core'
import type { Terminal, ITerminalOptions } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { SearchAddon } from '@xterm/addon-search'
import { Unicode11Addon } from '@xterm/addon-unicode11'
// import { WebglAddon } from '@xterm/addon-webgl'
import { AttachAddon } from '~/lib/addon-attach.client'

const { audio, BELL_SOUND, CONNECT_SOUND, DISCONNECT_SOUND } = useMultiMedia()

type HCIEdev = HCIE | 'localhost'

type TS = {
  [key in HCIEdev]: {
    xterm: Terminal
    options?: ITerminalOptions
    fit?: FitAddon
    rows?: number
    cols?: number
    url?: string
    ws?: Ref<WebSocket | undefined>
    status?: string
    title?: string
    attach?: AttachAddon
    search?: SearchAddon
    tmux?: boolean
  }
}

//  XtermJs instance(s)
let sessionList = {} as TS
const sessionGet = (sessionId: HCIEdev) => sessionList[sessionId] || sessionList['localhost']
const cols = ref(80)
const rows = ref(25)
const selection = ref('')
const title = ref('')

export default function useTerminalSocket() {
  function prepare(sessionId: HCIEdev, term: Terminal, url?: string, lines?: number, columns?: number) {
  // term.loadAddon(new WebglAddon())
    term.loadAddon(new Unicode11Addon())
    term.unicode.activeVersion = '11'

    const prep = <TS>{}
    prep[sessionId] = { xterm: term }
    prep[sessionId].rows = lines || get(rows)
    prep[sessionId].cols = columns || get(cols)
    if (url) prep[sessionId].url = url + `&profile=${sessionId}`
    prep[sessionId].status = 'CLOSED'
    prep[sessionId].title = 'offline'
    sessionList = Object.assign(sessionList, prep)
    const session = sessionList[sessionId]
    session.fit = new FitAddon()
    session.xterm.loadAddon(session.fit)
    session.search = new SearchAddon()
    term.loadAddon(session.search)
    // console.info(session)
  }

  function connect(sessionId: HCIEdev, tmux = false) {
    const session = sessionGet(sessionId)
    const { ws, status } = useWebSocket(session.url! + (tmux ? '&tmux=true' : ''))
    session.ws = ws
    session.status = get(status)
    session.tmux = tmux

    watch(status, async (n, o) => {
      session.status = get(status)
      console.info(sessionId, 'websocket status now:', n, 'from:', o)
      connected(sessionId)
      if (n == 'OPEN') {
        get(audio).src = CONNECT_SOUND
        get(audio).play()
      } else {
        set(title, '')
        session.attach?.dispose()
        session.xterm.options.cursorBlink = false
        useToast().add({ title: `${sessionId} terminal disconnected`, description: `${new Date().toTimeString()}` })
        get(audio).src = DISCONNECT_SOUND
        get(audio).play()
      }
    })
  }

  function attach(sessionId: HCIEdev) {
    const session = sessionGet(sessionId)
    if (session.ws?.value) {
      session.attach = new AttachAddon(session.ws.value)
      session.xterm.loadAddon(session.attach)
      session.xterm.options.cursorBlink = true
      session.xterm.onBell(() => {
        get(audio).src = BELL_SOUND
        get(audio).play()
      })
      session.xterm.onSelectionChange(() => {
        const text = session.xterm.getSelection()
        if (text.length) {
          set(selection, text)
          navigator.clipboard.writeText(get(selection))
        }
      })
      session.xterm.onTitleChange((value) => {
        if (value.includes('@'))
          value = value.split('@').at(1)!
        if (value.includes(':'))
          value = value.split(':').at(1)!
        value = value.trim()
        set(title, value)
        session.title = value
      })
    }
  }

  function detach(sessionId: HCIEdev) {
    const session = sessionGet(sessionId)
    if (session.ws?.value) session.ws?.value.close()
  }

  function connected(sessionId: HCIEdev, force = false) {
    const session = sessionGet(sessionId)
    set(title, session.title)
    const ready = session.attach?.checkOpenSocket() || false
    set(isConnected, ready)
    // upon open or a session switch
    if (ready || force) {
      resize(sessionId)
      if (session.tmux && force) {
        setTimeout(() => {
          session.attach?.sendData('\x02')
          setTimeout(() => {
            session.attach?.sendData('r')
          }, 100)
        }, 100)
      } else
        setTimeout(() => {
          session.xterm.refresh(0, session.xterm.rows - 1)
        }, 100)
    }
    setTimeout(() => {
      session.xterm.clearSelection()
    }, 50)
  }

  const isConnected = ref(false)

  function resize(sessionId: HCIEdev) {
    const session = sessionGet(sessionId)

    if (session.fit) {
      session.fit.fit()
      const xy = session.fit.proposeDimensions()
      //  sanity checks
      if (xy?.rows && xy?.cols) {
        if (Number.isNaN(xy.rows) == false && xy.rows >= 25)
          set(rows, xy.rows)
        if (Number.isNaN(xy.cols) == false && xy.cols >= 64)
          set(cols, xy.cols)
        // console.log(get(cols), 'x', get(rows), '<-', session.xterm.cols,':',session.xterm.rows)
        session.xterm.resize(get(cols), get(rows))
      }
      session.xterm.focus()
    }

    const event = { resize: { rows: get(rows), cols: get(cols) } }
    session.attach?.sendData('♥' + JSON.stringify(event))
    // console.log('resize', sessionId, session)
  }

  return { sessionList, cols, rows, selection, title, prepare, connect, attach, detach, connected, isConnected, resize }
}
