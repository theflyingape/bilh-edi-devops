import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
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
    const fileName = file.split('/').at(-1)!
    const downloaded = 'files/' + fileName
    const got = statSync(downloaded)
    log('LOG_NOTICE', `file downloaded -> ${downloaded} size: ${got.size}`)

    setResponseHeaders(event, {
      "content-type": "application/octet-stream",
      "content-disposition": `attachment; filename="${fileName}"`
    })
    const buffer = readFileSync(downloaded)
    send(event, Buffer.from(buffer))
    setResponseStatus(event, 200, 'OK')

    //return { status: 'OK', file: fileName, size: got.size }
  }
  catch(err) {
    log('LOG_ERROR', `${err}`)
    setResponseStatus(event, 404, 'not found')
    //return { status: err, file: '', size: 0 }
  }
})
