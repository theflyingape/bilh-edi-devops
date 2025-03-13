import { createError, eventHandler, readBody } from 'h3'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'

//  supply trivial values for testing -- make .env to better secure your site implementation
const dev = process.dev
export const ACCESS_TOKEN_TTL = process.env.NUXT_JWT_ACCESS || 30
export const REFRESH_TOKEN_TTL = process.env.NUXT_JWT_REFRESH || 4 * 60 * 60
export const SECRET = process.env.NUXT_JWT_PASSWORD || '!$ecure!'

export interface User {
  id: string,
  enabled: boolean,
  roles?: string,
  name?: string,
  comment?: string,
  loggedInAt?: number,
}

export interface JwtPayload extends User {
  scope: Array<'guest' | 'user' | 'analyst' | 'developer' | 'admin'>
  exp?: number
}

interface TokensByUser {
  access: Map<string, string>
  refresh: Map<string, string>
}

/**
 * Tokens storage :: TO DO harden and stress-test
 */
export const tokensByUser: Map<string, TokensByUser> = new Map()

const credentialsSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(dev ? 6 : 8)
})

export default defineEventHandler(async (event) => {
  const { username, password } = await readValidatedBody(event, credentialsSchema.parse)
  const auth = Buffer.from(`${username}:${password}`).toString('base64')
  let session: JwtPayload = { id:username, enabled:false, scope:[] }
  let token = { token:{} }

  //  this allows me to test out-of-band
  if (dev) {
    let name, comment, roles, valid = ''
    let scope = session.scope
    switch(username) {
      case 'admin':
        name = 'Professor Falken'
        comment = 'Witness Protection'
        roles = '%All'
        scope = [ username ]
        valid = 'joshua'
        break
      case 'dev':
        name = 'Linus Torvalds'
        comment = 'Linux moderator'
        roles = '%Developer'
        scope = [ 'developer' ]
        valid = 'creator'
        break
      case 'ops':
        name = 'Indiana Jones'
        comment = 'Smooth operator'
        roles = '%Operator'
        scope = [ 'analyst' ]
        valid = 'worker'
        break
      case 'user':
        name = 'Snoopy'
        comment = 'know-it-all'
        roles = 'Training'
        scope = [ username ]
        valid = 'browser'
        break
    }
    if (valid && password !== valid) {
        throw createError({
          statusCode: 401,
          message: 'bad credentials'
        })
    }
    // TO DO: move to a generalized set of functions
    session = {
      id: username,
      enabled: true,
      roles: roles,
      name: name,
      comment: comment,
      loggedInAt: Date.now(),
      scope: scope
    }

    const tokenData: JwtPayload = session
    const accessToken = sign(tokenData, SECRET, {
      expiresIn: <number>ACCESS_TOKEN_TTL
    })
    const refreshToken = sign(tokenData, SECRET, {
      expiresIn: <number>REFRESH_TOKEN_TTL
    })
  
    const userTokens: TokensByUser = tokensByUser.get(username) ?? {
      access: new Map(),
      refresh: new Map()
    }
    userTokens.access.set(accessToken, refreshToken)
    userTokens.refresh.set(refreshToken, accessToken)
    tokensByUser.set(username, userTokens)

    setResponseStatus(event, 200, 'logged in')

    token = { token: { accessToken, refreshToken } }
    return token
  }

  await fetch(`https://hciedev.laheyhealth.org/api/hcie/user/${username}`,
    { headers: { Authorization: `Basic ${auth}` } }
  ).then(async (res) => {
    try {
      if (res.status == 401)
        throw createError({
          statusCode: 401,
          message: 'bad credentials'
        })
      await res.json().then(async (hcie) => {
        session = {
          id: username,
          enabled: hcie.Enabled,
          roles: hcie.Roles,
          name: hcie.FullName,
          comment: hcie.Comment,
          loggedInAt: Date.now(),
          scope: ['admin']
        }

        const tokenData: JwtPayload = session
        const accessToken = sign(tokenData, SECRET, {
          expiresIn: <number>ACCESS_TOKEN_TTL
        })
        const refreshToken = sign(tokenData, SECRET, {
          expiresIn: <number>REFRESH_TOKEN_TTL
        })
      
        // Naive implementation - please implement properly yourself!
        const userTokens: TokensByUser = tokensByUser.get(username) ?? {
          access: new Map(),
          refresh: new Map()
        }
        userTokens.access.set(accessToken, refreshToken)
        userTokens.refresh.set(refreshToken, accessToken)
        tokensByUser.set(username, userTokens)

        setResponseStatus(event, 200, 'logged in')

        token = { token: { accessToken, refreshToken } }
      })
    }
    catch(err) {
      console.error('login() error', err)
      throw createError({
        statusCode: 401,
        message: 'mishandled credentials'
      })
    }
  })
  return token
})

//  TO DO: determine purpose, unclear why their playground had this here
export function extractToken(authorizationHeader: string) {
  return authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : authorizationHeader
}
