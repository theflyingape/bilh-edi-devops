import child from 'child_process'
import { log } from '~/lib/syslog'
import useCodeServer from './code-sessions'
import url from 'url'

export default defineEventHandler(async (event)  => {
  const { ports, sessions, generatePIN } = useCodeServer()
  log('LOG_NOTICE', `code-server ${event}`)
  const params = url.parse(event.path, true).query
  const username = <string>params?.username || 'guest'

  if (sessions[username]) {
    return { status: 'OK', ...sessions[username] }
  }
  else {
    const pin = generatePIN()
    const vscode = child.spawn('code-server.sh', [], { cwd: '.', env: { ...process.env, IDLE: '3600', HOME: `/home/${username}`, USER: username, PASSWORD: pin.join('') }, stdio: 'ignore' })
    if (vscode.pid) {
      await new Promise<number>((resolve, reject) => {
        //  wait for a PORT=#### assignment to echo
        vscode.stdout?.on('data', (data: string) => {
          const ini = data.split("=")
          if (ini[0] == "PORT") {
            const port = parseInt(ini[1])
            ports[port] = { id: username }
            sessions[username] = { pin: generatePIN(), port: port }
            resolve(port)
          }
        })
        //  script exited
        vscode.on('close', (code) => {
          reject(code)
        })
      }).then((reason) => {
        log('LOG_NOTICE', `code-server ${username} assigned #${reason}`)
        return { status: 'OK', ...sessions[username] }
      }).catch((reason) => {
        log('LOG_ERROR', `code-server exit ${reason}: rejected ${username} request`)
        return { status: 'ERR' }
      })
    }
    return { status: 'spawn error' }
  }
})
