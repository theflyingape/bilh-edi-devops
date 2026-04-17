import { log } from '~/lib/syslog.server'
import useUserLogins from './user-logins'

export default defineEventHandler(async (_ev) => {
  const { tokensByUser } = useUserLogins()
  const online = [...tokensByUser.keys()]
  const login = Array.from(tokensByUser.values(), id => id.login)
  log('LOG_NOTICE', `online: ${online}`)
  return { users: online, logins: login }
})
