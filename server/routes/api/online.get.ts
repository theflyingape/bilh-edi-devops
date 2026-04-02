import { log } from '~/lib/syslog.server'
import { tokensByUser } from './auth/login.post'

export default defineEventHandler(async (_ev) => {
  const online = [...tokensByUser.keys()]
  const login = Array.from(tokensByUser.values(), id => id.login)
  log('LOG_NOTICE', `online: ${online}`)
  return { users: online, logins: login }
})
