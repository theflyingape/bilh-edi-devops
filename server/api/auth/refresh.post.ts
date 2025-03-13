import { createError, eventHandler, getRequestHeader, readBody } from 'h3'
import { sign, verify } from 'jsonwebtoken'
import { type JwtPayload, SECRET, extractToken, tokensByUser } from './login.post'

export default eventHandler(async (event) => {
  const body = await readBody<{ refreshToken: string }>(event)
  const authorizationHeader = getRequestHeader(event, 'Authorization')
  const refreshToken = body.refreshToken

  if (!refreshToken || !authorizationHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized, no refreshToken or no Authorization header'
    })
  }

  // Verify
  const decoded = verify(refreshToken, SECRET) as JwtPayload | undefined
  if (!decoded) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized, refreshToken can\'t be verified'
    })
  }

  // Get tokens
  const userTokens = tokensByUser.get(decoded.id)
  if (!userTokens) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized, user is not logged in'
    })
  }

  // Check against known token
  const requestAccessToken = extractToken(authorizationHeader)
  const knownAccessToken = userTokens.refresh.get(body.refreshToken)
  if (!knownAccessToken || knownAccessToken !== requestAccessToken) {
    console.log({
      msg: 'Tokens mismatch',
      knownAccessToken,
      requestAccessToken
    })
    throw createError({
      statusCode: 401,
      statusMessage: 'Tokens mismatch - this is not good'
    })
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
    expiresIn: 60
  })
  userTokens.refresh.set(refreshToken, accessToken)
  userTokens.access.set(accessToken, refreshToken)
  let token = { token: { accessToken, refreshToken } }

  return token
})
