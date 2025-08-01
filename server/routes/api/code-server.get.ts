import child from 'child_process'
import url from 'url'
import useCodeServer from './code-sessions'
// import { getServerSession } from '#auth'
import { log } from '~/lib/syslog.server'

export default defineEventHandler(async (event) => {
  //  TODO: future implementation for server-side auth
  //  inspired by the getServerSession of NextAuth.js
  //  it also avoids an external HTTP GET request to the /api/auth/sessions endpoint,
  //  instead directly calling a pure JS-method
  //  const session = await getServerSession(event)
  //  if (!session)
  //    return { status: 'unauthenticated' }

  const { ports, sessions, generatePIN } = useCodeServer()
  log('LOG_NOTICE', `code-server ${event}`)
  const params = url.parse(event.path, true).query
  const username = <string>params?.username || 'guest'
  let response = { status: 'unknown' }

  if (sessions[username]) {
    const port = sessions[username].port
    const pid = ports[port].pid
    try {
      process.kill(pid, 0)
      return { status: 'OK', ...sessions[username], ...ports[port] }
    } catch (e) {
      log('LOG_WARN', `code-server ${e}`)
      //  process had shutdown -- free from lists and re-instantiate a new one
      delete sessions[username], ports[port]
    }
  }

  const pin = generatePIN()
  const vscode = child.spawn('./code-server.sh', [], { cwd: '.', env: { ...process.env, IDLE: '36000', HOME: `/home/${username}`, USER: username, PASSWORD: pin.join('') } })

  if (vscode.pid) {
    log('LOG_NOTICE', `code-server spawned PID #${vscode.pid} for ${username}`)
    await new Promise<number>((resolve, reject) => {
      //  wait for a PORT=#### assignment to echo and the first idle dot
      vscode.stdout?.on('data', (data) => {
        log('LOG_NOTICE', `code-server: ${data}`)
        const ini = data.toString().split('=')
        if (ini[0] == 'PORT') {
          const port = parseInt(ini[1])
          ports[port] = { id: username, pid: vscode.pid! }
          sessions[username] = {
            pin: pin, port: port,
            url: `https://hciedev.laheyhealth.org/code-server/${port}/?workspace=/home/${username}/.local/share/code-server/User/Workspaces/${username}-devops.code-workspace`
          }
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
      response = { status: 'OK', ...sessions[username], ...ports[sessions[username].port] }
    }).catch((reason) => {
      log('LOG_ERROR', `code-server exit ${reason}: rejected ${username} request`)
      response = { status: `rejected: ${reason}` }
    })
  } else {
    response = { status: `spawn error #${vscode.exitCode}` }
  }
  return response
})
