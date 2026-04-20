import fs from 'fs'
import path from 'path'
import { log } from '~/lib/syslog.server'

//  used to match against what is allowed
export function extractToken(authorizationHeader: string) {
  return authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : authorizationHeader
}

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
  login: number
}

//  user provisioned session map
export const tokensByUser: Map<string, TokensByUser> = new Map()

try {
  //  inconsequential, but restore former user logins after a service restart
  const filePath = path.join(process.cwd(), 'visitors.json')
  const js = fs.readFileSync(filePath, 'utf-8')
  const visitors = JSON.parse(js)

  Object.entries(visitors).forEach(([key, value]) => {
    if (Math.floor((Date.now() - <number>value) / (1000 * 60 * 60 * 24)) < 92) {
      tokensByUser.set(key, {
        access: new Map(),
        refresh: new Map(),
        login: <number>value
      })
    }
  })
  log('LOG_NOTICE', `${tokensByUser.size} visitors loaded`)
} catch (err) {
  console.error(err)
}

export default function useUserLogins() {
  return {
    ACCESS_TOKEN_TTL,
    REFRESH_TOKEN_TTL,
    SECRET,
    extractToken,
    tokensByUser
  }
}
