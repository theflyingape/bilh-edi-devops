import { log } from '~/lib/syslog.server'
import { jwtVerify } from 'jose'
import type { JwtPayload } from '../user-logins'
import useUserLogins from '../user-logins'

export default defineEventHandler(async (event) => {
  const { SECRET, tokensByUser } = useUserLogins()
  const authorizationHeader = getRequestHeader(event, 'Authorization')
  const body = await readBody<{ accessToken: string, refreshToken: string }>(event)

  // Verify
  try {
    //  const accessToken = body.accessToken
    const refreshToken = body.refreshToken

    if (!refreshToken || !authorizationHeader) {
      return dumpSession('not logged in: no refreshToken or no Authorization header', 'invalid session')
    }

    const { payload } = await jwtVerify(refreshToken, SECRET)
    if (!payload) {
      return dumpSession(`not logged in: refreshToken can't be verified`, 'invalid refresh token')
    }
    const session = <JwtPayload>{ auth: payload.auth }

    if (session.auth.id) {
      const userTokens = tokensByUser.get(session.auth.id)
      if (userTokens) {
      //  tokensByUser.delete(session.id)
        userTokens.access = new Map()
        userTokens.refresh = new Map()
      }

      log('LOG_NOTICE', `${session.auth.id} ${event}`)
      setResponseStatus(event, 200, `${session.auth.id} logged out`)
    }
  } catch (err) {
    console.error(err)
    return dumpSession(`${err}`, 'refresh error')
  }

  function dumpSession(respond: string, message: string) {
    setResponseStatus(event, 401, respond)
    deleteCookie(event, 'auth.refresh-token')
    deleteCookie(event, 'auth.token')
    return { status: respond, message: message }
  }
})
