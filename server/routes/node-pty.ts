// start a new terminal session on host in preparation for a client websocket connection into node-pty
import { ITerminalOptions } from '@xterm/xterm'
import pty from 'node-pty'
import { IPty } from 'node-pty'
import { log } from '../syslog'
import url from 'url'

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

interface sessions {
  [key: string]: { 
    profile: string
    term: IPty
  }
}

import profiles from '~/assets/terminals.json'
let terminal: config = Object.assign(profiles)
let sessions: sessions = {}

export default defineWebSocketHandler({
  open(peer) {
    const wsOpts = url.parse(peer.request.url, true).query
    const id = <string>wsOpts?.id || 'unknown'
    const profile = <string>wsOpts?.profile || 'localhost'
    const cfg = terminal[profile]

    log('LOG_DEBUG', `node-pty ${peer.id} open for ${id} on ${profile} - ${peer.request.url}`, cfg.loglevel)
    let spawn = pty.spawn(cfg.cmd, [...cfg.params, id], {
      name: cfg.pty?.term || 'xterm-256color',
      cols: cfg.pty?.cols || 80, rows: cfg.pty?.rows || 25,
      cwd: cfg.pty?.cwd || __dirname,
      env: cfg.pty?.env || process.env
    })

    const pid = peer.id || spawn.pid
    sessions[pid] = { profile: profile, term: spawn }
    log('LOG_DEBUG', `node-pty sessions[${pid}] = ${JSON.stringify(sessions[pid])}`, cfg.loglevel)
    const session = sessions[peer.id]
    const term = session.term

    if (pid) {
      log('LOG_INFO', `node-pty ${pid} started PID #${term.pid}: ${[cfg.cmd, ...cfg.params, id].join(" ")}`, cfg.loglevel)

      term.onData((data) => {
        try {
          peer.send(data)
        } catch (ex) {
          log('LOG_ERROR', `node-pty ${pid} exception → browser: ${ex}`, cfg.loglevel)
        }
      })

      term.onExit(() => {
        log('LOG_NOTICE', `node-pty ${pid} exited PID #${term.pid}`, cfg.loglevel)
        delete sessions[pid]
      })
    }
    else {
      log('LOG_ERROR', `node-pty spawn failure to run: ${cfg.cmd} ${cfg.params.join(" ")}`, cfg.loglevel)
    }
  },

  message(peer, message) {
    const session = sessions[peer.id]
    const term = session.term
    const profile = session.profile
    const cfg = terminal[profile]
    term.write(message.text())
  },

  close(peer) {
    const session = sessions[peer.id]
    const term = session.term
    const profile = session.profile
    const cfg = terminal[profile]
    log('LOG_INFO', `node-pty ${peer.id} close`, cfg.loglevel)
  },

  error(peer, error) {
    const session = sessions[peer.id]
    const term = session.term
    const profile = session.profile
    const cfg = terminal[profile]
    log('LOG_ERROR', `node-pty ${peer.id} error: ${error}`, cfg.loglevel)
  },
})
