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
            // do not preemptively open a websocket from the component
            //prep[sessionId].ws = useWebSocket(url, { autoConnect: false }).ws.value
        }
        sessionList.value = { ...sessionList.value, ...prep }
    }

    function connect(sessionId:string) {
        const { ws } = useWebSocket(sessionList.value[sessionId]?.url)
        return ws.value
    }

    return { sessionList, prepare, connect }
}
