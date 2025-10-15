import { createThemeClient } from '@pasteque/react-themes'

const { themes, useTheme, ThemeProvider } = createThemeClient()

export type Theme = (typeof themes)[number]

export { themes, useTheme, ThemeProvider }
