import { verify } from 'jsonwebtoken'

// typing this h3 event context
declare module 'h3' {
  interface H3EventContext {
    auth?: {
      id: string
      enabled: boolean
    }
  }
}

export default defineNitroPlugin((nitroApp) => {
  // Get the JWT secret from runtime configuration
  const secret = useRuntimeConfig().jwtSecret

  nitroApp.hooks.hook('request', async (event) => {
    const publicRoutes = ['/api/auth/login', '/api/auth/refresh']
    const url = event.node.req.url

    // skip middleware for public routes
    if (!url || !url.includes('/api/auth') || publicRoutes.includes(url))
      return

    // get the token from the Authorization header
    const token = event.node.req.headers.authorization?.split(' ')[1]

    if (!token) {
      console.error('jwt-auth missing token for', url)
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Missing token'
      })
    }

    try {
      // Verify and decode the JWT
      const decoded = verify(token, secret) as {
        auth: {
          id: string
          enabled: boolean
        }
      }

      // Attach the user to the event context for access in other handlers
      event.context.auth = decoded.auth
    } catch (error) {
      // If verification fails, respond with an invalid token error
      console.error('jwt-auth', error)
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Invalid token'
      })
    }
  })
})
