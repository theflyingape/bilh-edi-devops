//  terminal sessions
import { IPty } from 'node-pty'

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

export default function useTerminalSessions() {
  return { terminal, sessions }
}
