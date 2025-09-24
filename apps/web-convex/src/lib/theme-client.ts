import { createThemeClient } from './arthur-theme/create-theme-client'

const { themes, useTheme, ThemeProvider } = createThemeClient()

export type Theme = (typeof themes)[number]

export { themes, useTheme, ThemeProvider }
