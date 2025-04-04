/**
 * used for any instance of an <XtermJs> component that may
 * require a persisted WebSocket connection
 **/
import { Terminal, type ITerminalOptions } from '@xterm/xterm'
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'

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

let sessionList = <TS>{}
let lastRows = 50, lastCols = 80

export default function useTerminalSocket() {
  function prepare(sessionId: string, terminal: Terminal, url?: string, rows?: number, cols?: number) {
    let prep = <TS>{}
    prep[sessionId] = { xterm: terminal }
    console.log(prep)
    if (rows) prep[sessionId].rows = rows
    if (cols) prep[sessionId].cols = cols
    if (url) {
      prep[sessionId].url = url
    }
    prep[sessionId].status = 'CLOSED'
    sessionList = Object.assign(sessionList, prep)
    const session = sessionList[sessionId]
    if (session) {
      session.fit = new FitAddon()
      session.xterm.loadAddon(session.fit)
    }
  }

  function connect(sessionId: string) {
    console.log('connect', sessionList[sessionId])
    const session = sessionList[sessionId]

    if (session) {
      const { ws, status } = useWebSocket(session.url)
      session.ws = ws
      session.status = status.value

      watch(status, async (n, o) => {
        session.status = status.value
        console.log(session, 'websocket status now:', n, 'from:', o)
        isConnected.value = connected(sessionId)
        if (!session.ws?.value?.OPEN) session.attach?.dispose()
      })
    }
  }

  function attach(sessionId: string) {
    const session = sessionList[sessionId]

    if (session && session.ws?.value) {
        console.log('attach', session)
        session.attach = new AttachAddon(session.ws.value)
        session.xterm.loadAddon(session.attach)
    }
  }

  function detach(sessionId: string) {
    const session = sessionList[sessionId]
    console.log('detach', session)

    if (session && session.ws) {
      session.ws.value?.close()
      //session.ws.value = undefined
    }
  }

  function connected(sessionId: string) {
    //console.log(sessionId, 'connected:', sessionList[sessionId]?.status)
    return (sessionList[sessionId] && sessionList[sessionId].status !== 'CLOSED') || false
  }

  const isConnected = ref(false)

  function resize(sessionId: string) {
    const session = sessionList[sessionId]
    if (session) {
      if (session.fit) {
        //session.fit.fit()
        let xy = session.fit?.proposeDimensions()
        if (xy?.rows && Number.isNaN(xy.rows) == false && xy.rows >= 20) lastRows = xy.rows
        if (xy?.cols && Number.isNaN(xy.cols) == false && xy.cols >= 40) lastCols = xy.cols
        console.log(`resize(${sessionId}):`, lastRows, lastCols)
        //session.xterm.resize(lastCols, lastRows)
      }
      session.xterm.focus()
    }
  }

  return { sessionList, prepare, connect, attach, detach, connected, isConnected, resize }
}
