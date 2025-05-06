import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'
import { log } from '~/lib/syslog.server'
import useTerminalSessions from './terminal-sessions'

const { terminal } = useTerminalSessions()

export default defineEventHandler(async (event) => {
  const { user, host, file } = await readBody<{ user:string, host:string, file:string }>(event)
  //  execute
  try {
    execFileSync('./files.sh',
      [ 'download', user, terminal[host].host, file ], { timeout:3600 }
    )
    const downloaded = file.split('/').at(-1)
    const got = statSync('files/' + downloaded)
    log('LOG_NOTICE', `file downloaded -> ${file} size: ${got.size}`)
    return { status: 'OK', file: downloaded, size: got.size }
  }
  catch(err) {
    log('LOG_ERROR', `${err}`)
    return { status: err, file: '', size: 0 }
  }
})
