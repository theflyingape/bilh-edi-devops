/**
 * used for any instance of an <XtermJs> component that may
 * require a persisted WebSocket connection
 **/
import { Terminal, type ITerminalOptions } from '@xterm/xterm'
import { AttachAddon } from '@xterm/addon-attach'

interface TS {
  [key: string]: {
    xterm: Terminal
    options?: ITerminalOptions
    rows?: number
    cols?: number
    url?: string
    ws?: WebSocket | undefined
    attach?: AttachAddon
  }
}

let sessionList = <TS>{}

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
    sessionList = Object.assign(sessionList, prep)
  }

  function connect(sessionId: string) {
    console.log('connect', sessionList[sessionId])
    const session = sessionList[sessionId]

    if (session) {
      const { ws, status } = useWebSocket(session.url, { autoConnect: true })

      watch(status, async (n, o) => {
        console.log(ws.value)
        console.log(session, 'websocket status now:', n, 'from:', o)
      })

      session.ws = ws.value
      /*
      if (ws.value?.onopen) {
        ws.value.onopen = (ev) => {
          console.log('ws.onopen', ev)
        }
      }
      */
    }
  }

  function attach(sessionId: string) {
    const session = sessionList[sessionId]

    if (session && session.ws) {
        console.log('attach', session)
        session.attach = new AttachAddon(session.ws)
        session.xterm.loadAddon(session.attach)
    }
  }

  return { sessionList, prepare, connect, attach }
}
