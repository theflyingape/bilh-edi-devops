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
  [key: number]: session
}

import profiles from '~/assets/terminals.json'
let terminal: config = Object.assign(profiles)
let sessions: sessions = {}
let term

export default defineEventHandler(async (event) => {
  try {
    //const body = await readBody(event)
    const body = { profile: 'Development' }

    let cols = terminal[body.profile].pty?.cols || 80
    let rows = terminal[body.profile].pty?.rows || 25
    term = pty.spawn(terminal[body.profile].cmd, terminal[body.profile].params, {
      name: terminal[body.profile].pty?.term || 'xterm256-color',
      cols: cols, rows: rows,
      cwd: terminal[body.profile].pty?.cwd || __dirname,
      env: terminal[body.profile].pty?.env || process.env
    })
    const pid = term.pid

    if (pid) {
      //syslog.note(`Started app PID: ${pid} CLIENT: ${process.env.SSH_CLIENT} (${rows}x${cols})`)
      console.log(`Started app PID: ${pid} (${rows}x${cols})`)
      sessions[pid] = term
      //  buffer any initial output from forked process
      //  between this post and ensuing client wss connection
      sessions[pid].spawn = term.onData((data) => {
        sessions[pid].startup = (sessions[pid].startup || '') + data
      })
    }
    else {
      //syslog.warn(`Failed to spawn app request for CLIENT: ${process.env.SSH_CLIENT} (${rows}x${cols})`)
      console.error(`Failed to spawn app request (${rows}x${cols})`)
    }

    setResponseStatus(event, 200, `OK: ${term.pid} started`)
    return ({ host: process.platform, pid: term.pid, cols: term.cols, rows: term.rows })
  }
  catch (err) {
    console.error('reading body', err)
    setResponseStatus(event, 200, `${err}`)
    return null
  }
})

/*
sudo `which node`
const pty = require('node-pty')
term = pty.spawn("su",["-","theflyingape"])
term.onData((data) => { console.log(data) })
term.write('ls\r')
*/
