import { SignJWT } from 'jose'
import type { IRIStoken } from '~/composables/useIrisSessions'
import { log } from '~/lib/syslog.server'
import { z } from 'zod'

const dev = import.meta.dev || false
export const ACCESS_TOKEN_TTL = process.env.NUXT_JWT_ACCESS || '30s'
export const REFRESH_TOKEN_TTL = process.env.NUXT_JWT_REFRESH || '1h'
export const SECRET = new TextEncoder().encode(useRuntimeConfig().jwtSecret)

export interface JwtPayload {
  auth: {
    id: string
    enabled: boolean
    login: number
  }
}

export interface TokensByUser {
  access: Map<string, string>
  refresh: Map<string, string>
}

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
  const session: JwtPayload = { auth: { id: username, enabled: false, login: Date.now() } }
  let token

  //  create separate JWT for Nuxt auth session handling
  //  this allows me to test out-of-band
  if (dev) {
    if (username == 'dev' && password == 'tester') {
      session.auth.enabled = true
      const accessToken = await new SignJWT({ auth: session.auth })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(ACCESS_TOKEN_TTL)
        .sign(SECRET)
      const refreshToken = await new SignJWT({ auth: session.auth })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(REFRESH_TOKEN_TTL)
        .sign(SECRET)
      const userTokens: TokensByUser = tokensByUser.get(username) ?? {
        access: new Map(),
        refresh: new Map()
      }
      /* // for any jose / nuxt auth regression testing
      const { payload } = await jwtVerify(accessToken, SECRET)
      log('LOG_NOTICE', `${username} ${event} ${REFRESH_TOKEN_TTL} refresh ${ACCESS_TOKEN_TTL} access (${JSON.stringify(payload)?.length} bytes)`)
      */
      userTokens.access.set(accessToken, refreshToken)
      userTokens.refresh.set(refreshToken, accessToken)
      tokensByUser.set(username, userTokens)

      setResponseStatus(event, 200, 'logged in')
      token = { token: { accessToken, refreshToken } }
    } else
      setResponseStatus(event, 401, 'invalid credentials')
  }

  if (IRIStoken) {
    session.auth.enabled = true
    try {
      const accessToken = await new SignJWT({ auth: session.auth })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(ACCESS_TOKEN_TTL)
        .sign(SECRET)
      const refreshToken = await new SignJWT({ auth: session.auth })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(REFRESH_TOKEN_TTL)
        .sign(SECRET)
      const userTokens: TokensByUser = tokensByUser.get(username) ?? {
        access: new Map(),
        refresh: new Map()
      }

      userTokens.access.set(accessToken, refreshToken)
      userTokens.refresh.set(refreshToken, accessToken)
      tokensByUser.set(username, userTokens)

      setResponseStatus(event, 200, 'logged in')
      token = { token: { accessToken, refreshToken } }
    } catch (err) {
      setResponseStatus(event, 401, `${err}`)
      log('LOG_NOTICE', `${username} ${event} ${JSON.stringify(err)}`)
    }
  }

  log('LOG_NOTICE', `${username} ${event} ${REFRESH_TOKEN_TTL} refresh ${ACCESS_TOKEN_TTL} access (${JSON.stringify(token)?.length} bytes)`)
  return token
})

//  used to match against what is allowed
export function extractToken(authorizationHeader: string) {
  return authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : authorizationHeader
}
