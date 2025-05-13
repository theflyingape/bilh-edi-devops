// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    //baseURL: '/devops',
    pageTransition: false,
    layoutTransition: false
  },
  appConfig: {
    buildDate: new Date().toLocaleString('en-us', { dateStyle:'full', timeStyle:'short' }),
    version: '0.7.7'
  },
  auth: {
    baseURL: '/api/auth',
    isEnabled: true,
    globalAppMiddleware: true,
    //disableServerSideAuth: false,
    originEnvKey: 'AUTH_ORIGIN',
    provider: {
      type: 'local',
      endpoints: {
      //  signIn: { path: '/login', method: 'post' },
      //  signOut: { path: '/logout', method: 'post' },
      signUp: false,
      //  getSession: { path: '/session', method: 'get' },
      },
      pages: {
        login: '/sorry',
      },
      session: {
        dataResponsePointer: "/",
        dataType: {
          id: 'string',
          name: 'string',
          enabled: 'boolean',
          groups: 'string[]',
          roles: 'string',
          comment: 'string',
          scope: 'string[]',
        },
      },
      refresh: {
        isEnabled: true,
        //endpoint: { path: '/refresh', method: 'post' },
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
        //cookieName: 'auth.token',
        headerName: 'Authorization',
        //httpOnlyCookieAttribute: false,
        maxAgeInSeconds: 12 * 60 * 60,
        //sameSiteAttribute: 'lax',
        //secureCookieAttribute: false,
      }
    },
    sessionRefresh: {
      // Whether to refresh the session every time the browser window is refocused.
      enableOnWindowFocus: true,
      // Whether to refresh the session every `X` milliseconds. Set this to `false` to turn it off. The session will only be refreshed if a session already exists.
      enablePeriodically: false,
      // Custom refresh handler - uncomment to use
      // handler: './config/AuthRefreshHandler'
    },
  },
  runtimeConfig: {
    public: {
      websocket: process.env.NODE_ENV == 'development' ?  'ws' : 'wss'
    }
  },

  css: ['~/assets/css/main.css', '~/assets/css/xterm.css'],
  ui: {
    theme: {
      colors: [ 'primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error', 'action' ]
    }
  },

  devtools: {
    enabled: true,
    vscode: {},
  },
  devServer: {
    host: '0.0.0.0',
    port: 6500,
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  fileStorage: {
    mount: 'files'
  },
  icon: {
    provider: 'iconify'
  },
  llms: {
    domain: 'https://docs-template.nuxt.dev/',
    title: 'EDI DevOps - Documentation',
    description: 'Documentation built on Nuxt UI Pro and Nuxt Content',
    full: {
      title: 'BILH EDI DevOps - Documentation',
      description: 'This is online documentation for EDI DevOps'
    },
    sections: [
      {
        title: 'BILH Interface Engine',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/docs/1-bilh-interface-engine%' }
        ]
      },
      {
        title: 'Technology & Innovation',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/docs/2-technology-and-innovation%' }
        ]
      }
    ]
  },

  nitro: {
    preset: 'node_server',
    //baseURL: '/devops',
    experimental: {
      websocket: true
    },
/*
    prerender: {
      routes: [ '/' ],
      crawlLinks: true,
      failOnError: false,
    },
*/
    routeRules: {
      '/': { prerender: true },
      '/api/**': { cache: false },
      '/assets/**': { headers: { 'cache-control': 's-maxage=0' } },
      '/components/**': { ssr: false },
      '/composables/**': { ssr: false },
      '/code': { ssr: false },
      '/home': { ssr: false },
      '/terminal': { ssr: false },
      '/utility': { ssr: false },
      //'/faq': { cache: { maxAge: 600 } },
      //'/home': { cache: { maxAge: 600, swr: false } },
      //'/index': { cache: { maxAge: 600, swr: false } },
      //'/mission/**': { cache: { maxAge: 600 } },
      //'/terminal': { cache: false, ssr: false },
    }
  },
  vite: {
    optimizeDeps:{
      exclude: ['@xterm/xterm']
    },
    preview: {
      allowedHosts: ['hciedev.laheyhealth.org']
    },
    server: {
      allowedHosts: ['hciedev.laheyhealth.org'],
      hmr: {
        protocol: 'ws',
        host: '127.0.0.1'
      }
    }
  },

  imports: {
    autoImport: true,
  },
  modules: [
    '@nuxt/devtools', '@nuxt/eslint', '@nuxt/image', '@nuxt/ui-pro', '@nuxt/content', 
    '@sidebase/nuxt-auth', '@vueuse/nuxt', 'nuxt-file-storage', 'nuxt-llms'
  ],
  uiPro: {
    content: true
  },

  build: {
    transpile: ['jsonwebtoken']
  },
  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    }
  },
  compatibilityDate: '2025-03-09',
  future: {
    compatibilityVersion: 4
  },
})
