//  code-server
interface ports {
  id: string
  pid: number
}

interface sessions {
  pin: string[]
  port: number
  url: string
}

const ports = new Map<number, ports>()
const sessions = new Map<string, sessions>()

function generatePIN(): string[] {
  return [d10(), d10(), d10()]
}

function d10(): string {
  const n = 10 * Math.random()
  return parseInt(`${n}`).toString()
}

export default function useCodeServer() {
  return { ports, sessions, generatePIN }
}
