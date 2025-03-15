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
      success: 'green',
      info: 'blue',
      warning: 'yellow',
      error: 'red',
      neutral: 'slate',
      action: 'pink',
    },
    icons: {
    },
    notifications: {
      // Show toasts at the top right of the screen
      position: 'top-0 bottom-auto'
    }
  }
})
