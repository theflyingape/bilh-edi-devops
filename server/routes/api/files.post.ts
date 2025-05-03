import { log } from '~/lib/syslog.server'
import { ServerFile } from "nuxt-file-storage"

export default defineEventHandler(async (event) => {
  const { files } = await readBody<{ files: ServerFile[] }>(event)

  const fileNames: string[] = []
	for (const file of files) {
    log('LOG_NOTICE', `file uploaded -> ${file.name} size: ${file.size} type: ${file.type} modified: ${new Date(file.lastModified)} `)
    const basename = file.name.split('.').slice(0, -1).join('.')
		fileNames.push(await storeFileLocally(file, basename))
	}
	return fileNames
})
