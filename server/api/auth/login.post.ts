import { createError, eventHandler, readBody } from 'h3'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'

//  supply trivial values for testing -- make .env to better secure your site implementation
const dev = process.dev
export const ACCESS_TOKEN_TTL = process.env.NUXT_JWT_ACCESS || '30s'
export const REFRESH_TOKEN_TTL = process.env.NUXT_JWT_REFRESH || '1h'
export const SECRET = process.env.NUXT_JWT_PASSWORD || '!$ecure!'

export interface User {
  id: string,
  enabled: boolean,
  groups?: string,
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
  password: z.string().min(6)
})

export default defineEventHandler(async (event) => {
  const { username, password } = await readValidatedBody(event, credentialsSchema.parse)
  const auth = Buffer.from(`${username}:${password}`).toString('base64')
  let session: JwtPayload = { id:username, enabled:false, scope:[] }
  let token = { token:{} }

  //  this allows me to test out-of-band
  if (dev) {
    let name, comment, groups, roles, valid = ''
    let scope = session.scope
    switch(username) {
      case 'admin':
        name = 'Professor Falken'
        comment = 'Witness Protection'
        groups = 'irisadm'
        roles = '%All'
        scope = [ username ]
        valid = 'joshua'
        break
      case 'dev':
        name = 'Linus Torvalds'
        comment = 'Linux moderator'
        groups = 'irisdev'
        roles = '%Developer'
        scope = [ 'developer' ]
        valid = 'creator'
        break
      case 'ops':
        name = 'Indiana Jones'
        comment = 'Smooth operator'
        groups = 'irisdev'
        roles = '%Operator'
        scope = [ 'analyst' ]
        valid = 'worker'
        break
      case 'user':
        name = 'Snoopy'
        comment = 'know-it-all'
        groups = 'domain user'
        roles = 'Training'
        scope = [ username ]
        valid = 'browser'
        break
      default:
        setResponseStatus(event, 401, 'invalid user')
        return
      }
    if (valid && password !== valid) {
      setResponseStatus(event, 401, 'invalid credentials')
      return
    }
    // TO DO: move to a generalized set of functions
    session = {
      id: username,
      enabled: true,
      groups: groups,
      roles: roles,
      name: name,
      comment: comment,
      loggedInAt: Date.now(),
      scope: scope
    }

    const tokenData: JwtPayload = session
    const accessToken = sign(tokenData, SECRET, {
      expiresIn: ACCESS_TOKEN_TTL
    })
    const refreshToken = sign(tokenData, SECRET, {
      expiresIn: REFRESH_TOKEN_TTL
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

  await fetch(`https://hciedev.laheyhealth.org/api/hcie/user/${username}`, {
    headers: {
      Authorization: `Basic ${auth}`,
      mode: 'no-cors',
    }
  }).then(async (res) => {
    console.log(res)
    try {
      await res.json().then(async (hcie) => {
        session = {
          id: username,
          enabled: hcie.Enabled,
          groups: hcie.Groups,
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
          expiresIn: REFRESH_TOKEN_TTL
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
      setResponseStatus(event, 401, `${err}`)
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
