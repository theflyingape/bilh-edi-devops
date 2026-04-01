import { log } from '~/lib/syslog.server'
import { tokensByUser } from './auth/login.post'

export default defineEventHandler(async (_ev) => {
  const online = [...tokensByUser.keys()]
  log('LOG_NOTICE', `online: ${online}`)
  return { users: online }
})
