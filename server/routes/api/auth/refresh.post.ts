import { deleteCookie, eventHandler, getRequestHeader, readBody } from 'h3'
import { sign, type Secret, type SignOptions, verify } from 'jsonwebtoken'
import { type JwtPayload, ACCESS_TOKEN_TTL, SECRET, extractToken, tokensByUser } from './login.post'

export default eventHandler(async (event) => {
  const body = await readBody<{ accessToken: string, refreshToken: string }>(event)
  const authorizationHeader = getRequestHeader(event, 'Authorization')
  const accessToken = body.accessToken
  const refreshToken = body.refreshToken
  let token = { token: { accessToken: accessToken, refreshToken: refreshToken } }

  if (!refreshToken || !authorizationHeader) {
    return dumpSession('Unauthorized, no refreshToken or no Authorization header', 'invalid session')
  }

  // Verify
  try {
    const decoded = verify(refreshToken, <Secret>SECRET) as JwtPayload | undefined
    if (!decoded) {
      return dumpSession(`Unauthorized, refreshToken can't be verified`, 'invalid refresh token')
    }

    // Get tokens
    const userTokens = tokensByUser.get(decoded.id)
    if (!userTokens) {
      return dumpSession('Unauthorized, user is not logged in', 'invalid login')
    }

    // Check against known token
    const requestAccessToken = extractToken(authorizationHeader)
    const knownAccessToken = userTokens.refresh.get(body.refreshToken)
    if (!knownAccessToken || knownAccessToken !== requestAccessToken) {
      return dumpSession('toekn mismatch', 'token mismatch')
    }

    // Invalidate old access token
    userTokens.access.delete(knownAccessToken)

    const user: JwtPayload = {
      id: decoded.id,
      enabled: decoded.enabled
    }

    const accessToken = sign({ ...user }, SECRET, <SignOptions>{
      expiresIn: ACCESS_TOKEN_TTL
    })
    userTokens.refresh.set(refreshToken, accessToken)
    userTokens.access.set(accessToken, refreshToken)

    setResponseStatus(event, 200, 'refresh ok')
    token = { token: { accessToken, refreshToken } }

    return token
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
