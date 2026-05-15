import { deleteCookie, eventHandler, getRequestHeader, readBody } from 'h3'
import { SignJWT, jwtVerify } from 'jose'
import type { JwtPayload } from '../user-logins'
import useUserLogins from '../user-logins'

export default eventHandler(async (event) => {
  const { ACCESS_TOKEN_TTL, SECRET, extractToken, tokensByUser } = useUserLogins()

  // Verify
  try {
    const authorizationHeader = getRequestHeader(event, 'Authorization')
    const body = await readBody<{ accessToken: string, refreshToken: string }>(event)

    //  const accessToken = body.accessToken
    const refreshToken = body.refreshToken

    if (!refreshToken || !authorizationHeader) {
      return dumpSession('Unauthorized, no refreshToken or no Authorization header', 'invalid session')
    }

    const { payload } = await jwtVerify(refreshToken, SECRET)
    if (!payload) {
      return dumpSession(`Unauthorized, refreshToken can't be verified`, 'invalid refresh token')
    }
    const session = <JwtPayload>{ auth: payload.auth }

    // Get tokens
    const userTokens = tokensByUser.get(session.auth.id)
    if (!userTokens) {
      return dumpSession('Unauthorized, user is not logged in', 'invalid login')
    }

    // Check against known token
    const requestAccessToken = extractToken(authorizationHeader)
    if (!userTokens.access.get(requestAccessToken)) {
      return dumpSession('unknown access token', 'token mismatch')
    }

    // Invalidate old access token
    const newAccessToken = await new SignJWT({ auth: session.auth })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(ACCESS_TOKEN_TTL)
      .sign(SECRET)
    userTokens.access.set(newAccessToken, refreshToken)
    userTokens.refresh.set(refreshToken, newAccessToken)

    setResponseStatus(event, 200, 'refresh ok')
    return { token: { accessToken: newAccessToken, refreshToken: refreshToken } }
  } catch (err) {
    console.error('refresh', err)
    return dumpSession(`${err}`, 'refresh error')
  }

  function dumpSession(respond: string, message: string) {
    setResponseStatus(event, 401, respond)
    deleteCookie(event, 'auth.refresh-token')
    deleteCookie(event, 'auth.token')
    return { status: respond, message: message }
  }
})
