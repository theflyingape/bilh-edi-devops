import { PrivateKey, sign, SignOptions } from 'jsonwebtoken'
import { IRIStoken } from '~/composables/useIrisSessions'
import { log } from '~/lib/syslog'
import { z } from 'zod'

//  supply trivial values for testing -- make .env to better secure your site implementation
//const dev = process.dev || false
const dev = import.meta.dev || false
export const ACCESS_TOKEN_TTL = process.env.NUXT_JWT_ACCESS || '30s'
export const REFRESH_TOKEN_TTL = process.env.NUXT_JWT_REFRESH || '1h'
export const SECRET: PrivateKey = process.env.NUXT_JWT_PASSWORD || '!$ecure!'

export interface JwtPayload {
  id: string
  enabled: boolean
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
  password: z.string().min(6),
  IRIStoken: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    sub: z.string(),
    iat: z.number(),
    exp: z.number()
  }) satisfies z.ZodType<IRIStoken>
})

export default defineEventHandler(async (event) => {
  const { username, password, IRIStoken } = await readValidatedBody(event, credentialsSchema.parse)
  let session: JwtPayload = { id: username, enabled: false }
  let token

  //  this allows me to test out-of-band
  if (dev) {
    if (username == 'dev' && password == 'tester') {
      session.enabled = true
      //  create separate JWT for Nuxt auth session handling
      const tokenData: JwtPayload = session
      const accessToken = sign(tokenData, SECRET, <SignOptions>{
        expiresIn: ACCESS_TOKEN_TTL
      })
      const refreshToken = sign(tokenData, SECRET, <SignOptions>{
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
    }
    else
      setResponseStatus(event, 401, 'invalid credentials')
  }

  if (IRIStoken) {
    session.enabled = true
    try {
      //  create separate JWT for Nuxt auth session handling
      const tokenData: JwtPayload = session
      const accessToken = sign(tokenData, SECRET, <SignOptions>{
        expiresIn: ACCESS_TOKEN_TTL
      })
      const refreshToken = sign(tokenData, SECRET, <SignOptions>{
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
    }
    catch (err) {
      setResponseStatus(event, 401, `${err}`)
      log('LOG_NOTICE', `${username} ${event} ${JSON.stringify(err)}`)
    }
  }

  log('LOG_NOTICE', `${username} ${event} ${REFRESH_TOKEN_TTL} return token size: ${JSON.stringify(token).length}`)
  return token
})

//  TO DO: determine purpose, unclear why their playground had this here
export function extractToken(authorizationHeader: string) {
  return authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : authorizationHeader
}
