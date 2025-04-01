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
    ws?: Ref<WebSocket|undefined>
    status?: string
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
    prep[sessionId].status = 'CLOSED'
    sessionList = Object.assign(sessionList, prep)
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

  const isConnected = ref(false)

  function connected(sessionId:string) {
    console.log(sessionId, 'connected:', sessionList[sessionId]?.status)
    return (sessionList[sessionId] && sessionList[sessionId].status !== 'CLOSED') || false
  }

  return { sessionList, prepare, connect, attach, detach, isConnected }
}
