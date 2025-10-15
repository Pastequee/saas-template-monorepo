import { createThemeClient } from '@pasteque/react-themes'

export const { themes, useTheme, ThemeProvider } = createThemeClient()

export type Theme = (typeof themes)[number]
