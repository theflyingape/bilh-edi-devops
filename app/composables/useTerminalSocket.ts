/**
 * used for any instance of an <XtermJs> component that may
 * require a WebSocket connection
 **/
import { Terminal, type ITerminalOptions } from '@xterm/xterm'
import { Unicode11Addon } from '@xterm/addon-unicode11'
import { ClipboardAddon } from '@xterm/addon-clipboard'
import { FitAddon } from '@xterm/addon-fit'
import { AttachAddon } from '../lib/addon-attach'
import { terminal } from '~~/server/terminal-sessions'

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
  }
}

//  XtermJs instance(s)
let sessionList = <TS>{}
let lastRows = 40, lastCols = 80

export default function useTerminalSocket() {
  function prepare(sessionId: string, term: Terminal, url?: string, rows?: number, cols?: number) {
    term.loadAddon(new Unicode11Addon())
    term.loadAddon(new ClipboardAddon())
    term.unicode.activeVersion = '11'

    let prep = <TS>{}
    prep[sessionId] = { xterm: term }
    if (rows) prep[sessionId].rows = rows
    if (cols) prep[sessionId].cols = cols
    if (url) prep[sessionId].url = url
    prep[sessionId].status = 'CLOSED'
    sessionList = Object.assign(sessionList, prep)
    const session = sessionList[sessionId]!
    session.fit = new FitAddon()
    session.xterm.loadAddon(session.fit)
  }

  function connect(sessionId: string) {
    const session = sessionList[sessionId]!

    const { ws, status } = useWebSocket(session.url)
    session.ws = ws
    session.status = status.value

    watch(status, async (n, o) => {
      session.status = status.value
      console.log(session, 'websocket status now:', n, 'from:', o)
      connected(sessionId)
      if (session.ws?.value?.OPEN)
        resize(sessionId)
      else
        session.attach?.dispose()
    })
  }

  function attach(sessionId: string) {
    const session = sessionList[sessionId]!
    if (session.ws?.value) {
      session.attach = new AttachAddon(session.ws.value)
      session.xterm.loadAddon(session.attach)
    }
  }

  function detach(sessionId: string) {
    const session = sessionList[sessionId]!
    session.ws?.value?.close()
  }

  function connected(sessionId: string) {
    const session = sessionList[sessionId]!
    isConnected.value = session.attach?.checkOpenSocket() || false
    resize(sessionId)
  }

  const isConnected = ref(false)

  function resize(sessionId: string, deltaRows = 0) {
    const session = sessionList[sessionId]!
    if (session.fit) {
      session.fit.fit()
      let xy = session.fit.proposeDimensions()
      if (xy?.rows && xy?.cols) {
        if (Number.isNaN(xy.rows) == false && xy.rows >= 12)
          lastRows = xy.rows + deltaRows
        if (Number.isNaN(xy.cols) == false && xy.cols >= 40)
          lastCols = xy.cols
        session.xterm.resize(lastCols, lastRows)
        console.log('resize deltaRows =', deltaRows)
      }
      session.xterm.focus()
    }
    //  notify backend as necessary
    const event = { resize:{ rows:lastRows, cols:lastCols } }
    session.attach?.sendData('♥' + JSON.stringify(event))
  }

  return { sessionList, prepare, connect, attach, detach, connected, isConnected, resize }
}
