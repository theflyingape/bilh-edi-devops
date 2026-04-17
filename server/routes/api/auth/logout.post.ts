import { log } from '~/lib/syslog.server'
import sessionGet from './session.get'
import useUserLogins from '../user-logins'

export default defineEventHandler(async (event) => {
  const { tokensByUser } = useUserLogins()
  const session = await sessionGet(event)

  if (session?.id) {
    const userTokens = tokensByUser.get(session.id)
    console.info('logout', userTokens)
    if (userTokens) {
    //  tokensByUser.delete(session.id)
      userTokens.access = new Map()
      userTokens.refresh = new Map()
    }
    log('LOG_NOTICE', `${session.id} ${event}`)
  }

  return ({ status: 'OK' })
})
