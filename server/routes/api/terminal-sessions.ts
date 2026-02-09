//  terminal sessions
import type { IPty } from 'node-pty'
import profiles from '~/assets/terminals.json'

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
      env: NodeJS.ProcessEnv
    }
  }
}

interface sessions {
  profile: string
  term: IPty
}

const terminal: config = Object.assign(profiles)
const sessions = new Map<string | number, sessions>()

export default function useTerminalSessions() {
  return { terminal, sessions }
}
