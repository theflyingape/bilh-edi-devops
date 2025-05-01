import { ServerFile } from "nuxt-file-storage"

export default defineEventHandler(async (event) => {
  const { files } = await readBody<{ files: ServerFile[] }>(event)

  for (const file of files) {
    // Parses a data URL and returns an object with the binary data and the file extension.
    const { binaryString, ext } = parseDataUrl(file.content)
  }

  // Deleting Files
  await deleteFile('requiredFile.txt', '/userFiles')

  // Get file path
  await getFileLocally('requiredFile.txt', '/userFiles')
  // returns: {AbsolutePath}/userFiles/requiredFile.txt

  // Get all files in a folder
  await getFilesLocally('/userFiles')
})
