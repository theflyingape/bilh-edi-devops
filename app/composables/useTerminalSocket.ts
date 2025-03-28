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

//const wsList = ref(new Array<WebSocket|undefined>)
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
      // do not preemptively open a websocket from the component
      //prep[sessionId].ws = useWebSocket(url, { autoConnect: false }).ws.value
    }
    sessionList = Object.assign(sessionList, prep)
    //prep[sessionId].xterm.writeln(`prepared ${JSON.stringify(sessionList)}`)
  }

  function connect(sessionId: string) {
    console.log('connect', sessionList[sessionId])
    if (sessionList[sessionId]) {
      sessionList[sessionId].xterm.writeln(` connect(${sessionList[sessionId]?.url}`)
      const { ws } = useWebSocket(sessionList[sessionId]?.url)
      if (ws.value?.onopen) {
        ws.value.onopen = (ev) => {
          console.log('onopen', ev)
        }
      }
      sessionList[sessionId].ws = ws.value
      return ws.value
    }
    return undefined
  }

  function attach(sessionId: string) {
    if (sessionList[sessionId]?.ws)
      sessionList[sessionId].attach = new AttachAddon(<WebSocket>sessionList[sessionId].ws)
  }

  return { sessionList, prepare, connect, attach }
}
