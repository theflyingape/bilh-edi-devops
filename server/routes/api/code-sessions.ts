//  code-server
interface ports {
  [key: number]: {
    id: string
  }
}

interface sessions {
  [key: string]: {
    pin: string[]
    port: number
  }
}

export let ports: ports = {}
export let sessions: sessions = {}

export function generatePIN(): string[] {
  return [d10(), d10(), d10()]
}

function d10(): string {
  const n = 10 * Math.random()
  return parseInt(`${n}`).toString()
}

export default function useCodeServer() {
  return { ports, sessions, generatePIN }
}
