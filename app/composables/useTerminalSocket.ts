/**
 * useful for every instance of an XtermJs component that may require
 * a WebSocket connection
 **/
import { Terminal, type ITerminalOptions } from '@xterm/xterm'

interface TS {
    [key: string]: {
        xterm: Terminal
        options?: ITerminalOptions
        rows?: number
        cols?: number
        url?: string
        ws?: WebSocket|undefined
    }
}

const sessionList = ref(<TS>{})
//const wsList = ref(new Array<WebSocket|undefined>)

export default function useTerminalSocket() {

    function prepare(sessionId:string, terminal:Terminal, url?:string, rows?:number, cols?:number) {
        let prep = <TS>{}
        prep[sessionId] = { xterm:terminal }
        if (rows) prep[sessionId].rows = rows
        if (cols) prep[sessionId].cols = cols
        if (url) {
            prep[sessionId].url = url
            prep[sessionId].ws = useWebSocket(url, { autoConnect: false }).ws.value
        }
        sessionList.value = { ...sessionList.value, ...prep }
    }

    function connect(sessionId:string) {
        const { ws } = useWebSocket(sessionList.value[sessionId]?.url)
    }

/*
  props.socket!.onmessage = function (ev) {
    term.write(ev.data)
  }

  props.socket!.onopen = (ev) => {
    term.focus()
    term.options.cursorBlink = true
    term.writeln('\x1B[0;2mWebSocket \x1B[22mopen')
  }

  props.socket!.onclose = (ev) => {
    term.options.cursorBlink = false
    term.writeln('\x1B[0;2mWebSocket close\x1B[m')
  }

  props.socket!.onerror = (ev) => {
    term.writeln('\x1B[0;2mWebSocket \x1B[22;1;31merror\x1B[m')
  }
*/

    return { sessionList, prepare, connect }
}
