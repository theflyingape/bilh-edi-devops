import { log } from '~/lib/syslog.server'
import { tokensByUser } from './login.post'
import sessionGet from './session.get'

export default defineEventHandler(async (event) => {
  const session = await sessionGet(event)

  if (session?.id) {
    const userTokens = tokensByUser.get(session.id)
    if (userTokens) {
      tokensByUser.delete(session.id)
    }
    log('LOG_NOTICE', `${session.id} ${event}`)
  }

  return ({ status: 'OK' })
})
