import fs from 'fs'
import path from 'path'
import useUserLogins from '~~/server/routes/api/user-logins'

export default defineNitroPlugin((nitroApp) => {
  console.info(process.title, 'startup hook in Nitro')
  process.title = 'devops'
  // handle server shutdown
  nitroApp.hooks.hook('close', async () => {
    console.info(`Nitro for ${process.title} is shutting down...`)

    const { tokensByUser } = useUserLogins()
    const filePath = path.join(process.cwd(), 'visitors.json')
    const save = JSON.stringify(tokensByUser, (_, session) => {
      if (session instanceof Map) {
        return Object.fromEntries(session)
      }
      return session.login || 0
    }, 2)
    fs.writeFileSync(filePath, save)
  })
})
