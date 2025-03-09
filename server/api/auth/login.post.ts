import { createError, eventHandler, readBody } from 'h3'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'

export const SECRET = process.env.NUXT_SESSION_PASSWORD || '!$ecure!'
export const ACCESS_TOKEN_TTL = 60

export interface User {
  id: string,
  enabled: boolean,
  roles?: string,
  name?: string,
  comment?: string,
  loggedInAt?: number,
}

export interface JwtPayload extends User {
  scope: Array<'guest' | 'analyst' | 'developer' | 'admin'>
  exp?: number
}

interface TokensByUser {
  access: Map<string, string>
  refresh: Map<string, string>
}

/**
 * Tokens storage
 * You will need to implement your own, connect with DB/etc.
 */
export const tokensByUser: Map<string, TokensByUser> = new Map()

const credentialsSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
})

export default defineEventHandler(async (event) => {
  const { username, password } = await readValidatedBody(event, credentialsSchema.parse)
  const auth = Buffer.from(`${username}:${password}`).toString('base64')
  let session: JwtPayload = { id:username, enabled:false, scope:[] }
  let token = { token:{} }

  if ( username == 'admin') {
    if (password !== 'joshua') {
      throw createError({
        statusCode: 401,
        message: 'Bad credentials'
      })
    }
    session = {
      id: username,
      enabled: true,
      roles: '%All',
      name: 'Professor Falken',
      comment: 'Witness Protection',
      loggedInAt: Date.now(),
      scope: ['admin']
    }

    const tokenData: JwtPayload = session
    const accessToken = sign(tokenData, SECRET, {
      expiresIn: ACCESS_TOKEN_TTL
    })
    const refreshToken = sign(tokenData, SECRET, {
      expiresIn: 60 * 60 * 12
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
    return token
  }

  await fetch(`https://hciedev.laheyhealth.org/api/hcie/user/${username}`, { headers: {Authorization: `Basic ${auth}`} }
  ).then(async (res) => {
    try {
      if (res.status == 401)
        throw createError({
          statusCode: 401,
          message: 'Bad credentials'
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
          expiresIn: ACCESS_TOKEN_TTL
        })
        const refreshToken = sign(tokenData, SECRET, {
          expiresIn: 60 * 60 * 12
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
        message: 'Mishandled credentials'
      })
    }
  })
  return token
})

export function extractToken(authorizationHeader: string) {
  return authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : authorizationHeader
}
