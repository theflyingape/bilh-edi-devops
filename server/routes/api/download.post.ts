import { execFileSync } from 'node:child_process'
import { openAsBlob, readFileSync, statSync } from 'node:fs'
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
    let fileName = file.split('/').at(-1)!
    if (fileName[0] == "'" && fileName.lastIndexOf("'") == fileName.length - 1) {
      const trim = (str:string, chars:string) => str.split(chars).filter(Boolean).join(chars)
      fileName = trim(fileName, "'")
    }
    const downloaded = 'files/' + fileName
    const got = statSync(downloaded)
    log('LOG_NOTICE', `file downloaded -> ${downloaded} size: ${got.size}`)

    setResponseHeaders(event, {
      "content-type": "application/octet-stream",
      "content-disposition": `attachment; filename="${fileName}"`
    })
    //const blob = await openAsBlob(downloaded)
    //await send(event, blob.stream(), 'application/octet-stream')
    const buffer = readFileSync(downloaded)
    await send(event, Buffer.from(buffer), 'application/octet-stream')
    setResponseStatus(event, 200, 'OK')

    //return { status: 'OK', file: fileName, size: got.size }
  }
  catch(err) {
    log('LOG_ERROR', `${err}`)
    setResponseStatus(event, 404, 'not found')
    //return { status: err, file: '', size: 0 }
  }
})
