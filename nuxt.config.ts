// https://nuxt.com/docs/api/configuration/nuxt-config
// const sw = process.env.SW === 'true'

export default defineNuxtConfig({
  app: {
    //baseURL: '/devops',
  },
  appConfig: {
    buildDate: new Date().toLocaleString('en-us', { dateStyle:'full', timeStyle:'short' }),
    version: '0.6.12'
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
      enablePeriodically: 98765,
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
          { field: 'path', operator: 'LIKE', value: '/1-bilh-interface-engine%' }
        ]
      },
      {
        title: 'Technology & Innovation',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/2-technology-and-innovation%' }
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
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  nitro: {
    preset: 'node_server',
    //baseURL: '/devops',
    experimental: {
      websocket: true
    },
    prerender: {
      routes: [ '/' ],
      crawlLinks: true,
      failOnError: false,
    },
    routeRules: {
      '/api/**': { cache: false },
      '/assets/**': { headers: { 'cache-control': 's-maxage=0' } },
      '/components/**': { ssr: false },
      '/composables/**': { ssr: false },
      '/home': { cache: { maxAge: 600, swr: false } },
      '/index': { cache: { maxAge: 600, swr: false } },
      '/mission/**': { cache: { maxAge: 3600 } },
      '/terminal': { cache: { maxAge: 600, swr: false }, ssr: false },
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
    '@sidebase/nuxt-auth', '@vueuse/nuxt', '@vite-pwa/nuxt',
    'nuxt-file-storage', 'nuxt-llms'
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
