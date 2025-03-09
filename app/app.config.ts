export default defineAppConfig({
  // https://ui3.nuxt.dev/getting-started/theme#design-system
  ui: {
    colors: {
      primary: 'teal',
      neutral: 'slate',
      action: 'pink',
    },
    button: {
      defaultVariants: {
        // Set default button color to neutral
        // color: 'neutral'
      }
    },
    notifications: {
      // Show toasts at the top right of the screen
      position: 'top-0 bottom-auto'
    }
  }
})
