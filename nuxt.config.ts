// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: '/dev-ops',
  },
  auth: {
    baseURL: `http://${process.env.HOST || 'hciedev.laheyhealth.org'}:${process.env.PORT || 3000}/dev-ops/api/auth`,
    isEnabled: true,
    disableServerSideAuth: false,
    globalAppMiddleware: true,
    originEnvKey: 'NUXT_BASE_URL',
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        signOut: { path: '/logout', method: 'post' },
        getSession: { path: '/session', method: 'get' },
      },
      pages: {
        login: '/login'
      },
      session: {
        dataResponsePointer: "/",
        dataType: {
          id: 'string',
          name: 'string',
          enabled: 'boolean',
          roles: 'string',
          comment: 'string',
          scope: 'string[]',
        },
      },
      refresh: {
        isEnabled: true,
        endpoint: { path: '/refresh', method: 'post' },
        token: {
          signInResponseRefreshTokenPointer: '/token/refreshToken',
          refreshResponseTokenPointer: '',
          refreshRequestTokenPointer: '/refreshToken'
        },
      },
      token: {
        signInResponseTokenPointer: '/token/accessToken',
        //type: 'Bearer',
        //cookieDomain: 'laheyhealth.org',
        //cookieName: 'devops.token',
        //headerName: 'Authorization',
        //httpOnlyCookieAttribute: false,
        //maxAgeInSeconds: 150 * 60 * 60,
        //sameSiteAttribute: 'lax',
        //secureCookieAttribute: false,
      }
    },
    sessionRefresh: {
      // Whether to refresh the session every time the browser window is refocused.
      enableOnWindowFocus: true,
      // Whether to refresh the session every `X` milliseconds. Set this to `false` to turn it off. The session will only be refreshed if a session already exists.
      enablePeriodically: 30000,
      // Custom refresh handler - uncomment to use
      // handler: './config/AuthRefreshHandler'
    },
  },

  routeRules: {
    '/': {
      // prerender: true,
      // swr: 5,
      // ssr: false,
    },
    '/with-caching': {
      swr: 86400000,
      auth: {
        disableServerSideAuth: true
      }
    }
  },

  css: ['~/assets/css/main.css'],
  ui: {
    theme: {
      colors: [ 'action' ]
    }
  },

  devtools: {
    enabled: true,
  },
  devServer: {
    host: 'hciedev.laheyhealth.org',
    port: 6500,
  },

  imports: {
    autoImport: true,
  },
  modules: ['@nuxt/ui', '@nuxt/eslint', '@sidebase/nuxt-auth', '@vueuse/nuxt'],

  build: {
    transpile: ['jsonwebtoken']
  },
  compatibilityDate: '2025-03-09',
  future: {
    compatibilityVersion: 4
  },
})