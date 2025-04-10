// https://nuxt.com/docs/api/configuration/nuxt-config
// const sw = process.env.SW === 'true'

export default defineNuxtConfig({
  app: {
    //baseURL: '/devops',
  },
  appConfig: {
    buildDate: new Date().toLocaleString('en-us', { dateStyle:'full', timeStyle:'short' })
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
/*
  routeRules: {
    '/': {
      //prerender: true,
      //swr: 5,
      //ssr: false,
    },
    '/with-caching': {
      swr: 86400000,
      auth: {
        disableServerSideAuth: true
      }
    }
  },
*/

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
  icon: {
    provider: 'iconify'
  },
  llms: {
    domain: 'https://docs-template.nuxt.dev/',
    title: 'Nuxt UI Pro - Docs template',
    description: 'A template for building documentation with Nuxt UI Pro and Nuxt Content',
    full: {
      title: 'Nuxt UI Pro - Docs template Full Documentation',
      description: 'This is the full documentation for the Nuxt UI Pro - Docs template'
    },
    sections: [
      {
        title: 'Getting Started',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/getting-started%' }
        ]
      },
      {
        title: 'Essentials',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/essentials%' }
        ]
      }
    ]
  },
  pwa: {
  /*
    strategies: sw ? 'injectManifest' : 'generateSW',
    srcDir: sw ? 'service-worker' : undefined,
    filename: sw ? 'sw.ts' : undefined,
    registerType: 'autoUpdate',
  */
    scope: '/',
    base: '/',
    strategies: 'injectManifest',
    srcDir: 'service-worker',
    filename: 'sw.ts',
    registerType: 'prompt',
    manifest: {
      name: 'EDI DevOps',
      short_name: 'EDI',
      display_override: ['fullscreen', 'minimal-ui'],
      display: 'standalone',
      theme_color: '#f0f8ff',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 10000,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  routeRules: {
    "/api/**": { cache: false, swr: false }
  },
    nitro: {
    //baseURL: '/devops',
    experimental: {
      websocket: true
    },
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true,
      failOnError: false,
    },
    preset: 'node_server',
  },
  vite: {
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
  modules: ['@nuxt/devtools', '@nuxt/eslint', '@nuxt/image', '@nuxt/ui-pro', '@nuxt/content', 'nuxt-llms', '@sidebase/nuxt-auth', '@vueuse/nuxt', '@vite-pwa/nuxt'],
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
