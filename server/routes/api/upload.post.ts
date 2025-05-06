import { execFileSync } from 'node:child_process'
import { log } from '~/lib/syslog.server'
import { ServerFile } from "nuxt-file-storage"
import useTerminalSessions from './terminal-sessions'

const { terminal } = useTerminalSessions()

export default defineEventHandler(async (event) => {
  const { files, user, host, folder } = await readBody<{ files: ServerFile[], user:string, host:string, folder:string }>(event)

  const fileNames: string[] = []
	for (const file of files) {
    log('LOG_NOTICE', `file uploaded -> ${file.name} size: ${file.size} type: ${file.type} modified: ${new Date(file.lastModified)}`)
    const basename = file.name.split('.').slice(0, -1).join('.')
		fileNames.push(await storeFileLocally(file, basename))
    //  execute
    try {
      execFileSync('./files.sh',
        [ 'upload', user, terminal[host].host, `"${folder}/${file.name}"` ], { timeout:3600 }
      )
    }
    catch(err) {
      log('LOG_ERROR', `${err}`)
    }
	}
	return fileNames
})
