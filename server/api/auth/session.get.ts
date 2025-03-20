import { createError, eventHandler, getRequestHeader } from 'h3'
import { Secret, verify } from 'jsonwebtoken'
import { type JwtPayload, SECRET, extractToken, tokensByUser } from './login.post'

export default eventHandler((event) => {
  const authorizationHeader = getRequestHeader(event, 'Authorization')
  if (typeof authorizationHeader === 'undefined') {
    setResponseStatus(event, 403, 'Need to pass valid Bearer-authorization header to access this endpoint')
    return null
    //throw createError({ statusCode: 403, statusMessage: 'Need to pass valid Bearer-authorization header to access this endpoint' })
  }

  const extractedToken = extractToken(authorizationHeader)
  let decoded: JwtPayload
  try {
    decoded = verify(extractedToken, <Secret>SECRET) as JwtPayload
  }
  catch (error) {
    console.error({
      msg: 'Login failed. Here\'s the raw error:',
      error
    })
    setResponseStatus(event, 401, 'Unauthorized')
    return null
    //throw createError({ statusCode: 403, statusMessage: 'You must be logged in to use this endpoint' })
  }

  // Check against known token
  const userTokens = tokensByUser.get(decoded.id)
  if (!userTokens || !userTokens.access.has(extractedToken)) {
    return null
    /*
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized, user is not logged in'
    })
    */
  }

  // All checks successful
  const { id, enabled, groups, roles, name, comment, loggedInAt, scope } = decoded
  return { id, enabled, groups, roles, name, comment, loggedInAt, scope }
})
