import { createError, eventHandler, getRequestHeader, readBody, sendRedirect } from 'h3'
import { sign, verify } from 'jsonwebtoken'
import { type JwtPayload, ACCESS_TOKEN_TTL, SECRET, extractToken, tokensByUser } from './login.post'

export default eventHandler(async (event) => {
  const body = await readBody<{ refreshToken: string }>(event)
  const authorizationHeader = getRequestHeader(event, 'Authorization')
  const refreshToken = body.refreshToken
  let token = { token:{} }

  if (!refreshToken || !authorizationHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized, no refreshToken or no Authorization header'
    })
  }

  // Verify
  try {
    const decoded = verify(refreshToken, SECRET) as JwtPayload | undefined
    if (!decoded) {
      //const session = await useSession(event);
      //await session.clear();
      setResponseStatus(event, 303, 'expired')
      return null
      /**
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized, refreshToken can\'t be verified'
      })
      */
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
      enabled: decoded.enabled,
      groups: decoded.groups,
      roles: decoded.roles,
      name: decoded.name,
      comment: decoded.comment,
      loggedInAt: decoded.loggedInAt,
      scope: decoded.scope
    }

    const accessToken = sign({ ...user }, SECRET, {
      expiresIn: ACCESS_TOKEN_TTL
    })
    userTokens.refresh.set(refreshToken, accessToken)
    userTokens.access.set(accessToken, refreshToken)

    setResponseStatus(event, 200, 'refresh ok')
    token = { token: { accessToken, refreshToken } }

    return token
  }
  catch (err) {
    console.error('refresh:', err)
    setResponseStatus(event, 401, 'Unauthorized')
  }
})
