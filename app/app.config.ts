export default defineAppConfig({
  // https://ui3.nuxt.dev/getting-started/theme#design-system
  ui: {
    button: {
      defaultVariants: {
        // Set default button color to neutral
        // color: 'neutral'
      }
    },
    colors: {
      primary: 'teal',
      secondary: 'blue',
      tertiary: 'amber',
      success: 'green',
      info: 'blue',
      warning: 'yellow',
      error: 'red',
      neutral: 'slate',
      action: 'pink'
    },
    icons: {
    }
  },
  uiPro: {
    pageHero: {
      slots: {
        headline: 'mb-4'
      }
    }
  },
  seo: {
    siteName: 'EDI DevOps'
  },
  toc: {
    title: 'Table of Contents',
    bottom: {
      title: 'Community',
      links: [{
        icon: 'i-lucide-hand-helping',
        label: 'Developer Community',
        to: 'https://community.intersystems.com',
        target: '_blank'
      }, {
        icon: 'i-lucide-star',
        label: 'Star on GitHub',
        to: 'https://github.com/theflyingape/bilh-edi-devops',
        target: '_blank'
      }, {
        icon: 'i-lucide-book-open',
        label: 'Nuxt UI Pro docs',
        to: 'https://ui.nuxt.com/getting-started/installation/pro/nuxt',
        target: '_blank'
      }]
    }
  }
})
