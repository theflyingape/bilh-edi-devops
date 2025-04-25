import { createError, deleteCookie, eventHandler, getRequestHeader, readBody } from 'h3'
import { sign, Secret, SignOptions, verify } from 'jsonwebtoken'
import { type JwtPayload, ACCESS_TOKEN_TTL, SECRET, extractToken, tokensByUser } from './login.post'

export default eventHandler(async (event) => {
  const body = await readBody<{ accessToken: string, refreshToken: string }>(event)
  const authorizationHeader = getRequestHeader(event, 'Authorization')
  const accessToken = body.accessToken
  const refreshToken = body.refreshToken
  let token = { token: { accessToken:accessToken, refreshToken:refreshToken } }

  if (!refreshToken || !authorizationHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized, no refreshToken or no Authorization header'
    })
  }

  // Verify
  try {
    const decoded = verify(refreshToken, <Secret>SECRET) as JwtPayload | undefined
    if (!decoded) {
      setResponseStatus(event, 401, `Unauthorized, refreshToken can't be verified`)
      return token
    }

    // Get tokens
    const userTokens = tokensByUser.get(decoded.id)
    if (!userTokens) {
      setResponseStatus(event, 401, 'Unauthorized, user is not logged in')
      return token
    }

    // Check against known token
    const requestAccessToken = extractToken(authorizationHeader)
    const knownAccessToken = userTokens.refresh.get(body.refreshToken)
    if (!knownAccessToken || knownAccessToken !== requestAccessToken) {
      setResponseStatus(event, 401, 'token mismatch')
      return token
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
  }
  catch (err) {
    setResponseStatus(event, 401, `${ err }`)
    deleteCookie(event, 'auth.refresh-token')
    deleteCookie(event, 'auth.token')
    return { message: 'Logged out' }
  }
})
