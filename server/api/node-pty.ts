//  start a new terminal session on host in preparation for a client websocket connection into node-pty
import { ITerminalOptions } from '@xterm/xterm'
import pty from 'node-pty'
import { IPty } from 'node-pty'

interface client {
  [key: string]: {
    options: ITerminalOptions
    bgColor: string
    cols?: number
    scrollback: 1000
    fontFamily: string
    theme: {
      foreground: string
      background: string
    }
  }
}

interface config {
  [key: string]: {
    host: string
    cmd: string
    params: string[]
    loglevel?: string | number
    pty?: {
      term: string
      cols: number
      rows: number
      cwd: string
      env: {}
    }
  }
}

interface session extends IPty {
  spawn?: any
  startup?: string
}

interface sessions {
  [key: string]: session
}

import profiles from '~/assets/terminals.json'
let terminal: config = Object.assign(profiles)
let sessions: sessions = {}

export default defineWebSocketHandler({
  open(peer) {
    const profile = 'localhost'
    console.log('WS open: ', peer.id, peer.request.url)
    let term = pty.spawn(terminal[profile].cmd, terminal[profile].params, {
      name: terminal[profile].pty?.term || 'xterm256-color',
      cols: terminal[profile].pty?.cols || 80, rows: terminal[profile].pty?.rows || 25,
      cwd: terminal[profile].pty?.cwd || __dirname,
      env: terminal[profile].pty?.env || process.env
    })
    const pid = peer.id || term.pid

    if (pid) {
      console.log(`Started terminal PID: ${pid} as ${terminal[profile].cmd} ${terminal[profile].params}`)
      sessions[pid] = term

      term.onData((data) => {
        try {
          peer.send(data)
        } catch (ex) {
          console.error(`?FATAL ACTIVE app session ${pid} pty → ws error:`, ex)
          console.error(data)
        }
      })

      term.onExit(() => {
        console.log(`Exit session ${pid}`)
        delete sessions[pid]
      })
    }
    else {
      console.error(`Failed to spawn the ${profile} terminal request`)
    }
  },

  message(peer, message) {
    let term: IPty = sessions[peer.id]
    term.write(message.text())
  },

  close(peer) {
    console.log('node-pty close: ', peer.id)
  },

  error(peer, error) {
    console.error('node-pty error: ', peer.id, error)
  },
})
