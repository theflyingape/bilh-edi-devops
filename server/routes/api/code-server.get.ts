import child from 'child_process'
import { log } from '~/lib/syslog'
import useCodeServer from './code-sessions'
import url from 'url'

export default defineEventHandler(async (event)  => {
  const { ports, sessions, generatePIN } = useCodeServer()
  log('LOG_NOTICE', `code-server ${event}`)
  const params = url.parse(event.path, true).query
  const username = <string>params?.username || 'guest'
  let response = { status: 'spawn error' }

  if (sessions[username]) {
    return { status: 'OK', ...sessions[username] }
  }
  else {
    const pin = generatePIN()
    const vscode = child.spawn('./code-server.sh', [], { cwd: '.', env: { ...process.env, IDLE: '3600', HOME: `/home/${username}`, USER: username, PASSWORD: pin.join('') } })
    if (vscode.pid) {
      log('LOG_NOTICE', `code-server spawned PID #${vscode.pid} for ${username}`)
      await new Promise<number>((resolve, reject) => {
        //  wait for a PORT=#### assignment to echo and the first idle dot
        vscode.stdout?.on('data', (data) => {
          log('LOG_NOTICE', `code-server: ${data}`)
          const ini = data.toString().split("=")
          if (ini[0] == 'PORT') {
            const port = parseInt(ini[1])
            ports[port] = { id: username }
            sessions[username] = { pin: generatePIN(), port: port,
              url: `https://hciedev.laheyhealth.org/code-server/6501/?workspace=/home/${username}/.local/share/code-server/User/Workspaces/${username}-devops.code-workspace`}
          }
          if (ini[0] == '.')
            resolve(sessions[username].port)
        })
        //  script aborted
        vscode.on('close', (code) => {
          reject(code)
        })
      }).then((reason) => {
        log('LOG_NOTICE', `code-server ${username} assigned #${reason}`)
        response = { status: 'OK', ...sessions[username] }
      }).catch((reason) => {
        log('LOG_ERROR', `code-server exit ${reason}: rejected ${username} request`)
        response = { status: 'rejected' }
      })
    }
    return response
  }
})
